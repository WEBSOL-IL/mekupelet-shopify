# Collections import plan (categories + brands)

Source: `docs/import/shopify_collections.json` (schema `websol.shopify.catalog-plan` v1, prepared by
the merchant's migration tooling, status `prepared_not_imported`). Script: `scripts/import-collections.py`
(dry run by default; `--execute` needs `SHOPIFY_SHOP` + `SHOPIFY_ADMIN_TOKEN`).

## What the file contains
| | Count | Images | Membership rule |
|---|---|---|---|
| Category collections | 161 (33 roots, depth ≤ 3) | 43 | product tag `legacy-category-<id>` |
| Brand collections | 316 (from 345 source records; 20 combined + 9 duplicates merged) | 284 | vendor equals brand name |
| Metafield definition | `custom.collection_kind` = category / brand | | |
| Navigation | full category tree + brand list | | |
| Product migration | tag prefix, include ancestors, vendor aliases | | |

Images are URLs on `www.mekupelet.co.il`; Shopify fetches them server-side on `collectionCreate`
(`image.src`), so the old site only has to stay online during the import.

## Decisions (merchant) — see the Hebrew summary in the chat
1. **Handles**: plan default is id-based (`category-24`, `brand-280`). Alternative `--handles slug`
   uses the old-site slugs (`כלי-אוכל`, `stephen-joseph`) which match the old URLs and read better.
   Slug mode has one collision (`re-cycle-me` ×2) that must be renamed.
2. **Existing 6 collections** (`בגדי-ילדים`, `כלי-אוכל`, `ספרים`, `צעצועים-ובובות`, `אביזרים`, `כלי-בית`):
   with slug handles they collide with the plan. Options: update them in place (rules, image,
   metafields) or delete them before the import.
3. **Internal WooCommerce rules** (`--skip-internal` drops 7: Uncategorized, לא לכלול בקופונים ×2,
   משתתף במבצע 1+1, לא לצבור נקודות, מוצרי קופה, עמוד הבית). Recommended: skip.
4. **Execution path**: (a) Admin API token from a custom app (Settings → Apps and sales channels →
   Develop apps → scopes `write_products`, `read_products`, `write_metafields`,
   `write_online_store_navigation`) stored as the environment secret `SHOPIFY_ADMIN_TOKEN`, run
   once with `--execute`; or (b) through the Shopify connector in this session, ~27 confirmations
   (3 definitions + 24 batches of 20).
5. **Hierarchy**: stored as `custom.parent_handle` on each child (plus `custom.legacy_term_id`).
   Menus (main + footer) are built from `navigation` with `menuCreate` after the collections exist;
   the design shows 11 top-level nav items, the tree has 33 roots → the merchant picks the 11.

## Order of operations
1. Metafield definitions (3). 2. Brand collections (316, rule: vendor). 3. Category collections
(154) parents before children (the plan is already ordered that way). 4. Verify counts + images.
5. Menus. 6. Product tagging (separate step: each product gets `legacy-category-<id>` tags for its
categories and ancestors; vendor normalized via `vendor_aliases`).

## Rollback
Every created collection id is written to `docs/import/out/result-log.json`; a `collectionDelete`
loop over that log removes them.
