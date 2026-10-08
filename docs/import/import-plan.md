# Collections import plan (categories + brands)

Source: `docs/import/shopify_collections.json` (schema `websol.shopify.catalog-plan` v1, prepared by
the merchant's migration tooling, status `prepared_not_imported`). Script: `scripts/import-collections.py`
(dry run by default; `--execute` needs `SHOPIFY_SHOP` + `SHOPIFY_CLIENT_ID`/`SHOPIFY_CLIENT_SECRET`
or `SHOPIFY_ADMIN_TOKEN`). **Status: executed 2026-10-08, see "Result" below.**

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

## Result (2026-10-08)
- Executed with `--handles slug --skip-internal`: 470 plan collections (154 categories, 316 brands) are
  in the store; store total 472 (plus the pre-existing `frontpage` and the merchant's manual `אביזרים`).
  Every planned handle exists, every rule matches the plan, 326 images uploaded (all planned), all
  metafields set. Log: `docs/import/out/result-log.json` (465 created ids for rollback, 11 updates).
- 5 pre-existing merchant collections (`בגדי-ילדים`, `כלי-אוכל`, `ספרים`, `צעצועים-ובובות`, `כלי-בית`)
  were updated in place with `collectionUpdate` (manual → smart with the plan's rule, image,
  metafields; ids unchanged). `אביזרים` has no plan match and was left untouched (manual, 0 products).
- Slug collision: brand `Re-Cycle-Me` keeps `re-cycle-me`; category "מארזי יצירה - Re-Cycle-Me" got
  `re-cycle-me-2` (`HANDLE_OVERRIDES` in the script).
- Script changes made during the run: idempotent create/update by existing handle, `--only` for
  retries, percent-encoded image URLs (the `ספרים` image failed unencoded), image skipped on update
  when the collection already has one (Shopify rejects re-sending it), append-only log.
- Metafield definitions `custom.collection_kind` (choices category/brand), `custom.parent_handle`,
  `custom.legacy_term_id` exist on COLLECTION.
- Collections created via the API are not published to any channel by default; after the merchant added
  `write_publications`, `scripts/publish-collections.py --execute` published all 470 to the Online Store.
- Collections are empty until the product migration tags products (`legacy-category-<id>`) and
  normalizes `vendor`.
- Menus: `scripts/create-menus.py` (footer-1..4) is ready and dry-run verified; execution still pending
  (blocked by the session's permission classifier). Main menu waits for the merchant's pick of 11 roots.
