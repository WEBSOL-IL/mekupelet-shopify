# Implementation plan (Phase 0 deliverable, 2026-10-07)

Status: DRAFT for merchant approval at the end of Phase 0. No theme code has been written.

Inputs used:
- Untouched Hyper 1.4.0 pull of theme `154698219714` (commit `67656a7`), audited in `docs/hyper-audit/hyper-audit.md`.
- Figma file `YOVayNJZ1olagd5NLKXMzJ` (version 2387234945909493089, last modified 2026-08-13) exported to `docs/figma/` (full tree `file.json`, 2x renders in `png/`, image fills in `images/`), analysed in `docs/figma/tokens.md`, `docs/figma/sections.md`, `docs/figma/copy.md`.
- Baseline Lighthouse in `docs/lighthouse/baseline/README.md`.
- Frame map and designer annotations in `docs/figma-frame-map.md`.

## 0. Executive summary

1. Hyper is a good fit: OS 2.0, RTL-first CSS (logical properties), native Storefront filtering, Swiper with RTL, per-section CSS/JS, images with srcset/sizes and no CLS. The baseline is already Perf 75-79 mobile in the sandbox.
2. The approved revision changes the design globally: primary action colour becomes teal-blue `#007F94` (was coral), badges become amber/orange/cyan, product cards get a 1px gray bordered container, nav loses its shadow, stars become amber, wishlist heart gets an orange active state. Most of this is **tier 1 (theme settings) + tier 2 (one custom stylesheet on Hyper variables)**.
3. Four things Hyper does not have and the design needs: **wishlist**, **star rating / reviews**, a **USP icon bar inside the header group**, and a **brands index with descriptions**. These are tier 3 `mk-` sections/snippets, two of which need a small `MK-CUSTOM` hook inside `snippets/card-product.liquid` (tier 4, logged).
4. The design uses **Simpler Pro (SimplerPro_HLAR)** 400/600/700. It is a commercial font; the merchant must supply licensed woff2 files. Until then Hebrew falls back to system fonts (current theme fonts are Instrument Sans, Latin only).
5. The design has inconsistencies that must be decided before Phase 1 (section 7): two badge styles (pill vs square), two button radii (4 vs pill), three teal-blues, sale badge orange vs pink, 4-6 near-identical grays, missing tablet breakpoint, 8-10px mobile text.
6. Boxes (Phase 5) need a technical choice; Hyper's bundle sections are JS multi-add, not Shopify native bundles. Proposal in section 8.

## 1. Design tokens → Hyper mapping

Full extraction with counts and node evidence: `docs/figma/tokens.md`. The proposal below is what we will implement (tier 1 = theme setting, tier 2 = `assets/mk-custom.css` built on Hyper CSS variables).

### 1.1 Colours

| Token | Value (revision) | Hyper target | Tier |
|---|---|---|---|
| Background | `#FFFFFF` | `scheme-1.background` | 1 |
| Surface 1 (filter panels, thumbnails, USP icon bg) | `#F8F8F8` (merging `#F5F5F5`, `#F7F7F7`) | `scheme-1.secondary_background`, `form_field` | 1 |
| Surface 2 (announcement bar) | `#E9E9E9` | topbar colour scheme (`scheme-10` repurposed) | 1 |
| Text primary | `#1C1C1C` (merging `#000000`, `#353535`) | `scheme-1.text` | 1 |
| Text muted | `#6B6B6B` | `scheme-1.subtext` | 1 |
| Text subtle (brand line, compare-at) | `#9B9B9B` | `--mk-color-subtle` in custom CSS; `.product-card__vendor`, `.price--compare` | 2 |
| Primary action (designer: "buttons blue") | `#007F94` (merging `#008094`, `#008298`) | `scheme-1.button` + `primary_accent`, `button_label #FFFFFF` | 1 |
| Primary hover | not designed; propose `#006B7D` (10% darker) | `button_hover` where exposed, else `--mk-color-primary-hover` | 2 |
| Sale price / low stock | `#FF5400` | `scheme-1.product_price_sale`, `--color-badge-sale` | 1 |
| Badge new | bg `#FFBF00`, text `#3B0D15` | `color_badge_new` / `_text` | 1 |
| Badge sale | bg `#FF5400`, text `#1C1C1C` (pink `#FF75BA` variant rejected, see Q3) | `color_badge_sale` / `_text` | 1 |
| Badge bestseller | bg `#67DBDE`, text `#3B0D15` | `color_badge_hot` / `_text` (Hyper "hot" = our "bestseller", tag-driven) | 1 |
| Badge sold out | not designed; propose `#9B9B9B` / white | `color_badge_soldout` | 1 |
| Wishlist active | `#FF5500` (merging `#FF6920`) | `--mk-color-wishlist` | 2 |
| Stars | `#FFBF00` | `--mk-color-star` | 2 |
| In stock pill | bg `#00B255`, text `#FEFEFE` | `--mk-color-success` | 2 |
| Border | `#DDDDDD` (cards, search, review cards, arrows) | `scheme-1.border` | 1 |
| Divider | `#E0E0E0` (header bottom line, filter dividers, icon circles) | `--mk-color-divider` | 2 |
| Nav panel | white, 1px `#E0E0E0` border, **no shadow** | custom CSS override of `.dropdown`/mega menu shadow | 2 |
| Newsletter band | `#3BD6D9 @73%` ≈ `#6EE2E4` on white | dedicated colour scheme `scheme-newsletter` | 1 |
| Footer | bg `#312E7D`, text white | colour scheme `scheme-footer` | 1 |
| Decorative palette (age pills, category rings, USP icons, hero) | `#00BA57 #FF5400 #FFBF00 #8761EB #FF75BA #3BD6D9 #007F94` | block colour settings in the `mk-` sections; not global tokens | 3 |

Current theme has 16 colour schemes (all accent `#c4301c`). Plan: keep 5 (default, newsletter, footer, surface, inverse) to shrink the inline style block.

### 1.2 Typography

| Role | Desktop | Mobile | Weight | Hyper target |
|---|---|---|---|---|
| Family | Simpler Pro (SimplerPro_HLAR) | same | 400 / 600 / 700 | Self-hosted woff2 via `snippets/mk-fonts.liquid` (`@font-face`, `font-display: swap`, preload 2 files: 400 + 700). `type_body_font`/`type_header_font` stay on a system font as fallback; `--font-body-family`/`--font-heading-family` overridden in `mk-custom.css`. |
| h1 (hero, surprise box) | 40/40 | 24/30 | 700 | `display_heading_size` 40 → `--font-hd2-size`; `heading_mobile_scale` 60 |
| h2 section title | 32/40 | 16/24 (confirm, see Q6) | 700 | `heading_scale` 100 → `--font-h2-size` 3.2rem (matches) |
| h3 product title / newsletter title | 24, 20/30 | 16/24 | 600-700 | `--font-h4-size` 2.2rem → override to 2.4rem |
| Body | 16/24 | 14/22 | 400 | `body_font_size` 16 |
| Body small (brand, breadcrumb, sort, search) | 14/20 | 12/18 | 400 | `.text-sm` |
| Nav | 14 | 12-14 | 700 | `navigation_font_weight` 700, `--font-navigation-*` |
| Card title | 16/24, 2 lines | 12-14 | 600 | `pcard_title_scale` 100, `pcard_title_font_weight` 600, `pcard_title_line_limit` 2 |
| Price | 16-20 | 12-14 | 600 | `pcard_price_font_weight` 600 |
| Badge / caption | 12 | 10 (minimum 11 in code) | 600 | `pcard_badge_font_weight` 600 |
| Button | 14-16 | 14 | 600 | `buttons_font_weight` 600, `buttons_transform` none |

Rules: no `text-transform: uppercase` (Figma `textCase: UPPER` on 612 nodes is an artefact; it would uppercase Latin brand names), letter-spacing 0, `heading_uppercase` false. Minimum rendered size 12px on mobile (design has 8-10px; see Q6).

### 1.3 Layout, radii, shadows

| Token | Value | Hyper target |
|---|---|---|
| Content max width | 1312px (64px gutters at 1440) | `page_width` 1310 (currently 1700). `--page-padding` 1.6rem mobile (design 15px), 4rem ≥1024, 6.4rem ≥1440. Above 1440: content stays 1312 centred. |
| Grid gaps | products 27-31px desktop, 14-15px mobile; brands 20px; reviews 29px | section `column_gap` = `medium` (3rem) / mobile `extra-small` |
| Collection sidebar | 304px at the inline-start side, 30px gap | `filter_type vertical`; width override in custom CSS |
| Radius sm | 4px (buttons, collection badges, qty stepper, search box 5px) | `buttons_corner_radius: slightly` (5px), `inputs_corner_radius: slightly` |
| Radius md | 10px (product images, cards, review cards, mega promo tile) | `pcard_corner_radius: slightly` (10px), `blocks_corner_radius: slightly` |
| Radius xl | 30px (surprise-box banner, USP tiles) | section-level setting in `mk-` sections / `--mk-radius-xl` |
| Radius full | pills (badges 60/70, icon circles 80, finder bar 100, CTA 50) | `badges_corner_radius: round` **or** `slightly` (see Q2) |
| Shadow sm | `0 2px 4px rgb(0 0 0 / .10)` (card hover, product complementary cards) | `--mk-shadow-sm` |
| Shadow md | `0 4px 8px rgb(0 0 0 / .15)` (slider arrows, active thumbnail) | `--mk-shadow-md` |
| Button height | 44px (PDP), 28px (card), 45px (finder), 49px (CTA pill) | `buttons_height` 44; `.btn--small` 28px override |
| Icon circles | 32px, 1px `#E0E0E0`, white | `--mk-icon-circle` |

Breakpoints: Hyper's 640/768/1024/1280/1536 are kept. Figma covers only 1440 and 320. Assumptions: 320-767 = mobile frames; 768-1023 = mobile components with 2-3 columns; 1024-1439 = fluid desktop with 32-64px gutters; ≥1440 = 1312 centred.

## 2. Original vs revision diff and mobile adaptation

Tree-level diff per section: `docs/figma/sections.md`. Summary of what the revision changes (applies to EVERY template):

| Area | Original (`1:266`, `1:1794`, `1:949`) | Revision (`18:4094`, `52:5172`, `69:5443`) | Implementation |
|---|---|---|---|
| Primary colour | coral `#E66277` everywhere | teal-blue `#007F94` | tier 1 colour scheme |
| Product card | no container, image + text | 1px `#DDDDDD` container, r=10, 16px padding, white; brand line in `#9B9B9B`; wishlist circle top-start; badge top-end; "add to cart" small primary button bottom-start, price bottom-end | tier 2 CSS on `.product-card` + tier 3 wishlist/rating hooks |
| Badges | pale pastel fills | saturated amber / orange / cyan, pill (Home/PDP) or r=4 (Collection) | tier 1 colours; shape per Q2 |
| Stars | `#F8CF6A` / coral | `#FFBF00` | tier 2 |
| Nav | shadowed dropdown | gray border, no shadow | tier 2 |
| Icons | outline icons | "new icons with solid white background" (header icons in white circles with gray ring, USP icons multi-colour) | tier 2 for circles; USP icons are images (section settings) |
| Logo | original | softened logo `69:7519` / `141:4402` | asset (SVG export) in `logo` setting |
| Instagram icon | old | new (`69:7521`) | asset |
| Category circles | flat `#F9EDE8` fill (mobile) | 1px coloured ring per circle, PNG product on white | `mk-category-circles` block colour setting |
| Age buttons | 6 outlined buttons on gray band | 6 solid coloured pills, no band | `buttons-with-icon` (Hyper) restyled, or `mk-age-pills` |
| Brands grid | logos | logos stay (`69:5437`), 4x2 bordered tiles `#DFDFDF`, "show all brands" button | Hyper `brand-logos` with `grid_bordered` + CSS |
| Footer social icons | dark glyphs | `#312E7D` glyph on white circle | tier 2 |
| Hero | one image | two options (`69:4498` vs `69:4497`, Q5) | `slideshow` or `image-with-text-overlay` |
| Opening hours | two lines | one line (`69:5434`) | footer `contact_information` block text |

Mobile adaptation (original mobile frames for layout, revision for content/styling):
- Home mobile `1:7075`: announcement bar, logo centred with hamburger and icons, hero full-bleed, finder as a stacked card (290px, shadow), categories 3 circles per row, product grid 2 columns (138px cards, 14px gap), age pills 2 per row, brands 2 per row, surprise box stacked (image 258x220 over text), USP 2 per row tiles, Instagram 2 per row, reviews 1 per view slider, newsletter stacked, footer stacked.
- Collection mobile `1:7815`/`1:8109` + states `1:8411…1:9824`: filter + sort as two buttons opening bottom drawers (Hyper `filter_type drawer` + sort select; drawer states in `1:8411`-`1:9824` map to Hyper facets drawer), 2-column grid, load more / numbered pagination (Q9).
- Product mobile `1:10570`: gallery slider with dots/thumbnails below, info stacked, sticky ATC bar (Hyper `sticky-atc-bar` block), accordions, complementary slider 2 per view, reviews list, newsletter.
- Header mobile `1:7663` (drawer open, 291px from the inline-start side with 29px overlay) and `1:7515`: Hyper `menu-drawer` with nested levels, account/wishlist/cart in drawer footer.
- Tablet (768-1023): not designed; use mobile components with 3 columns (categories 4, products 3, brands 3, USP 3).

## 3. Figma section → Hyper mapping

Tier: 1 settings/JSON, 2 CSS, 3 new `mk-` section/snippet/asset, 4 core edit (logged). Effort: S ≤ 2h, M ≤ 1 day, L > 1 day. Node IDs refer to the revision frames; see `docs/figma/sections.md` for the full inventory.

### 3.1 Global (Phase 2)

| Design element | Hyper | Tier | Justification | Effort |
|---|---|---|---|---|
| Announcement bar (gray, centred text) | `topbar` (text block) in header group, colour scheme surface-2 | 1 + 2 | native | S |
| Header: icons (account, wishlist, cart) at the inline-start side, centred logo, search box at the inline-end side, nav row below with 1px bottom line | `header` layout `logo-center` (two rows), sticky `on-scroll-up`, `enable_collapse_on_scroll` false, `show_sperator_line`; search inline (`predictive_search_enabled`); **wishlist icon = new slot** | 1 + 2 + 4 | layout exists; wishlist icon needs an `MK-CUSTOM` hook in `sections/header.liquid` (or a `custom_link` block with the heart icon linking to `/pages/wishlist`, tier 1, preferred first attempt) | M |
| Mega menu (6 link columns + image promo tile "WINTER SALE") | `header` block `promotion_banner` keyed by `menu_title` | 1 | native; needs the Shopify menu built (3 levels) | S per menu |
| USP strip under header (`1:806`: shipping promise on pink band) | **not placeable in header group** (`multicolumn-icon`/`buttons-with-icon` disabled there) | 3 `mk-usp-bar` (enabled on header group, text + icon + colour settings) or `announcement-bar` second instance | small section | S |
| Mobile drawer | `menu-drawer` (`drawer--left` → opens from inline-start in RTL) | 1 + 2 | native | S |
| Footer: contact column (address, phone, email, hours one line, social circles) + 4 link columns, navy bg | `footer` with `contact_information` + 4 `menu` blocks, scheme-footer, social icons restyled | 1 + 2 | native (`footer` max 6 blocks: 1 contact + 4 menus + 0) | S |
| Newsletter band (cyan, title, email input with arrow, consent checkbox text) | `newsletter` section (consent text = rich text setting) placed before footer in footer group, or `footer` `newsletter` block | 1 + 2 | native; consent checkbox needs CSS/text only (no legal gating) | S |
| Mini cart (`1:2285`, `1:2583`) | `cart-drawer` | 1 + 2 | native (free-shipping goal, recommendations) | M |
| Search results (predictive) | `predictive-search` | 1 + 2 | native | S |
| Breadcrumbs | `breadcrumbs` section (`text_alignment start`) | 1 + 2 | check RTL separators | S |
| Back to top, page transition, scroll animations | settings: back-to-top on; page transition off; scroll animations off (perf) | 1 | — | S |
| Hebrew storefront strings | `locales/he.json` (new file, tier 3 asset) | 3 | Hyper ships no Hebrew locale | L |
| Fonts | `snippets/mk-fonts.liquid` + `assets/mk-*.woff2` | 3 | commercial font, self-hosted | S (after files arrive) |
| LTR isolation for prices, SKUs, phone, email | `.mk-ltr { direction:ltr; unicode-bidi:isolate }` applied via CSS to `.price`, `.product-meta__sku`, footer tel/email | 2 (+4 if markup hooks are missing) | Hyper has none | S |

### 3.2 Home (`18:4094`, Phase 3)

| # | Section (y, h) | Hyper section | Tier | Notes | Effort |
|---|---|---|---|---|---|
| 1 | Hero banner, full-bleed illustration, title, subtitle, CTA | `slideshow` (1 slide, `enable_preload_image`, mobile image) or `image-with-text-overlay` | 1 + 2 | LCP image: set `fetchpriority` via Hyper's first-slide logic; hero option Q5 | S |
| 2 | Product finder bar (age, skills, brand, price selects + "find me products" button) | **not in Hyper** | 3 `mk-product-finder` | builds a `/collections/all?filter.p.m…` URL from Search & Discovery filter values (no JS search; a form GET) | M |
| 3 | "קטגוריות נבחרות" 6 circles slider with coloured rings | `collection-list-slider` (circle image ratio) + CSS rings via block colour | 1 + 2 (+3 if ring colour per block is not a setting → `mk-category-circles`) | check `collection-list-slider` block settings for a colour; else tier 3 | S-M |
| 4 | "המוצרים שלנו" tabs (new / sale / bestsellers), 4-card slider | `featured-collection` with up to 8 collection tabs, `enable_slider` | 1 + 2 | tabs are native; collections "new", "sale", "bestsellers" must exist (automated collections) | S |
| 5 | "רכישה לפי גיל" 6 coloured pills | `buttons-with-icon` (each block: label, link, colour) restyled to pills | 1 + 2 | native; check per-block colour setting, else `mk-age-pills` | S |
| 6 | "מותגי הבית" 4x2 logo tiles + "show all brands" button | `brand-logos` (`grid_bordered`, columns 4, section button) | 1 + 2 | native | S |
| 7 | "קטגוריות נבחרות" second product slider (same card) | `featured-collection` | 1 | native | S |
| 8 | Surprise box banner (image, white card with title, text, CTA, r=30) | `image-with-text-overlay` or `image-with-text` (overlay card) | 1 + 2 | placeholder image until final (`69:5435`) | S |
| 9 | USP tiles 6 icons + labels | `multicolumn-icon` (image icons, 6 columns) | 1 + 2 | copy must be shortened (`69:5433`) | S |
| 10 | Instagram "mekupelet_toys" 5 video tiles | `shop-the-feed` (static images/videos from Files, link to Instagram) | 1 + 2 | no app needed; merchant uploads 5-10 media; Q4 | S |
| 11 | "ביקורות" 3 review cards with stars and date | `testimonials` (blocks: image, name, text, date) + stars via `mk-rating` snippet | 1 + 2 (+3 stars) | native testimonials have no star setting → add rating setting in `mk-testimonials` only if needed; else CSS stars by block "rating" text | M |
| 12 | Newsletter band | see global | 1 | — | — |

Current `templates/index.json` holds the Hyper demo (19 sections); it will be rebuilt (merge with the remote copy first).

### 3.3 Collection (`69:5443`, Phase 3)

| Design element | Hyper | Tier | Notes | Effort |
|---|---|---|---|---|
| Breadcrumb, title, description | `main-collection-banner` (no image) + `breadcrumbs` | 1 | — | S |
| Sidebar filters (categories list, age checkboxes 2 columns, skills, price range, highlights new/bestseller/sale, brand) in gray panels at the inline-end side | `main-collection-product-grid` `filter_type vertical` + Search & Discovery filters (metafields `age`, `skills`, `brand`=vendor, tags for highlights) | 1 + 2 | native; 2-column checkbox layout and panel styling in CSS; "categories" list = `image_card`? No: a `link_list` of sub-collections is **not in facets** → `mk-collection-links` block or a `collection_info` text | M |
| Active filter chips + "clear" + item count | `facets-active` + `facet-count` | 1 + 2 | native | S |
| Sort select | `facet-short` native select | 1 + 2 | — | S |
| 4-column grid, bordered cards, promo image tile in the grid | `columns_desktop 4`, `image_card` block | 1 + 2 | native | S |
| Pagination | `pagination number` (design shows none; Q9) | 1 | — | S |
| Mobile: filter/sort buttons, bottom drawers | `filter_type drawer` on mobile is automatic (<1280) | 1 + 2 | drawer states `1:8411…1:9824` | M |
| Boxes collection (`1:1598`, `1:1707`) | Phase 5 | — | — | — |

### 3.4 Product (`52:5172`, Phase 3)

| Design element | Hyper block | Tier | Notes | Effort |
|---|---|---|---|---|
| Breadcrumb | `breadcrumbs` | 1 | — | S |
| Vertical thumbnails at the inline-start side + main image with sale badge, share/whatsapp/wishlist circles | `gallery_layout vertical-carousel`, `badges` block, `addons` (share) + wishlist hook | 1 + 2 + 3 | wishlist icon on PDP = `mk-wishlist-button` snippet | M |
| Brand, title, short description, stock pill + low-stock dot, price (sale orange + compare-at) | `meta` (vendor), `title`, `text`, `inventory`, `price` | 1 + 2 | stock pill styling in CSS | S |
| Size / colour variant pickers | `variant_picker` (button + swatch) | 1 | — | S |
| Qty + "buy now" black full-width button | `buy_buttons` (qty; dynamic checkout off) | 1 + 2 | design shows black button on PDP vs teal elsewhere; Q1 | S |
| Gift wrap checkbox "+3 ₪" | Hyper `gift-wrapping.js` is cart-drawer only; PDP gift option = line item property | 3 `mk-gift-wrap` (checkbox adding a property; pricing via a gift-wrap product in cart) | needs decision (Phase 5 overlaps) | M |
| Free shipping notice pill | `shipping` block or `text` | 1 | — | S |
| Accordions: description, shipping/returns, development index, age fit, skills index, more details | `collapsible_tab` ×6 (page or metafield content) | 1 | metafields for age/skills/index | S |
| "Related products" tag pills (two colours) | `text`/`custom_liquid` with product tags → `mk-tag-pills` snippet | 3 | small | S |
| 3 USP tiles under the gallery | `grid-icon-box` or `icon-with-text` with `show_below_product_media` | 1 | native | S |
| "מוצרים משלימים" 4-card slider (bordered cards, "+" quick add) | `complementary` block (Search & Discovery) or `related-products` | 1 + 2 | native | S |
| Reviews: summary 4.7 + stars + count, "leave review" button, review list with image, name, stars, text, date, pagination | **not in Hyper** | 3 `mk-reviews` (metaobject-driven, read-only) **or** reviews app (`@app` block) | Q2 in progress.md: app vs native. Recommendation below | L (custom) / S (app) |
| Newsletter | see global | 1 | — | — |

### 3.5 Content templates (Phase 4)

| Template | Figma | Hyper | Tier | Notes |
|---|---|---|---|---|
| About (`1:3123`) | long page: hero, story, images, values | `page.about.json` with `image-with-text`, `rich-text`, `multicolumn`, `image-cards` | 1 + 2 | rebuild preset |
| Brands index (`1:3983`) | grid of brand tiles with name + short description + link | `brand-logos` lacks text → `mk-brands-index` section reading a **metaobject `brand`** | 3 | see data model |
| Brand page (`1:4180`, `1:4781`) | brand hero (logo, description, image) + product grid | `collection` template `collection.brand.json` with `mk-brand-hero` section (metaobject by collection metafield) + product grid | 1 + 3 | one template, two variants by settings |
| Blog (`1:5487`) / Article (`1:5586`) | cards grid; article with image, share, related | `main-blog`, `main-article`, `featured-blog` | 1 + 2 | native |
| FAQ (`1:5916`) | accordion groups | `page.faq.json` + `collapsible-tabs` (metaobject `faq` optional) | 1 | native; content via blocks |
| Legal (`1:5823`) | single text template | `page.legal.json` = `main-page` + `rich-text` | 1 | one template for all legal pages |
| Gift card (`1:2885`) | product page variant | `product.gift-card.json` (+ `gift_card.liquid` styling) | 1 + 2 | native |
| Course landing (`1:3455`) | long sales page | `page.course.json` built from `image-with-text`, `multicolumn`, `collapsible-tabs`, `rich-text`, CTA | 1 + 2 | scope Q (progress.md 1) |
| 404, search, cart page, account | not designed | Hyper defaults restyled | 1 + 2 | state assumptions |

## 4. Data models (merchant checklist items, no code yet)

| Need | Model | Definition |
|---|---|---|
| Brands | Metaobject `brand`: `name`, `logo` (file), `description` (rich text), `hero_image`, `collection` (collection ref), `website`, `featured` (boolean), `sort_order` | Brand page = collection with metafield `custom.brand` → metaobject; brands index lists metaobjects (paginated `metaobjects.brand.values`, ≤ 50 per page, fine for ~40 brands) |
| Product attributes for filters and PDP accordions | Product metafields: `custom.age_range` (list.single_line_text: `0-6m`, `6-12m`, … `3+`), `custom.skills` (list), `custom.development_index` (rich text), `custom.more_details` (rich text), `custom.age_fit` (rich text); brand = `vendor` | Search & Discovery filters on `age_range`, `skills`, vendor, price, availability, tags |
| Badges | Tags `new`, `bestseller`, `sale` (sale is automatic from compare-at price) mapped to Hyper `product_new_tags` = `חדש,new`, `product_hot_tags` = `בסט סלר,bestseller`; badge label = tag text, so use the Hebrew tag or override text in locale | no custom logic needed; "new" by date is not supported (Q8) |
| Reviews | Option A (recommended for launch): app with `@app` block + card rating snippet from the app's metafield (`reviews.rating`, `reviews.rating_count` standard metafields). Option B: metaobject `review` (`product`, `author`, `rating`, `body`, `date`, `image`) rendered by `mk-reviews`, no submission form (Shopify has no native form) | Q2 |
| Wishlist | Client-side: `localStorage['mk:wishlist']` (product handles), `mk-wishlist.js` (deferred, loaded by header), `/pages/wishlist` page with `mk-wishlist-grid` fetching `/products/<handle>.js` lazily; optional sync to customer metafield later | no app needed; Q3 |
| FAQ | `collapsible-tabs` blocks (editor) or metaobject `faq_item` (`question`, `answer`, `group`) | editor blocks are enough for ~30 items |
| Legal pages | Shopify Pages with `page.legal` template | — |
| Boxes (Phase 5) | see section 8 | — |
| Instagram | section blocks with media from Files + permalink | no app |

## 5. Asset inventory

| Asset | Source | Format / action |
|---|---|---|
| Logo (softened) | `69:7519` (group), `141:4402` (frame) | export SVG from Figma (vector), also PNG 2x fallback; `logo` + `logo_mobile` settings |
| Header icons (account, wishlist, cart, search, hamburger, close) | `docs/figma/tokens.md` §7 | Hyper Phosphor icons kept where identical; else `snippets/mk-icon-*.liquid` SVG |
| USP icons (6, multi-colour) | image fills in `docs/figma/images/` (see tokens.md §8) | PNG → upload to Files, section image settings; prefer SVG from designer |
| Category circle PNGs (5-6) | OPEN `69:5439` | merchant supplies transparent PNGs 600px |
| Hero illustration | `69:4498` / `69:4497` (Q5) | JPG/WebP 2880px desktop + 800px mobile, in Files |
| Surprise box image | `69:5435` placeholder | temporary; final from merchant |
| Brand logos | image fills | PNG/SVG in metaobject `brand.logo` |
| Social icons (TikTok, Instagram new `69:7521`, Facebook, WhatsApp) | Figma vectors | SVG snippets |
| Age pill colours, category ring colours | tokens.md §1 | section block colour settings |
| Fonts | Simpler Pro 400/600/700 | merchant supplies licensed woff2 |
| Instagram media | merchant | Files |
| Review images | merchant / app | — |

## 6. Baseline Lighthouse (mobile, untouched Hyper, sandbox)

| Page | Perf (median of 3) | A11y | BP | SEO | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|
| Home `/` | 79 | 87 | 96 | 85 | 3.0 s | 350 ms | 0 |
| Collection `/collections/all` | 77 | 99 | 96 | 92 | 3.1 s | 490 ms | 0 |
| Product `/products/121790` | 75 | 95 | 96 | 92 | 2.6 s | 680 ms | 0 |

Full detail and caveats in `docs/lighthouse/baseline/README.md`. Main costs: `vendor.js` 61 KB gz + `theme.js` 22 KB gz, DOM 1,840-3,845 elements (demo home has 19 sections), main-thread 5 s on the throttled CPU, Shopify checkout-web preloads and `wpm` pixel (not theme-controlled). The home LCP is the hero image `HEADER_VALUE-DESKTOP` (already `fetchpriority=high`). Targets for Phase 3: keep CLS 0, LCP ≤ 2.5 s on PSI, TBT ≤ 300 ms, DOM < 1,500 on home.

Perf levers inside our control: fewer home sections, 5 colour schemes instead of 16, `enable_product_compare` off (drops compare.js/css), animations off, no quick view, self-hosted fonts with 2 preloads, no apps on the storefront except reviews if chosen.

## 7. Open questions (merchant / designer) — blocking Phase 1

1. **Button radius and colour**: Figma mixes 4px (PDP buy, card button) with pills (hero CTA, "show all brands", finder). PDP "buy now" is black while every other action is teal. Proposal: teal `#007F94` everywhere, radius 4px for form/commerce buttons, pill only for hero/marketing CTAs (a block setting).
2. **Badge shape**: pill with 25% tint (Home/PDP) vs solid square r=4 (Collection). Proposal: solid colours, r=4, same on all templates (designer note `69:6242` says badges are global).
3. **Sale badge colour**: orange `#FF5400` (Collection, Home) vs pink `#FF75BA` (PDP main badge). Proposal: orange; pink stays decorative.
4. **Instagram section**: static media uploaded to Files (recommended, no app) or a feed app (needs approval).
5. **Hero image**: `69:4498` vs `69:4497` (`69:5442`).
6. **Mobile type sizes**: originals use 8-10px for badges/brand/price. Proposal: 12px minimum.
7. **Fonts**: confirm Simpler Pro web license and supply woff2 (400, 600, 700). `42dot Sans` on 9 nodes is a missing-font artefact; treat as Simpler Pro.
8. **"New" badge logic**: by tag (manual) or by product creation date (needs custom Liquid: `product.created_at` within N days, cheap). Proposal: tag for launch.
9. **Collection pagination**: numbered (Hyper default, SEO-friendly) or "load more". Design shows none. Proposal: numbered, 24 per page.
10. **Reviews**: app (Judge.me / similar, needs approval) or read-only metaobject reviews without a submission form. Proposal: app, because the design has a "leave review" button.
11. **Wishlist**: custom localStorage implementation (no app, no login) acceptable?
12. **Course landing page** scope and whether the course is a Shopify product (progress.md Q1).
13. **Category PNGs, USP copy length, surprise-box image, `139:4423` age reference**: still open from the frame map.
14. **Header shadow / nav**: confirm "gray border, no shadow" applies to the sticky header on scroll too.
15. **Product card hover**: design has no hover state. Proposal: shadow-sm + second image off (perf), quick-add button always visible on mobile.
16. **Tablet**: no frames; approve the assumptions in section 1.3.
17. **Figma hygiene (designer)**: the second Home product slider is titled `קטגוריות נבחרות` (copy-paste, real title?); age pills carry placeholder labels (`שנתיים-שלוש` ×3, `3+ years` ×3); the surprise-box banner background has no fill; Product and Collection revision frames contain two overlapping footers; footer opening hours are still on two lines (annotation `69:5434` says one line); announcement bar, descriptions, reviews and footer column titles are lorem (see `docs/figma/copy.md`).
18. **Figma renders**: 43 of 73 frames (all mobile frames and the Product/Collection revisions `52:5172`, `69:5443`) could not be rendered as 2x PNG because the Figma image-render quota of this token is exhausted (HTTP 429, retry-after ~4.6 days). The node tree and image fills are complete. Options: wait, use the designer's Figma account token, or allow the Figma MCP for screenshots only.

## 8. Boxes (Phase 5) — technical options to decide later

| Option | Inventory | Pricing | Checkout | 4,000+ catalogue | Notes |
|---|---|---|---|---|---|
| A. Line item properties on a "box" product (Hyper bundle sections pattern) | box product only; components not decremented | fixed box price | one line | fine (picker uses predictive search / collection JSON, paginated) | simplest; no app; fulfilment reads properties |
| B. Shopify native bundles (Bundles app / cart transform function) | component inventory decremented | sum or fixed | one bundle line with children | needs a custom app or Shopify Bundles app (limited to fixed bundles) | best data integrity; "assembled box" (customer choice) needs a cart-transform function app |
| C. Multiple lines + discount | decremented | discount code/automatic | N lines | fine | clearest for ops, weakest UX |

Recommendation to present in Phase 5: A for "surprise box" and "ready-made package", B (cart transform) for "assembled box" if inventory accuracy matters; otherwise A for all.

## 9. Phase 1 scope (after approval)

Tokens and settings (tier 1), `assets/mk-custom.css` loaded from `layout/theme.liquid` (one `MK-CUSTOM` include, logged), `snippets/mk-fonts.liquid`, buttons, inputs, badges, icons, product card restyle, `locales/he.json` skeleton. Verification per section with screenshots at 320/390/768/1440.
