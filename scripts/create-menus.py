#!/usr/bin/env python3
"""Create / update the storefront navigation menus from docs/import/menus.json.

Dry run by default: resolves every collection handle and prints the tree. `--execute` writes:
menuCreate for handles that do not exist yet, menuUpdate (items replaced) for ones that do.
Auth: same env as scripts/import-collections.py (SHOPIFY_SHOP + SHOPIFY_CLIENT_ID/SECRET or
SHOPIFY_ADMIN_TOKEN). Scope needed: write_online_store_navigation (+ read_products for lookups).
Run with `python3 -I scripts/create-menus.py [--execute] [--only main-menu,footer-1]`.
"""
import argparse, importlib.util, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("imp", os.path.join(HERE, "import-collections.py"))
imp = importlib.util.module_from_spec(spec); spec.loader.exec_module(imp)
gql = imp.gql
SPEC = os.path.join(HERE, "..", "docs", "import", "menus.json")


def fetch_collections():
    ids, after = {}, None
    while True:
        r = gql("""query($after:String){ collections(first:250, after:$after) {
            nodes { id handle } pageInfo { hasNextPage endCursor } } }""", {"after": after})
        d = r["data"]["collections"]
        ids.update({n["handle"]: n["id"] for n in d["nodes"]})
        if not d["pageInfo"]["hasNextPage"]:
            return ids
        after = d["pageInfo"]["endCursor"]


def fetch_menus():
    r = gql("{ menus(first: 50) { nodes { id handle title } } }", {})
    return {m["handle"]: m for m in r["data"]["menus"]["nodes"]}


def to_input(item, spec, cols, errors, path=""):
    title = item["t"]
    out = {"title": title}
    if "c" in item:
        if item["c"] not in cols:
            errors.append(f"{path}/{title}: collection '{item['c']}' not found")
        out.update(type="COLLECTION", resourceId=cols.get(item["c"]), url=f"/collections/{item['c']}")
    elif "p" in item:
        if item["p"] not in spec["pages"]:
            errors.append(f"{path}/{title}: page '{item['p']}' not in spec.pages")
        out.update(type="PAGE", resourceId=spec["pages"].get(item["p"]), url=f"/pages/{item['p']}")
    elif "blog" in item:
        out.update(type="BLOG", resourceId=spec["blogs"][item["blog"]], url=f"/blogs/{item['blog']}")
    elif "u" in item:
        out.update(type="HTTP", url=item["u"])
    else:
        errors.append(f"{path}/{title}: no target")
    if item.get("i"):
        out["items"] = [to_input(c, spec, cols, errors, f"{path}/{title}") for c in item["i"]]
    return out


def show(items, depth=0):
    for it in items:
        print("  " * depth + f"- {it['title']}  [{it.get('type')}] {it.get('url', '')}")
        show(it.get("items", []), depth + 1)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--execute", action="store_true")
    ap.add_argument("--only", default="", help="comma-separated menu handles")
    args = ap.parse_args()
    spec = json.load(open(SPEC, encoding="utf-8"))
    only = {h for h in args.only.split(",") if h}
    cols = fetch_collections()
    existing = fetch_menus()
    print(f"collections: {len(cols)}; existing menus: {sorted(existing)}")
    errors = []
    plans = []
    for menu in spec["menus"]:
        if only and menu["handle"] not in only:
            continue
        items = [to_input(i, spec, cols, errors, menu["handle"]) for i in menu["items"]]
        plans.append((menu, items))
        print(f"\n== {menu['handle']} ({'update' if menu['handle'] in existing else 'create'}): {menu['title']}")
        show(items)
    if errors:
        print("\nERRORS:"); [print(" ", e) for e in errors]; sys.exit(1)
    if not args.execute:
        print("\ndry run only; add --execute to write"); return
    for menu, items in plans:
        if menu["handle"] in existing:
            r = gql("""mutation($id:ID!,$title:String!,$handle:String!,$items:[MenuItemUpdateInput!]!){
                menuUpdate(id:$id,title:$title,handle:$handle,items:$items){ menu { id handle } userErrors { field message } } }""",
                {"id": existing[menu["handle"]]["id"], "title": menu["title"], "handle": menu["handle"], "items": items})
            res = r.get("data", {}).get("menuUpdate")
        else:
            r = gql("""mutation($title:String!,$handle:String!,$items:[MenuItemCreateInput!]!){
                menuCreate(title:$title,handle:$handle,items:$items){ menu { id handle } userErrors { field message } } }""",
                {"title": menu["title"], "handle": menu["handle"], "items": items})
            res = r.get("data", {}).get("menuCreate")
        if not res:
            print(menu["handle"], "FAILED:", json.dumps(r, ensure_ascii=False)[:800]); continue
        print(menu["handle"], "->", res["menu"], "errors:", res["userErrors"])


if __name__ == "__main__":
    main()
