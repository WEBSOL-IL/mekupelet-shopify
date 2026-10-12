#!/usr/bin/env python3
"""Import per-product data from the merchant's product Excel into existing Shopify products.
Only rows with a barcode are used; a row matches a product whose variant barcode OR sku equals it.
Per matched product:
  - gallery images ("גלריית תמונות", "|"-separated URLs) appended to the product media, skipping
    files already present (compared by file name, case-insensitive, Shopify's size/UUID suffixes ignored)
  - custom.short_description  <- "תיאור קצר - קלוד"
  - custom.skills (list, choices) <- "מיומנות - קלוד AI" (", "-separated; values outside the choice
    list are dropped and reported)
  - custom.age_range (list, choices) <- "גילאים - מדויק" (same rule)
Dry run by default: prints the match report and writes docs/import/out/product-data-report.json.
Usage: python3 -I scripts/import-product-data.py <excel.xlsx> [--execute] [--limit N] [--no-images]
(env as import-collections.py)"""
import importlib.util, json, os, re, sys, time, urllib.parse

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..")
spec = importlib.util.spec_from_file_location("imp", os.path.join(HERE, "import-collections.py"))
imp = importlib.util.module_from_spec(spec); spec.loader.exec_module(imp)
gql = imp.gql

args = sys.argv[1:]
xlsx = next((a for a in args if a.endswith(".xlsx")), None) or sys.exit(__doc__)
execute = "--execute" in args
no_images = "--no-images" in args
limit = int(args[args.index("--limit") + 1]) if "--limit" in args else None

COL = {"name": "שם", "short": "תיאור קצר - קלוד", "age": "גילאים - מדויק", "skills": "מיומנות - קלוד AI",
       "gallery": "גלריית תמונות", "main": "תמונה ראשית", "barcode": "barcode", "sku": "meta:jk_sku"}
choices = {k: json.load(open(os.path.join(ROOT, "docs", "import", f), encoding="utf-8"))["choices"]
           for k, f in (("skills", "skills-choices.json"), ("age", "age-choices.json"))}

# ---- Excel ------------------------------------------------------------------------------------
import openpyxl
ws = openpyxl.load_workbook(xlsx, read_only=True, data_only=True).worksheets[0]
rows = ws.iter_rows(values_only=True)
hdr = [str(h).strip() if h is not None else "" for h in next(rows)]
idx = {k: hdr.index(v) for k, v in COL.items()}
def cell(r, k):
    v = r[idx[k]]
    return str(v).strip() if v is not None and str(v).strip() not in ("", "None") else ""
def norm_code(s):
    s = re.sub(r"\s+", "", s or "")
    return s[:-2] if re.fullmatch(r"\d+\.0", s) else s
def split_list(s, sep):
    out = []
    for x in (s or "").split(sep):
        x = x.strip()
        if x and x not in out:          # Shopify rejects lists with duplicates
            out.append(x)
    return out
def safe_url(u):
    # Shopify rejects raw non-ASCII / en-dash characters in originalSource; keep already-encoded parts
    return urllib.parse.quote(u, safe=":/?&=%+@~-._")
def file_key(url):
    """Comparable file name. Shopify stores non-ASCII names percent-encoded with "%" turned into "_"
    (מגנטים.jpg -> D7_9E_D7_92....jpg), so both sides are reduced to that encoded form."""
    name = url.split("?")[0].rsplit("/", 1)[-1]
    name = re.sub(r"_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(?=\.)", "", name, flags=re.I)  # shopify uuid suffix
    name = urllib.parse.quote(urllib.parse.unquote(name), safe="-._").replace("%", "_").lstrip("_").lower()
    name = re.sub(r"-\d{2,4}x\d{2,4}(?=\.)", "", name)                                                # wp thumbnails
    name = re.sub(r"\.jpeg$", ".jpg", name)                                                           # shopify re-extensions
    stem, dot, ext = name.rpartition(".")
    return (stem[:60] if stem else ext) + "." + ext if dot else name                                   # long names are truncated
def same_list(value, items):
    try:
        return json.loads(value or "null") == items
    except ValueError:
        return False

excel = []
seen_codes = {}
for r in rows:
    code = norm_code(cell(r, "barcode"))
    if not code:
        continue
    excel.append({"code": code, "sku": cell(r, "sku"), "name": cell(r, "name"), "short": cell(r, "short"),
                  "skills": split_list(cell(r, "skills"), ","), "age": split_list(cell(r, "age"), ","),
                  "gallery": [u for u in split_list(cell(r, "gallery"), "|") if u.startswith("http") and re.search(r"\.(jpe?g|png|gif|webp)$", u.split("?")[0], re.I)],
                  "main": cell(r, "main")})
    seen_codes.setdefault(code, 0); seen_codes[code] += 1
dup_rows = {c: n for c, n in seen_codes.items() if n > 1}

# ---- Shopify products -------------------------------------------------------------------------
products, cursor = [], None
while True:
    p = gql('''query($c:String){ products(first:250, after:$c){ pageInfo{hasNextPage endCursor} nodes{
        id title handle
        variants(first:20){ nodes{ id sku barcode } }
        media(first:50){ nodes{ ... on MediaImage { id image { url } } } }
        sd: metafield(namespace:"custom", key:"short_description"){ value }
        sk: metafield(namespace:"custom", key:"skills"){ value }
        ag: metafield(namespace:"custom", key:"age_range"){ value } } } }''', {"c": cursor})["data"]["products"]
    products += p["nodes"]
    if not p["pageInfo"]["hasNextPage"]:
        break
    cursor = p["pageInfo"]["endCursor"]
by_code = {}
for pr in products:
    for v in pr["variants"]["nodes"]:
        for c in (norm_code(v["barcode"] or ""), norm_code(v["sku"] or "")):
            if c:
                by_code.setdefault(c, set()).add(pr["id"])
prod_by_id = {p["id"]: p for p in products}

# ---- Match + plan -----------------------------------------------------------------------------
plan, unmatched, ambiguous, bad_values = [], [], [], {"skills": {}, "age": {}}
touched = {}
for row in excel:
    ids = by_code.get(row["code"]) or (by_code.get(norm_code(row["sku"])) if row["sku"] else None)
    if not ids:
        unmatched.append(row["code"]); continue
    if len(ids) > 1:
        ambiguous.append((row["code"], sorted(ids))); continue
    pid = next(iter(ids)); pr = prod_by_id[pid]
    if pid in touched:
        touched[pid] += 1; continue          # first row wins; duplicates reported
    touched[pid] = 1
    skills = [s for s in row["skills"] if s in choices["skills"]]
    for s in row["skills"]:
        if s not in choices["skills"]: bad_values["skills"][s] = bad_values["skills"].get(s, 0) + 1
    ages = [a for a in row["age"] if a in choices["age"]]
    for a in row["age"]:
        if a not in choices["age"]: bad_values["age"][a] = bad_values["age"].get(a, 0) + 1
    have = {file_key(m["image"]["url"]) for m in pr["media"]["nodes"] if m.get("image")}
    new_imgs, seen = [], set()
    for u in row["gallery"]:
        k = file_key(u)
        if k in have or k in seen:
            continue
        seen.add(k); new_imgs.append(u)
    mfs = []
    if row["short"] and row["short"] != (pr["sd"] or {}).get("value"):
        mfs.append({"key": "short_description", "type": "multi_line_text_field", "value": row["short"]})
    if skills and not same_list((pr["sk"] or {}).get("value"), skills):
        mfs.append({"key": "skills", "type": "list.single_line_text_field", "value": json.dumps(skills, ensure_ascii=False)})
    if ages and not same_list((pr["ag"] or {}).get("value"), ages):
        mfs.append({"key": "age_range", "type": "list.single_line_text_field", "value": json.dumps(ages, ensure_ascii=False)})
    if mfs or new_imgs:
        plan.append({"id": pid, "handle": pr["handle"], "title": pr["title"], "code": row["code"], "metafields": mfs,
                     "images": [] if no_images else new_imgs, "alt": pr["title"]})

dup_products = {prod_by_id[k]["handle"]: n for k, n in touched.items() if n > 1}
report = {"excel_rows_with_barcode": len(excel), "duplicate_barcodes_in_excel": dup_rows, "shopify_products": len(products),
          "matched_products": len(touched), "unmatched_barcodes": len(unmatched), "unmatched_sample": unmatched[:30],
          "ambiguous": ambiguous[:30], "rows_sharing_a_product": dup_products,
          "to_update": len(plan), "with_new_images": sum(1 for p in plan if p["images"]),
          "new_images_total": sum(len(p["images"]) for p in plan),
          "metafield_writes": {k: sum(1 for p in plan for m in p["metafields"] if m["key"] == k)
                               for k in ("short_description", "skills", "age_range")},
          "values_outside_choices": {k: dict(sorted(v.items(), key=lambda x: -x[1])) for k, v in bad_values.items()}}
os.makedirs(os.path.join(ROOT, "docs", "import", "out"), exist_ok=True)
json.dump({"report": report, "plan": plan}, open(os.path.join(ROOT, "docs", "import", "out", "product-data-report.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(json.dumps(report, ensure_ascii=False, indent=1))
if not execute:
    print("dry run; add --execute to write"); sys.exit(0)

# ---- Execute ----------------------------------------------------------------------------------
done, errors = 0, []
for i, p in enumerate(plan[:limit] if limit else plan):
    if p["metafields"]:
        r = gql('mutation($m:[MetafieldsSetInput!]!){ metafieldsSet(metafields:$m){ userErrors{ field message code } } }',
                {"m": [{"ownerId": p["id"], "namespace": "custom", **m} for m in p["metafields"]]})
        ue = r.get("data", {}).get("metafieldsSet", {}).get("userErrors") or r.get("errors")
        if ue:
            errors.append({"handle": p["handle"], "step": "metafields", "err": ue}); continue
    if p["images"]:
        r = gql('mutation($id:ID!,$m:[CreateMediaInput!]!){ productCreateMedia(productId:$id, media:$m){ mediaUserErrors{ field message code } } }',
                {"id": p["id"], "m": [{"originalSource": safe_url(u), "mediaContentType": "IMAGE", "alt": p["alt"]} for u in p["images"]]})
        ue = r.get("data", {}).get("productCreateMedia", {}).get("mediaUserErrors") or r.get("errors")
        if ue:
            errors.append({"handle": p["handle"], "step": "images", "err": ue}); continue
    done += 1
    if done % 100 == 0:
        print("updated", done, flush=True)
    time.sleep(0.25)
json.dump(errors, open(os.path.join(ROOT, "docs", "import", "out", "product-data-errors.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("updated", done, "errors", len(errors))
