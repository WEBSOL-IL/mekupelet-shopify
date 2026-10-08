#!/usr/bin/env python3
"""
Create the footer menus (footer-1..footer-4) in the store with menuCreate. Dry run by default;
--execute writes to the store. Idempotent: a menu whose handle already exists is left untouched
(print + skip). Uses the same credentials as scripts/import-collections.py (SHOPIFY_SHOP +
SHOPIFY_CLIENT_ID/SECRET or SHOPIFY_ADMIN_TOKEN; scope write_online_store_navigation).

Structure (approved 2026-10-08, see docs/progress.md): pages / customer service / 6 top categories /
6 age collections. Links to pages, policies and age collections that do not exist yet are HTTP links
by path, so each menu item works as soon as the merchant creates the resource with that handle
(see docs/merchant-checklist.md). The main menu is NOT created here: the merchant picks 11 roots.
"""
import importlib.util, json, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("imp", ROOT / "import-collections.py")
imp = importlib.util.module_from_spec(spec); spec.loader.exec_module(imp)
OUT = ROOT.parent / "docs/import/out"


def http(title, url):
    return {"title": title, "type": "HTTP", "url": url}


def collection(title, handle, ids):
    return {"title": title, "type": "COLLECTION", "resourceId": ids[handle]}


def menus(ids):
    # the six categories of the Home "categories" slider (templates/index.json)
    top_categories = [("בגדי ילדים", "בגדי-ילדים"), ("כלי אוכל", "כלי-אוכל"), ("ספרים", "ספרים"),
                      ("צעצועים ובובות", "צעצועים-ובובות"), ("אביזרים", "אביזרים"), ("כלי בית", "כלי-בית")]
    # the six age pills of the Home "רכישה לפי גיל" section (same handles as templates/index.json)
    ages = [("0-6 חודשים", "age-0-6"), ("6-12 חודשים", "age-6-12"), ("שנה-שנה וחצי", "age-1-1-5"),
            ("שנה וחצי-שנתיים", "age-1-5-2"), ("שנתיים-שלוש", "age-2-3"), ("3+ שנים", "age-3-plus")]
    return [
        ("footer-1", "Footer 1 — חשוב לדעת", [
            http("אודות", "/pages/about"), http("שאלות ותשובות", "/pages/faq"), http("בלוג", "/blogs/news"),
            http("גיפט קארד", "/products/gift-card"), http("המותגים שלנו", "/pages/brands")]),
        ("footer-2", "Footer 2 — שירות לקוחות", [
            http("צור קשר", "/pages/contact"), http("משלוחים", "/pages/shipping"),
            http("מדיניות החזרות", "/policies/refund-policy"), http("תנאי שימוש", "/policies/terms-of-service"),
            http("מדיניות פרטיות", "/policies/privacy-policy"), http("הצהרת נגישות", "/pages/accessibility"),
            http("אזור אישי", "/account")]),
        ("footer-3", "Footer 3 — קטגוריות", [collection(t, h, ids) for t, h in top_categories]),
        ("footer-4", "Footer 4 — לפי גיל", [http(t, f"/collections/{h}") for t, h in ages]),
    ]


def main():
    execute = "--execute" in sys.argv
    existing = {h: v["id"] for h, v in imp.existing_collections().items()}
    res = imp.gql("{ menus(first: 50) { nodes { id handle } } }", {})
    have = {m["handle"]: m["id"] for m in res["data"]["menus"]["nodes"]}
    log = []
    for handle, title, items in menus(existing):
        if handle in have:
            print(f"{handle}: exists ({have[handle]}), skipped")
            continue
        print(f"{handle}: {len(items)} items" + ("" if execute else " (dry run)"), [i["title"] for i in items])
        if not execute:
            continue
        r = imp.gql("mutation($t: String!, $h: String!, $i: [MenuItemCreateInput!]!) { menuCreate(title: $t, handle: $h, items: $i) { menu { id handle title items { title url type } } userErrors { field message code } } }",
                    {"t": title, "h": handle, "i": items})
        payload = r.get("data", {}).get("menuCreate") or r
        print(json.dumps(payload, ensure_ascii=False)[:400])
        log.append({"handle": handle, "result": payload})
    if execute:
        OUT.mkdir(parents=True, exist_ok=True)
        (OUT / "menus-log.json").write_text(json.dumps(log, ensure_ascii=False, indent=2), encoding="utf-8")


if __name__ == "__main__":
    main()
