#!/usr/bin/env python3
"""Create (or update) the three automated Home collections and publish them to the Online Store:
  new-arrivals  חדש באתר   every product, newest first
  best-sellers  בסט סלרס   every product, best selling first
  on-sale       במבצע      products with a compare-at price, best selling first
Usage: python3 -I scripts/create-home-collections.py [--execute]   (env as import-collections.py)"""
import importlib.util, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("imp", os.path.join(HERE, "import-collections.py"))
imp = importlib.util.module_from_spec(spec); spec.loader.exec_module(imp)
gql = imp.gql
execute = "--execute" in sys.argv

ONLINE_STORE = "gid://shopify/Publication/146896027842"
ANY_PRODUCT = {"column": "VARIANT_PRICE", "relation": "GREATER_THAN", "condition": "0"}
SPECS = [
    {"handle": "new-arrivals", "title": "חדש באתר", "sortOrder": "CREATED_DESC", "rules": [ANY_PRODUCT],
     "descriptionHtml": "<p>המוצרים האחרונים שעלו לאתר.</p>"},
    {"handle": "best-sellers", "title": "בסט סלרס", "sortOrder": "BEST_SELLING", "rules": [ANY_PRODUCT],
     "descriptionHtml": "<p>המוצרים הכי נמכרים במקופלת.</p>"},
    {"handle": "on-sale", "title": "במבצע", "sortOrder": "BEST_SELLING",
     "rules": [{"column": "VARIANT_COMPARE_AT_PRICE", "relation": "GREATER_THAN", "condition": "0"}],
     "descriptionHtml": "<p>מוצרים במחיר מבצע.</p>"},
]

for spec_ in SPECS:
    existing = gql('query($h:String!){ collectionByHandle(handle:$h){ id productsCount{count} } }', {"h": spec_["handle"]})["data"]["collectionByHandle"]
    inp = {"title": spec_["title"], "handle": spec_["handle"], "descriptionHtml": spec_["descriptionHtml"],
           "sortOrder": spec_["sortOrder"], "ruleSet": {"appliedDisjunctively": False, "rules": spec_["rules"]}}
    print(f"{spec_['handle']}: {'update' if existing else 'create'}", "(dry run)" if not execute else "")
    if not execute:
        continue
    if existing:
        inp["id"] = existing["id"]
        r = gql('mutation($in:CollectionInput!){ collectionUpdate(input:$in){ collection{ id handle productsCount{count} } userErrors{ field message } } }', {"in": inp})
        d = r["data"]["collectionUpdate"]
    else:
        r = gql('mutation($in:CollectionInput!){ collectionCreate(input:$in){ collection{ id handle productsCount{count} } userErrors{ field message } } }', {"in": inp})
        d = r["data"]["collectionCreate"]
    if d["userErrors"]:
        sys.exit(f"{spec_['handle']}: {d['userErrors']}")
    cid = d["collection"]["id"]
    p = gql('mutation($id:ID!,$pub:[PublicationInput!]!){ publishablePublish(id:$id, input:$pub){ userErrors{ field message } } }',
            {"id": cid, "pub": [{"publicationId": ONLINE_STORE}]})["data"]["publishablePublish"]
    print("  ", cid, "products:", d["collection"]["productsCount"]["count"], "publish errors:", p["userErrors"])
