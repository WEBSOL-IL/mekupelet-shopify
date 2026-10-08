#!/usr/bin/env python3
"""Create the product metafield definitions the product template reads (Figma 52:5172 accordions).
Idempotent: an existing definition is reported, not changed. Env as scripts/import-collections.py."""
import importlib.util, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("imp", os.path.join(HERE, "import-collections.py"))
imp = importlib.util.module_from_spec(spec); spec.loader.exec_module(imp)

DEFS = [
    ("short_description", "תיאור קצר", "multi_line_text_field", "Short text under the title (product page)"),
    ("development_index", "מדד מקופלת להתפתחות הילד", "rich_text_field", "Accordion: Mekupelet development index"),
    ("age_range", "מתאים לגיל", "single_line_text_field", "Accordion: suitable age (e.g. 3-6)"),
    ("skills", "מפתח מיומנויות", "rich_text_field", "Accordion: skills the product develops"),
    ("extra_details", "פרטים נוספים", "rich_text_field", "Accordion: extra details (materials, dimensions, care)"),
]
for key, name, typ, desc in DEFS:
    r = imp.gql("""mutation($d: MetafieldDefinitionInput!){ metafieldDefinitionCreate(definition:$d){
        createdDefinition { id } userErrors { code message } } }""",
        {"d": {"name": name, "namespace": "custom", "key": key, "ownerType": "PRODUCT", "type": typ,
               "description": desc, "pin": True}})
    d = r["data"]["metafieldDefinitionCreate"]
    print(key, "->", d["createdDefinition"] or d["userErrors"])
