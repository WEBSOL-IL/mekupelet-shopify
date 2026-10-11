# Collection page feedback (Word doc, 2026-10-11) — plan

Plan only, nothing changed on the store. Audit of what Hyper 1.5.0 already ships for each request,
then the lowest tier that achieves it (T1 settings / T2 `mk-custom.css` / T3 `mk-` files / T4 logged core edit).
Current collection template: `breadcrumbs` → `main-collection-banner` → `main-collection-product-grid`
(vertical filters, 24 per page, numbered pagination, `expand_filter_groups` = "קטגוריות נבחרות, גיל, מחיר, היילייטס, מותג, זמינות").
Live store today exposes only two Search & Discovery filters (availability, price); sort names come from
Shopify in English because English is still the primary language.

## A. Data + admin (needed before most filter items)

| # | Request | Hyper / Shopify | How | Tier | Effort |
|---|---|---|---|---|---|
| A1 | Optional description per collection | Native `collection.description`, already shown by the banner block (`show_description: true`) | Nothing to build: fill "Description" on the collection in the admin. If a second, SEO text below the grid is wanted later: collection metafield + a `rich-text` section connected to it | T1 | — |
| A2 | Filters: brand, skill, age; order category → age → skill → brand → price | Hyper renders whatever Search & Discovery exposes (`collection.filters`), in S&D order. S&D offers Vendor, tags, product type and metafield filters | Brand = Vendor filter (vendor is set on import). Skill + age = product metafields `mk.skill`, `mk.age` (single-line text, list, with a value list) filled by the product import; then add the two metafield filters in S&D, drag the order, rename labels. Update `expand_filter_groups` to the final labels | admin + T1 | S (after import) |
| A3 | "קטגוריות נבחרות" behaves oddly / should be the main menu categories | It is an S&D filter group, not a sub-collection list; it narrows the current collection, it does not navigate. Hyper has no sub-collection block in the product grid | Replace with a product metafield `mk.category` (list of main-category names, from the import's category tree, roots only) exposed as the first S&D filter. Clean values, no tag noise. If navigation between sibling collections is wanted instead, that is the chips item (C4) | admin + import | S |
| A4 | Sort list: Hebrew, only 5 options (best selling, price ↑↓, date ↑↓) | `snippets/facet-short.liquid` loops every `collection.sort_options`; names are Shopify's, localized by the store's primary language. No setting to hide options | Hebrew: make Hebrew the primary language (already on the merchant checklist); Shopify's own Hebrew names match the requested wording. Hide options: small core edit in `facet-short.liquid` wrapped in MK-CUSTOM that skips values listed in a new theme setting `mk_sort_hidden` (settings_schema, MK group), default `manual, most-relevant, title-ascending, title-descending` | T4 (logged) | S |

## B. Desktop styling (CSS only, block 7)

| # | Request | Hyper | How | Tier | Effort |
|---|---|---|---|---|---|
| B1 | Sort control bordered like the filter button | Sort is a borderless `<select>` in `#SortByContainer`; filter button is `.facet-drawer-button` | Restore a 1px border + radius on the sort wrapper, same height as the filter button | T2 | XS |
| B2 | Active filter chips must look different from filter/sort buttons; white text on hover | `snippets/facets-active.liquid` → `.facets-active` chips, currently styled like buttons | Chip style: light fill, no border, text colour; hover = accent background + white text; keep the × icon | T2 | XS |
| B3 | Second image on hover | Theme setting `pcard_show_second_img` (default on) + `enable_image_hover_effects`; card renders the 2nd image only when the product has ≥2 images | Already works for products with 2+ images; verify our card rewrite (block 4) did not hide `.product-card__image--secondary`. Content item: migrated products need a 2nd image | T1 (+T2 check) | XS |
| B4 | Breadcrumb arrows reversed, current page not grey | Hyper separator is a hairline; our block 7 replaces it with `\2039` (‹) and colours links grey | Flip to `\203A` (›) and reset the current item (`.breadcrumbs--last`) to the text colour | T2 | XS |
| B5 | Infinite scroll, no page numbers | `pagination` setting: `number` / `load_more` / `infinite` (`load-more-button` in facets.js, IntersectionObserver) | Set `pagination: infinite` in `templates/collection.json` (keep 24 per page) | T1 | XS |

## C. New blocks on the page

| # | Request | Hyper | How | Tier | Effort |
|---|---|---|---|---|---|
| C1 | Newsletter banner on every page above the footer | `newsletter` section is allowed in the footer group (`disabled_on` = header/overlay only) | Move the Home newsletter section into `sections/footer-group.json` before `mk_contact_row` (shows site-wide, incl. Home; remove it from index.json to avoid a double) | T1 | XS |
| C2 | USP icon row under the products | Home `feature_tiles` is our `mk-feature-icons` section | Add an `mk-feature-icons` instance to `templates/collection.json` after `product-grid` (same 6 tiles) | T1 | XS |
| C3 | Collection background image on some pages only | `main-collection-banner`: `show_collection_image` (uses `collection.image`, which is also the category tile image → wrong crop) and a static `image` setting. Image settings in templates can connect to a metafield ("dynamic source") | Collection metafield `mk.banner_image` (file) + connect the banner `image` setting to it in the editor; set `image_height` medium/extra-small mobile. No image → the plain title header stays. No alternate template needed | admin + T1 | S |
| C4 | Quick-filter chips (popular categories / ages) that apply the existing filters | No Hyper equivalent (`collection-tabs` is a Home products block; `mk-age-pills` links to collections) | New `mk-filter-chips` section for the collection template: setting "filter group label" → renders that facet's values from `collection.filters` as chips with `filter_value.url_to_add` / `url_to_remove`, active state from `filter_value.active`, optional "הכל" chip, optional manual chips (label + URL) as blocks. Links reuse Hyper's facets URLs, so the drawer/sidebar stay in sync; CSS loads with the section | T3 | M |

## D. Labels (badges)

| # | Request | Hyper | How | Tier | Effort |
|---|---|---|---|---|---|
| D1 | "חדש" = created in the last 30 days | Badges are tag-driven only (`product_new_tags`); no date logic | Small core edit in `snippets/pcard-badges.liquid` (MK-CUSTOM): show the New badge when `product.created_at` is within `settings.mk_new_days` (new setting, default 30) and after `settings.mk_new_since` (date cutoff, so the 4,000 migrated products are not all "new" on launch). Tag `חדש` keeps working as a manual override | T4 (logged) | S |
| D2 | "__% הנחה" from compare-at price | Native: `pcard_sale_badge_type: show_percentage` is already on; renders `-20%` | Keep. If the word "הנחה" is wanted on the badge, CSS `::after` on `.f-badge--sale` (T2), no code | T1/T2 | XS |
| D3 | Best sellers: manual, or via a smart collection + tags | `product_hot_tags` = `רב מכר` already set; per-card collection membership checks cost a Liquid loop per card | Tag `רב מכר` (manual, or bulk-tag from the admin products list). A smart collection cannot tag products; Shopify Flow could (needs the Flow app, merchant approval). Recommendation: tag only | T1 | — |

## E. Mobile (CSS only, block 7 mobile section)

| # | Request | How | Tier | Effort |
|---|---|---|---|---|
| E1 | Sort and filter on the same row | Today the sort is hidden below `lg` and lives in the drawer. Show `#SortByContainer` on mobile as a bordered select next to the filter button, count on its own line below; keep the drawer copy hidden | T2 | XS |
| E2 | Thin grey divider under the toolbar | `border-bottom: 1px solid var(--mk-color-divider)` on `.collection__toolbar` below `lg` | T2 | XS |
| E3 | Much smaller breadcrumbs | 1.2rem font, tighter separators, single line with ellipsis below `md` | T2 | XS |

## Packages (proposed order)

1. **Styling pass (B1, B2, B4, B5, E1–E3, D2)**: CSS + one template setting. One commit, verified at 390/768/1440.
2. **Page blocks (C1, C2, C3)**: footer group + collection template + metafield definition checklist for the merchant.
3. **Badges (D1, D3)**: core edit in pcard-badges + two theme settings, logged in CUSTOMIZATIONS.md.
4. **Sort list (A4)**: core edit in facet-short + setting. Pairs with the Hebrew-primary-language switch.
5. **Filters + chips (A2, A3, C4)**: needs the metafield definitions and the product import that fills them; then S&D configuration (merchant) and the `mk-filter-chips` section.

## Merchant checklist (admin side, when we reach the package)

- Settings → Languages: Hebrew as primary (sort names, S&D labels in Hebrew).
- Settings → Custom data → Products: `mk.category` (list, single-line text), `mk.age` (list), `mk.skill` (list); Collections: `mk.banner_image` (file).
- Search & Discovery → Filters: Vendor ("מותג"), `mk.category` ("קטגוריה"), `mk.age` ("גיל"), `mk.skill` ("מיומנות"), Price ("מחיר"); order: קטגוריה, גיל, מיומנות, מותג, מחיר; remove "היילייטס"/"זמינות" if not wanted.
- Collections: fill descriptions where wanted; upload a banner image into `mk.banner_image` for the few collections that get one.
- Products: 2nd image where a hover image is wanted; tag `רב מכר` for best sellers.

## Open questions

1. Chips content: one facet (e.g. age) on every collection, or per-collection manual chips (needs the section blocks per template)? Both are supported by C4; default proposal: age facet automatically + manual blocks when set.
2. "New" cutoff date for D1: launch date, or import date?
3. Keep the "היילייטס" and "זמינות" filter groups?
4. Newsletter on Home: keep only the footer-group instance (recommended) or both?
