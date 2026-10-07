# Hyper theme audit (untouched baseline)

Scope: read-only audit of the Hyper theme files pulled from theme `154698219714` (commit `67656a7`).
Purpose: know what Hyper already ships, which conventions to follow, and where the Figma design
will need custom `mk-` work. Facts cite file paths and setting IDs; "not in Hyper" is stated explicitly.

## 1. Version and architecture

| Item | Evidence |
|---|---|
| Theme | Hyper **1.4.0** by FoxEcom (`config/settings_schema.json` → `theme_info`; `snippets/js-variables.liquid` → `FoxTheme.settings.themeVersion = '1.4.0'`). Docs URL in theme_info: docs.foxecom.com/hyper-theme. |
| Architecture | OS 2.0, JSON templates, section groups `sections/header-group.json`, `footer-group.json`, `overlay-group.json` (`layout/theme.liquid` lines 118–126). Presets installed: Hyper, Ceramide, Trove, Pillar, Nexvo (`settings_data.json` → `presets`). |
| Global JS namespace | `window.FoxTheme` (`assets/theme.js` line 1). |
| Files | 96 sections, 145 snippets, 169 assets, 6 locales (de, en.default, es, fr, it, vi). **No `he.json` locale ships**; all storefront strings must be translated by us (Shopify admin "Translate & Adapt" or a `locales/he.json` file). |

### 1.1 CSS loading

| Layer | Files | How loaded | Size (raw / gzip) |
|---|---|---|---|
| Global, in `<head>` | `assets/vendor.css` (Swiper core), `assets/theme.css` | `stylesheet_tag: preload: true` in `layout/theme.liquid` lines 56–57 | 11.8 KB / 3.7 KB; 186 KB / 31 KB |
| Conditional global | `assets/compare.css` (if `settings.enable_product_compare`), `assets/rtl.css` (if RTL resolved true) | same, lines 59–65 | 4.9 KB; 2.9 KB |
| Inline critical | `snippets/css-variables.liquid` → `{% style %}` block with `@font-face`, color-scheme vars, `:root` tokens, `html/body` base | rendered before the stylesheets | n/a |
| Per section | `section-*.css` and `component-*.css` (`{{ 'x.css' | asset_url | stylesheet_tag }}` at the top of the section file; 66 sections do this, 8 add `preload: true`) | Render-blocking `<link>` inside the body, one per section (Shopify dedupes identical hrefs). | 0.3–21 KB each; largest `section-main-product.css` 21 KB, `component-country-flag.css` 17 KB, `photoswipe-component.css` 9 KB |

### 1.2 JS loading

| Layer | Files | How loaded |
|---|---|---|
| Global | `assets/vendor.js` (231 KB / 61 KB gz), `assets/theme.js` (99 KB / 22 KB gz) | `<script defer>` in head, `theme.liquid` lines 69–70 |
| Conditional global | `quick-view.js` (if `pcard_show_quickview_button` or `pcard_choose_options_actions == 'open_popup'`), `compare.js` (if `enable_product_compare`), `theme-editor.js` (design mode), `shopify_common.js` (customer pages) | end of `<body>` / head |
| Per section | `<script src="{{ 'x.js' | asset_url }}" defer>` at the top or bottom of the section file (70 occurrences). Examples: `header.js` 28 KB, `cart.js` 33 KB, `facets.js` 20 KB, `product-info.js` 15 KB, `media-gallery.js` 14 KB, `photoswipe.js` 91 KB (only when `enable_image_zoom`, `sections/main-product.liquid` line 111). |

### 1.3 What `vendor.js` bundles (identified from the minified source)

| Library | Evidence |
|---|---|
| **Swiper** (full build: Navigation, Pagination, Autoplay, Thumbs, Mousewheel, EffectFade, Controller, A11y, Virtual, FreeMode, Scrollbar, Parallax) | `FoxTheme.Swiper=` export; 224 `swiper` identifiers; `rtlTranslate` present (Swiper auto-detects `dir="rtl"`). |
| **Motion One** subset | `FoxTheme.Motion={animate,inView,timeline,stagger,scroll}` — drives `<motion-element data-motion="...">` scroll animations. |
| Custom-elements polyfill (Andrea Giammarchi `@webreflection`) | header comment `/*! (c) Andrea Giammarchi */`. |
| `image-lazy` (`<img is="image-lazy">` customised built-in) | defined at the end of `vendor.js`; handles `pageshow` / bfcache re-src. |
| Not bundled | PhotoSwipe is a separate `assets/photoswipe.js`; no jQuery, no GSAP, no Alpine, no lazysizes. |

Transpiled to ES5-style (`arguments`, `concat`, Symbol iterator helpers) → large for what it does. **Total global payload: ~84 KB gz JS + ~35 KB gz CSS + inline style block.**

## 2. Conventions to follow

### 2.1 JS pattern
- Everything is a **custom element**. `theme.js` defines 32 (e.g. `drawer-component`, `modal-component`, `product-form`, `quantity-input`, `accordion-details`, `tabs-component`, `motion-element`, `product-recently-viewed`, `scroll-pagination`, `masonry-layout`). Section scripts define their own, guarded by `if (!customElements.get('x'))` (see `assets/collection-list.js`).
- Section init pattern: `class X extends HTMLElement { connectedCallback() { this.sectionId = this.dataset.sectionId; this.section = this.closest('.section-' + id); ... matchMedia(FoxTheme.config.mediaQueryMobile).onchange = this.init } }`.
- Sliders: `new FoxTheme.Carousel(container, options, extraModules).init()` wraps `FoxTheme.Swiper.Swiper` with Navigation/Pagination/A11y by default (`theme.js` line 354).
- Globals from `snippets/js-variables.liquid`: `FoxTheme.routes.*`, `FoxTheme.settings {cartType, moneyFormat, themeName, themeVersion, enableAnimations}`, `FoxTheme.variantStrings`, `FoxTheme.cartStrings`, `FoxTheme.compare`, `FoxTheme.accessibilityStrings`, `FoxTheme.quickOrderListStrings`, `FoxTheme.shippingCalculatorStrings`.
- Helpers in `theme.js`: `FoxTheme.config` (`mqlMobile/Tablet/Laptop/SmallDesktop`, `isTouch`, `isRTL`, `motionReduced`), `FoxTheme.DOMready`, `FoxTheme.a11y.trapFocus/removeTrapFocus`, `FoxTheme.utils` (incl. localStorage with expiry), `FoxTheme.Currency`, `FoxTheme.MotionObserver`, `FoxTheme.delayUntilInteraction`, `FoxTheme.focusVisiblePolyfill`.
- Events: `FoxTheme.pubsub.publish/subscribe` with `PUB_SUB_EVENTS = {cartUpdate:'cart-update', quantityUpdate, quantityRules, quantityBoundries, variantChange:'variant-change', cartError, facetUpdate:'facet-update', optionValueSelectionChange}`. DOM events: `matchMobile/unmatchMobile/matchTablet/...`, `cart:updated`, `cart:refresh`, `collection:rerendered`, `recommendations:loaded`, `menu-drawer:open`, `tabChange`, `page:loaded`, `motion-initialized`.
- Recently viewed uses `localStorage['hypertheme:recently-viewed']` (`assets/recently-viewed-products.js` line 52).

### 2.2 CSS naming
- BEM-ish blocks: `.product-card__image-wrapper`, `.header__bottom`, `.mega-menu__column`, modifiers `.btn--primary`, `.f-grid--gap-medium`, `.product-card-style-card`.
- Hyper-prefixed primitives: `.f-grid`, `.f-column`, `.f-badge`, `.f-price`.
- A Tailwind-like utility layer in `theme.css`: `.flex .grid .hidden .gap-1…8 .items-center .justify-between .w-full .relative .text-center .text-sm .text-base .text-lg`, responsive prefixes `.md\:`, `.lg\:`, `.xl\:` (e.g. `.hidden.md\:block`), `.text-limit-2-lines`.
- Typography classes: `.hd1 .hd2 .h1–.h6 .text-subheading .text-pcard-title .text-sm-extra .font-heading .font-body-bolder .rte`.
- Section wrapper: `class="section section-{{ section.id }} <name> section--padding color-{{ settings.color_scheme }}"` with `--section-padding-top/bottom: {{ settings.padding_top }}px` in a `{% style %}` block. Mobile padding = `min(4rem, 60%)`, tablet = `max(min(top, 6rem), 75%)`, ≥1280 = full (`theme.css` lines 166–200).
- Container: `.page-width` (`padding-inline: var(--page-padding)`), `.page-width--full`, `--narrow` (88rem), `--small` (120rem). `--page-padding`: 1.6rem → 5rem (≥1200) → `max(13.5rem, 50vw - page-width/2)` (≥1536).

### 2.3 Breakpoints
| Name (JS `FoxTheme.config`) | CSS media query (theme.css + section css counts) |
|---|---|
| mobile | `(max-width: 767.98px)` ×57 / ×183; `(min-width: 768px)` ×27 / ×106 |
| small phone | `(max-width: 639.98px)` ×6, `(min-width: 640px)` ×5 |
| tablet | `(max-width: 1023.98px)` ×7 / ×23; `(min-width: 1024px)` ×15 / ×47 |
| laptop | `(min-width: 1280px)` ×9 / ×36; `(max-width: 1279.98px)` |
| small desktop | `(min-width: 1536px)` ×6 / ×9 |
| misc | `(hover: hover) and (pointer: fine)`, `(prefers-reduced-motion)`, `(forced-colors: active)`; legacy stragglers `750px`, `751px`, `1200px` |
JS: `mediaQueryMobile: 767px`, `Tablet: 1023px`, `Laptop: 1279px`, `SmallDesktop: 1535px` (`theme.js` lines 8–11). Color schemes also split at 768 (`desktop-color-*` / `mobile-color-*` in `css-variables.liquid`).

### 2.4 CSS variables available (defined in `snippets/css-variables.liquid` unless noted)
- Per color scheme (`.color-{id}`, `:root` = first scheme), all as RGB triplets for `rgb(var(--x))`: `--color-background`, `--color-secondary-background`, `--color-primary`, `--color-text-heading`, `--color-foreground`, `--color-subtext`(+`-alpha`), `--color-border`(+`-alpha`), `--color-button`, `--color-button-text`, `--color-secondary-button`, `--color-secondary-button-border`, `--color-secondary-button-text`, `--color-button-before`, `--color-field`(+`-alpha`), `--color-field-text`, `--color-link`, `--color-link-hover`, `--color-product-price-sale`, `--color-progress-bar`, `--color-foreground-lighten-60/40/19`, `--inputs-border-width`, `--inputs-search-border-width`.
- Fonts: `--font-body-family/style/weight/weight-bolder/weight-bold/size/line-height`, `--font-heading-family/style/weight/letter-spacing/transform/scale/mobile-scale`, `--font-subheading-*`, `--font-navigation-family/weight`, `--navigation-transform`, `--font-button-family/weight`, `--buttons-letter-spacing/transform/height/border-width`, `--font-pcard-title-family/style/weight/scale/transform/size/line-height`, `--font-pcard-price-*`, `--font-pcard-badge-*`.
- Type scale (rem on `html{font-size:62.5%}` → 1rem = 10px): `--font-hd1-size` = display×0.1428, `--font-hd2-size` = display×0.1, `--font-h1-size: calc(scale*4rem)`, h2 3.2rem, h3 2.8rem, h4 2.2rem, h5 1.8rem, h6 1.6rem, `--font-subheading-size`. Body line-height = 1.625 + (size−16)×0.025.
- Badges: `--color-badge-sale/-text`, `-soldout`, `-hot`, `-new`, `-coming-soon`, `--color-cart-bubble`, `--color-keyboard-focus`.
- Radii: `--buttons-radius`, `--inputs-radius`, `--textareas-radius`, `--blocks-radius`, `--blocks-radius-mobile`, `--small-blocks-radius`, `--medium-blocks-radius`, `--pcard-radius`, `--pcard-inner-radius`, `--badges-radius` (mapped from select settings: slightly=5/10, soft-pill=10, round=100 for buttons; blocks slightly=10/6/5, round=20/10/6; pcard slightly=10/6, round=20/10; badges slightly=5, round=40).
- Layout/animation: `--page-width`, `--page-width-margin`, `--page-padding` (theme.css), `--header-padding-bottom(-mobile/-large/-large-lg)`, `--animation-long/nav/default/fast/button`, `--duration-default/image`, `--transform-origin-start/end` (flipped by rtl.css).
- Grid (theme.css): `--f-columns-mobile/md/xl/xxl`, `--f-column-gap-mobile/md/lg/xl`, `--f-row-gap-*`; gap tokens `2xs` 0.8rem, `extra-small` 1.2rem, `small` 2rem, `medium` 3rem, `large` 5rem(mobile 1.2), `extra-large` 10rem(lg 5).
- No spacing scale beyond those gaps and the `.gap-N` utilities (0.4rem steps).

### 2.5 Schema translation style
- Every label is `t:` keyed into `locales/en.default.schema.json` (`general`, `settings_schema`, `sections` with 91 section namespaces). Shared labels live under `t:general.*` (`general.padding.top`, `general.container.options__fixed`, `general.grid.column_gap`, `general.section_header.*`, `general.button.*`, `general.image.*`, `general.mobile.name`, `general.carousel.name`). Section-specific under `t:sections.<section>.settings.<id>.label` and `.blocks.<type>.settings.<id>.label`; options as `options__1.label`.
- Standard section settings order: `container {fixed|full}` → `color_scheme` → section header group (`section_header_alignment`, `subheading`, `heading`, `highlight_style`, `heading_size {h5…hd1}`, `description`, `button_label/link/style/icon`) → grid (`columns`, `column_gap`, `row_gap`) → carousel (`enable_slider`, `navigation_position`) → mobile (`columns_mobile`, `swipe_on_mobile`, `show_progress_bar`) → `padding_top/bottom` (range 0–100 step 2 px, default 50) → divider (`show_section_divider`, `divider_width`).
- Button style option set: `btn--primary | btn--secondary | btn--underline | btn--plain` (+ `btn--white`, `btn--blank`, `btn--icon` in some places). Button icons: select list mapped to `assets/icon-*.svg` via `inline_asset_content` (`snippets/button.liquid` line 65).

## 3. RTL support

| Topic | Finding |
|---|---|
| Switch | `settings.enable_rtl` + `settings.language_support_rtl` (comma list, default `he,ar`). `layout/theme.liquid` lines 1–13: if the list is set, RTL applies only when `localization.language.iso_code` is in it → `<html dir="rtl">` and `rtl.css` preloaded. **Current: `enable_rtl: true`, `language_support_rtl: "he"`** → RTL is active for Hebrew. |
| `assets/rtl.css` (2.9 KB) | Only ~30 rules: flips `--transform-origin-start/end`; `.rtl-flip-x` (scaleX(-1)) and `.flip-x`; checkbox tick and switch slider transforms; `input[type=tel]{direction:rtl}`; swiper progressbar origin; tooltip translate; locale selector padding; drawer slide direction (`.drawer--left/--right` `--translate-x`); `.product-card{--pcard-quickview-offset:-15px}`; scrolling promotion keyframes `-rtl`; image-comparison clip; popup teaser/spotlight toggle rotation; highlight-text svg; favorite-products translate; collection-card arrow flip; bundle hotspot factor; layered images; countdown divider. **It does not** touch typography, alignment, breadcrumbs, pagination arrows, facets, header icons or mega menu — those rely on logical properties. |
| Logical props in `theme.css` | `padding-inline` 79, `inset-inline` 74, `margin-inline` 33, `border-inline` 11, `text-align: start` 10 / `end` 6; `text-align: left/right` 0, `margin-left/right` 0, `padding-left/right` 1, `border-left/right` 0, `float` 0. Physical `left:`/`right:` 55 occurrences, mostly paired `left:0;right:0` (full-bleed) plus a few one-sided offsets (lines 1096, 2867–2873, 3190, 3486, 3943). Verdict: **RTL-first codebase; spot-check the one-sided offsets.** |
| Sliders | Swiper reads `dir="rtl"` from the container automatically (`rtlTranslate` in vendor.js). Theme code uses `FoxTheme.config.isRTL` once (`theme.js` 3076, scroll factor). Prev/next icons use `icon-slider-prev/next` snippets; PhotoSwipe arrows get `rtl-flip-x` (`media-gallery.js` 288). **Verify every Swiper section visually** (loop + autoplay + navigation). |
| Drawers | `.drawer--left/--right` flipped by rtl.css; menu drawer is `drawer--left` (`snippets/menu-drawer.liquid` line 9) → opens from the right in RTL. |
| Icons | Directional icons (`icon-caret-left/right`, `icon-arrow-left/right`) are **not auto-flipped** except where `.rtl-flip-x` is applied; breadcrumb separator, "view all" arrows and pagination arrows must be checked. |
| Mixed strings | No `unicode-bidi`/`dir="ltr"` helpers for prices/SKUs in `theme.css` or `snippets/price.liquid`. `input[type=tel]` is forced RTL (arguably wrong for phone numbers). **We need a small `mk-` LTR-isolate utility** for prices, SKUs, phone numbers. |

## 4. Theme settings inventory (`config/settings_schema.json`) and current values (`config/settings_data.json`)

### 4.1 Groups and decision-relevant IDs
| Group | Setting IDs (type, options → default) |
|---|---|
| General | `enable_rtl`, `language_support_rtl`, `enable_back_to_top` |
| Logo | `logo`, `logo_width` 50–400, `logo_mobile`, `logo_width_mobile` 50–200, `favicon` |
| Colors | `color_schemes` (group, fields below), `color_badge_sale/_text`, `color_badge_hot/_text`, `color_badge_new/_text`, `color_badge_soldout/_text`, `color_badge_coming_soon/_text`, `color_cart_bubble`, `color_key_board_focus`, `overlay_color_scheme` |
| Color scheme fields | `primary_accent`, `border`, `text`, `subtext`, `background`, `secondary_background`, `button`, `button_label`, `secondary_button`, `secondary_button_border`, `secondary_button_label`, `form_field`, `form_field_label`, `product_price_sale`, `progress_bar_color` (15 fields; no "link" or "shadow" field) |
| Typography | `type_body_font`, `body_font_weight_bolder {500–900}`, `body_font_size` 12–24, `type_header_font`, `heading_scale` 100–150%, `heading_mobile_scale` 70–120%, `heading_letter_spacing`, `heading_uppercase`, `display_heading_size` 40–80, `display_heading_uppercase`, `subheading_scale/font/font_weight/letter_spacing/transform`, `pcard_title_scale/font/font_weight/uppercase`, `pcard_price_font/font_weight`, `pcard_badge_font/font_weight`, `navigation_font/font_weight/uppercase`, `buttons_font/font_weight/letter_spacing/transform` |
| Layout | `page_width` 1000–2000 step 10, `buttons_corner_radius {square|slightly|soft-pill|round}`, `inputs_corner_radius` (same), `blocks_corner_radius {square|slightly|round}`, `pcard_corner_radius`, `badges_corner_radius` |
| Buttons | `buttons_height` 24–80 step 2 (default 48) |
| Animations | `enable_page_transition`, `enable_scroll_animations`, `enable_image_hover_effects` (all default true) |
| Product cards | `pcard_style {standard|card}`, `pcard_content_alignment`, `pcard_title_line_limit`, `pcard_color_scheme`, `pcard_image_ratio {adapt|1/1|3/4|4/3}`, `pcard_show_second_img`, `pcard_show_vendor`, `pcard_show_type`, `pcard_show_price`, `pcard_show_badge_soldout`, `pcard_list_style`, `pcard_overlay_color_scheme`, `pcard_show_cart_button`, `pcard_choose_options_actions {open_popup|product_page}`, `pcard_button_style {btn--primary|btn--secondary|btn--white}`, `pcard_show_quickview_button`, `quickview_button_style`, `pcard_show_flash_sale`, `pcard_flash_sale_color_scheme`, `pcard_show_sale_badge`, `pcard_sale_badge_type {show_text|show_percentage|show_amount}`, `pcard_enable_color_swatches`, `pcard_maximum_swatches_to_show` 1–6, `pcard_swatch_shape`, `pcard_swatches_type`, `pcard_mobile_hide_quick_add` |
| Product badges | `product_new_tags` (textarea, default "New"), `product_hot_tags` ("Hot"), `product_coming_tags` ("Coming soon") |
| Blog cards | `blog_cards_image_ratio` |
| Color swatches | `color_swatch_trigger`, `swatch_list` |
| Compare | `enable_product_compare`, `max_products_in_compare` 2–15, `compare_show_image_border` |
| Quick view | `quick_view_type {drawer|modal}` |
| Cart | `cart_type {drawer|page}`, `cart_icon {shopping-cart|shopping-bag}`, `cart_style {default|bordered|solid}`, `cart_icon_color`, `cart_icon_background`, `free_shipping_minimum_amount`, `cart_empty_message`, `collection_list`, `collection_card_color_scheme`, `collection_image_ratio` |
| Social | `share_facebook/x/pinterest`, `social_*_link` ×9 |
| Search | `predictive_search_enabled`, `predictive_search_type_enabled`, `number_results_to_show` 3–10, `predictive_search_show_vendor/type/price`, `most_searched_keyworkds` (sic), `products_recommendations`, `search_products_column_gap/row_gap` |
| Currency | `currency_code_enabled` |

### 4.2 Badge logic
- Card: `snippets/pcard-badges.liquid`. Sold out = `product.available == false` (+ `pcard_show_badge_soldout`). Sale = selected/first variant `compare_at_price > price` (+ `pcard_show_sale_badge`, text/percent/amount per `pcard_sale_badge_type`). New / Hot / Coming = **product tags** matched (handleised) against `product_new_tags`, `product_hot_tags`, `product_coming_tags` lists; badge text = the tag itself. Loops over `product.tags` per card. Order: soldout, sale, then tags.
- Product page: `snippets/product-badges.liquid` (block `badges`): in-stock check via `inventory_quantity`/`inventory_policy`; tag badges first, then sale; sold-out replaces everything.
- Markup `.f-badge.f-badge--{sale|soldout|new|hot|coming}`, colors from `--color-badge-*`, radius `--badges-radius`. **No date-based "new" logic, no metafield-driven badges, no custom badge colors per tag.**

### 4.3 Features present / absent
| Feature | Hyper |
|---|---|
| Wishlist / favourites | **Not in Hyper** (zero matches for "wishlist" in sections, snippets, assets, settings). `icon-heart` exists only as a decorative icon option. Needs app or custom `mk-` (localStorage + metafield) implementation. |
| Reviews / star rating | **Not in Hyper** (no rating markup, no `.rating` CSS, no app hooks). Product/featured-product support `@app` blocks; card has no app-block slot. |
| Compare | Native (`compare.js/css`, `product-compare` overlay section, `compare-checkbox` in card). |
| Quick view | Native (`quick-view.js`, `sections/quick-view.liquid`, drawer or modal). |
| Cart drawer | Native (`sections/cart-drawer.liquid`: note, coupon, shipping calculator, free-shipping goal, recommendations, gift wrapping via `gift-wrapping.js`). |
| Recently viewed | Native, localStorage, `sections/recently-viewed-products.liquid`. |
| Back to top | `enable_back_to_top` → `snippets/back-to-top.liquid`. |
| Animations | `motion-element` + Motion One; `enable_scroll_animations`, `enable_image_hover_effects`, `enable_page_transition`. |
| Color swatches | Native: settings group + `snippets/swatch.liquid`, `pcard-color-swatch.liquid`, facets swatch presentation. |
| Bundles | `products-bundle`, `multiple-product-bundles`, `products-bundle-selection` sections (JS-driven multi-add; not Shopify native bundles) — relevant to Phase 5. |

### 4.4 Current merchant values (settings_data.json `current`)
| Setting | Value |
|---|---|
| `enable_rtl` / `language_support_rtl` | `true` / `"he"` |
| `type_body_font` / `type_header_font` | `instrument_sans_n5` / `instrument_sans_n7` (Shopify-hosted; **no Hebrew glyphs**; Hebrew will fall back to system fonts until we self-host the design fonts) |
| `body_font_size` / `body_font_weight_bolder` | 15 / 600 |
| `heading_scale` / `heading_mobile_scale` | 100 / 70 |
| `subheading_font` / weight / scale | body / 700 / 106 |
| `pcard_title_font` / weight / scale | heading / 600 / 100 |
| `navigation_font_weight`, `buttons_font`/weight/transform | 700; body / 700 / capitalize |
| `page_width` | **1700** (schema default 1410; Figma frame 1440) |
| `buttons_corner_radius` / `inputs_corner_radius` | round / round |
| `blocks_corner_radius` / `pcard_corner_radius` / `badges_corner_radius` | slightly / slightly / round |
| `logo` / `logo_width` / `logo_width_mobile` | set (shop_images …6d053.png) / 250 / 110 |
| `pcard_style`, `pcard_color_scheme` | standard, scheme-1 |
| `pcard_show_quickview_button` / `pcard_show_vendor` | false / false |
| `pcard_enable_color_swatches`, `pcard_show_sale_badge`, `pcard_sale_badge_type` | true, true, show_text |
| `quick_view_type`, `cart_type`, `cart_icon` | modal, drawer, shopping-bag |
| `free_shipping_minimum_amount` | "500" |
| `predictive_search_enabled` / `number_results_to_show` | true / 10 |
| `currency_code_enabled` | false |
| `color_badge_new` / `color_badge_hot` | #0d8756 / #1d349a |
| Unset (schema defaults apply) | `buttons_height` 48, animations all true, `enable_product_compare` true, `pcard_image_ratio` adapt, `pcard_show_second_img` true, `pcard_show_cart_button` true, `pcard_choose_options_actions` open_popup, `pcard_button_style` btn--white, `color_badge_sale` #C4301C, `color_badge_soldout` #ADADAD, `product_*_tags` defaults |
| Color schemes (16) | `scheme-1` bg #ffffff text #000 subtext #666 border #e5e5e5 accent #c4301c button #000/#fff secondary #ededed field #ededed sale #c4301c progress #0d8756; `scheme-inverse` black/white; `scheme-2` bg #1d349a white text; `scheme-3` #f4f691; `scheme-4` #f5e2e2; `scheme-6` #e0efe4; `scheme-7` #dbe1ff; `scheme-8` #c4301c; `scheme-9` white + yellow button; `scheme-10` #f6f6f6; `scheme-11/12/13` navy #072835 text; `scheme-14` white + #ffe093 button; `scheme-info` #f0f2ff; one UUID-named clone of scheme-1. All share `primary_accent #c4301c`. |

## 5. Sections and snippets inventory

### 5.1 Sections (`sections/`)
Header / navigation
| File | Purpose | Blocks |
|---|---|---|
| `header.liquid` | Main header, 3 layouts, sticky, search, account, cart | `hightlight_link`, `custom_link`(1), `promotion_banner`, `custom_card`, `product_list`, `sidebar` (mega-menu types keyed by `menu_title`) |
| `topbar.liquid` | Top bar (fixed/full, color scheme, padding 12) | `link_list`, `text` (+highlight pill), `social_links`, `language_country`(1) |
| `announcement-bar.liquid` | Rotating announcements (autoplay) | `announcement_bar`, `timer` |
| `breadcrumbs.liquid` | Breadcrumb bar (`container`, `text_alignment {start|center|end}`) | – |

Footer
| `footer.liquid` | Footer (layout standard/reverse, social, country/language, payment icons, bottom menu) | `menu`, `contact_information`(1), `image_text`, `newsletter`(1); max 6 |
| `mobile-sticky-bar.liquid` | Mobile bottom nav (currently disabled) | `home`, `cart`, `products`, `link` |

Home / marketing (all with presets)
| File | Purpose / blocks |
|---|---|
| `slideshow.liquid` | Hero slider; `slide`/`video` ×6; heights adapt/small/medium/large; `enable_preload_image` |
| `slideshow-with-product.liquid`, `slider-with-multicolumn.liquid`, `image-with-text-slider.liquid` | Slider variants |
| `banner-with-tabs.liquid`, `banners-with-categories.liquid`, `grid-banner.liquid`, `image-cards.liquid`, `image-with-text.liquid`, `image-with-text-overlay.liquid`, `image-with-feature.liquid`, `layered-images-with-text.liquid`, `video-hero.liquid`, `video.liquid` | Banner/image sections |
| `collection-list.liquid`, `collection-list-slider.liquid`, `collection-list-with-banner.liquid`, `collection-cards.liquid`, `collection-tabs.liquid` | Collection grids/sliders (`featured_collection` ×18 max) |
| `featured-collection.liquid` | Product grid/slider, up to 8 `collection` tabs; `limit` 2–12, `columns` 2–6 |
| `featured-products-tab.liquid`, `horizontal-products-list.liquid`, `favorite-products.liquid` | Product showcases |
| `brand-logos.liquid` | Logo grid (`logo` blocks: image + link; columns 2–10, `grid_bordered`) — a **brands index page needs more** (name, description, link to brand page) |
| `multicolumn.liquid`, `multicolumn-icon.liquid`, `buttons-with-icon.liquid`, `icon-with-text` (block) | USP / feature rows |
| `testimonials.liquid`, `testimonials-masonry.liquid`, `press.liquid` | Social proof |
| `rich-text.liquid`, `custom-content.liquid`, `custom-liquid.liquid`, `spacer.liquid`, `highlight-text-with-image.liquid`, `scrolling-promotion.liquid`, `scrolling-banner.liquid`, `scrolling-gallery-image.liquid`, `shop-the-feed.liquid`, `lookbook-banner.liquid`, `lookbook-slider.liquid`, `image-comparison.liquid` | Content / editorial |
| `newsletter.liquid`, `promotion-banner.liquid`, `countdown-timer.liquid`, `featured-countdown-timer.liquid`, `popup.liquid` (overlay), `spotlight-picks.liquid` (overlay) | Promo |
| `collapsible-tabs.liquid` | FAQ accordion (`collapsible_item`, `heading`, `image_card`) — usable for FAQ page |
| `tabs-content.liquid`, `comparison-table.liquid`, `contact-form.liquid` | Page content |
| `products-bundle.liquid`, `multiple-product-bundles.liquid`, `products-bundle-selection.liquid` | Bundle builders (Phase 5 candidates) |
| `apps.liquid` | App blocks container |

Collection
| `main-collection-banner.liquid` | Hero (image position top/right/bottom/left/as-bg, parallax) | `collection_info` |
| `main-collection-product-grid.liquid` | Grid + facets; `products_per_page` 8–36 (cur 20), `columns_desktop` 2–6 (cur 4), `columns_mobile` 1/2, `pagination {infinite|load_more|number}` (cur number), `filter_type {vertical|drawer}` (cur vertical), `enable_sorting`, `enable_layout_switching`, `enable_color_swatch`, `expand_filter_groups` | `image_card` ×3 (promo tile at position N) |
| `main-list-collections.liquid`, `main-search.liquid` | Collections index; search results (same facets) |

Product
| `main-product.liquid` | See §7 | 28 block types |
| `featured-product.liquid`, `quick-view.liquid` (overlay) | Same block set minus sticky/newsletter |
| `related-products.liquid`, `recently-viewed-products.liquid`, `quick-comparison-table.liquid`, `quick-order-list.liquid`, `product-compare.liquid`, `product-compare-bar-item.liquid`, `pickup-availability.liquid` | Product helpers |

Cart / blog / pages / customers / utilities
| `cart-drawer.liquid` (overlay), `main-cart.liquid` (`free_shipping_goal`, `subtotal`, `buttons`, `cart_note`, `cart_coupon`, `cart_shipping_rate`) | Cart |
| `main-blog.liquid` (`tags`, `heading`, `featured_post`), `main-article.liquid` (`image`, `title`, `content`, `share`, `navigation`), `featured-blog.liquid` | Blog |
| `main-page.liquid`, `main-404.liquid`, `main-password*.liquid`, `main-account/activate-account/addresses/login/order/register/reset-password.liquid` | Pages / customers |

Templates shipped: `collection.{banner-as-background,banner-left,banner-top-with-cards,banner-without-image}`, `page.{about,contact,customer-care,faq,find-a-store}`, `product.{coming-soon,flash-sale,grid-2-columns,grid-mix,horizontal-thumbnails,out-of-stock,product-image-swatch}`, `list-collections`, `search`, `password`, `gift_card.liquid`.

### 5.2 Card snippets
| Snippet | Used by | Notes |
|---|---|---|
| `card-product.liquid` (419 lines) | collection grid, search, featured-collection, predictive search, related, etc. (10 files) | Standard card: image wrapper (main + second image on hover, `motion-element` zoom), `pcard-badges`, `pcard-flash-sale`, quick-view button, quick-add / choose-options button (`product-form`), compare checkbox, info (vendor, type, `h3.product-card__title`, `price`, `pcard-color-swatch`), list-layout actions. Params: `image_sizes`, `section_index`, `index` (LCP logic), `enable_quick_add`, `enable_quick_view`, `enable_compare_checkbox`, `pcard_style`, `image_ratio`, `list_on_mobile`, `custom_class`. |
| `card-product-boxed.liquid` | favorite-products, slideshow-with-product | Boxed variant |
| `card-product-horizontal.liquid` | horizontal-products-list, cart recommendations, complementary | Image-left row |
| `card-product-list.liquid` | cart recommendations, complementary | Compact list |
| `card-product-overlay.liquid` | (unused) | Text over image |
| `card-product-with-selection.liquid`, `card-product-bundle.liquid` | bundle sections | Selectable cards |
| `card-product-placeholder.liquid` | empty states | Placeholder SVG |
| `card-collection.liquid`, `card-image.liquid`, `card-image-boxed.liquid`, `card-image-with-product.liquid`, `card-article.liquid` | collection/banner/blog cards | |

### 5.3 Facets, sort, pagination
| Piece | Evidence |
|---|---|
| Filter UI | `snippets/facets.liquid` (331 lines): `<facet-form>` with `<details>` per filter; `list/boolean` → checkbox list, or `.swatches` when `filter.presentation == 'swatch'` or label matches `color_swatch_trigger`; `price_range` → `<price-range>` dual-range slider with min/max inputs. Native Storefront filtering (Search & Discovery). Filters count via `facet-count`. |
| Placement | `filter_type: vertical` sidebar (desktop) + drawer on <1280 (`snippets/facets-drawer.liquid`, `drawer--left`), or `drawer` everywhere. Active filters: `snippets/facets-active.liquid`. |
| Sort | `snippets/facet-short.liquid`: native `<select name="sort_by">` from `results.sort_options`. |
| Layout switch | `enable_layout_switching` → grid/list icons (`layout-switcher`). |
| Pagination | `snippets/pagination.liquid`: `number` → numbered list with caret icons; `load_more` → `<button is="load-more-button">`; `infinite` → same button auto-triggered (`facets.js` `LoadMoreButton` line 470) + `scroll-pagination`. `{% paginate collection.products by products_per_page %}` (8–36). |
| Catalog safety | No loops over `collections.all`/`all_products`; `main-list-collections.liquid` iterates all collections once (paginated). `featured-collection` uses `collection.all_products_count` only for the limit. |

## 6. Header (`sections/header.liquid`, `header.js`, `snippets/desktop-menu.liquid`, `mega-menu.liquid`, `menu-drawer.liquid`, `predictive-search.liquid`)

| Capability | Finding |
|---|---|
| Layouts | `header_layout {logo-left | logo-center | logo-left-search-center}` (current: `logo-center`). Structure: `.header__top` (icons-left / logo / search / icons-right) + `.header__bottom` (`.header__navigation`, desktop only, own `navigation_color_scheme`, `navigation_content_alignment {start|center|end}`). Two-row header only; **no single-row "logo + inline nav + icons" layout**. |
| Sticky | `sticky_header {none|always|on-scroll-up}` (`is="sticky-header"`, class `header-sticky`), `enable_collapse_on_scroll` (hides nav row, adds hamburger; current true). Scrolled state adds `box-shadow: 0 4px 18px rgba(fg,.1)` on `.header__bottom` (`theme.css` 7128). |
| Separator | `show_sperator_line` (sic) between rows. |
| Menu trigger | `menu_trigger {click|hover}` (current hover). Custom elements `details-dropdown`, `details-mega`, `menu-drawer-details`. |
| Mega menu | Enabled per top-level link by adding a block whose `menu_title` equals the link title (`desktop-menu.liquid` lines 5–12). Types: `promotion_banner` (2–6 link columns + 1–5 image promos with heading/text/button, left/right, width %), `custom_card` (image+heading+text cards), `product_list` (product_list + columns), `sidebar` (grandchild links with collection images, `show_collection_image`, `image_ratio`). Links come from the Shopify menu (3 levels). Plain dropdowns otherwise (`.dropdown`). `hightlight_link` block colours/styles a top-level link (text colour, star twinkle, button, wave underline). |
| Mobile drawer | `menu_mobile` menu, nested `menu-drawer-details` (slide-in levels), custom link, account, country/language selectors, social icons. Opens from `drawer--left` (= right in RTL). |
| Topbar / USP bar | `topbar.liquid` (text/menu/social/localization blocks, positions left/center/right) and `announcement-bar.liquid` (rotating, timer). **No dedicated icon USP strip in the header group**: `multicolumn-icon` and `buttons-with-icon` are explicitly `disabled_on: groups: ["header", …]` (their schemas, lines 187 and 670), so they cannot be placed in the header group. A USP bar under the header must be an `mk-usp-bar` section (enabled on the header group) or a styled `topbar` text block. |
| Search | `snippets/predictive-search.liquid` → `<predictive-search>` (`search.js`): inline form in `.header__search` (layout-dependent), optional product-type select (`predictive_search_type_enabled`), results for products/collections/articles/pages, "most searched" keywords and recommended products when empty. Limit `number_results_to_show` (cur 10). |
| Icons | Account (`icon-account`, `customer_account_style icon-only|icon-with-text`, uses `<shopify-account>` web component), cart (`icon-cart` shopping-bag/cart, `cart_style default|bordered|solid`, bubble `cart-count`), search, hamburger, custom link with Phosphor icon or uploaded image. **No wishlist icon slot.** |
| Logo | Image or text; separate mobile logo; widths 250/110 px. |

## 7. Product page (`sections/main-product.liquid`, `snippets/product-information-blocks.liquid`, `product-media-gallery.liquid`)

| Area | Finding |
|---|---|
| Section settings | `color_scheme`, `use_color_scheme_in_container`, `enable_sticky_info` (sticky info column), `media_size {small|medium|large}`, `gallery_layout {stacked|grid-mix|columns|carousel|vertical-carousel}` (current vertical-carousel), `mobile_thumbnails {show|hide}` (current show), `show_image_border`, `enable_image_zoom` (PhotoSwipe, current true), `enable_video_looping`, padding. |
| Gallery | Swiper-based `product__media-gallery-viewer` + thumbnail Swiper (`product-thumbnail.liquid`: main image `image_url width 1946`, widths 400–1960, first media eager + `fetchpriority=high`, `data-src` for zoom). Supports video, external video, 3D (`product-model.js`, `model-viewer-ui`). |
| Blocks (28) | `@app`, `text`, `rich-text`, `title` (size h5–hd1), `price`, `meta` (vendor, type, SKU, barcode, link colour), `inventory` (threshold, qty), `variant_picker` (dropdown/button, swatch type/style/size, size chart page), `buy_buttons` (qty, dynamic checkout, gift recipient), `pickup_availability`, `description`, `custom_liquid`, `collapsible_tab` (heading, icon, richtext or page, default_open, `show_below_product_media`), `popup` (page in modal), `complementary` (Search & Discovery complementary products), `icon-with-text` (3 icons), `addons` (share, ask-a-question), `social_sharing`, `badges`, `shipping` (estimated delivery date), `timer`, `promotion_alert`, `newsletter`, `payment_info` (text + payment icons), `divider`, `sticky-atc-bar` (visibility all/desktop/mobile, standard/minimalist, qty, dynamic checkout), `grid-icon-box` (up to 8 icon+heading tiles). |
| Below-media content | Several blocks have `show_below_product_media` → rendered by `snippets/product-information-below-media.liquid` under the gallery on desktop. |
| Tabs | Only accordions (`collapsible_tab`, `accordion-details`). **No horizontal tabs block in main-product**; `tabs-content.liquid` is a separate section (currently used in product.json). |
| Related / recently viewed | `related-products.liquid` (Shopify recommendations API, grid/slider, limit 2–12), `recently-viewed-products.liquid` (localStorage), `complementary` block, `quick-comparison-table`, `cart-drawer` recommendations. |
| Variant logic | `product-info.js` (`product-info` element) fetches section HTML on variant change; `variant-change` pubsub; `product-variant-picker.liquid`/`product-variant-options.liquid`/`swatch-input.liquid`. |
| Reviews / rating | **None.** Needs an `@app` block (Judge.me etc.) or custom metafield-based `mk-` block. |
| Current product.json | 20 blocks in `main-product`, then testimonials, tabs-content, multicolumn, lookbook-banner, quick-comparison-table, image-with-text, custom-content, related-products, multicolumn-icon, scrolling-gallery-image (demo content to be replaced). |

## 8. Performance observations

| Topic | Evidence / risk |
|---|---|
| Render-blocking | `vendor.css`, `theme.css` (+`compare.css`, `rtl.css`) preloaded in head; per-section `stylesheet_tag` links inside the body are render-blocking for content below them (acceptable, but Home currently loads ~15 section stylesheets). Inline `{% style %}` from `css-variables.liquid` is large (all 16 color schemes × 3 variants = ~48 rule blocks) — **reduce the color scheme count** to shrink HTML. |
| JS | All scripts `defer`. `vendor.js` 61 KB gz is the biggest single cost (Swiper full build + Motion + polyfill + ES5 transpile). `theme.js` 22 KB gz. Page scripts: quick-view.js + compare.js load globally when enabled (compare is on by default → consider `enable_product_compare: false`). |
| Fonts | `font_face` with `font-display: swap` for body (regular/italic/bolder/bold ×2) + heading (regular/italic) + extra weights per role; preload exactly 2 woff2 files (body + heading) in `css-variables.liquid` lines 388–396. Hebrew fonts from the design must be self-hosted (Shopify font picker has few Hebrew families) → custom `@font-face` in an `mk-` snippet; keep the 2-preload rule. |
| Images | Cards: `image_tag` with `widths '70…1420'`, `sizes` computed per grid (`main-collection-product-grid.liquid` lines 31–35), `loading=lazy` except `section_index < 3 and index == 1` → eager + `fetchpriority=high`; width/height from `image_tag`; `--aspect-ratio` prevents CLS. Slideshow: first slide of first 2 sections → high priority, widths 300–3200, `sizes 100vw`, separate mobile `srcset`. Product main image: first media eager/high. **Watch:** `product-card` sets `fetchpriority=high` on the first card of up to 3 sections (3 "LCP" candidates); `enable_preload_image` exists on 12 sections. |
| Liquid loops | No `collections.all` / `all_products` iteration. `pcard-badges` loops `product.tags × 3 lists` per card (cheap). `main-list-collections` sorts all collections. Mega menu `sidebar` renders collection images per grandchild link (menu size matters). |
| Third-party | None hardcoded. `shop.metafields.foxtheme.code_head/code_body` allow merchant-injected scripts (`theme.liquid` lines 92, 110). |
| Baseline Lighthouse (mobile, sandbox) | Home 79 / Collection 77 / Product 75 perf; LCP 2.6–3.1 s; TBT 350–680 ms; CLS 0 (`docs/lighthouse/baseline/README.md`). |

## 9. Things that will fight the design

| Item | Evidence | Implication |
|---|---|---|
| Fonts | Current `instrument_sans` has no Hebrew; Shopify font picker offers limited Hebrew (Assistant, Heebo, Rubik, Noto Sans Hebrew…). | Self-host design fonts via `mk-` snippet; map `--font-body-family`/`--font-heading-family` overrides in the custom stylesheet. |
| Page width | `page_width` 1700 vs Figma 1440; `--page-padding` jumps to `max(13.5rem, …)` at ≥1536. | Set `page_width` to the design container; check ≥1536 gutter rule. |
| Sticky header shadow | `.header-sticky.header-scrolled .header__bottom { box-shadow: 0 4px 18px }` (`theme.css` 7128). | Override in custom CSS if design has no shadow. |
| Two-row header only | No layout with logo, nav and icons on one row; nav row collapses to hamburger on scroll. | If Figma `1:806` is single-row, header needs CSS re-layout (tier 2) or an `mk-header` (tier 3). |
| Dropdown/mega shadows | `.dropdown`/mega-menu use `box-shadow: 0 4px 10px rgba(0,0,0,.12)` and `0 8px 14px` (`theme.css` 3176, 3916, 4578). | Override tokens. |
| Card options | `pcard_style standard|card` (card = bg colour scheme, no border setting), image-wrapper colour scheme, hover second image/zoom, quick-add button on hover (`btn--white` default), compare checkbox. No border/shadow toggle, no rating slot, no wishlist button, no "brand" line other than vendor. | Card restyle via CSS vars (`--pcard-radius`, scheme) + possibly `mk-` partials rendered inside `card-product` via `MK-CUSTOM` edits for wishlist/rating. |
| Buttons | Classes `btn--primary` (filled, `--color-button`), `btn--secondary` (filled `--color-secondary-button` + border), `btn--outline`, `btn--underline`, `btn--plain`, `btn--link`, `btn--white`, `btn--icon`, `btn--icon-circle`, `btn--danger`, sizes `--extra-small/--small/--medium/--large`, `--square`. Height single global `--buttons-height` (48), padding 3.2rem, `text-transform` default capitalize, `line-height: 30px` hardcoded, border 1px. | Fine for primary/secondary/outline. Per-size heights need CSS overrides. |
| Badges | Single shape/radius for all (`--badges-radius`), 5 fixed types, text = tag. | Custom badge types (e.g. "Vegan", brand badges) need an `mk-` badge snippet or metafield logic. |
| Icons | Phosphor "regular" inline SVG: `snippets/icons.liquid` (30 named icons for settings), ~70 `snippets/icon-*.liquid` (stroke/fill, `size` 2xs…extra-large, `thickness`), `assets/icon-*.svg` (25, for buttons via `inline_asset_content`). | If Figma icon set differs, add `mk-icon-*.liquid` snippets following the same `size`/`thickness` API. |
| Star rating | No markup/CSS. | Build `mk-rating` or app block. |
| Animations | Scroll reveal (`motion-element`) and image hover zoom on by default; page transition overlay on. | Decide per design; disabling saves JS work (`enable_scroll_animations`, `enable_image_hover_effects`, `enable_page_transition`). |
| Input RTL | `rtl.css` forces `input[type=tel]{direction:rtl}`; no LTR isolation for prices/SKU. | Add `mk` utility (`unicode-bidi: isolate; direction:ltr`) and override tel. |
| Locale | No `he.json`; schema has English only. | Create `locales/he.json` (storefront strings) — large but required. |
| Color schemes | 16 schemes inflate inline CSS; only `primary_accent`, `button`, `secondary_button`, `border`, `subtext` etc. are tokenised — no "accent 2", "success/error", "shadow" tokens. | Trim to the design's schemes; add missing tokens as `--mk-*` vars in the custom stylesheet. |
