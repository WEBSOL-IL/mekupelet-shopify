#!/usr/bin/env python3
"""Populate `custom.children` (list.collection_reference) on category collections from the
imported `custom.parent_handle` values, so the collection template can list sub-categories
without looping over the whole catalog. Dry run by default; `--execute` creates the metafield
definition (if missing) and writes the values with metafieldsSet in batches of 25.
Auth/env as scripts/import-collections.py."""
import argparse, importlib.util, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("imp", os.path.join(HERE, "import-collections.py"))
imp = importlib.util.module_from_spec(spec); spec.loader.exec_module(imp)
gql = imp.gql


def fetch():
    nodes, after = [], None
    while True:
        r = gql("""query($after:String){ collections(first:250, after:$after) { nodes { id handle title
            kind: metafield(namespace:"custom", key:"collection_kind") { value }
            parent: metafield(namespace:"custom", key:"parent_handle") { value } }
            pageInfo { hasNextPage endCursor } } }""", {"after": after})
        d = r["data"]["collections"]; nodes += d["nodes"]
        if not d["pageInfo"]["hasNextPage"]:
            return nodes
        after = d["pageInfo"]["endCursor"]


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--execute", action="store_true"); args = ap.parse_args()
    cols = fetch()
    by_handle = {c["handle"]: c for c in cols}
    children = {}
    for c in cols:
        p = (c["parent"] or {}).get("value")
        if p and p in by_handle:
            children.setdefault(p, []).append(c["id"])
    print(f"collections: {len(cols)}; parents with children: {len(children)}; "
          f"child links: {sum(len(v) for v in children.values())}")
    for h, ids in sorted(children.items(), key=lambda kv: -len(kv[1]))[:8]:
        print(f"  {h}: {len(ids)}")
    if not args.execute:
        print("dry run only; add --execute to write"); return
    r = gql("""mutation($d: MetafieldDefinitionInput!){ metafieldDefinitionCreate(definition:$d){
        createdDefinition { id } userErrors { code message } } }""",
        {"d": {"name": "Child collections", "namespace": "custom", "key": "children", "ownerType": "COLLECTION",
               "type": "list.collection_reference", "description": "Sub-categories shown on the collection page (set by scripts/set-collection-children.py)"}})
    print("definition:", json.dumps(r["data"]["metafieldDefinitionCreate"], ensure_ascii=False))
    items = [{"ownerId": by_handle[h]["id"], "namespace": "custom", "key": "children",
              "type": "list.collection_reference", "value": json.dumps(ids)} for h, ids in children.items()]
    for i in range(0, len(items), 25):
        r = gql("""mutation($m:[MetafieldsSetInput!]!){ metafieldsSet(metafields:$m){ metafields { id } userErrors { field message } } }""",
                {"m": items[i:i + 25]})
        d = r["data"]["metafieldsSet"]
        print(f"batch {i // 25 + 1}: set {len(d['metafields'])}, errors {d['userErrors']}")


if __name__ == "__main__":
    main()
