# Product page feedback (Word doc, 2026-10-14) — plan

Plan only, nothing changed on the store. 28 notes, audited against Hyper 1.5.0 and the current
`templates/product.json` (blocks: meta → title → short_description → inventory → price → divider →
variant_picker → buy_buttons → gift_wrap (line item property) → shipping_note → badges →
pickup_availability → description tab → 4 metafield tabs → "למוצרים נוספים" chips → feature boxes;
sections: breadcrumbs → main → related-products (Shopify recommendations) → testimonials → newsletter).
Baseline screenshots: `docs/screenshots/product-feedback/before/`.
Tiers: T1 settings / T2 `mk-custom.css` / T3 `mk-` files / T4 logged core edit.

## A. Info column, text and spacing (CSS + settings)

| # | Note | Hyper today | How | Tier | Effort |
|---|---|---|---|---|---|
| A1 | Everything aligned to the start, one line | Blocks have different inline paddings (vendor meta, inventory, tabs) | CSS: zero the inline padding of every `.product__block` so all start at the column edge | T2 | XS |
| A2 | A bit more space under the breadcrumbs; vendor line thin, grey, small, without "מותג:" | `meta` block prints `products.product.vendor` ("מותג:") + underlined link | Empty the "מותג:" locale string, CSS: 1.3rem/400 grey link, no underline; breadcrumbs padding-bottom 16 → 24. Assumption: "שם מוצר" in the note = the vendor line, the title stays bold | T1 + T2 | XS |
| A3 | Inventory: < 8 → "מלאי נמוך - נותרו X במלאי", else "זמין במלאי", green/yellow/orange pulsing dot, no progress bar | `inventory` block: threshold setting (10), locale strings, `.product__inventory-icon` dot, `progress-bar` below the threshold | Threshold 8; locale strings `inventory_low_stock_*` → "מלאי נמוך - נותרו {{ quantity }} במלאי", `inventory_in_stock` stays; CSS: hide the bar, animated dot (green in stock, orange low, red out) | T1 + T2 | S |
| A4 | Gift wrap: cart shows `₪22%`, product page should read "הוספת אריזת מתנה בתוספת 3 ₪" | The block is a line-item *property* checkbox named `אריזת מתנה בתוספת 3 ש"ח`; the `"` is URL-encoded in the cart and no price is charged. Hyper also ships a real gift-wrap feature: menu `gift-wrapping` → gift-wrap product, checkbox in the cart/drawer, price added as a line | Phase 1: rename the property to "הוספת אריזת מתנה בתוספת 3 ₪" (no quotes). Phase 2 (recommended): merchant creates product "אריזת מתנה" at 3 ₪ + menu handle `gift-wrapping` → Hyper's checkbox appears in the drawer and charges; the product-page checkbox then becomes an `mk-gift-wrap` toggle that adds the wrap product together with the item (small JS reusing Hyper's gift-wrapping element) | T1, then T3 | XS, then M |
| A5 | Description tab closed by default; tab spacing; smaller headings inside; green ✓ instead of bullets; space above the tabs | `mk-product-description-tab` snippet renders `<details open>`; Hyper accordion spacing; description HTML from WooCommerce (h2/h3 + ul) | Remove `open`; CSS: tab padding-block 1.6rem, `.rte h2/h3` 1.8/1.6rem, `.rte ul li::before` green check (SVG mask), margin-top above the first tab | T2 (+1 line in our snippet) | S |
| A6 | "למוצרים נוספים" chips: white text on hover | `mk-product-collections` uses `btn--secondary` → hover fill without text change | CSS hover: accent fill + white text (same as the collection chips) | T2 | XS |
| A7 | Feature boxes: width of the image, other icons, no frame | `grid-icon-box` block with `show_below_product_media`, 3 columns, Hyper icons, boxed style | Setting: icons from Hyper's list (truck, shield-check, arrows-counter-clockwise, gift…) per the reference; CSS: no background/border, compact, constrained to the media column width | T1 + T2 | S |
| A8 | Duplicate newsletter at the bottom | `newsletter` in product.json **and** in the footer group (since collection package 2) | Remove the section from product.json | T1 | XS |

## B. Gallery

| # | Note | Hyper today | How | Tier | Effort |
|---|---|---|---|---|---|
| B1 | Thumbnails on the left of the main image | `gallery_layout: vertical-carousel` puts thumbnails at the inline-start (right in RTL); our block 8 reverses the row for the info column | CSS: `.product--vertical-carousel .product__media-wrapper { flex-direction: row-reverse }` (thumbs at the far left, main image next to the info) | T2 | XS |
| B2 | Mobile gallery like Koala/Babysitter: main image + thumbnail row | `mobile_thumbnails: hide` → fraction pager "1/2" | Set `mobile_thumbnails: show` (Hyper renders a horizontal thumbnail strip); CSS polish for the active frame | T1 | XS |

## C. Age everywhere

| # | Note | How | Tier | Effort |
|---|---|---|---|---|
| C1 | Age chips under the short description (grey, no border) | `custom.age_range` is a list now: `mk-age-chips` snippet rendered from a custom_liquid block after the short description, grey pills linking to `/collections/all?filter.p.m.custom.age_range=<value>` (same filter URLs as the collection chips) | T3 (snippet) | S |
| C2 | "מתאים לגילאים" accordion | Exists (`tab_age`), now showing the list joined with ", ". Keep; rename heading if wanted | T1 | — |
| C3 | Labels above the title, optionally ages in fixed colours | Hyper `badges` block (sale/sold-out/tag badges) sits below the buttons today → move the block above `title`; age badges: same `mk-age-chips` snippet in "badge" mode with a colour per range from a small theme setting (6 colours) | T1 + T3 | S |

## D. Recommendations and related products

| # | Note | Hyper today | How | Tier | Effort |
|---|---|---|---|---|---|
| D1 | What is the logic of "מוצרים נוספים"? | `related-products` = Shopify's Product Recommendations API (`intent: related`): purchase history, descriptions, collections; not configurable, improves with orders | Keep as "מוצרים שחשבנו שתאהב"; "by age" is not supported by the API | — | — |
| D2 | "עוד מהמותג": 5 per row, divider, like Home; preferably same age | Vendor collections exist (`brand-<id>`, rule vendor = name, metafield `custom.collection_kind = brand`) | `mk-more-from-brand` section (T3): finds the brand collection in `product.collections` (kind = brand), renders up to 10 of its products as Hyper cards in a 5-column slider, excluding the current product; "same age first" = Liquid sort by overlap of `custom.age_range` within the first 50 products of the collection (cheap, per-product list) | T3 | M |
| D3 | "מוצרים שצפית בהם לאחרונה" | Hyper `recently-viewed-products` section (localStorage) | Add the section to product.json, heading "מוצרים שצפית בהם לאחרונה", 5 columns | T1 | XS |
| D4 | "מוצרים שחשבנו שתאהב" by age | See D1: use D2's age logic on the related products instead? Possible as a Liquid re-sort of the 8 recommendations by age overlap | T3 (inside an `mk-` override of the recommendations card loop) | S |
| D5 | Linked products as "variants" (e.g. JABADABADO kitchen colours) | No Hyper feature; Shopify Combined Listings needs Plus | Product metafield `custom.linked_products` (list.product_reference) + `mk-linked-products` snippet in a custom_liquid block under the price: thumbnails of the linked products (+ the current one, marked), each a link; optional label metafield for the variant name ("צבע: שחור"). Merchant fills the list on each product of the group (or we fill it from a CSV) | admin + T3 | M |

## E. Reviews, club, UGC

| # | Note | How | Tier | Effort |
|---|---|---|---|---|
| E1 | Space above reviews, heading "ביקורות", layout like the reference (rating summary, photo, stars, date, pagination) | Today a static `testimonials` section with placeholder text. The reference is a reviews app (Judge.me style). Decision needed: app (Judge.me free tier covers this; needs approval) or our `mk-reviews` section over a `review` metaobject filled by the merchant | app or T3 | S (app) / L (own) |
| E2 | Club + points ("חברי מועדון צוברים X נקודות") | No loyalty app installed; the text block alone is possible (`promotion_alert` block with a dynamic points formula is not possible in Liquid without the app) | Needs a loyalty app (Smile.io / BON / Yotpo Loyalty) → merchant decision; a static sentence can be added now as a `text` block | app | — |
| E3 | Instagram reels per product | Product metafield `custom.reels` (list of URLs or files). Instagram embeds load Instagram's script (performance); self-hosted MP4 in Files is lighter | `mk-product-videos` section reading the metafield: Shopify-hosted videos as `<video>` cards, or Instagram URL as a click-to-load embed | admin + T3 | M |
| E4 | "תמונות אמיתיות ששלחתם לי" | Product metafield `custom.customer_photos` (list.file_reference) + `mk-customer-photos` section (grid/slider, lightbox via Hyper's modal) | admin + T3 | M |

## Packages (proposed order)

1. **Info column + gallery (A1–A3, A5–A8, B1–B2)**: CSS, settings, one locale string, one snippet line. One commit, 390/768/1440 screenshots.
2. **Gift wrap (A4)**: phase 1 label now; phase 2 after the merchant creates the wrap product + menu.
3. **Age (C1–C3)**: `mk-age-chips` snippet, badges block moved up.
4. **Recommendations (D2, D3, D4)**: recently viewed (T1), `mk-more-from-brand` section, age re-sort.
5. **Linked products (D5)**: metafield definition + snippet; merchant fills the first group (JABADABADO).
6. **Reviews / club / UGC (E1–E4)**: after the app decisions; metafield-based sections can be built meanwhile.

## Questions

1. A2: "שם מוצר דק ואפור" = the vendor line (assumed), or the product title itself?
2. A4: approve the native gift-wrap flow (a 3 ₪ wrap product + `gift-wrapping` menu, created by you)?
3. E1: reviews via Judge.me (free, needs approval and installs its script) or our own metaobject-based section?
4. E2: which loyalty app, if any?
5. E3: reels as Instagram links (their embed script) or MP4 files uploaded to Shopify Files (faster)?
6. C3: colour per age range for the badges, or one grey style like the chips?
