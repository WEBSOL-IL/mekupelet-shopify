#!/usr/bin/env python3
"""
Publish the imported collections to the Online Store sales channel. Collections created through the
Admin API are not published to any channel by default (storefront 404), unlike collections created in
the admin. Needs the Dev Dashboard app to have the scopes read_publications + write_publications
(add them to the app version, reinstall, then run). Dry run by default; --execute publishes.

Reads the ids from docs/import/out/result-log.json (every created collection) and, with
--all, every collection in the store instead. publishablePublish is idempotent.
"""
import importlib.util, json, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("imp", ROOT / "import-collections.py")
imp = importlib.util.module_from_spec(spec); spec.loader.exec_module(imp)
LOG = ROOT.parent / "docs/import/out/result-log.json"
BATCH = 25


def main():
    execute = "--execute" in sys.argv
    res = imp.gql("{ publications(first: 20) { nodes { id name catalog { title } } } }", {})
    if res.get("errors"):
        sys.exit("cannot read publications (add read_publications/write_publications to the app): " + json.dumps(res["errors"][:1]))
    pubs = res["data"]["publications"]["nodes"]
    online = [p for p in pubs if "online store" in (p.get("name") or "").lower()]
    print("publications:", [(p["id"], p["name"]) for p in pubs])
    if len(online) != 1:
        sys.exit("expected exactly one Online Store publication")
    pub_id = online[0]["id"]
    if "--all" in sys.argv:
        ids = [v["id"] for v in imp.existing_collections().values()]
    else:
        ids = sorted({e["id"] for e in json.loads(LOG.read_text(encoding="utf-8")) if e.get("id")})
    print(f"collections to publish: {len(ids)} to {pub_id}" + ("" if execute else " (dry run)"))
    if not execute:
        return
    errors = 0
    for i in range(0, len(ids), BATCH):
        chunk = ids[i:i + BATCH]
        fields = "\n".join(f'p{j}: publishablePublish(id: "{cid}", input: {{publicationId: "{pub_id}"}}) {{ userErrors {{ field message }} }}' for j, cid in enumerate(chunk))
        r = imp.gql("mutation {\n" + fields + "\n}", {})
        for alias, payload in (r.get("data") or {}).items():
            if payload.get("userErrors"):
                errors += 1
                print(alias, chunk[int(alias[1:])], payload["userErrors"])
        if r.get("errors"):
            print("GRAPHQL ERRORS", json.dumps(r["errors"], ensure_ascii=False)[:300])
        print(f"batch {i // BATCH}: {len(chunk)} sent")
    print("done; errors:", errors)


if __name__ == "__main__":
    main()
