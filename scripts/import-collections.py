#!/usr/bin/env python3
"""
Build (and optionally run) the Shopify Admin GraphQL mutations that import the collections plan in
docs/import/shopify_collections.json.

Default is a DRY RUN: it prints a summary and writes batched mutation payloads to
docs/import/out/*.graphql.json without touching the store. Running against the store requires an
explicit --execute plus credentials in the environment:
  SHOPIFY_SHOP            e.g. mekupelet-store.myshopify.com
  SHOPIFY_CLIENT_ID + SHOPIFY_CLIENT_SECRET   Dev Dashboard app installed on the store (client
                          credentials grant: the script exchanges them for a 24h Admin API token), or
  SHOPIFY_ADMIN_TOKEN     a ready Admin API access token (legacy admin-created custom app).
Scopes the app version needs: read_products, write_products, read_online_store_navigation,
write_online_store_navigation, read_files, write_files.

Decisions encoded as flags (see docs/import/import-plan.md):
  --handles ids|slug      collection handles: "category-24" (plan default) or the source slug
  --skip-internal         skip categories that look like internal/promo rules (see INTERNAL_PREFIXES)
  --kinds category,brand  which kinds to import
  --batch 20              collections per mutation (aliases c0..cN)
  --limit N               pilot: only the first N collections of the selection
  --only h1,h2            only these handles (retry a failed item)

Idempotent: before executing, the script reads every collection handle already in the store. A plan
entry whose handle exists is UPDATED in place with collectionUpdate (same rules/image/metafields);
the others are created with collectionCreate. Re-running the script therefore never creates
duplicates. HANDLE_OVERRIDES resolves the one slug collision in the plan.
"""
import argparse, datetime, json, os, re, sys, pathlib, urllib.parse, urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
PLAN = ROOT / "docs/import/shopify_collections.json"
OUT = ROOT / "docs/import/out"
API_VERSION = "2025-07"
# plan key -> handle, for slug collisions (brand "Re-Cycle-Me" keeps "re-cycle-me")
HANDLE_OVERRIDES = {"category:172": "re-cycle-me-2"}
INTERNAL_PREFIXES = ("לא לכלול", "משתתף במבצע", "לא לצבור", "מוצרי קופה", "Uncategorized", "עמוד הבית")


def load_plan():
    return json.loads(PLAN.read_text(encoding="utf-8"))


def handle_for(c, mode):
    if c.get("key") in HANDLE_OVERRIDES:
        return HANDLE_OVERRIDES[c["key"]]
    if mode == "slug":
        slug = c.get("source_slug_decoded") or c.get("source_slug") or c["handle"]
        slug = re.sub(r"[^\w\-]+", "-", slug, flags=re.UNICODE).strip("-").lower()
        return slug or c["handle"]
    return c["handle"]


def rule_for(c):
    m = c["membership"]
    if m["source"] == "product_tag":
        return {"column": "TAG", "relation": "EQUALS", "condition": m["value"]}
    if m["source"] == "product_vendor":
        return {"column": "VENDOR", "relation": "EQUALS", "condition": m["value"]}
    raise ValueError(f"unknown membership {m}")


def collection_input(c, args, parent_handle=None):
    inp = {
        "title": c["title"].strip(),
        "handle": handle_for(c, args.handles),
        "descriptionHtml": c.get("description_html") or "",
        "ruleSet": {"appliedDisjunctively": False, "rules": [rule_for(c)]},
        "sortOrder": "BEST_SELLING",
        "metafields": [
            {"namespace": "custom", "key": "collection_kind", "type": "single_line_text_field", "value": c["kind"]},
        ],
    }
    if c.get("source_term_id"):
        inp["metafields"].append({"namespace": "custom", "key": "legacy_term_id", "type": "single_line_text_field", "value": str(c["source_term_id"])})
    if parent_handle:
        inp["metafields"].append({"namespace": "custom", "key": "parent_handle", "type": "single_line_text_field", "value": parent_handle})
    if c.get("image_url"):
        # Shopify fetches the URL server-side; non-ASCII path characters must be percent-encoded
        inp["image"] = {"src": urllib.parse.quote(c["image_url"], safe=":/?&=%"), "altText": c["title"].strip()}
    return inp


def is_internal(c):
    return c["kind"] == "category" and c["title"].strip().startswith(INTERNAL_PREFIXES)


def build(args):
    plan = load_plan()
    cols = [c for c in plan["collections"] if c["kind"] in args.kinds]
    if args.skip_internal:
        cols = [c for c in cols if not is_internal(c)]
    by_key = {c["key"]: c for c in plan["collections"]}
    inputs = []
    for c in cols:
        parent = by_key.get(c["parent_key"]) if c.get("parent_key") else None
        inputs.append(collection_input(c, args, handle_for(parent, args.handles) if parent else None))
    # metafield definitions first (idempotent on the store side: creation fails if it exists)
    definitions = [
        {"name": "Collection kind", "namespace": "custom", "key": "collection_kind", "type": "single_line_text_field", "ownerType": "COLLECTION",
         "validations": [{"name": "choices", "value": json.dumps(["category", "brand"])}]},
        {"name": "Parent collection handle", "namespace": "custom", "key": "parent_handle", "type": "single_line_text_field", "ownerType": "COLLECTION"},
        {"name": "Legacy term id", "namespace": "custom", "key": "legacy_term_id", "type": "single_line_text_field", "ownerType": "COLLECTION"},
    ]
    return definitions, inputs


def make_batches(inputs, batch_size, mutation="collectionCreate", prefix="c"):
    """Batch CollectionInput dicts into aliased mutations. For collectionUpdate each input carries id."""
    batches = []
    for i in range(0, len(inputs), batch_size):
        chunk = inputs[i:i + batch_size]
        fields, variables = [], {}
        for j, inp in enumerate(chunk):
            fields.append(f"{prefix}{j}: {mutation}(input: $in{j}) {{ collection {{ id handle title }} userErrors {{ field message }} }}")
            variables[f"in{j}"] = inp
        decl = ", ".join(f"$in{j}: CollectionInput!" for j in range(len(chunk)))
        query = f"mutation ImportCollections({decl}) {{\n  " + "\n  ".join(fields) + "\n}"
        batches.append({"query": query, "variables": variables})
    return batches


_TOKEN = None


def access_token():
    """Return an Admin API token: SHOPIFY_ADMIN_TOKEN as is, or one obtained with the client
    credentials grant from SHOPIFY_CLIENT_ID / SHOPIFY_CLIENT_SECRET (valid for 24 hours)."""
    global _TOKEN
    if _TOKEN:
        return _TOKEN
    if os.environ.get("SHOPIFY_ADMIN_TOKEN"):
        _TOKEN = os.environ["SHOPIFY_ADMIN_TOKEN"]
        return _TOKEN
    shop = os.environ["SHOPIFY_SHOP"]
    body = json.dumps({
        "client_id": os.environ["SHOPIFY_CLIENT_ID"],
        "client_secret": os.environ["SHOPIFY_CLIENT_SECRET"],
        "grant_type": "client_credentials",
    }).encode()
    req = urllib.request.Request(f"https://{shop}/admin/oauth/access_token", data=body, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as r:
        data = json.load(r)
    _TOKEN = data["access_token"]
    print("access token obtained; scopes:", data.get("scope"), "| expires_in:", data.get("expires_in"))
    return _TOKEN


def gql(query, variables):
    shop = os.environ["SHOPIFY_SHOP"]
    token = access_token()
    req = urllib.request.Request(
        f"https://{shop}/admin/api/{API_VERSION}/graphql.json",
        data=json.dumps({"query": query, "variables": variables}).encode(),
        headers={"Content-Type": "application/json", "X-Shopify-Access-Token": token},
    )
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.load(r)


def existing_collections():
    """handle -> {id, has_image} for every collection in the store (paginated)."""
    out, cursor = {}, None
    while True:
        res = gql("query($c: String) { collections(first: 250, after: $c) { nodes { id handle image { url } } pageInfo { hasNextPage endCursor } } }", {"c": cursor})
        page = res["data"]["collections"]
        for n in page["nodes"]:
            out[n["handle"]] = {"id": n["id"], "has_image": bool(n["image"])}
        if not page["pageInfo"]["hasNextPage"]:
            return out
        cursor = page["pageInfo"]["endCursor"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--handles", choices=["ids", "slug"], default="ids")
    ap.add_argument("--skip-internal", action="store_true")
    ap.add_argument("--kinds", default="category,brand")
    ap.add_argument("--batch", type=int, default=20)
    ap.add_argument("--execute", action="store_true", help="run against the store (needs SHOPIFY_SHOP + credentials, see module docstring)")
    ap.add_argument("--check-access", action="store_true", help="only obtain a token and read the shop name + collection count")
    ap.add_argument("--limit", type=int, default=0, help="create only the first N collections (pilot run)")
    ap.add_argument("--only", default="", help="comma-separated handles: process only these (retries)")
    args = ap.parse_args()
    args.kinds = args.kinds.split(",")
    definitions, inputs = build(args)
    if args.only:
        only = set(args.only.split(","))
        inputs = [i for i in inputs if i["handle"] in only]
    if args.limit:
        inputs = inputs[:args.limit]
        print(f"PILOT: only the first {args.limit} collections of the selection")
    batches = make_batches(inputs, args.batch)
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "definitions.json").write_text(json.dumps(definitions, ensure_ascii=False, indent=2), encoding="utf-8")
    for n, b in enumerate(batches):
        (OUT / f"batch-{n:02d}.graphql.json").write_text(json.dumps(b, ensure_ascii=False, indent=2), encoding="utf-8")
    kinds = {}
    for i in inputs:
        kinds[i["metafields"][0]["value"]] = kinds.get(i["metafields"][0]["value"], 0) + 1
    print(f"collections in plan: {len(inputs)} {kinds} | with image: {sum(1 for i in inputs if 'image' in i)} | batches: {len(batches)} | handles: {args.handles}")
    dup = {}
    for i in inputs:
        dup.setdefault(i["handle"], 0); dup[i["handle"]] += 1
    dups = {h: n for h, n in dup.items() if n > 1}
    if dups:
        print("DUPLICATE HANDLES:", dups)
        if args.execute:
            sys.exit("refusing to execute with duplicate handles")
    if args.check_access:
        res = gql("{ shop { name myshopifyDomain } collectionsCount { count } }", {})
        print(json.dumps(res, ensure_ascii=False))
        return
    if not args.execute:
        print("dry run only; payloads in", OUT)
        return
    existing = existing_collections()
    creates = [i for i in inputs if i["handle"] not in existing]
    # re-sending an image a collection already has fails the whole update, so drop it there
    updates = [{k: v for k, v in dict(i, id=existing[i["handle"]]["id"]).items() if not (k == "image" and existing[i["handle"]]["has_image"])}
               for i in inputs if i["handle"] in existing]
    print(f"store has {len(existing)} collections | to create: {len(creates)} | to update in place: {len(updates)} {[u['handle'] for u in updates][:20]}")
    log = []
    run = {"run": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"), "argv": sys.argv[1:]}
    for d in definitions:
        res = gql("mutation($def: MetafieldDefinitionInput!) { metafieldDefinitionCreate(definition: $def) { createdDefinition { id } userErrors { field message code } } }", {"def": d})
        print("definition", d["key"], json.dumps(res.get("data", res), ensure_ascii=False)[:200])
    runs = [("update", make_batches(updates, args.batch, "collectionUpdate", "u")), ("create", make_batches(creates, args.batch))]
    for action, action_batches in runs:
        for n, b in enumerate(action_batches):
            res = gql(b["query"], b["variables"])
            if res.get("errors"):
                print(f"{action} batch {n}: GRAPHQL ERRORS {json.dumps(res['errors'], ensure_ascii=False)[:500]}")
            data = res.get("data") or {}
            for alias, payload in data.items():
                errs = payload.get("userErrors") or []
                col = payload.get("collection") or {}
                sent = b["variables"]["in" + alias[1:]]
                log.append({"action": action, "batch": n, "alias": alias, "planned_handle": sent["handle"], "title": sent["title"],
                            "handle": col.get("handle"), "id": col.get("id"), "errors": errs})
                if errs:
                    print(f"{action} batch {n} {alias} {sent['handle']}: {errs}")
                elif col.get("handle") != sent["handle"]:
                    print(f"{action} batch {n} {alias}: HANDLE CHANGED {sent['handle']} -> {col.get('handle')}")
            print(f"{action} batch {n}: {len(data)} responses, {sum(1 for a in data.values() if a.get('userErrors'))} with errors")
    # append: the log is the rollback record (collectionDelete over every created id), never overwrite it
    log_path = OUT / "result-log.json"
    previous = json.loads(log_path.read_text(encoding="utf-8")) if log_path.exists() else []
    log_path.write_text(json.dumps(previous + [dict(run, **e) for e in log], ensure_ascii=False, indent=2), encoding="utf-8")
    print("log:", log_path, "| entries:", len(previous) + len(log))


if __name__ == "__main__":
    main()
