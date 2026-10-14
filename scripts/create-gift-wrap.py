#!/usr/bin/env python3
"""Hyper gift wrapping: a 3 ILS product "אריזת מתנה" (tag gift-wrap, not tracked, no shipping), published
to the Online Store, linked from a menu with handle `gift-wrapping` (Hyper reads linklists['gift-wrapping']),
and an automated `all` collection that leaves the wrap product out of /collections/all.
Usage: python3 -I scripts/create-gift-wrap.py [--execute]   (env as import-collections.py). Idempotent."""
import importlib.util, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("imp", os.path.join(HERE, "import-collections.py"))
imp = importlib.util.module_from_spec(spec); spec.loader.exec_module(imp)
gql = imp.gql
execute = "--execute" in sys.argv
ONLINE_STORE = "gid://shopify/Publication/146896027842"
HANDLE, MENU, TAG, PRICE = "gift-wrap", "gift-wrapping", "gift-wrap", "3.00"

def check(r, path):
    d = r["data"]
    for k in path: d = d[k]
    if d.get("userErrors"): sys.exit(f"{path}: {d['userErrors']}")
    return d

state = gql('query($h:String!){ productByHandle(handle:$h){ id status variants(first:1){ nodes{ id price } } } menus(first:50){ nodes{ id handle } } all: collectionByHandle(handle:"all"){ id } }', {"h": HANDLE})["data"]
product = state["productByHandle"]; menu = next((m for m in state["menus"]["nodes"] if m["handle"] == MENU), None); allc = state["all"]
print("product:", product and product["id"], "| menu:", menu and menu["id"], "| all collection:", allc and allc["id"], "(dry run)" if not execute else "")
if not execute: sys.exit(0)

if not product:
    r = gql('''mutation($in:ProductSetInput!){ productSet(synchronous:true, input:$in){ product{ id variants(first:1){ nodes{ id } } } userErrors{ field message } } }''',
            {"in": {"title": "אריזת מתנה", "handle": HANDLE, "status": "ACTIVE", "tags": [TAG], "productType": "שירות", "vendor": "מקופלת",
                    "descriptionHtml": "<p>אריזת מתנה להזמנה.</p>",
                    "productOptions": [{"name": "Title", "values": [{"name": "Default Title"}]}],
                    "variants": [{"price": PRICE, "optionValues": [{"optionName": "Title", "name": "Default Title"}], "taxable": True,
                                  "inventoryPolicy": "CONTINUE", "inventoryItem": {"tracked": False, "requiresShipping": False}}]}})
    product = check(r, ["productSet"])["product"]; print("created product", product["id"])
    p = check(gql('mutation($id:ID!,$pub:[PublicationInput!]!){ publishablePublish(id:$id, input:$pub){ userErrors{ field message } } }', {"id": product["id"], "pub": [{"publicationId": ONLINE_STORE}]}), ["publishablePublish"])
    print("published to Online Store")
if not menu:
    r = gql('mutation($t:String!,$h:String!,$items:[MenuItemCreateInput!]!){ menuCreate(title:$t, handle:$h, items:$items){ menu{ id handle } userErrors{ field message } } }',
            {"t": "Gift wrapping (Hyper)", "h": MENU, "items": [{"title": "אריזת מתנה", "type": "PRODUCT", "resourceId": product["id"]}]})
    menu = check(r, ["menuCreate"])["menu"]; print("created menu", menu)
if not allc:
    r = gql('mutation($in:CollectionInput!){ collectionCreate(input:$in){ collection{ id handle productsCount{count} } userErrors{ field message } } }',
            {"in": {"title": "מוצרים", "handle": "all", "sortOrder": "BEST_SELLING",
                    "ruleSet": {"appliedDisjunctively": False, "rules": [{"column": "TAG", "relation": "NOT_EQUALS", "condition": TAG}]}}})
    allc = check(r, ["collectionCreate"])["collection"]; print("created collection", allc)
    check(gql('mutation($id:ID!,$pub:[PublicationInput!]!){ publishablePublish(id:$id, input:$pub){ userErrors{ field message } } }', {"id": allc["id"], "pub": [{"publicationId": ONLINE_STORE}]}), ["publishablePublish"])
print("done")
