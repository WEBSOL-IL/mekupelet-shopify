#!/usr/bin/env python3
"""Replace the empty rich-text definition custom.skills (מפתח מיומנויות) with a choice list:
list.single_line_text_field limited to the values in docs/import/skills-choices.json.
Refuses to run when any product already has a custom.skills value (the old type cannot be converted).
Usage: python3 -I scripts/create-skills-definition.py [--execute]   (env as import-collections.py)"""
import importlib.util, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("imp", os.path.join(HERE, "import-collections.py"))
imp = importlib.util.module_from_spec(spec); spec.loader.exec_module(imp)
gql = imp.gql
execute = "--execute" in sys.argv

cfg = json.load(open(os.path.join(HERE, "..", "docs", "import", "skills-choices.json"), encoding="utf-8"))
d, choices = cfg["definition"], cfg["choices"]
assert len(choices) == len(set(choices)) and 0 < len(choices) <= 100, "choices must be unique, 1..100"

existing = gql('query($ns:String!,$key:String!){ metafieldDefinitions(ownerType:PRODUCT, namespace:$ns, key:$key, first:1){ nodes{ id name type{name} metafieldsCount } } }',
               {"ns": d["namespace"], "key": d["key"]})["data"]["metafieldDefinitions"]["nodes"]
old = existing[0] if existing else None
print("existing:", old)
if old and old["type"]["name"] == d["type"]:
    print("already a", d["type"], "definition: only the choices would be updated")
if old and old["metafieldsCount"]:
    sys.exit(f"{old['metafieldsCount']} products carry a value; convert them first")

new_input = {"ownerType": d["ownerType"], "namespace": d["namespace"], "key": d["key"], "name": d["name"], "type": d["type"],
             "pin": True, "access": {"storefront": "PUBLIC_READ"},
             "validations": [{"name": "choices", "value": json.dumps(choices, ensure_ascii=False)}]}
print(f"{'create' if not old else 'replace'} {d['namespace']}.{d['key']} as {d['type']} with {len(choices)} choices", "(dry run)" if not execute else "")
if not execute:
    sys.exit(0)
if old and old["type"]["name"] != d["type"]:
    r = gql('mutation($id:ID!){ metafieldDefinitionDelete(id:$id, deleteAllAssociatedMetafields:false){ deletedDefinitionId userErrors{ field message } } }', {"id": old["id"]})["data"]["metafieldDefinitionDelete"]
    if r["userErrors"]:
        sys.exit(f"delete: {r['userErrors']}")
    print("deleted", r["deletedDefinitionId"]); old = None
if old:
    r = gql('mutation($def:MetafieldDefinitionUpdateInput!){ metafieldDefinitionUpdate(definition:$def){ updatedDefinition{ id } userErrors{ field message } } }',
            {"def": {k: new_input[k] for k in ("ownerType", "namespace", "key", "name", "pin", "validations")}})["data"]["metafieldDefinitionUpdate"]
    key = "updatedDefinition"
else:
    r = gql('mutation($def:MetafieldDefinitionInput!){ metafieldDefinitionCreate(definition:$def){ createdDefinition{ id } userErrors{ field message } } }', {"def": new_input})["data"]["metafieldDefinitionCreate"]
    key = "createdDefinition"
if r["userErrors"]:
    sys.exit(f"{key}: {r['userErrors']}")
print("done:", r[key]["id"])
