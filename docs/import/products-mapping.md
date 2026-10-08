# Product update plan — tags, vendor, prices, stock (from the merchant's product file)

Source: `products-190924-1122.xlsx` (merchant upload, 2026-10-08; 1 sheet, 1,763 rows, 10 columns).
Kept out of git (`docs/import/in/` is ignored); copy it there before running the script.
Status: **mapping proposed, waiting for merchant approval. Nothing executed.**

## Store state (read 2026-10-08)
- 1,824 products, all ACTIVE, exactly one variant each, 0 tags, 100 distinct vendors.
- `product.handle` = the old WooCommerce product id (e.g. `261`). SKU unique, 10 products without SKU.
- Inventory tracked on 1,809 variants. `read_inventory`/`write_inventory`/`read_locations` scopes are
  **missing** on the app (needed for the stock column).

## Matching (file row → store product)
| Key | Rows | Note |
|---|---|---|
| SKU equals `variant.sku` (as string, leading zeros kept) | 1,282 | primary key, per merchant |
| fallback `id` equals `product.handle` | 10 | rows without SKU |
| no match | 471 | 132 have ids newer than anything in the store, 339 older ids the store import did not include. Not touched by this step; they need a product import. |
| store products not in the file | 532 | not touched |

No SKU/handle conflicts, no duplicate SKUs on either side.

## Column mapping
| File column | Shopify field | Rule |
|---|---|---|
| `id` | — | matching fallback only (already the handle) |
| `Title` | — | not updated (store titles already exist) |
| `Sku` | `variant.sku` | match key; not changed |
| `Brands` | `product.vendor` | HTML-unescape (`&amp;` → `&`); `a|b` multi-brand → first brand that exists in the brand plan; empty (23 rows) → keep the current vendor. Resolved against the 316 brand collections + `vendor_aliases`, so every vendor equals a brand collection rule (`VENDOR EQUALS`). 8 vendors change (5 are `&amp;` fixes, 2 alias normalizations `goliath→גוליית`, `ALLDORO→אלדורו`). |
| `קטגוריות מוצרים` | `product.tags` | split on `|`, path on `>`; each path resolved to a plan category by full path (132 distinct paths, **100% resolved**); tag `legacy-category-<term id>` for the category **and all its ancestors**; the 7 internal WooCommerce rules (`לא לכלול בקופונים`, `לא לצבור נקודות`, `Uncategorized`, `לא לכלול בקופון 30`, `משתתף במבצע 1+1`, `עמוד הבית`, `מוצרי קופה`) are skipped. 1–18 tags per product, average 6.6, no product without tags. Tags are **added** (`tagsAdd`), existing tags are kept. |
| `Price` | — | equals `Regular Price` on every row; used only as fallback |
| `Regular Price` | `variant.price`, or `compareAtPrice` when on sale | see pricing |
| `Sale Price` | `variant.price` when set | 31 rows on sale; `price = Sale Price`, `compareAtPrice = Regular Price`; otherwise `price = Regular Price`, `compareAtPrice = null`. 3 rows without any price → skipped. Diff vs store: 38 prices, 29 compare-at values. |
| `Stock Status` | — | all 1,763 rows are `instock`; ignored |
| `Stock` | inventory `available` at the store's location (`inventorySetQuantities`) | integer; 16 rows empty → skipped; 744 matched products differ from the store's current quantity. **Needs the scopes above and a decision on which snapshot is current.** |

## Multi-brand rows (6) — proposed primary brand = first
| Woo id | Brands cell | proposed vendor |
|---|---|---|
| see script dry run | `belle & boo|djeco` | belle & boo |
| | `מוצרים נוספים|פוקסמיינד` | מוצרים נוספים |
| | `Magnetic Cubes|סופר קידס` (×2) | Magnetic Cubes |
| | `MAGPAD|סופר קידס` | MAGPAD |
| | `Smart Snow|סופר קידס` | Smart Snow |

## Execution (after approval)
`scripts/update-products.py` (to be written): dry run by default, reads the xlsx from `docs/import/in/`,
matches as above, prints the diff counts, writes the planned mutations to `docs/import/out/`, and with
`--execute` runs them in batches: `tagsAdd` + `productUpdate(vendor)` per product, `productVariantsBulkUpdate`
for price/compareAtPrice, `inventorySetQuantities` for stock (only when the scopes exist). Every change is
logged to `docs/import/out/products-log.json` with the previous value for rollback.

## Open decisions
1. Only the 1,292 matched products are updated. The 471 file-only products: separate product import later?
   The 532 store-only products: leave active, or mark as draft?
2. Prices from the file: apply (38 changes)?
3. Stock from the file: apply (744 changes)? Requires adding `read_inventory`, `write_inventory`,
   `read_locations` to the app. Which snapshot is current, the file or the store?
4. Multi-brand rule "first brand" OK?
5. Internal rules skipped. Keep a tag for `לא לכלול בקופונים` (460 products) for future discount exclusions?
