# Implementation plan — Phase 0 deliverable (Discovery)

Status: draft for merchant approval, 2026-10-08. Read-only phase; no theme code was written.
Baseline: Hyper 1.5.0, theme `189111500994` (live), commit `10e0398`. Backup `154698219714` (1.4.0).

Sections marked **[needs Figma exports]** are structured now and get their values once the manual
exports in `docs/figma/EXPORT-CHECKLIST.md` arrive (Figma MCP quota is exhausted).

---

## 1. Hyper audit (what the theme gives us, and the gap to the design)

### 1.1 Architecture

| Area | What Hyper 1.5.0 ships | Gap / implication |
|---|---|---|
| Layout | `layout/theme.liquid`: `vendor.css` (11.5 KB) + `theme.css` (182.6 KB) blocking, `rtl.css` (2.9 KB) when RTL; `vendor.js` (225 KB) + `theme.js` (108 KB) deferred; section groups header/footer/overlay; `shop.metafields.foxtheme.code_head/code_body` hooks | No `Custom CSS` theme setting group; only the platform `custom_css` (editor) exists. Our single stylesheet goes in as `assets/mk-custom.css` loaded from `theme.liquid` (one core edit, logged) or via the editor's Custom CSS if it stays small. Decision below. |
| CSS conventions | BEM (`.product-card__image--main`) + Tailwind-like utilities (`md:block`, `w-6/12`); breakpoints 640 / 768 / 1024 / 1280 / 1536; logical properties used almost everywhere (0 `margin-left/right` in theme.css); `html { font-size: 62.5% }` so 1rem = 10px; per-section `section-*.css` via `stylesheet_tag`, `preload: true` on main sections | Follow the same: BEM, `mk-` prefix, same breakpoints, rem units, per-section CSS. |
| CSS variables | `snippets/css-variables.liquid` emits per-scheme `--color-*` (r,g,b triplets), typography `--font-*`, `--buttons-*`, `--pcard-*`, badge `--color-badge-{sale,hot,new,soldout,coming-soon}`, radii `--*-radius`, `--page-width` | Nearly every design token maps to a theme setting or an existing variable. Overrides target these variables, not raw values. |
| JS | Native custom elements (`customElements.define`, 100+), `window.FoxTheme` namespace (`config`, `pubsub`, `utils`, `Motion`, `Swiper`), per-section `<script defer>`; pubsub events `cart-update`, `variant-change`, `facet-update`… | New `mk-` JS = small custom elements that subscribe to `FoxTheme.pubsub`. No frameworks. |
| RTL | `enable_rtl` + `language_support_rtl` (set: `true`, `he`), `dir="rtl"` on `<html>`, `rtl.css` flips transform origins, drawers, icons (`.rtl-flip-x`), Swiper progress | Good base. Verify sliders/arrows/breadcrumbs per section during the verification loop. |
| Fonts | Shopify font library via `font_face`, `font-display: swap`, no preload (deliberate, see comment in `css-variables.liquid:388`). Current fonts **Instrument Sans n5/n7 — Latin only**, Hebrew falls back to system fonts | Switch to the design's Hebrew fonts. If they are in Shopify's library (e.g. Assistant, Heebo, Rubik, Noto Sans Hebrew) this is a settings change only; otherwise self-hosted woff2 via `mk-fonts` snippet (tier 3). |
| Locales | `en.default`, de, es, fr, it, vi. **No `he.json`**. Storefront strings on the live site are English ("Search", "Add to cart") | Add `locales/he.json` (423 keys) — a new file, not a core edit. Alternative: Translate & Adapt app. Recommendation: `he.json` in git (versioned, survives theme updates by copy). |
| Images | `image_tag` with widths list + `sizes`, `is="image-lazy"`, `loading="lazy"` except first cards (`section_index < 3 and index == 1`), LCP preload on product page, `content-visibility: auto` from the 3rd section | Reuse the same pattern in every `mk-` snippet. |
| Perf toggles at defaults | `enable_page_transition` true, `enable_scroll_animations` true, `enable_image_hover_effects` true, `enable_product_compare` true (loads `compare.css`/`compare.js`), popup enabled, `pcard_choose_options_actions: open_popup` (loads `quick-view.js` on every page) | Propose turning off: page transition, scroll animations, product compare, popup, and `open_popup` → `product_page` (design has no quick view). Each is a settings change with measurable TBT gain. |
| Theme check | 0 errors, 11 warnings on the baseline | Keep at 0 new errors. |
| Vendor comments | Four files carry perf comments that read like store-specific measurements (`theme.liquid:68`, `css-variables.liquid:388`, `main-product.liquid:56`, `product-thumbnail.liquid:36`); absent in the 1.4.0 backup | Open question Q7: was 1.5.0 installed from the Theme Store, or edited by someone? Affects the update guide. |

### 1.2 Commerce components

| Component | Hyper | Gap vs design |
|---|---|---|
| Product card | `snippets/card-product.liquid` + `pcard_*` settings (style standard/card, scheme, ratio, second image, quick add, quick view, swatches, vendor/type, title line limit). Radius via `pcard_corner_radius` (square/slightly/round). **No border setting**, no wishlist, no rating slot | Square border: CSS override on `.product-card__wrapper` (tier 2). `pcard_corner_radius: square`. Wishlist heart: no native feature → Q2 (app or `mk-wishlist` localStorage element). Stars: no native reviews → Q3 (app). |
| Badges | `snippets/pcard-badges.liquid`: Sale (compare-at), Sold out, and **tag badges** New / Hot / Coming soon (`product_new_tags`, `product_hot_tags`, `product_coming_tags`, one tag per line; badge text = the tag). Colors `color_badge_*` + text colors. Nested loop tags × 3 lists per card | Bestseller = rename usage of the `hot` slot: set `product_hot_tags` to `bestseller` tag (Hebrew tag text shows on the badge, e.g. tag `רב מכר`). New via tag `חדש`. Sale is automatic. Colors are settings. No code needed (tier 1). |
| Buttons | `--color-button*` per scheme, `buttons_corner_radius`, `buttons_height`, font weight/transform settings | Blue action buttons = scheme button color + radius settings (tier 1). |
| Header / nav | `sections/header.liquid`: layouts logo-left/center/left-search-center, sticky always/on-scroll-up, separator line setting, mega menu blocks (promotion_banner, custom_card, product_list, sidebar), mobile drawer. Shadow is hard-coded (`theme.css:7169`, `6985`) | Gray border = `show_sperator_line` + scheme border color (tier 1). No shadow = 2 CSS overrides (tier 2). |
| USP bar with icons | `topbar.liquid` (text/link_list/social blocks, no icons), `announcement-bar.liquid` (text, no icons). `multicolumn-icon` / `buttons-with-icon` have icons but are disabled in the header group | New `mk-usp-bar` section allowed in the header group, blocks: icon image (SVG from Files) + text, or inline icon choice (tier 3, S). |
| Search | Predictive search re-renders the header section per keystroke (`section_id` = header) | Keep native; measure; if slow, limit results (`number_results_to_show`). |
| Mini cart | `cart-drawer.liquid`: empty state (collections grid, `collection_in_cart` metafield) + filled state, free-shipping bar, note, coupon, recommendations, Section Rendering API | Two design states map to the two native states. Styling via CSS (tier 2). |
| Collection | `main-collection-product-grid`: 8–36 per page, columns 2–6 desktop / 1–2 mobile, filters vertical (xl) or drawer, storefront filtering (list, swatch, image, price range), sort, grid/list switch, pagination number / load_more / infinite, `image_card` blocks. Facets rendered twice (sidebar + drawer) | Mostly settings. Mobile filter/sort states from Figma map to the drawer; styling via CSS. Keep `number` or `load_more` pagination (SEO + 4,000 products). |
| Product page | `main-product` with 27 block types (title, price, meta, variant picker, buy buttons, pickup, description, collapsible tabs, complementary, icon-with-text, badges, shipping, sticky ATC, `@app`…), gallery layouts, PhotoSwipe zoom, LCP preload | Block configuration in `templates/product.json` (tier 1) + CSS. Reviews via `@app` block if an app is chosen. |
| Footer | `footer.liquid`: menu, contact_information (address, **single-line `working_hours`**, email, phone), image_text, newsletter; payment icons, social, selectors | Opening hours on one line = native (`working_hours`). Styling tier 2. |
| Breadcrumbs | `sections/breadcrumbs.liquid`, product trail via `breadcrumb.primary_collection` metafield | RTL check of separators. |
| Bundles | `products-bundle-selection` (tabs by collection, max 2–12 items, tiers are display-only, adds items via `cart/add.js` with no line-item properties), `products-bundle`, `multiple-product-bundles` | Phase 5 proposal starts from these. Discounts must be Shopify automatic discounts. |
| Metaobjects | Zero usage in the theme | Brands/FAQ/legal via metaobjects need `mk-` sections (tier 3). |

### 1.3 Current content state
All templates still hold English Hyper demo content; only the slideshow images, logo, topbar text
("משלוח חינם בהזמנה מעל 300 ₪"), spotlight-picks heading and free-shipping amount (500) were set.
No collections are assigned anywhere; the store has one collection (`frontpage`, 1 product) and
4,000+ products with numeric handles. Popup is enabled with demo text.

---

## 2. Design tokens → Hyper mapping **[needs Figma exports for the values]**

| Token | Hyper target | Current value | Figma value |
|---|---|---|---|
| Action blue (buttons, links) | `color_schemes.scheme-1.button` (+ `button_label`), `primary_accent` | button `#000000` on white; scheme-2 bg `#1d349a`; product meta link `#1D349A` | _pending_ (likely the `#1d349a` family already used by the merchant) |
| Text / heading / subtext | scheme `text`, `subtext` | `#000000` / `#666666` | _pending_ |
| Border gray (nav, cards) | scheme `border` | `#e5e5e5` | _pending_ |
| Background / secondary | scheme `background`, `secondary_background` | `#ffffff` / `#ededed` | _pending_ |
| Badge new / sale / bestseller | `color_badge_new`, `color_badge_sale`, `color_badge_hot` (+ `_text`) | new `#0d8756`, sale `#C4301C`, hot `#1d349a` | _pending_ |
| Star color | no native; `mk-` CSS var `--mk-color-star` | – | _pending_ |
| Wishlist heart | `--mk-color-heart` | – | _pending_ |
| Heading font / body font | `type_header_font`, `type_body_font` | Instrument Sans (no Hebrew) | _pending_ (Hebrew family + weights) |
| Type scale h1–h6, body, small | `heading_scale`, `body_font_size`, `heading_mobile_scale` (+ `--font-h*-size`) | 100 / 15px / 70 | _pending_ |
| Radii: buttons / inputs / blocks / cards / badges | `buttons_corner_radius`, `inputs_corner_radius`, `blocks_corner_radius`, `pcard_corner_radius`, `badges_corner_radius` | round / round / slightly / slightly / round | _pending_ (card = square per annotation) |
| Button height | `buttons_height` | 48 | _pending_ |
| Page width / gutter | `page_width`, `--page-padding` | 1700 / 1.6rem→5rem→13.5rem | _pending_ (design is 1440 wide) |
| Shadows | none on nav (annotation); others `--mk-shadow-*` if any | hard-coded header shadow | _pending_ |

Tokens live in `docs/figma/tokens.md` once extracted; CSS consumers use the Hyper variables above
and a short `:root { --mk-* }` block in `assets/mk-custom.css` only for tokens Hyper lacks.

---

## 3. Approved revision: global decisions, diff and mobile adaptation

### 3.1 Global decisions (from the 17 designer annotations, `docs/figma-frame-map.md`)

| # | Decision | Implementation tier | Mobile adaptation |
|---|---|---|---|
| G1 | Action buttons blue | 1 (scheme button color) | Same; full-width buttons on 320 where the original mobile frames show them |
| G2 | Navigation with gray border, no shadow | 1 (`show_sperator_line`, border color) + 2 (remove shadow rules) | Mobile header keeps the border; drawer unchanged |
| G3 | Square border around every product card | 2 (CSS on `.product-card__wrapper`) + 1 (`pcard_corner_radius: square`) | Same card, 2 columns (`columns_mobile: 2`) |
| G4 | New colors for heart, new, sale, bestseller | 1 (badge colors) + 2 (`--mk-color-heart`) | Same |
| G5 | Icons with solid white backgrounds (USP) | 3 (`mk-usp-bar`) | Horizontal scroll or 2×2 grid per original mobile frame `1:7075` |
| G6 | New star color | 2 (CSS var) once reviews source is decided (Q3) | Same |
| G7 | Softened logo | asset (Files) + `logo` setting | `logo_mobile` setting |
| G8 | New Instagram icon | asset; footer social icons via CSS override or `mk-` snippet | Same |
| G9 | Brand logos stay in the brands grid | 1 (`brand-logos` section) | Fewer columns, swipe on mobile (section setting) |
| G10 | Footer opening hours on one line | 1 (`working_hours` text) | Same |

### 3.2 Original vs revision per template **[needs Figma exports]**

| Template | Original | Revision | Diff (to fill from exports) |
|---|---|---|---|
| Home | `1:266` | `18:4094` | section order, hero image option (`69:4498` vs `69:4497`), USP bar copy, category tiles (PNG on brand colors), badges |
| Product | `1:1794` | `52:5172` | buttons, card border in recommendations, badges, stars |
| Collection | `1:949` | `69:5443` | card border, badges, filters styling |

Method: side-by-side 2x PNG comparison, one row per section, columns: section / original / revision /
change / mobile pattern source (original mobile frame) / Hyper mapping.

### 3.3 Open annotations (merchant input needed)
See Open questions Q8–Q12 (category PNGs, hero image, surprise-box image, USP copy, `139:4423`).

---

## 4. Figma section → Hyper mapping (tier, justification, effort)

Tiers: **T1** settings/JSON, **T2** CSS override, **T3** new `mk-` section/snippet, **T4** core edit.
Effort: S < 0.5 day, M 0.5–1.5 days, L > 1.5 days.

### 4.1 Shared components (Phase 1–2)

| Component | Mapping | Tier | Why | Effort |
|---|---|---|---|---|
| Typography + Hebrew fonts | `type_*_font`, scales; `mk-fonts` snippet only if the family is not in Shopify's library | T1 (T3 fallback) | Hyper loads fonts from Shopify's CDN with swap | S–M |
| Buttons | scheme button colors, `buttons_*` settings | T1 | Native | S |
| Form fields | scheme `form_field*`, `inputs_corner_radius` + CSS polish | T1 + T2 | Native | S |
| Icons | Hyper `icons.liquid` (32) + `icon-*.liquid` (57); design icons as SVG in Files for USP/footer | T1/T3 | Avoid editing `icons.liquid` (core) | S |
| Badges new/sale/bestseller | tag lists + colors | T1 | Native tag badges | S |
| Product card | settings + CSS border; wishlist/stars pending Q2/Q3 | T1 + T2 (+T3) | No border/wishlist natively | M |
| Header + nav + mega menu | `header` settings/blocks, `main-menu`, CSS for border/no-shadow | T1 + T2 | Native mega menu | M |
| USP bar | `mk-usp-bar` (header group) | T3 | No icon-capable bar in header group | S |
| Mobile menu | `menu_mobile` + CSS | T1 + T2 | Native drawer | S |
| Search | native predictive search + CSS | T1 + T2 | Native | S |
| Footer | footer blocks + CSS | T1 + T2 | Native incl. working hours | S–M |
| Mini cart (2 states) | `cart-drawer` settings + CSS | T1 + T2 | Native two states | M |
| Hebrew storefront strings | `locales/he.json` | T3 (new file) | No he locale shipped | M |

### 4.2 Core commerce (Phase 3)

| Page / section | Mapping | Tier | Effort |
|---|---|---|---|
| Home — hero | `slideshow` (already has merchant images) | T1 + T2 | S |
| Home — USP bar | `mk-usp-bar` or `multicolumn-icon` (template-level) | T3/T1 | S |
| Home — categories with PNG tiles | `collection-list` / `collection-cards` (image per collection, color scheme per block) | T1 + T2 | M |
| Home — featured products (new/bestsellers) | `featured-collection` (tabs) | T1 | S |
| Home — brands grid | `brand-logos` (logo + link per block) | T1 + T2 | S |
| Home — boxes teaser / promo banners | `custom-content` / `image-with-text-overlay` / `grid-banner` | T1 + T2 | S–M |
| Home — Instagram feed | Q4 (app vs `scrolling-gallery-image` with Files images) | T1 or app | S |
| Home — remaining sections | **[needs exports]** per-section rows added after the diff | – | – |
| Collection | `main-collection-banner` + `main-collection-product-grid` settings; filters via Search & Discovery (merchant checklist); CSS | T1 + T2 | M |
| Collection mobile filter/sort states | native facets drawer + CSS | T2 | S–M |
| Product | `templates/product.json` blocks + CSS; gallery layout per design | T1 + T2 | M–L |

### 4.3 Content (Phase 4)

| Page | Mapping | Tier | Effort |
|---|---|---|---|
| About | `page.about` template: `image-with-text`, `rich-text`, `multicolumn`, `testimonials` | T1 + T2 | M |
| Brands index | `mk-brands-index` section over metaobject `brand` (paginated grid, alphabet filter if designed) | T3 | M |
| Brand page (2 variants) | `templates/collection.brand.json` (collection per brand) with `mk-brand-header` reading metaobject by handle = collection handle | T3 | M |
| Blog / Article | `main-blog`, `main-article` + CSS | T1 + T2 | S–M |
| FAQ | `mk-faq` section over metaobject `faq_item` (categories as tabs/anchors) or `collapsible-tabs` with blocks if content is static | T3 (or T1) | M |
| Legal (one template) | `templates/page.legal.json`: `main-page` + `mk-page-toc` block (headings → anchor list) | T1 + T3 | S |
| Gift card | `templates/gift_card.liquid` CSS | T2 | S |
| Course landing page | Q1 — scope | – | – |

### 4.4 Boxes (Phase 5) — functionality, proposal before build
Start from `products-bundle-selection` (tabs by collection, max items, display-only tiers, adds
items with no properties). Options to compare in the Phase 5 proposal: (a) native bundle section +
automatic discount, (b) `mk-box-builder` with line item properties grouping items to a box, (c) Cart
Transform function (bundle into one line, needs an app/extension = approval). Trade-offs per
inventory, pricing, checkout and 4,000-product catalog will be written then.

---

## 5. Data models (admin setup by the merchant, exact checklists provided at build time)

| Model | Proposal | Fields |
|---|---|---|
| Brand | Metaobject `brand` (one entry per brand) + one collection per brand (handle = metaobject handle). Brands index reads the metaobject list; brand page = collection template with brand header | `name` (text), `logo` (file), `hero_image` (file), `hero_image_mobile` (file), `description` (rich text), `collection` (collection ref), `website` (url), `featured` (boolean), `sort_order` (number) |
| FAQ | Metaobject `faq_item` + `faq_category` | item: `question`, `answer` (rich text), `category` (ref), `order`; category: `title`, `order` |
| Legal | Shopify pages + `page.legal` template; TOC generated from `h2` headings | none |
| Badges | Product tags: `חדש` (new), `רב מכר` (bestseller → `hot` slot); sale automatic from compare-at price. Optional later: `new` by `created_at` window via `mk-` logic if tags prove unmanageable | tags |
| Category tiles | Collection image + metafield `collection.mk.tile_color` (color) for the PNG-on-brand-color tiles | metafield |
| Box products | Decided in Phase 5 | – |

---

## 6. Asset inventory

| Asset | Source | Status |
|---|---|---|
| Logo (softened) | Figma `69:7519` → SVG → Files | export pending |
| Instagram icon | Figma → SVG | export pending |
| USP icons (solid white backgrounds) | Figma → SVG set | export pending; copy length OPEN |
| Badge shapes/colors | Figma components | export pending |
| Star, heart icons | Figma → SVG | export pending |
| Category PNGs on brand colors | OPEN who supplies (`69:5439`) | open |
| Home hero image | `69:4498` vs `69:4497` OPEN | open |
| Surprise box image | AI placeholder (`69:5435`) | placeholder |
| Payment icons | Shopify native (`payment_type_img_url`) | ready |
| Hebrew fonts | design family TBD; Shopify library or woff2 | pending |

---

## 7. Baseline Lighthouse (mobile, medians of 3)
See `docs/lighthouse/baseline.md`: Home **75**, Collection **72**, Product **69**; CLS 0 everywhere,
TBT ~0.5 s from the vendor bundle, LCP 2.9–3.7 s. Quick wins available through settings alone
(animations, compare, popup, quick view) before any custom code.

---

## 8. Open questions for the merchant

1. **Course landing page** (`1:3455`): in scope as `page.course`? Digital product on Shopify or external link?
2. **Wishlist**: app (needs approval) or a light `mk-wishlist` (localStorage, no accounts)?
3. **Reviews / stars**: which app (Judge.me, Shopify Product Reviews successor, other)? The star color applies to its widget.
4. **Instagram feed** on Home: app or static images from Files?
5. **Hebrew strings**: `locales/he.json` in git (recommended) or Translate & Adapt app?
6. **Hebrew fonts**: which families does the design use? If not in Shopify's font library, approve self-hosting woff2.
7. **Hyper 1.5.0 origin**: installed from the Theme Store update, or did someone edit files? (four vendor files carry store-specific performance comments). Needed for the update guide.
8. Category PNGs on brand colors: who supplies them (`69:5439`)?
9. Final hero image: `69:4498` or `69:4497` (`69:5442`)?
10. Surprise-box image: placeholder until a final image arrives (`69:5435`)?
11. USP copy must be shortened (`69:5433`): who writes the short version?
12. `139:4423` "0-6 חודשים" reference: age filter? ignore?
13. **Perf toggles**: approve turning off page transition, scroll animations, product compare, popup, and quick-view popup (settings only, reversible)?
14. **Custom stylesheet location**: `assets/mk-custom.css` linked from `theme.liquid` (one logged core edit, cacheable file) vs the editor's Custom CSS (no core edit, inlined on every page). Recommendation: the file.
