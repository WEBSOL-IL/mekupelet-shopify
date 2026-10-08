#!/usr/bin/env python3
"""
Update existing store products from the merchant's product file (docs/import/in/products.xlsx):
category tags, vendor, price / compare-at price and stock, matched by SKU (fallback: file id = handle).
Mapping and approved decisions: docs/import/products-mapping.md. Dry run by default; --execute writes.

Same credentials as scripts/import-collections.py. Scopes: write_products, read_inventory,
write_inventory, read_locations.

  --limit N      pilot: only the first N matched products (plus no store-only zeroing)
  --only SKU,..  only these SKUs
  --skip stock|prices|vendor|tags|zero   skip a step (repeatable, comma-separated)
Every write is logged with the previous value in docs/import/out/products-log.json (append-only).
"""
import argparse, datetime, html, importlib.util, json, pathlib, sys
import openpyxl

ROOT = pathlib.Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("imp", ROOT / "scripts/import-collections.py")
imp = importlib.util.module_from_spec(spec); spec.loader.exec_module(imp)
IN = ROOT / "docs/import/in/products.xlsx"
OUT = ROOT / "docs/import/out"
TAG_PREFIX = "legacy-category-"
# internal WooCommerce rules that still become a tag (merchant decision: coupon exclusion)
KEEP_INTERNAL = ("לא לכלול בקופונים", "לא לכלול בקופון 30")
BATCH = 20


def load_file():
    wb = openpyxl.load_workbook(IN, read_only=True, data_only=True)
    rows = list(wb.worksheets[0].iter_rows(values_only=True))
    return [dict(zip(rows[0], r)) for r in rows[1:]]


def sku_str(v):
    return "" if v in (None, "") else str(v).strip()


def money(v):
    return None if v in (None, "") else f"{float(v):.2f}"


def build_brand_map(plan):
    bmap = {}
    for b in plan["collections"]:
        if b["kind"] != "brand":
            continue
        bmap.setdefault(b["title"].strip().lower(), b["title"].strip())
        for a in b.get("aliases") or []:
            bmap.setdefault(str(a).strip().lower(), b["title"].strip())
    for k, v in plan["product_migration"]["vendor_aliases"].items():
        if v.strip().lower() in bmap:
            bmap.setdefault(k.strip().lower(), bmap[v.strip().lower()])
    return bmap


def resolve_vendor(raw, bmap):
    if raw in (None, ""):
        return None
    parts = list(dict.fromkeys(html.unescape(p).strip() for p in str(raw).split("|")))
    hits = [bmap[p.lower()] for p in parts if p.lower() in bmap]
    return hits[0] if hits else None  # unknown brand: leave the vendor as is


def tags_for(raw, by_path, by_key):
    tags = set()
    for p in str(raw or "").split("|"):
        c = by_path.get(p.strip())
        if not c:
            continue
        if imp.is_internal(c) and not c["title"].strip().startswith(KEEP_INTERNAL):
            continue
        while c:
            tags.add(f"{TAG_PREFIX}{c['source_term_id']}")
            c = by_key.get(c["parent_key"]) if c.get("parent_key") and not imp.is_internal(c) else None
    return sorted(tags)


def store_variants():
    nodes, cursor = [], None
    while True:
        r = imp.gql("query($c: String) { productVariants(first: 250, after: $c) { nodes { id sku price compareAtPrice inventoryQuantity inventoryItem { id tracked } product { id title handle vendor tags } } pageInfo { hasNextPage endCursor } } }", {"c": cursor})
        if r.get("errors"):
            sys.exit("variants query failed: " + json.dumps(r["errors"])[:300])
        page = r["data"]["productVariants"]; nodes += page["nodes"]
        if not page["pageInfo"]["hasNextPage"]:
            return nodes
        cursor = page["pageInfo"]["endCursor"]


def location_id():
    r = imp.gql("{ locations(first: 5, query: \"active:true\") { nodes { id name fulfillsOnlineOrders } } }", {})
    locs = r.get("data", {}).get("locations", {}).get("nodes") if r.get("data") else None
    if not locs:
        sys.exit("cannot read locations (scope read_locations?): " + json.dumps(r.get("errors"))[:300])
    if len(locs) != 1:
        sys.exit(f"expected one active location, got {[(l['id'], l['name']) for l in locs]}")
    return locs[0]["id"]


def run_batches(label, items, make_field, decl_type, log, prev_of):
    """items: list of (key, variables_value). make_field(alias, var) -> mutation field text."""
    for i in range(0, len(items), BATCH):
        chunk = items[i:i + BATCH]
        fields = [make_field(f"m{j}", f"$v{j}") for j, _ in enumerate(chunk)]
        decl = ", ".join(f"$v{j}: {decl_type}" for j in range(len(chunk)))
        q = f"mutation({decl}) {{\n  " + "\n  ".join(fields) + "\n}"
        r = imp.gql(q, {f"v{j}": v for j, (_, v) in enumerate(chunk)})
        if r.get("errors"):
            print(f"{label} batch {i // BATCH}: GRAPHQL ERRORS {json.dumps(r['errors'], ensure_ascii=False)[:400]}")
        data = r.get("data") or {}
        errs = 0
        for j, (key, v) in enumerate(chunk):
            payload = data.get(f"m{j}") or {}
            ue = payload.get("userErrors") or []
            errs += bool(ue)
            log.append({"step": label, "key": key, "sent": v, "previous": prev_of(key), "errors": ue})
            if ue:
                print(f"{label} {key}: {ue}")
        print(f"{label} batch {i // BATCH}: {len(chunk)} sent, {errs} with errors")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--execute", action="store_true")
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--only", default="")
    ap.add_argument("--skip", default="")
    args = ap.parse_args()
    skip = set(filter(None, args.skip.split(",")))

    plan = imp.load_plan()
    cats = [c for c in plan["collections"] if c["kind"] == "category"]
    by_path = {">".join(c["path"]): c for c in cats}
    by_key = {c["key"]: c for c in plan["collections"]}
    bmap = build_brand_map(plan)
    rows = load_file()
    variants = store_variants()
    by_sku = {sku_str(v["sku"]): v for v in variants if sku_str(v["sku"])}
    by_handle = {v["product"]["handle"]: v for v in variants}

    matched, unmatched = [], []
    for r in rows:
        v = by_sku.get(sku_str(r["Sku"])) or by_handle.get(str(r["id"]))
        (matched if v else unmatched).append((r, v))
    if args.only:
        only = set(args.only.split(","))
        matched = [(r, v) for r, v in matched if sku_str(r["Sku"]) in only or str(r["id"]) in only]
    if args.limit:
        matched = matched[:args.limit]
    matched_ids = {v["product"]["id"] for _, v in matched}
    file_keys = {sku_str(r["Sku"]) for r in rows} | {str(r["id"]) for r in rows}
    store_only = [v for v in variants if sku_str(v["sku"]) not in file_keys and v["product"]["handle"] not in file_keys]

    tag_ops, vendor_ops, price_ops, stock_ops, track_ops = [], [], [], [], []
    for r, v in matched:
        p = v["product"]
        new_tags = [t for t in tags_for(r["קטגוריות מוצרים"], by_path, by_key) if t not in p["tags"]]
        if new_tags:
            tag_ops.append((p["handle"], {"id": p["id"], "tags": new_tags}))
        vendor = resolve_vendor(r["Brands"], bmap)
        if vendor and vendor != (p["vendor"] or "").strip():
            vendor_ops.append((p["handle"], {"id": p["id"], "vendor": vendor}))
        sale = r["Sale Price"] not in (None, "")
        price = money(r["Sale Price"] if sale else (r["Regular Price"] if r["Regular Price"] not in (None, "") else r["Price"]))
        comp = money(r["Regular Price"]) if sale else None
        if price and (price != money(v["price"]) or comp != money(v["compareAtPrice"])):
            price_ops.append((p["handle"], {"productId": p["id"], "variants": [{"id": v["id"], "price": price, "compareAtPrice": comp}]}))
        if r["Stock"] not in (None, ""):
            qty = int(float(r["Stock"]))
            if not v["inventoryItem"]["tracked"]:
                track_ops.append((p["handle"], {"id": v["inventoryItem"]["id"], "input": {"tracked": True}}))
            if qty != v["inventoryQuantity"] or not v["inventoryItem"]["tracked"]:
                stock_ops.append((p["handle"], {"inventoryItemId": v["inventoryItem"]["id"], "quantity": qty, "prev": v["inventoryQuantity"]}))
    zero_ops = []
    if not args.limit and not args.only:
        for v in store_only:
            if v["inventoryQuantity"] != 0 or not v["inventoryItem"]["tracked"]:
                if not v["inventoryItem"]["tracked"]:
                    track_ops.append((v["product"]["handle"], {"id": v["inventoryItem"]["id"], "input": {"tracked": True}}))
                zero_ops.append((v["product"]["handle"], {"inventoryItemId": v["inventoryItem"]["id"], "quantity": 0, "prev": v["inventoryQuantity"]}))

    print(f"file rows {len(rows)} | matched {len(matched)} | unmatched {len(unmatched)} | store-only {len(store_only)}")
    print(f"planned: tags {len(tag_ops)} products | vendor {len(vendor_ops)} | prices {len(price_ops)} | stock {len(stock_ops)} | zero store-only {len(zero_ops)} | enable tracking {len(track_ops)}")
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "products-plan.json").write_text(json.dumps({
        "tags": tag_ops, "vendor": vendor_ops, "prices": price_ops, "stock": stock_ops, "zero": zero_ops, "track": track_ops,
        "unmatched_file_rows": [(r["id"], sku_str(r["Sku"]), r["Title"]) for r, _ in unmatched],
        "store_only": [(v["product"]["handle"], v["sku"], v["product"]["title"]) for v in store_only]}, ensure_ascii=False, indent=1, default=str), encoding="utf-8")
    if not args.execute:
        print("dry run; plan in", OUT / "products-plan.json")
        return

    prev = {v["product"]["handle"]: {"vendor": v["product"]["vendor"], "tags": v["product"]["tags"], "price": v["price"], "compareAtPrice": v["compareAtPrice"], "inventoryQuantity": v["inventoryQuantity"], "tracked": v["inventoryItem"]["tracked"]} for v in variants}
    log = []
    if "tags" not in skip:
        # tagsAdd takes scalar args, not an input object
        for i in range(0, len(tag_ops), BATCH):
            chunk = tag_ops[i:i + BATCH]
            fields = [f"m{j}: tagsAdd(id: $id{j}, tags: $tags{j}) {{ userErrors {{ field message }} }}" for j in range(len(chunk))]
            decl = ", ".join(f"$id{j}: ID!, $tags{j}: [String!]!" for j in range(len(chunk)))
            variables = {}
            for j, (_, v) in enumerate(chunk):
                variables[f"id{j}"] = v["id"]; variables[f"tags{j}"] = v["tags"]
            r = imp.gql(f"mutation({decl}) {{\n  " + "\n  ".join(fields) + "\n}", variables)
            if r.get("errors"):
                print(f"tags batch {i // BATCH}: GRAPHQL ERRORS {json.dumps(r['errors'], ensure_ascii=False)[:400]}")
            data = r.get("data") or {}
            errs = 0
            for j, (key, v) in enumerate(chunk):
                ue = (data.get(f"m{j}") or {}).get("userErrors") or []
                errs += bool(ue)
                log.append({"step": "tags", "key": key, "sent": v, "previous": prev.get(key), "errors": ue})
                if ue:
                    print(f"tags {key}: {ue}")
            print(f"tags batch {i // BATCH}: {len(chunk)} sent, {errs} with errors")
    if "vendor" not in skip:
        run_batches("vendor", vendor_ops, lambda a, x: f"{a}: productUpdate(product: {x}) {{ userErrors {{ field message }} }}", "ProductUpdateInput!", log, prev.get)
    if "prices" not in skip:
        for i in range(0, len(price_ops), BATCH):
            chunk = price_ops[i:i + BATCH]
            fields = [f"m{j}: productVariantsBulkUpdate(productId: $p{j}, variants: $v{j}) {{ userErrors {{ field message }} }}" for j in range(len(chunk))]
            decl = ", ".join(f"$p{j}: ID!, $v{j}: [ProductVariantsBulkInput!]!" for j in range(len(chunk)))
            variables = {}
            for j, (_, v) in enumerate(chunk):
                variables[f"p{j}"] = v["productId"]; variables[f"v{j}"] = v["variants"]
            r = imp.gql(f"mutation({decl}) {{\n  " + "\n  ".join(fields) + "\n}", variables)
            if r.get("errors"):
                print(f"prices batch {i // BATCH}: GRAPHQL ERRORS {json.dumps(r['errors'], ensure_ascii=False)[:400]}")
            data = r.get("data") or {}
            errs = 0
            for j, (key, v) in enumerate(chunk):
                ue = (data.get(f"m{j}") or {}).get("userErrors") or []
                errs += bool(ue)
                log.append({"step": "prices", "key": key, "sent": v, "previous": prev.get(key), "errors": ue})
                if ue:
                    print(f"prices {key}: {ue}")
            print(f"prices batch {i // BATCH}: {len(chunk)} sent, {errs} with errors")
    if "stock" not in skip or "zero" not in skip:
        loc = location_id()
        if track_ops:
            for i in range(0, len(track_ops), BATCH):
                chunk = track_ops[i:i + BATCH]
                fields = [f"m{j}: inventoryItemUpdate(id: $id{j}, input: $in{j}) {{ userErrors {{ field message }} }}" for j in range(len(chunk))]
                decl = ", ".join(f"$id{j}: ID!, $in{j}: InventoryItemInput!" for j in range(len(chunk)))
                variables = {}
                for j, (_, v) in enumerate(chunk):
                    variables[f"id{j}"] = v["id"]; variables[f"in{j}"] = v["input"]
                r = imp.gql(f"mutation({decl}) {{\n  " + "\n  ".join(fields) + "\n}", variables)
                data = r.get("data") or {}
                for j, (key, v) in enumerate(chunk):
                    ue = (data.get(f"m{j}") or {}).get("userErrors") or []
                    log.append({"step": "track", "key": key, "sent": v, "previous": prev.get(key), "errors": ue})
                    if ue:
                        print(f"track {key}: {ue}")
                print(f"track batch {i // BATCH}: {len(chunk)} sent")
        ops = ([] if "stock" in skip else stock_ops) + ([] if "zero" in skip else zero_ops)
        for i in range(0, len(ops), 100):
            chunk = ops[i:i + 100]
            inp = {"name": "available", "reason": "correction", "ignoreCompareQuantity": True,
                   "quantities": [{"inventoryItemId": v["inventoryItemId"], "locationId": loc, "quantity": v["quantity"]} for _, v in chunk]}
            r = imp.gql("mutation($in: InventorySetQuantitiesInput!) { inventorySetQuantities(input: $in) { inventoryAdjustmentGroup { changes { name delta } } userErrors { field message code } } }", {"in": inp})
            payload = (r.get("data") or {}).get("inventorySetQuantities") or {}
            ue = payload.get("userErrors") or []
            if r.get("errors") or ue:
                print(f"stock batch {i // 100}: ERRORS {json.dumps(r.get('errors') or ue, ensure_ascii=False)[:400]}")
            for key, v in chunk:
                log.append({"step": "stock", "key": key, "sent": v, "previous": prev.get(key), "errors": ue})
            print(f"stock batch {i // 100}: {len(chunk)} sent, changes applied: {len((payload.get('inventoryAdjustmentGroup') or {}).get('changes') or [])}")
    run = {"run": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"), "argv": sys.argv[1:]}
    log_path = OUT / "products-log.json"
    previous = json.loads(log_path.read_text(encoding="utf-8")) if log_path.exists() else []
    log_path.write_text(json.dumps(previous + [dict(run, **e) for e in log], ensure_ascii=False, indent=1), encoding="utf-8")
    print("log:", log_path, "| entries:", len(previous) + len(log))


if __name__ == "__main__":
    main()
