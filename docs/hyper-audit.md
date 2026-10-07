# Hyper theme audit (FoxEcom Hyper 1.4.0) for mekupelet

Source: untouched theme export (the git baseline commit of this repo) (460 files; `config/settings_schema.json` reports `theme_name: Hyper`, `theme_version: 1.4.0`; `snippets/js-variables.liquid` emits `themeVersion: '1.4.0'`). Public docs checked: https://docs.foxecom.com/hyper-theme (header, collection, product, update guide, products bundle pages). Live storefront fetched 2026-10-07.

Note: `config/settings_data.json` in this copy already contains merchant values (logo, `enable_rtl: true`, `language_support_rtl: "he"`, `page_width: 1700`, `free_shipping_minimum_amount: "500"`), so it is the store's export, not the vanilla zip. Everything else matches a stock Hyper 1.4.0.

## 0. Key facts at a glance

- OS 2.0 theme, JSON templates, three section groups (`sections/header-group.json`, `footer-group.json`, `overlay-group.json`).
- Global CSS: `assets/vendor.css` (12 KB, Swiper) + `assets/theme.css` (186 KB raw / 31 KB gzip) + inline `snippets/css-variables.liquid`. Per-section CSS as separate `section-*.css` / `component-*.css` files loaded with `stylesheet_tag` at the top of each section.
- Global JS: `assets/vendor.js` (231 KB raw / 61 KB gzip: Swiper, Motion, @ungap custom-elements polyfill, `image-lazy` element) + `assets/theme.js` (99 KB / 22 KB gzip). Everything is `defer`. Per-section JS files loaded by `<script src defer>` inside the section file. Pattern: Web Components (`customElements.define`), many as customized built-ins (`is="..."`).
- RTL: supported by a theme setting (`enable_rtl` + `language_support_rtl`) that sets `dir="rtl"` on `<html>` and loads `assets/rtl.css` (99 lines). theme.css is ~95% logical properties already. The live homepage currently renders `lang="en"` with NO `dir="rtl"` and no `rtl.css`, because `language_support_rtl` is `"he"` and the published primary locale is `en`.
- No Hebrew locale file ships (`locales/`: en.default, de, es, fr, it, vi). No reviews/rating integration, no wishlist anywhere in the code.
- Product badges are tag-driven (`settings.product_new_tags`, `product_hot_tags`, `product_coming_tags`) plus price-driven sale badge and availability-driven sold-out badge.
- Collection: native `collection.filters` (Search & Discovery), sidebar or drawer, sort select, pagination `number | load_more | infinite`, 8 to 36 per page, 2 to 6 desktop columns.
- Bundles: three sections, all add to cart with a plain `POST /cart/add.js` `items[]` array (multiple lines, no line item properties, no discount applied in cart).

## 1. CSS architecture

### Load order in `layout/theme.liquid` (lines 56-70)

1. `render 'meta-tags'`
2. `render 'css-variables'` -> inline `{% style %}` block with `@font-face` rules, color-scheme variables, root tokens, base reset (`html { font-size: 62.5% }`, `body` font), plus two `<link rel="preload" as="font">` (body font and heading font only).
3. `'vendor.css' | asset_url | stylesheet_tag: preload: true`
4. `'theme.css' | asset_url | stylesheet_tag: preload: true`
5. `'compare.css' | ... preload: true` when `settings.enable_product_compare`
6. `'rtl.css' | ... preload: true` when `enable_rtl` resolved true

All four are classic `<link rel="stylesheet">` (render-blocking); `preload: true` only adds a `Link` preload header. There is no critical-CSS inlining beyond `css-variables.liquid`. No `media="print"` swap at layout level (that pattern is used once, in `sections/header.liquid` lines 1-7 for `component-custom-card.css`).

### `assets/theme.css` organization (8,354 lines, one compiled file, no source map)

Order: `@keyframes` (dotscale, text-underlined, zoom-fade, spin, fade-in, fade-in-up, scrolling-left/right and their `-rtl` twins, move-up-down, twinkle, lineDraw, waveDraw) -> layout (`.site-wrapper`, `.page-width`, `.page-width--full`, `.page-width--narrow`, `.page-width--small`, `.section--padding`, `.f-grid` and its gap modifiers) -> typography (`h1`-`h6`, `.h1`-`.h6`, `.hd1`, `.hd2`, `.text-*` utilities) -> focus rings (`*:focus-visible`, `.focused`, `.focus-inset`, `.focus-none`, `.focus-offset`, line 1113) -> base elements -> components in comment-labelled blocks (`/* Modal */`, `/* Media component */`, `/* Overlay */`, `/* Cart count */`, `/* Progress bar */`, `/* Sticky element */`, `/* Select element */`, `/* Swatches (filters + pcard) */`, `/* checkbox */`, `/* component-quantity */`, `.f-badge`, `.btn`, `.f-price`, `.product-card`, `.drawer`, Swiper fixes at line 3090, `.icon-with-text` at 4837) -> Tailwind-like utility classes written by hand (`.flex`, `.grid`, `.hidden`, `.block`, `.relative`, `.gap-*`, `.items-center`, `.justify-*`, `.w-full`, `.inset-full`, `.content-overlay`) with escaped breakpoint prefixes `.sm\:`, `.md\:`, `.lg\:`, `.xl\:`, `.xxl\:` (e.g. `.md\:hidden`, `.lg\:flex`, `.xl\:block`) -> misc section styles. There is no Tailwind runtime; it is a static file.

Grid system: `.f-grid` reads `--f-columns-mobile`, `--f-columns-md` (>=768), `--f-columns-lg` (>=1024), `--f-columns-xl` (>=1280), `--f-columns-xxl` (>=1536) and `--f-column-gap-*` / `--f-row-gap-*` (theme.css 254-295). Sections set these in a `{% style %}` block scoped to `.section-{{ section.id }}` (e.g. `sections/featured-collection.liquid` lines 48-57) or as an inline `style="--f-columns-mobile: ..."` attribute (`sections/main-collection-product-grid.liquid` line 168). Gap modifiers: `.f-grid--gap-{none|2xs|extra-small|small|medium|large|extra-large}`, `.f-grid--row-gap-{inherit|...}`.

Container: `.page-width { margin: 0 auto; padding-inline: var(--page-padding) }`; `:root { --page-padding: 1.6rem }` (mobile), `5rem` at >=1200/1280, and at large screens `--page-padding: max(13.5rem, 50vw - var(--scrollbar-width,0px)/2 - var(--page-width)/2)` (line 209), i.e. the page width is implemented as padding, not max-width. `.page-width--narrow` = `max-width: 88rem`, `.page-width--small` = `120rem`. Section vertical spacing: `.section--padding` uses `--section-padding-top/bottom` (set per section from `padding_top/padding_bottom` range settings), scaled 0.6x on mobile and clamped on tablet (lines 168-205).

### `snippets/css-variables.liquid`: every custom property it emits

Color schemes (per scheme, emitted on `:root, .color-{{ scheme.id }}`, and repeated as `body .desktop-color-{{ id }}` at >=768 and `body .mobile-color-{{ id }}` at <=767). Values are `R,G,B` triplets, consumed as `rgb(var(--color-x))` / `rgba(var(--color-x), a)` unless stated:

| Variable | Scheme setting (`color_schemes` definition id) |
|---|---|
| `--color-background` | `background` |
| `--color-secondary-background` | `secondary_background` |
| `--color-primary` | `primary_accent` |
| `--color-text-heading`, `--color-foreground`, `--color-link`, `--color-link-hover` | `text` (all four) |
| `--color-subtext`, `--color-subtext-alpha` | `subtext` (+ alpha) |
| `--color-border`, `--color-border-alpha` | `border` (+ alpha) |
| `--color-button`, `--color-button-text` | `button`, `button_label` |
| `--color-secondary-button`, `--color-secondary-button-border`, `--color-secondary-button-text` | `secondary_button`, `secondary_button_border`, `secondary_button_label` |
| `--color-button-before` (hex) | `button_hover | color_lighten: 20` (note: `button_hover` is not in the scheme definition, so this evaluates against a missing setting) |
| `--color-field`, `--color-field-alpha`, `--color-field-text` | `form_field`, `form_field_label` |
| `--color-product-price-sale` | `product_price_sale` |
| `--color-progress-bar` | `progress_bar_color` |
| `--color-foreground-lighten-60/-40/-19` (hex) | computed `background | color_mix: text, 40/60/81` |
| `--inputs-border-width`, `--inputs-search-border-width` | `1px/2px` when `form_field == background`, else `0px` |

Root tokens (`:root`, lines 251-352):

- Animation: `--animation-long`, `--animation-nav`, `--animation-default`, `--animation-fast`, `--animation-button`, `--transform-origin-start: left`, `--transform-origin-end: right` (flipped in rtl.css), `--duration-default: 200ms`, `--duration-image: 1000ms`.
- Body type: `--font-body-family`, `--font-body-style`, `--font-body-weight` (`type_body_font`), `--font-body-weight-bolder` (`body_font_weight_bolder`), `--font-body-weight-bold` (weight+200), `--font-body-size` (`body_font_size`/10 rem), `--font-body-line-height` (1.625 + (size-16)*0.025).
- Headings: `--font-heading-family/-style/-weight` (`type_header_font`), `--font-heading-letter-spacing` (`heading_letter_spacing`/100 em), `--font-heading-transform` (`heading_uppercase`), `--font-heading-scale` (`heading_scale`/100), `--font-heading-mobile-scale` (`heading_scale * heading_mobile_scale`), `--font-hd1-transform` (`display_heading_uppercase`), `--font-hd1-size` (`display_heading_size * 0.1428572` rem), `--font-hd2-size` (`display_heading_size * 0.1` rem), `--font-h1-size` = scale*4rem, `--font-h2-size` 3.2rem, `--font-h3-size` 2.8rem, `--font-h4-size` 2.2rem, `--font-h5-size` 1.8rem, `--font-h6-size` 1.6rem.
- Subheading: `--font-subheading-family` (`subheading_font` body|heading), `--font-subheading-weight` (`subheading_font_weight`), `--font-subheading-scale` (`subheading_scale`), `--font-subheading-transform` (`subheading_transform`), `--font-subheading-letter-spacing`, `--font-subheading-size`.
- Navigation: `--font-navigation-family` (`navigation_font`), `--font-navigation-weight` (`navigation_font_weight`), `--navigation-transform` (`navigation_uppercase`).
- Buttons: `--font-button-family` (`buttons_font`), `--font-button-weight` (`buttons_font_weight`), `--buttons-letter-spacing` (`buttons_letter_spacing`), `--buttons-transform` (`buttons_transform`), `--buttons-height` (`buttons_height`, default 48 -> 4.8rem), `--buttons-border-width: 1px`, `--buttons-radius` (`buttons_corner_radius`: square 0 / slightly 5 / soft-pill 10 / round 100 px).
- Inputs: `--inputs-radius`, `--textareas-radius` (`inputs_corner_radius`: 0/5/10/100 and textareas capped at 10).
- Product card type: `--font-pcard-title-family/-style/-weight/-scale/-transform/-size/-line-height` (`pcard_title_font`, `pcard_title_font_weight`, `pcard_title_scale`, `pcard_title_uppercase`), `--font-pcard-price-family/-style/-weight` (`pcard_price_font`, `pcard_price_font_weight`), `--font-pcard-badge-family/-style/-weight` (`pcard_badge_font`, `pcard_badge_font_weight`).
- Badges (hex strings, not triplets): `--color-badge-sale`, `--color-badge-sale-text`, `--color-badge-soldout`, `--color-badge-soldout-text`, `--color-badge-hot`, `--color-badge-hot-text`, `--color-badge-new`, `--color-badge-new-text`, `--color-badge-coming-soon`, `--color-badge-coming-soon-text` (settings `color_badge_*`), `--badges-radius` (`badges_corner_radius`: 0/5/40 px).
- Header/misc colors: `--color-cart-bubble` (`color_cart_bubble`, hex), `--color-keyboard-focus` (`color_key_board_focus.rgb`).
- Radii: `--blocks-radius` (`blocks_corner_radius`: 0/10/20 px), `--blocks-radius-mobile` (0.08x), `--medium-blocks-radius` (0/6/10), `--small-blocks-radius` (0/5/6), `--pcard-radius` (`pcard_corner_radius`: 0/10/20), `--pcard-inner-radius` (0/6/10).
- Layout: `--page-width` (`page_width` px), `--page-width-margin` (2rem only when page_width == 1600), `--header-padding-bottom: 3.2rem`, `--header-padding-bottom-mobile: 2.4rem`, `--header-padding-bottom-large: 6rem`, `--header-padding-bottom-large-lg: 3.2rem`.
- Defined in theme.css, not in the snippet: `--page-padding`, `--section-padding-top/-bottom(-mobile)`, `--f-columns-*`, `--f-column-gap-*`, `--swiper-navigation-size`, `--swiper-navigation-offset-x`, `--aspect-ratio`, `--media-ratio`, `--scrollbar-width`, `--checkbox-size`, `--pcard-quickview-offset`, `--logo-width`, `--logo-width-mobile`.
- There are no shadow tokens and no spacing-scale tokens; spacing is hard-coded rem values in utility classes (`.gap-1` .. `.gap-*`) and section padding ranges.

### Fonts

`css-variables.liquid` lines 90-176 emits `font_face: font_display: 'swap'` for body (regular, italic, bolder, bolder italic, bold, bold italic), heading (regular, italic), and conditionally extra weights for subheading, buttons, pcard title/price/badge and navigation when they differ. Lines 388-397 preload exactly two files: `settings.type_body_font | font_url` and `settings.type_header_font | font_url` (skipped for system fonts). Current store fonts: `instrument_sans_n5` / `instrument_sans_n7` (Shopify CDN, no Hebrew glyphs). `layout/theme.liquid` line 35-37 adds `preconnect` to `fonts.shopifycdn.com` when fonts are not system.

### Section-specific CSS

66 sections start with `{{ 'section-<name>.css' | asset_url | stylesheet_tag }}` (render-blocking where the section is in the DOM; a few use `preload: true`: slideshow, slideshow-with-product, main-product, image-with-text-slider, collection-hero, collection.css, component-product-variant-picker, component-deferred-media). 42 sections also emit a `{% style %}` block scoped to `.section-{{ section.id }}` / `#shopify-section-{{ section.id }}` with `--section-padding-*`, `--f-columns-*` and similar; 10 files emit raw `<style>`. Component CSS reused across sections: `component-volume-pricing.css` (8 users), `customer.css` (7), `component-lookbook-card.css` (5), `component-article-card.css` (4).

## 2. Breakpoints

Distinct media queries in `assets/theme.css` (count):

| Query | Count |
|---|---|
| `(max-width: 767.98px)` | 57 |
| `(min-width: 768px)` | 27 (+1 `only screen`, +1 `screen and`) |
| `(min-width: 1024px)` | 15 (+1 `only screen`, +1 `screen and`) |
| `(min-width: 1280px)` | 9 |
| `(max-width: 1023.98px)` | 7 |
| `(min-width: 1536px)` | 6 |
| `(max-width: 639.98px)` | 6 |
| `(min-width: 640px)` | 5 |
| `screen and (min-width: 750px)` | 3 (Shopify challenge/policy boilerplate) |
| `(min-width: 768px) and (max-width: 1023.98px)` | 2 |
| `(min-width: 1024px) and (max-width: 1279.98px)` | 2 |
| `(min-width: 768px) and (max-width: 1279.98px)`, `(max-width: 1279.98px)`, `(min-width: 1279.98px)`, `(min-width: 1200px)`, `(min-width: 751px)`, `(max-width: 767px)` | 1 each |
| `prefers-reduced-motion`, `hover: hover`, `pointer: fine`, `forced-colors` variants | 10 total |

Section/component CSS (`section-*.css`, `component-*.css`, `cart.css`, `collection.css`, `compare.css`, `vendor.css`) uses the same ladder: `(max-width: 767.98px)` 114, `(min-width: 768px)` 72, `(min-width: 1024px)` 30, `(min-width: 1280px)` 24, `(max-width: 1023.98px)` 15, `(min-width: 1536px)` 2, plus one broken `@media (min-width: )` in a section CSS file and one `(max-width: 365px)`. `rtl.css` uses only `(min-width: 768px)` and `(hover: hover) and (pointer: fine)`.

Hyper's named tiers (consistent between CSS utility prefixes, `.f-grid`, and `assets/theme.js` `FoxTheme.config`):

| Tier | CSS | Utility prefix | `.f-grid` var | JS (`FoxTheme.config`) |
|---|---|---|---|---|
| Mobile | `<= 767.98px` | none | `--f-columns-mobile` | `mediaQueryMobile: 'screen and (max-width: 767px)'`, `mqlMobile`, events `matchMobile`/`unmatchMobile` |
| Small (rare) | `>= 640px` | `sm:` | - | - |
| Tablet | `768 .. 1023.98` | `md:` | `--f-columns-md` | `mediaQueryTablet: '(max-width: 1023px)'`, `matchTablet` |
| Laptop | `1024 .. 1279.98` | `lg:` | `--f-columns-lg` | `mediaQueryLaptop: '(max-width: 1279px)'`, `matchLaptop` |
| Desktop | `>= 1280` | `xl:` | `--f-columns-xl` | `mediaQuerySmallDesktop: '(max-width: 1535px)'`, `matchSmallDesktop` |
| Large desktop | `>= 1536` | `xxl:` | `--f-columns-xxl` | - |

Sidebar filters show only at `xl:` (`sections/main-collection-product-grid.liquid` line 133: `hidden xl:block`); header switches to the hamburger below `lg` (`lg:hidden` on the drawer button, header.liquid line 66). `sections/header.liquid` also uses its own `@media (max-width: 1023px)` and `snippets/mega-menu.liquid` `(max-width: 1279px)`.

## 3. RTL support

### How `dir` is set

`layout/theme.liquid` lines 1-22: `enable_rtl = settings.enable_rtl`; when `settings.language_support_rtl` is not blank it is split by comma and compared with `localization.language.iso_code`; `dir="rtl"` is added to `<html>` only when the current language is in that list (or the list is blank). Then `rtl.css` is loaded. `FoxTheme.config.isRTL` (theme.js line 18) reads `document.documentElement.getAttribute('dir') === 'rtl'`. Schema labels: `settings_schema.general`: "Enable RTL", "Languages support RTL" (ISO codes, comma separated, blank = all).

Live check (2026-10-07, homepage HTML): `<html class="no-js" lang="en">`, no `dir`, no `rtl.css` link, while `settings_data.json` has `enable_rtl: true` and `language_support_rtl: "he"`. So RTL will activate only once the store's published default locale is Hebrew (`he`), or the list is emptied.

### What `assets/rtl.css` covers (99 lines, all `[dir=rtl]`)

Flips `--transform-origin-start/end`; `.flip-x` / `.rtl-flip-x` (`scaleX(-1)`; used by 9 icon snippets: `icon-slider-prev/next`, `icon-arrow-left/right`, `icon-caret-left/right`, `icon-arrow-up-right`, `icon-list-dashes`, `snippets/mega-custom-card.liquid`); switch slider thumb; checkbox/swatch check-mark rotation; `input[type=tel] { direction: rtl }`; Swiper progressbar origin; `.tooltip` translate; locale selector background position; drawer slide direction (`.drawer--left/--right .drawer__inner --translate-x`); `.product-card --pcard-quickview-offset: -15px`; `.image-with-text__badge`; scrolling promotion animation names (`scrolling-left-rtl`, `scrolling-right-rtl`); image-comparison clip-path; subscription popup teaser and spotlight drawer toggle rotation; highlight hand-drawn circle; favorite-products layout; collection card arrow; product-bundle hotspot `--factor-x`; layered images float; promotion-banner countdown.

### Logical vs physical properties

`assets/theme.css`: `margin-inline` 33, `padding-inline` 81, `inset-inline` 74, `border-inline` 11, `text-align: start` 10 / `end` 6; physical: `margin-left/right` 0, `padding-left` 0, `padding-right` 1, `border-left/right` 0, `text-align: left/right` 0, `float` 0. Remaining physical `left:`/`right:` (33/22) are almost all symmetric `left: 0; right: 0` pairs on overlays (`.inset-full`, `.content-overlay`, `.media-wrapper`, `.full-width-link`, `.bg-image`) which are direction-neutral; the asymmetric ones are `.quantity__button[name=plus]` (left auto / right 0), `.disclosure-list__right`, `.swiper-button::before left -0.1rem`, `.drawer__loading-spinner left 50%`, `.product-card__flash-sale`, `.js [data-media-loading]:after left -1.5rem`, `.bg-video video left -100%`. Section/component CSS: `padding-inline` 83, `inset-inline` 62, `margin-inline` 44, `border-inline` 28 vs `left:` 30, `right:` 9, `margin-left` 1. `.text-left` / `.text-right` utility classes exist and are used by many sections (`text-{{ alignment }}` with options `left|center|right`): these do not flip in RTL (they are physical), while header uses `start|center|end`.

### Sliders, drawers, icons, breadcrumbs

- Swiper (in `vendor.js`) auto-detects `dir="rtl"` on the container (`rtlTranslate` appears 26 times); `FoxTheme.Carousel` (theme.js 354) passes no `rtl` option, relying on detection. `assets/theme.js` 3076 (`ScrollPagination`) uses `FoxTheme.config.isRTL ? -1 : 1`; `assets/image-comparison.js` 70 handles RTL; `assets/media-gallery.js` 288 adds `rtl-flip-x` to the PhotoSwipe arrows. Other section JS files do not reference RTL.
- Drawers: `drawer--right` (8 uses: cart drawer, quick view, facets drawer, etc.) and `drawer--left` (2: menu drawer) are mirrored by rtl.css via `--translate-x`; the physical class names stay, so a "right" drawer opens from the left in RTL.
- Breadcrumbs (`sections/breadcrumbs.liquid`): separator is an empty `<span class="breadcrumbs--sep">` styled in CSS (no text glyph), so direction is handled by flex order. No icon.
- Icons: directional arrows/carets flip via `rtl-flip-x`; `icon-arrow-up-right`, `icon-list-dashes` also flip.
- Mixed-direction strings: `[dir=rtl] input[type=tel] { direction: rtl }` is the only bidi rule; prices rendered by `snippets/price.liquid` are plain text inside spans (no `dir="ltr"` or `unicode-bidi` isolation). SKU/barcode in the `meta` block likewise.
- Known gaps: `text-left/right` alignment settings; `--pcard-quickview-offset` hack instead of logical placement; header mega-menu widths (`--promotions-width`) are direction neutral but `promotion_position {left,right}` is physical; `.product-card__flash-sale` uses both left and right 1rem (neutral). No RTL handling in `header.js` positioning (it only reads `getBoundingClientRect().bottom`, so no issue found).

## 4. JS architecture

### `assets/theme.js` (99 KB, deferred, loaded after `vendor.js`)

Namespace `window.FoxTheme`:
- `FoxTheme.config`: `hasLocalStorage`, `mqlMobile/Tablet/Laptop/SmallDesktop`, the four media query strings, `motionReduced`, `isTouch`, `isRTL`. Lines 495-545 attach `matchMedia` listeners and dispatch `document` CustomEvents `matchMobile/unmatchMobile`, `matchTablet/...`, `matchLaptop/...`, `matchSmallDesktop/...`.
- `FoxTheme.DOMready(cb)`, `FoxTheme.a11y` (`getFocusableElements`, `trapFocus`, `removeTrapFocus`, `shouldAnimate`), `FoxTheme.utils` (`throttle` via rAF, `debounce(fn, wait)`, `setScrollbarWidth`, `waitForEvent`, `queryDomNodes`, `addEventDelegate`, `getSectionId(el)`, `fetchConfig(type='json', method='POST')` -> `{ method, headers: { 'Content-Type': 'application/json', Accept: 'application/<type>' } }`, `postLink`, `imageReady`, `displayedMedia`), `FoxTheme.pubsub` (`subscribe(name, cb)` returns unsubscribe, `publish(name, data)`), `FoxTheme.Carousel` (thin wrapper: `new FoxTheme.Swiper.Swiper(container, { modules: [Navigation, Pagination, A11y, ...], ...options })`), `FoxTheme.delayUntilInteraction` (runs a callback after first user interaction or 5 s), `FoxTheme.Currency.formatMoney`, `FoxTheme.MotionObserver` (IntersectionObserver manager), `HTMLUpdateUtility` (view-transition style DOM swap), `pauseAllMedia()`.
- `FoxTheme.pubsub.PUB_SUB_EVENTS`: `cartUpdate: 'cart-update'`, `quantityUpdate`, `quantityRules`, `quantityBoundries`, `variantChange: 'variant-change'`, `cartError`, `facetUpdate: 'facet-update'`, `optionValueSelectionChange`.
- Custom elements defined in theme.js: `page-transition`, `modal-component`, `basic-modal`, `drawer-component` (extends ModalComponent), `spotlight-pick`, `accordion-details` (`is=` on `<details>`), `accordion-group`, `progress-bar`, `cart-count`, `quantity-input`, `quantity-selector`, `video-element`, `localization-form`, `grid-list`, `announcement-bar`, `select-element`, `product-recently-viewed`, `motion-element`, `tabs-component`, `tab-selector`, `parallax-element`, `product-form` (`is="product-form"` on `<form>`, posts to `cart_add_url`, publishes `cartUpdate`), `newsletter-form` (`is=`), `color-swatch` (`is=` on `<ul>`), `scrolling-promotion`, `read-more`, `copy-to-clipboard` (`is=` on div), `scroll-progress-bar`, `scroll-pagination`, `masonry-layout`, `show-more`, `highlight-text`.

### Per-section JS

Each section includes `<script src="{{ 'x.js' | asset_url }}" defer="defer"></script>` at the top of its Liquid (56 distinct files; e.g. `header.js` + `search.js` from `sections/header.liquid`, `cart.js` from `cart-drawer.liquid`/`main-cart.liquid`, `facets.js` from the collection grid and search, `product-info.js` + `media-gallery.js` + `variant-selects.js` from product). Each file guards with `if (!customElements.get('name'))` and defines its elements. `layout/theme.liquid` additionally loads `quick-view.js` (when `pcard_show_quickview_button` or `pcard_choose_options_actions == 'open_popup'`), `compare.js` (when `enable_product_compare`), `theme-editor.js` in design mode, and Shopify's `shopify_common.js` on customer pages. No `script_tag` filter, no module/import maps, no inline per-section JS except `templates/gift_card.liquid`.

Custom elements per file (selection): `header.js`: `basic-header`, `sticky-header` (both `is=` on `<header>`), `details-dropdown`, `details-mega` (`is=` on `<details>`), `menu-drawer-details`, `menu-drawer`, `menu-product-list`, `menu-sidebar`, `header-account`. `search.js`: `predictive-search`. `cart.js`: `cart-drawer`, `cart-addon-modal`, `cart-items`, `cart-remove-item`, `cart-note`, `cart-discount`, `cart-discount-remove`, `calculate-shipping`, `country-province`, `shipping-calculator`, `cart-drawer-products-recommendation`, `main-cart`, `free-shipping-goal`. `facets.js`: `facet-short`, `price-range`, `facet-form`, `facet-remove`, `facet-count`, `facet-toggler`, `load-more-button` (`is=` on button), `layout-switcher`. `footer.js`: `footer-details`. Bundles: `products-bundle`, `product-bundle-variant-selector`, `products-bundle-slider`, `products-bundle-hotspot`.

### `assets/vendor.js` (231 KB; minified, no version strings)

Contains: Swiper (modules exposed as `FoxTheme.Swiper = { Swiper, Navigation, Pagination, Autoplay, A11y, ... }`; the theme.css comment at line 3090 says the Swiper 8 variable fix is kept, so it is an 8.x-era build), Motion (`FoxTheme.Motion = { animate, inView, timeline, stagger, scroll }`; used 22+ times in theme.js), `@ungap/custom-elements` polyfill by Andrea Giammarchi (two `/*! (c) Andrea Giammarchi */` banners; enables `is="..."` built-ins in Safari), and the `image-lazy` customized built-in (`customElements.define("image-lazy", ..., { extends: "img" })`) that toggles `loading`/`loaded`/`error` classes on the image wrapper and re-sets `src` after bfcache `pageshow`. PhotoSwipe is a separate asset (`assets/photoswipe.js`, 91 KB, `PhotoSwipeLightbox`), loaded only by product/quick view when `enable_image_zoom`. No jQuery, no lazysizes, no range-slider lib (price filter uses two native `input[type=range]`, `facets.js` line 70).

### `snippets/js-variables.liquid`

Inline `<script>` in `<head>`: replaces `no-js` with `js`; sets `window.shopUrl`, `FoxTheme.routes` (`cart_add_url`, `cart_change_url`, `cart_update_url`, `cart_url`, `shop_url`, `predictive_search_url`, `root_url`), `FoxTheme.settings` (`cartType`, `moneyFormat`, `themeName`, `themeVersion`, `enableAnimations`), `FoxTheme.compare`, and translated string bags `shippingCalculatorStrings`, `variantStrings`, `cartStrings`, `quickOrderListStrings`, `accessibilityStrings`.

## 5. Sections inventory and template usage

96 files in `sections/` (93 Liquid + 3 group JSON). Names from `en.default.schema.json`:

| File | Name | Blocks |
|---|---|---|
| announcement-bar | Announcement bar (header group) | announcement_bar, timer |
| apps | Apps | @app |
| banner-with-tabs | Banner with tabs | tab |
| banners-with-categories | Banners with categories | banner-card, heading, category, button |
| brand-logos | Brand logos | logo |
| breadcrumbs | Breadcrumbs (limit 1, not on index) | - |
| buttons-with-icon | Button group | button_item |
| cart-drawer | Cart drawer (overlay group) | - |
| collapsible-tabs | Collapsible tabs | collapsible_item, heading, image_card |
| collection-cards | Collection cards | collection |
| collection-list-slider | Collection list slider | featured_collection |
| collection-list-with-banner | Collection list banner | image_card, featured_collection |
| collection-list | Collection list | featured_collection |
| collection-tabs | Collection tabs | collection |
| comparison-table | Comparison table | heading, content |
| contact-form | Contact form | custom_field, sidebar |
| countdown-timer | Countdown timer | heading, subheading, text, button, timer, image |
| custom-content | Custom content | image_card, video, image, text, lookbook_card, image_card_with_product, lookbook_card_hotspot, collections |
| custom-liquid | Custom Liquid | - |
| favorite-products | Favorite products (merchant-curated showcase with testimonials, not a wishlist) | product |
| featured-blog | Featured blogs | - |
| featured-collection | Featured collection | collection (max 8, tabbed when >1) |
| featured-countdown-timer | Featured countdown timer | countdown-timer, image-card |
| featured-product | Featured product | same blocks as main-product (no sticky bar) |
| featured-products-tab | Featured products tab | tab |
| footer | Footer (footer group, max 6 blocks) | menu, contact_information, image_text, newsletter |
| grid-banner | Grid banner | banner-card |
| header | Header (header group) | hightlight_link, custom_link, promotion_banner, custom_card, product_list, sidebar |
| highlight-text-with-image | Highlight text with image | image |
| horizontal-products-list | Horizontal products list | - |
| image-cards | Image cards | image_card |
| image-comparison | Before/after image slider | image, text |
| image-with-feature | Image with feature | column |
| image-with-text-overlay | Image with text overlay | subheading, heading, text, button |
| image-with-text-slider | Image with text slider | image-slide |
| image-with-text | Image with text | subheading, empty_space, heading, text, icon_with_text, button, badge |
| layered-images-with-text | Layered images with text | image |
| lookbook-banner | Banner with hotspots | hotspot |
| lookbook-slider | Lookbook slider | lookbook_card |
| main-404, main-account, main-activate-account, main-addresses, main-login, main-order, main-register, main-reset-password, main-password(-header/-footer) | Customer / system templates | - |
| main-article | Blog post | @app, image, title, content, share, navigation |
| main-blog | Blog posts | tags, heading, featured_post |
| main-cart | Main cart | @app, free_shipping_goal, subtotal, buttons, cart_note, cart_coupon, cart_shipping_rate |
| main-collection-banner | Collection banner | collection_info |
| main-collection-product-grid | Product grid | image_card (max 3) |
| main-list-collections | Collections list page | - |
| main-page | Page | - |
| main-product | Product information | 27 block types (see section 11) |
| main-search | Search results | - |
| mobile-sticky-bar | Mobile navigation bar (footer group) | home, cart, products, link |
| multicolumn-icon | Multicolumn with icon | column |
| multicolumn | Multicolumn | column |
| multiple-product-bundles | Multiple product bundles | product_bundles, image_card |
| newsletter | Email signup | image |
| pickup-availability | (no schema, rendered via Section Rendering API) | - |
| popup | Popup (overlay group) | image, heading, text, form, code, button, socials |
| press | Press | press |
| product-compare-bar-item | (no schema, helper) | - |
| product-compare | Product compare (overlay) | info, description, price, vendor, type, variants |
| products-bundle-selection | Products bundle selection | collection (max 8) |
| products-bundle | Products bundle | product |
| promotion-banner | Promotion banner | subheading, heading, text, button, code, timer, group_heading |
| quick-comparison-table | Quick comparison table (product only) | info, description, price, vendor, type, variants |
| quick-order-list | Quick order list (product only, limit 1) | - |
| quick-view | Quick view (overlay) | main-product blocks minus timer/newsletter/sticky bar |
| recently-viewed-products | Recently viewed products (limit 1) | - |
| related-products | Related products (limit 1; product, cart) | - |
| rich-text | Rich text | subheading, heading, text, button, empty_space |
| scrolling-banner | Scrolling banner | slide, video |
| scrolling-gallery-image | Scrolling gallery images | gallery |
| scrolling-promotion | Scrolling promotion | text, image |
| shop-the-feed | Shop the feed | feed |
| slider-with-multicolumn | Slider with multicolumn | slide, image-card |
| slideshow-with-product | Slideshow with product | slide, video |
| slideshow | Slideshow | slide, video |
| spacer | Spacer | - |
| spotlight-picks | Spotlight picks (overlay side drawer with discount code) | item, discount |
| tabs-content | Tabs content | tab, image_with_text, sidebar |
| testimonials-masonry | Testimonials masonry | testimonial |
| testimonials | Testimonials | testimonial |
| topbar | Top bar (header group) | link_list, text, social_links, language_country |
| video-hero | Video hero | subheading, heading, text, button |
| video | Video | - |

Templates (sections in order, demo content):

- `sections/header-group.json`: `topbar[text]`, `header`. `footer-group.json`: `multicolumn-icon[4 column]`, `footer[newsletter, menu x3]`, `mobile-sticky-bar` (disabled). `overlay-group.json`: `cart-drawer`, `product-compare`, `quick-view`, `popup`, `spotlight-picks`.
- `index.json`: collection-list-slider, slideshow, featured-collection (2 tabs), promotion-banner, custom-content (image_card_with_product x4), collection-list, collection-tabs, favorite-products, lookbook-slider, custom-content, buttons-with-icon, featured-collection, image-with-text, testimonials, slider-with-multicolumn, scrolling-promotion, buttons-with-icon, multicolumn, scrolling-gallery-image. (The live homepage currently renders only one template section, a `featured_collection`, so the merchant has already trimmed it.)
- `collection.json`: breadcrumbs, main-collection-banner, collection-list-slider, main-collection-product-grid[image_card], rich-text, buttons-with-icon, scrolling-promotion. Variants: `collection.banner-as-background`, `collection.banner-left`, `collection.banner-top-with-cards` (adds custom-content image cards above grid), `collection.banner-without-image`.
- `product.json`: breadcrumbs, main-product[badges, title, meta, price, icon-with-text, inventory, description, variant_picker, buy_buttons, icon-with-text, pickup_availability, promotion_alert, complementary, collapsible_tab x3, payment_info, divider, social_sharing, sticky-atc-bar], testimonials, tabs-content, multicolumn, lookbook-banner, quick-comparison-table, image-with-text, custom-content, related-products, multicolumn-icon, scrolling-gallery-image. Variants: `product.coming-soon` (no buy_buttons, has newsletter), `product.flash-sale` (adds timer), `product.grid-2-columns`, `product.grid-mix`, `product.horizontal-thumbnails`, `product.out-of-stock`, `product.product-image-swatch`.
- `page.about.json`: breadcrumbs, main-page (disabled), image-with-text-overlay, rich-text, image-with-text, buttons-with-icon, multicolumn, testimonials, scrolling-promotion, image-with-text, multicolumn, collapsible-tabs, scrolling-promotion.
- `page.faq.json`: breadcrumbs, main-page (disabled), multicolumn-icon (5 columns), collapsible-tabs x3 (each with a `heading` block and 3-4 `collapsible_item`), scrolling-promotion.
- `list-collections.json`: breadcrumbs, main-list-collections (disabled), collection-list (18 blocks), collection-list (8), custom-content, featured-collection, rich-text, buttons-with-icon, image-with-text-overlay.
- `blog.json`: breadcrumbs, main-blog[featured_post, heading, tags], scrolling-promotion. `article.json`: breadcrumbs, main-article[title, content, share, navigation], scrolling-promotion.
- `cart.json`: breadcrumbs, main-cart[free_shipping_goal, cart_note, cart_shipping_rate, subtotal, buttons], recently-viewed-products, scrolling-promotion. `search.json`: main-search. `404.json`: main-404. `page.json`: main-page. `page.contact.json`, `page.customer-care.json` (tabs-content), `page.find-a-store.json` (image-with-text x3), `password.json`. `templates/customers/*.json` each one `main-*` section. `gift_card.liquid` is a standalone Liquid template (see section 12).

## 6. Product card

Variants: `snippets/card-product.liquid` (default grid, 417 lines), `card-product-boxed.liquid` (bordered "card" style), `card-product-list.liquid` (list layout used by `layout-switcher`), `card-product-horizontal.liquid` (small horizontal rows: mega-menu product list, cart recommendations), `card-product-overlay.liquid` (showcase image/video from `product.metafields.foxtheme.showcase_image/showcase_video`), `card-product-with-selection.liquid` (bundle selection), `card-product-bundle.liquid` (bundle with variant selector), `card-product-placeholder.liquid`.

`card-product.liquid` structure: `.product-card.product-card-style-{standard|card}` > `.product-card__wrapper` > `.product-card__image-wrapper` (link, `<motion-element data-motion="zoom-out-sm">`, main image `.product-card__image--main` with `style="--aspect-ratio"`, optional second image `.product-card__image--second inset-full hidden md:block` for hover (desktop only, `settings.pcard_show_second_img`), badges, flash-sale ticker, quick view button `.product-card__quickview`, quick add `.product-card__actions` with `<form is="product-form">` or a "Choose options" button opening the quick view, optional `<compare-checkbox>`), then `.product-card__info.text-{{ settings.pcard_content_alignment }}` (vendor, type, `h3.product-card__title.text-pcard-title` with `text-limit-{1-line|2-lines|3-lines}`, `render 'price'`, `render 'pcard-color-swatch'`), then `.product-card__list-actions` (list view buttons). Image: `image_url: width: featured_media.width | image_tag: loading, fetchpriority, widths: '70, 140, 165, 355, 450, 535, 710, 900, 1070, 1420', sizes: image_sizes (default '450px'), is: 'image-lazy'`; the first card of sections with `section_index < 3` gets `loading: eager, fetchpriority: high`. Quick view: `snippets/quick-view-modal.liquid` renders a `<quick-view-modal>` per card (drawer or modal per `settings.quick_view_type`) and `quick-view.js` fetches the product URL and swaps in `sections/quick-view.liquid` content.

Badges (`snippets/pcard-badges.liquid`): sold out when `product.available == false` and `settings.pcard_show_badge_soldout`; sale when `selected_or_first_available_variant.compare_at_price > price` and `settings.pcard_show_sale_badge`, text per `settings.pcard_sale_badge_type` (`show_text` -> "Sale", `show_percentage` -> "-NN%", `show_amount` -> "Save X"); then for each `product.tags`, compared (handleized) against the newline-separated lists `settings.product_new_tags`, `product_hot_tags`, `product_coming_tags` -> `<span class="f-badge f-badge--{new|hot|coming}">{{ tag }}</span>` (the badge text is the tag itself). No date-based "new", no metafield, no bestseller logic. Product page badges (`snippets/product-badges.liquid`, block `badges`) use the same tag lists but compute stock from `inventory_quantity`/`inventory_policy`, with `block.settings.show_sale_badge`, `sale_badge_type {text|percentage|fixed_amount}`, `show_soldout_badge`. Colors: `settings.color_badge_sale/_text`, `color_badge_soldout/_text`, `color_badge_hot/_text`, `color_badge_new/_text`, `color_badge_coming_soon/_text` -> `--color-badge-*`; shape `badges_corner_radius`; font `pcard_badge_font`, `pcard_badge_font_weight`. `.f-badge` font-size is `calc(var(--font-body-size) * 0.8)` (theme.css 2985). Flash sale ticker (`snippets/pcard-flash-sale.liquid`) reads `product.metafields.foxtheme.flash_sale_text` (list) when `settings.pcard_show_flash_sale`.

Swatches (`snippets/pcard-color-swatch.liquid`): option is treated as color when its name is in `settings.color_swatch_trigger` (comma list, handles "colour"); one `<ul is="color-swatch">` per color option, up to `settings.pcard_maximum_swatches_to_show`, shape `pcard_swatch_shape {circle|square}`, source `pcard_swatches_type {color_swatch|variant_image}` (uses `value.swatch` from Shopify option swatches, else `settings.swatch_list` name:color mapping or `<value>.png` asset), with "+N" link. Clicking swaps the card image to the variant image (`ColorSwatch` in theme.js 2718).

Price (`snippets/price.liquid`): `.f-price` with `.f-price__regular`, `.f-price__sale` (`.f-price-item--sale` + `<s>` compare-at), `.f-price__unit-wrapper`, modifiers `f-price--on-sale`, `f-price--sold-out`, `f-price--{alignment}`; "From" via `products.product.price.from_price_html`; volume pricing range; `settings.currency_code_enabled` switches to `money_with_currency`.

Rating/reviews: none. `grep` for `reviews`, `rating`, `judge`, `loox`, `yotpo`, `spr-badge` over Liquid/JS/locales finds nothing; the only metafields read by the theme are `foxtheme.*` (see section 16) and `breadcrumb.primary_collection`. Reviews would come from an app block in `main-product` (`@app`) or a custom snippet.

Wishlist: none. `sections/favorite-products.liquid` + `assets/favorite-products.js` is a merchant-curated showcase section (products + testimonials sliders), not a customer wishlist; there is no heart button on the card and `icon-heart` is only used as a decorative option. Recently viewed uses `localStorage['hypertheme:recently-viewed']` (`assets/recently-viewed-products.js` line 52) and fetches `/search?q=id:...&section_id=`.

Theme settings that control the card (`settings_schema.json` group `product_cards`): `pcard_style {standard|card}`, `pcard_content_alignment {left|center|right}`, `pcard_title_line_limit {none|1-line|2-lines|3-lines}`, `pcard_color_scheme`, `pcard_image_ratio {adapt|1/1|3/4|4/3}`, `pcard_show_second_img`, `pcard_show_vendor`, `pcard_show_type`, `pcard_show_price`, `pcard_show_badge_soldout`, `pcard_list_style {standard|card}`, `pcard_overlay_color_scheme`, `pcard_show_cart_button`, `pcard_choose_options_actions {open_popup|product_page}`, `pcard_button_style {btn--primary|btn--secondary|btn--white}`, `pcard_show_quickview_button`, `quickview_button_style`, `pcard_show_flash_sale`, `pcard_flash_sale_color_scheme`, `pcard_show_sale_badge`, `pcard_sale_badge_type`, `pcard_enable_color_swatches`, `pcard_maximum_swatches_to_show`, `pcard_swatch_shape`, `pcard_swatches_type`, `pcard_mobile_hide_quick_add`; typography group: `pcard_title_scale`, `pcard_title_font`, `pcard_title_font_weight`, `pcard_title_uppercase`, `pcard_price_font`, `pcard_price_font_weight`, `pcard_badge_font`, `pcard_badge_font_weight`; layout group: `pcard_corner_radius`, `badges_corner_radius`; badges group: `product_new_tags`, `product_hot_tags`, `product_coming_tags`; `color_swatches` group: `color_swatch_trigger`, `swatch_list`. Note `card-product.liquid` line 19 reads `settings.pcard_show_color_swatch`, which does not exist in the schema (dead code).

## 7. Header

`sections/header.liquid` (3,104 lines, mostly schema). Element `<header is="sticky-header" data-sticky-type data-collapse-on-scroll>` or `is="basic-header"`. Two rows: `.header__top` (hamburger below `lg`, logo as `h1` on index, `.header__search` with `render 'predictive-search'`, account via `<header-account><shopify-account menu=...>` (customer accounts), cart icon with `<cart-count>`), and `.header__bottom` with the desktop menu (`snippets/desktop-menu.liquid`), its own `navigation_color_scheme`, `navigation_content_alignment {start|center|end}` and padding.

Settings: `container {full|fixed}`, `color_scheme`, `menu`, `menu_mobile`, `header_layout {logo-left|logo-center|logo-left-search-center}`, `menu_trigger {click|hover}`, `sticky_header {none|always|on-scroll-up}`, `enable_collapse_on_scroll` (hides the nav row and shows a toggle button after scrolling; `StickyHeader` in header.js line 76), `show_sperator_line`, `customer_account_style {icon-only|icon-with-text}`, `customer_account_menu`, mobile: `show_social_media_icons`, `enable_language_selector`, `enable_country_selector`; paddings `header_top_padding_top/bottom`, `navigation_padding_top/bottom`. Logo from theme settings `logo`, `logo_width`, `logo_mobile`, `logo_width_mobile` (rendered with 1x/2x `srcset`, `loading="eager"`, explicit width/height).

Mega menu: blocks are matched to a top-level menu link by handleized title (`snippets/desktop-menu.liquid` lines 7-25: `block.settings.menu_title | handle == link.title | handle`). Block types: `hightlight_link` (style a link: `text_color|star_twinkle|button|wave_underline`), `custom_link` (one icon link in the top row), `promotion_banner` (menu columns + up to 5 promo image cards with heading/subheading/description/button, `promotion_position {left|right}`, `promotions_width`, `promotion_columns`), `custom_card` (up to 5 simple image+heading cards), `product_list` (heading + `product_list` picker, columns, progress bar), `sidebar` (child links as columns with optional collection images: `show_collection_image`, `show_image_of_first_product`, `image_ratio`; image source order: `collection.featured_image` -> `collection.metafields.foxtheme.collection_megamenu_image` -> first product image). Dropdowns are `<details is="details-mega">` / `<details is="details-dropdown">` with `trigger="click|hover"`. Mobile drawer (`snippets/menu-drawer.liquid` + `menu-drawer-details.liquid`, `<menu-drawer>` drawer--left) reuses the same blocks (promo images, product list, sidebar images) as nested `<details>`, adds account link, social icons, localization selectors.

Search: `snippets/predictive-search.liquid` renders `<predictive-search data-results-limit="{{ settings.number_results_to_show }}">` with a `<form action="/search">` (`options[prefix]=last`, optional `type=product` when `predictive_search_type_enabled`), an empty-state panel with `settings.products_recommendations` (product list) and `settings.most_searched_keyworkds` (comma list), and results for `predictive_search.resources.{queries,products,collections,articles,pages}`. `assets/search.js` fetches `routes.predictive_search_url?q=&resources[limit]=&resources[limit_scope]=each&section_id=<header section>` and injects the returned section HTML. Settings group `search_input`: `predictive_search_enabled`, `predictive_search_type_enabled`, `number_results_to_show`, `predictive_search_show_vendor/_type/_price`, `most_searched_keyworkds`, `products_recommendations`, `search_products_column_gap`, `search_products_row_gap`.

Top bar (`sections/topbar.liquid`, header group): blocks `link_list` (menu, position), `text` (textarea + highlighted text styled `button|text-color`, position), `social_links` (per-network checkboxes), `language_country` (limit 1). Settings `container`, `color_scheme`, `show_separator_line`, `padding_top/bottom`. Announcement bar (`sections/announcement-bar.liquid`, header group, `<announcement-bar>` slider): blocks `announcement_bar` (inline_richtext + link) and `timer` (evergreen/fixed countdown with button), `autoplay`, `autoplay_speed`, `content_width`. USP strips would be `multicolumn-icon` or `topbar` text blocks; there is no dedicated USP bar section.

## 8. Footer

`sections/footer.liquid` (footer group, `max_blocks: 6`): blocks `menu` (heading, `menu`, `block_width`, `open_default`, `show_divider`; collapsible on mobile via `<footer-details>`), `contact_information` (limit 1: `address`, `working_hours` (single text line, rendered as `<span>{{ working_hours }}</span>` at line 135; no per-day structure), `email`, `phone`), `image_text` (image/overlay layouts, text, button, own color scheme), `newsletter` (limit 1: heading, description, terms richtext, `form_width`, `button_style`, `button_icon`, `order_first`). Section settings: `container`, `color_scheme`, `enable_follow_on_shop`, `show_social` + `social_button_style {btn--primary|btn--secondary|btn--icon}`, `enable_country_selector`, `enable_language_selector`, `payment_enable` (loops `shop.enabled_payment_types | payment_type_svg_tag`), `footer_layout {standard|reverse}`, `footer_bottom_menu`, `show_sperator_line`, divider and padding. Newsletter form: `snippets/newsletter-form.liquid` -> `{% form 'customer', is: 'newsletter-form' %}` with `contact[tags]=newsletter`. Social links come from theme settings `social_*_link` (`snippets/social-icons.liquid`: facebook, instagram, youtube, tiktok, twitter, snapchat, pinterest, tumblr, vimeo). `sections/footer-group.json` also carries `multicolumn-icon` above the footer and a disabled `mobile-sticky-bar` (home/cart/products/link tabs).

## 9. Cart drawer

`sections/cart-drawer.liquid` (`<cart-drawer class="drawer drawer--right">`, overlay group; `settings.cart_type {drawer|page}`): header with `<cart-count>`, optional `cart_message` strip (own color scheme), `<cart-items>` list with `<quantity-input>`, `<cart-remove-item>`, `<volume-pricing>`; empty state with `settings.cart_empty_message` and `settings.collection_list` cards (`card-collection`, image overridable by `collection.metafields.foxtheme.collection_in_cart`); footer with gift wrapping, `<cart-note>` (`show_cart_note`), `<calculate-shipping>`/`<shipping-calculator>`/`<country-province>` (`show_shipping_rates_calculator`), `<cart-discount>` coupon field (`show_cart_coupon`; applies codes by `POST cart_update_url` with `discount` = comma-joined codes, cart.js 440-480), subtotal, checkout. Free shipping: `render 'free-shipping-goal'` -> `<free-shipping-goal data-config="{{ settings.free_shipping_minimum_amount }}">` with `<progress-bar>`; config accepts per-currency map `"USD:100,ILS:500"` or a plain number (snippet header comment). Recommendations: `snippets/cart-drawer-products-recommendation.liquid` -> `<cart-drawer-products-recommendation data-url="{{ routes.product_recommendations_url }}?section_id&product_id&limit&intent=complementary">`, or the manual `cart_recommendations_products` list; layout `grid|horizontal-list`, heading, color scheme, limit 1-10. Gift wrap: enabled when a menu with handle `gift-wrapping` exists whose first link is a product (`linklists['gift-wrapping']`, line 14); `<gift-wrapping>` toggles the cart attribute `gift-wrapping` and adds/removes the product variant via `cart_update_url` (`assets/gift-wrapping.js`). FoxKit app hooks are present as empty divs (`foxkit-cart-countdown-hook`, `foxkit-cart-goal-hook`, `<foxkit-incart-upsell>`), inert without the app.

Update flow (`assets/cart.js`): `CartItems.updateQuantity` collects section ids by dispatching `cart:grouped-sections` on `documentElement` (each cart UI pushes its section id into `detail.sections`), then `fetch(cart_change_url, { line, quantity, sections })` (Section Rendering API bundle), then `FoxTheme.pubsub.publish(cartUpdate, { cart })`; `CartDrawer` listens and replaces `#CartDrawer-{{ section.id }}` body/footer/empty nodes from `parsedState.sections`, fires `document` event `cart:updated`. Opening the drawer with a stale state fetches `${root_url}?section_id=${sectionId}` (cart.js 46). `ProductForm` (theme.js 2506) posts `cart_add_url` with `sections` and `sections_url`, then publishes `cartUpdate`; when `cart_type == 'page'` it redirects. Notes go to `cart_update_url` with `{ note }`.

## 10. Collection page

`sections/main-collection-product-grid.liquid` (loads `facets.js`, `collection.css`): native storefront filtering (`collection.filters`, `filter.type` `list|boolean|price_range`, `filter.presentation == 'swatch'`, `filter_value.image` for visual filters, `filter_value.count`). Layout per `filter_type {vertical|drawer}`: vertical = left sidebar visible at `xl:` (`hidden xl:block`) with a `<button is="facet-toggler">` to collapse it; below `xl` and in drawer mode the filters open in `snippets/facets-drawer.liquid` (`drawer--right`). No horizontal filter bar. `expand_filter_groups` (comma list of group names opened by default). Active filters chips: `snippets/facets-active.liquid` (`<facet-remove>`). Price range: `<price-range>` with two native range inputs plus min/max fields. Sort: `<select is="facet-short" name="sort_by">` built from `results.sort_options` (`snippets/facet-short.liquid`) when `enable_sorting`. Layout switcher: `<layout-switcher>` grid/list toggles (`enable_layout_switching`), list view renders `card-product-list` with `settings.pcard_list_style`. AJAX: `facet-form` builds the URL, fetches with `section_id`, swaps `#ProductsList`/count (`facets.js` `renderProductGridContainer`), `history.replaceState`; publishes `facetUpdate`. Pagination: `{% paginate collection.products by products_to_display %}` (products_per_page minus promo blocks) and `snippets/pagination.liquid` with `type`: `number` (numbered links), `load_more` (`<button is="load-more-button" type="load_more">`), `infinite` (same element, auto-clicked when it scrolls into view via `FoxTheme.Motion.inView(this, ..., { margin: '200px 0px 200px 0px' })`, facets.js 479). Settings: `container`, `color_scheme`, `products_per_page` 8-36 (default 20), `columns_desktop` 2-6 (default 4; laptop = min(4, desktop), tablet 3, `columns_mobile {1|2}`), `column_gap`, `row_gap`, `pagination {infinite|load_more|number}`, `enable_filtering`, `enable_color_swatch`, `filter_type`, `expand_filter_groups`, `enable_sorting`, `enable_layout_switching`, padding, divider; blocks `image_card` (max 3 promo cards injected in the grid at `image_position`). `sizes` for card images is computed per column count (lines 31-39). `sections/main-collection-banner.liquid` adds title/description with image positions `top|right|bottom|left|as-bg`, parallax, and reads `collection.metafields.foxtheme.collection_banner(_mobile)`. `main-search.liquid` reuses the same facet/grid settings.

## 11. Product page

`sections/main-product.liquid` settings: `color_scheme`, `use_color_scheme_in_container`, `enable_sticky_info` (sticky info column), `media_size {small|medium|large}`, `gallery_layout {stacked|grid-mix|columns|carousel|vertical-carousel}`, `mobile_thumbnails {show|hide}`, `show_image_border`, `enable_image_zoom` (PhotoSwipe; loads `photoswipe.js` + `photoswipe-component.css` only then), `enable_video_looping`, padding. Gallery: `snippets/product-media-gallery.liquid` -> `<media-gallery>` using Swiper (`assets/media-gallery.js`), thumbnails `snippets/product-thumbnail.liquid`, 3D via `product-model.js`, `component-deferred-media.css`. Variant picker: `snippets/product-variant-picker.liquid` -> `<variant-selects>` (`assets/variant-selects.js`), block `variant_picker` settings `picker_type {dropdown|button}`, `swatch_type {color_swatch|variant_image}`, `swatch_style {standard|circle|square}`, `swatch_size`, `button_style`, `size_title`, `size_chart_from_page` (also `product.metafields.foxtheme.size_chart`). Variant changes re-render via `product-info.js` (Section Rendering API with `option_values`).

Block types (`snippets/product-information-blocks.liquid` `case block.type`): `@app`, `text`, `rich-text`, `title`, `price`, `meta` (vendor/type/SKU/barcode), `inventory` (threshold + count), `variant_picker`, `buy_buttons` (`show_quantity_selector`, `show_dynamic_checkout`, `show_gift_card_recipient`), `pickup_availability`, `description`, `custom_liquid`, `collapsible_tab` (heading, icon, richtext or `page`, `default_open`, `show_below_product_media`), `popup` (button opening a page in a modal), `complementary` (Shopify complementary recommendations, `product_list_limit`, `layout {grid|horizontal-list}`, `make_collapsible_row`, `enable_quick_add`), `icon-with-text` (3 icon/image + text items), `addons` (`show_share`, `show_ask_question` -> `snippets/ask-question-form.liquid`), `social_sharing`, `badges`, `shipping` (estimated delivery text with `deliver_days`, `date_format`), `timer`, `promotion_alert`, `newsletter`, `payment_info` (text + `show_payment_icons`), `divider`, `sticky-atc-bar` (limit 1: `visibility {all|desktop|mobile|hide}`, `style {standard|minimalist}`, `container`, `show_atc_button`, `show_dynamic_checkout_buttons`, `show_quantity`; `snippets/sticky-atc-bar.liquid` -> `<sticky-atc-bar>` or `<sticky-atc-bar-minimalist>`), `grid-icon-box` (up to 8 icon + heading cells). Several blocks have `show_below_product_media` to render under the gallery via `snippets/product-information-below-media.liquid`.

Related: `sections/related-products.liquid` -> `<product-recommendations data-url="{{ routes.product_recommendations_url }}?section_id&product_id&limit">` (limit 2-12, columns 2-6, slider, progress bar). Recently viewed: `sections/recently-viewed-products.liquid` (localStorage key above). Also `quick-comparison-table` and `quick-order-list` (B2B style) sections limited to product templates.

## 12. Existing templates that match our needs

- FAQ: `templates/page.faq.json` = `collapsible-tabs` sections (`container {fixed|narrow}`, `header_layout {vertical|standing-column}` = heading beside the accordion, `item_style {standard|card}`, `item_color_scheme`, `item_heading_font/size`, `item_icon_size`; blocks `collapsible_item` with `heading`, `content` richtext, `custom_liquid`, `page`, `open`, `use_subtext_color`, `icon`). Accordion is `<details is="accordion-details">` (theme.js 945). Content is section blocks, not a metaobject; no search, no schema.org FAQPage markup.
- About: `templates/page.about.json` composes `image-with-text-overlay`, `rich-text`, `image-with-text` (blocks subheading/heading/text/icon_with_text/button/badge), `multicolumn`, `testimonials`, `collapsible-tabs`, `scrolling-promotion`.
- Brands index: `templates/list-collections.json` disables `main-list-collections` and uses hand-picked `collection-list` blocks. `sections/main-list-collections.liquid` (auto, all collections, `sort {alphabetical|...|products_high|products_low}`, `collections_per_page` 12-30, `columns_desktop` 2-10, card style/ratio/width) is the paginated candidate. `sections/brand-logos.liquid` (block `logo`: image + link) is the logo-strip candidate. There is no vendor-based index (`product.vendor` / `url_for_vendor` only appear on the card).
- Blog/article: `main-blog` (post_limit 2-12, columns 1-4, card options, blocks tags/heading/featured_post), `main-article` (image, title, content, share, navigation blocks; related posts; comments), `featured-blog` section for home. Article cards in `snippets/card-article.liquid` with `settings.blog_cards_image_ratio`, `blog_card_style`, `blog_card_color_scheme`.
- Gift card: `templates/gift_card.liquid` is a full standalone HTML document (renders `css-variables`, `theme.css`, `giftcard.css`, `vendor/qrcode.js` from Shopify), shows balance, expiry, QR, code, Apple Wallet pass, print button; it does not read `settings.enable_rtl` (no `dir` attribute), so it needs its own RTL handling.
- Contact: `page.contact.json` with `contact-form` (custom fields + sidebar block). Customer care: `tabs-content`. Store locator: `page.find-a-store.json` is just `image-with-text` blocks.

## 13. Bundles

- `sections/products-bundle.liquid` (+ `products-bundle.js`, `section-products-bundle.css`): one hero image with optional hotspots (`show_hotspot`, per-block `horizontal_position`/`vertical_position` and mobile equivalents) and 2-4 columns of fixed products (block `product`), each `snippets/card-product-bundle.liquid` with a `<product-bundle-variant-selector>` (fetches `products/<handle>?section_id&option_values` to update variant/media). "Add all to cart" posts `{ items: [{ id, quantity }] }` to `FoxTheme.routes.cart_add_url` (products-bundle.js 19-51) and then refreshes the cart via `cart_url` + section fetch. No discount, no `properties`, no bundle grouping; each product becomes its own cart line. Docs confirm ("customers can pick the variant ... Add all to cart").
- `sections/products-bundle-selection.liquid` (+ `products-bundle-selection.js`): "build your own" from up to 8 collection tabs (block `collection`), a bundle bar with `discount_max_items` 2-12, `prevent_duplicate_products`, `discount_tiers` 1-3 with `discount_tier_min_items_N`, `discount_tier_percent_N`, `discount_tier_label_N`. The tier labels/percent are display-only; the add action again posts `items[]` to `/cart/add` (products-bundle-selection.js 98-123). The discount itself must be created separately in Shopify (automatic discount or Shopify Functions); the section does not apply or verify it.
- `sections/multiple-product-bundles.liquid` (+ `multiple-product-bundles.js`): several `product_bundles` blocks each with a `product_list`; every group is rendered as a `<products-bundle>` element containing `<products-bundle-slider>` and `<product-bundle-variant-selector>` cards plus an "Add all to cart" button (lines 214-310), so it reuses `products-bundle.js` and the same `items[]` POST. `multiple-product-bundles.js` only handles the outer slider.
- Cart side: none of the three writes `properties` or `_bundle_id`, so the cart drawer cannot group bundle lines or enforce "all or nothing". No cart transform / Shopify Bundles app integration exists in the code (no `bundle` cart line fields are read).

## 14. Settings schema groups (config/settings_schema.json)

- `general`: `enable_rtl`, `language_support_rtl`, `enable_back_to_top`.
- `logo`: `logo`, `logo_width`, `logo_mobile`, `logo_width_mobile`, `favicon`.
- `colors`: `color_schemes` (color_scheme_group; definition ids `primary_accent`, `border`, `text`, `subtext`, `background`, `secondary_background`, `button`, `button_label`, `secondary_button`, `secondary_button_border`, `secondary_button_label`, `form_field`, `form_field_label`, `product_price_sale`, `progress_bar_color`; 16 schemes defined in settings_data: `scheme-1`, `scheme-inverse`, `scheme-info`, `scheme-2`..`scheme-4`, `scheme-6`..`scheme-14`, one UUID scheme), badges `color_badge_sale`, `color_badge_sale_text`, `color_badge_hot`, `color_badge_hot_text`, `color_badge_new`, `color_badge_new_text`, `color_badge_soldout`, `color_badge_soldout_text`, `color_badge_coming_soon`, `color_badge_coming_soon_text`, header `color_cart_bubble`, `color_key_board_focus`, `overlay_color_scheme`.
- `typography`: `type_body_font`, `body_font_weight_bolder`, `body_font_size`, `type_header_font`, `heading_scale`, `heading_mobile_scale`, `heading_letter_spacing`, `heading_uppercase`, `display_heading_size`, `display_heading_uppercase`, `subheading_scale`, `subheading_font`, `subheading_font_weight`, `subheading_letter_spacing`, `subheading_transform`, `pcard_title_scale`, `pcard_title_font`, `pcard_title_font_weight`, `pcard_title_uppercase`, `pcard_price_font`, `pcard_price_font_weight`, `pcard_badge_font`, `pcard_badge_font_weight`, `navigation_font`, `navigation_font_weight`, `navigation_uppercase`, `buttons_font`, `buttons_font_weight`, `buttons_letter_spacing`, `buttons_transform`.
- `layout`: `page_width`, `buttons_corner_radius {square|slightly|soft-pill|round}`, `inputs_corner_radius`, `blocks_corner_radius {square|slightly|round}`, `pcard_corner_radius`, `badges_corner_radius`.
- `animations`: `enable_page_transition`, `enable_scroll_animations`, `enable_image_hover_effects`.
- `buttons`: `buttons_height`.
- `product_cards`: listed in section 6. `product_badges`: `product_new_tags`, `product_hot_tags`, `product_coming_tags`. `blog_cards`: `blog_cards_image_ratio`. `color_swatches`: `color_swatch_trigger`, `swatch_list`. `product_compare`: `enable_product_compare`, `max_products_in_compare`, `compare_show_image_border`. `quick_view`: `quick_view_type {drawer|modal}`.
- `cart`: `cart_type {drawer|page}`, `cart_icon {shopping-cart|shopping-bag}`, `cart_style {default|bordered|solid}`, `cart_icon_color`, `cart_icon_background`, `free_shipping_minimum_amount`, `cart_empty_message`, `collection_list`, `collection_card_color_scheme`, `collection_image_ratio`.
- `social-media`: `share_facebook`, `share_x`, `share_pinterest`, `social_facebook_link`, `social_instagram_link`, `social_youtube_link`, `social_tiktok_link`, `social_twitter_link`, `social_snapchat_link`, `social_pinterest_link`, `social_tumblr_link`, `social_vimeo_link`.
- `search_input`: listed in section 7. `currency_format`: `currency_code_enabled`.
- Current merchant values worth knowing: `page_width: 1700`, `body_font_size: 15`, `heading_scale: 100`, `heading_mobile_scale: 70`, `buttons_corner_radius: round`, `inputs_corner_radius: round`, `blocks_corner_radius: slightly`, `pcard_corner_radius: slightly`, `badges_corner_radius: round`, `pcard_style: standard`, `pcard_title_font: heading`, `pcard_show_quickview_button: false`, `quick_view_type: modal`, `cart_type: drawer`, `free_shipping_minimum_amount: "500"`, `color_badge_new: #0d8756`, `color_badge_hot: #1d349a`, `scheme-1` primary accent `#c4301c`.

## 15. Performance observations

- Render-blocking in `<head>`: inline `css-variables` style block (plus up to ~12 `@font-face` rules), `vendor.css`, `theme.css`, `compare.css` (compare is on: the live page links `compare.css`), `rtl.css` once RTL is active, then `content_for_header`. Every section's `stylesheet_tag` is also a blocking `<link>` wherever it sits in the body (`section-main-product.css` 21 KB, `collection.css` 7 KB, `cart.css` 6 KB). Live homepage loads 25 stylesheets and 31 scripts (22 theme JS files + Shopify). All scripts are `defer`; nothing is async or inline except `js-variables` and the small `Shopify.designMode` check.
- Byte totals: all CSS in `assets/` 401 KB raw; all JS 792 KB raw (vendor.js 231 KB / 61 KB gzip, theme.js 99 KB / 22 KB gzip, theme.css 186 KB / 31 KB gzip, photoswipe.js 91 KB, cart.js 33 KB, header.js 28 KB, facets.js 20 KB). `component-country-flag.css` is 17 KB (flag sprite data URIs) and loads with the localization selectors.
- Images: cards use `image_tag` with `widths: '70, 140, 165, 355, 450, 535, 710, 900, 1070, 1420'` plus the native width, `sizes` computed per column count, `loading="lazy"` (69 Liquid occurrences) and `fetchpriority="low"` by default; `loading: eager` / `fetchpriority: high` is given to the first card when `section_index < 3`, to slideshow slide 1 when `section.index < 2`, to `image-with-text-overlay` when `section.index == 1`, and to `products-bundle` images when `section.index <= 2`; blocks offer `enable_preload_image` (slideshow, image-cards, image-with-text-overlay). Wrapper `style="--aspect-ratio: ..."` reserves space (zero CLS). The `is="image-lazy"` element only toggles classes; it does not defer loading. Risk: several sections independently decide "eager" by index, so a page can have more than one `fetchpriority="high"` image (the live homepage has exactly one).
- Inline styles: 42 sections emit a `{% style %}` block (scoped by section id), 10 emit raw `<style>`; the live homepage carries 29 `<style>` blocks. `style="--aspect-ratio"` / `--f-columns-*` attributes are used widely (up to 8 per section file).
- Fonts: `font-display: swap`, two preloads, Shopify CDN. Switching to self-hosted Hebrew woff2 means replacing `font_face` output (theme settings only allow Shopify font library picks) with `@font-face` in a custom stylesheet and overriding `--font-body-family` / `--font-heading-family`.
- Liquid cost hotspots: `snippets/pcard-badges.liquid` loops `product.tags` x 3 tag lists per card; `pcard-color-swatch.liquid` loops `product.variants` per color option; `mega-menu.liquid` / `menu-drawer-details.liquid` may call `collections[handle].all_products.first` per grandchild link when `show_image_of_first_product` is on (avoid with 4,000 products); each card renders a `quick-view-modal` wrapper when quick view/popup options are enabled; `favorite-products`, `collection-list` with 18 blocks render many images.
- Motion: `enable_scroll_animations` wraps most content in `<motion-element>` (Motion library, IntersectionObserver). `enable_page_transition` adds a fade overlay. Both are theme-settings toggles.

## 16. Localization

- `locales/`: `en.default.json` + `en.default.schema.json`, and `de`, `es`, `fr`, `it`, `vi` (each with `.schema.json`). No `he.json`. Each storefront file has 421 leaf strings in groups `general`, `newsletter`, `accessibility`, `blogs`, `onboarding`, `products`, `collections`, `templates`, `sections`, `localization`, `customer`, `gift_cards`, `recipient`. Schema files have ~1,475 strings (`general`, `settings_schema`, `sections`); all section/setting labels are `t:` keys, so the editor UI is translatable.
- Storefront strings are all pulled with `| t` (no hardcoded English found in card/cart/header snippets); several are passed to JS via `js-variables.liquid` (variant, cart, quick-order, a11y strings) and `data-*` attributes. Merchant-facing demo copy (headings, descriptions, FAQ answers, testimonial text, button labels) lives in JSON template/section settings, not in locales, so it must be replaced per section.
- Metafields the theme reads (namespace `foxtheme` unless noted): `shop.metafields.foxtheme.code_head`, `code_body` (layout head/body injection), `product.metafields.foxtheme.flash_sale_text` (list), `showcase_image`, `showcase_video`, `showcase_title` (overlay cards, featured-products-tab), `size_chart`, `collection.metafields.foxtheme.collection_megamenu_image`, `collection_in_cart`, `collection_banner`, `collection_banner_mobile`, and `product.metafields.breadcrumb.primary_collection` (breadcrumbs). No metaobjects are referenced.
- Money: `shop.money_format` or `money_with_currency_format` via `settings.currency_code_enabled`; JS formatting in `FoxTheme.Currency.formatMoney` with `FoxTheme.settings.moneyFormat`.

## 17. Risks and recommendations for custom work

1. Make RTL actually active before any styling work: set the store's primary language to Hebrew in Shopify admin (or clear `language_support_rtl`), confirm `<html dir="rtl">` and `rtl.css` in the live HTML. Until then every RTL check is meaningless. Also note `templates/gift_card.liquid` ignores the RTL setting and will need a `dir="rtl"` edit (a core-file edit, log it).
2. Single custom stylesheet: add `assets/mk-custom.css` and load it from `layout/theme.liquid` right after the `rtl.css` line inside the same `{%- liquid -%}` block (`echo 'mk-custom.css' | asset_url | stylesheet_tag`), wrapped in `MK-CUSTOM start/end` comments. Loading it last guarantees it wins the cascade over `theme.css` and `rtl.css` without `!important`. Put Hebrew `@font-face` (self-hosted woff2, `font-display: swap`) in this file and override `--font-body-family` / `--font-heading-family` / `--font-navigation-family` / `--font-button-family` / `--font-pcard-*-family` / `--font-subheading-family` on `:root`; add at most two `<link rel="preload" as="font">` next to the existing ones (css-variables.liquid 388-397 preloads Instrument Sans; those preloads should be removed or the fonts set to a system font in settings to avoid loading unused files).
3. Override tokens, not selectors, wherever possible: colors through the `color_schemes` editor (one scheme per Figma surface), radii through `*_corner_radius` settings (only 3-4 fixed steps; anything else needs `--buttons-radius`, `--blocks-radius`, `--pcard-radius`, `--badges-radius` overrides in mk-custom.css), type scale through `heading_scale`, `body_font_size`, `pcard_title_scale`, plus `--font-h1-size`..`--font-h6-size` overrides for exact Figma values. Badges: tag lists + `color_badge_*`; a "bestseller" badge is covered by the "hot" badge (tag listed in `product_hot_tags`; the tag text is the label), so no code is needed for it.
4. Section conventions to copy for `mk-` sections: `{{ 'mk-x.css' | asset_url | stylesheet_tag }}` + `<script src="{{ 'mk-x.js' | asset_url }}" defer="defer"></script>` at the top; `{% style %}.section-{{ section.id }} { --section-padding-top: ...px; --section-padding-bottom: ...px; --f-columns-mobile/md/lg/xl: ... }{% endstyle %}`; wrapper `<div class="section section-{{ section.id }} section--padding color-{{ section.settings.color_scheme }}"><div class="section__container page-width page-width--{{ section.settings.container }}">`; headings via `render 'section-heading', section_settings: section.settings`; grids via `.f-grid f-grid--gap-{{ column_gap }}`; images via `image_url | image_tag: widths, sizes, loading, is: 'image-lazy'` inside `.media-wrapper` with `style="--aspect-ratio"`; animation via `<motion-element data-motion="fade-up">`; JS as `if (!customElements.get('mk-x')) customElements.define('mk-x', class extends HTMLElement {...})` using `FoxTheme.utils`, `FoxTheme.pubsub`, `FoxTheme.Carousel`. Schema: `"enabled_on": {"groups": ["header","footer","custom.overlay"]}` style disabling, `t:` labels are optional for custom sections (plain English labels are fine), presets required, use the standard `general.padding` ranges (0-100 step 2, default 50).
5. Use CSS logical properties and `text-align: start/end`; avoid Hyper's `text-left/right` and `justify-{left|right}` setting values in RTL-sensitive places; prefer the header's `start|center|end` pattern. Audit `drawer--right` naming (cart/quick view will open from the left in RTL by design) against the Figma.
6. Core-file edits that look unavoidable (all to be wrapped in `MK-CUSTOM` and logged): `layout/theme.liquid` (custom stylesheet, Hebrew font preloads), `templates/gift_card.liquid` (RTL + fonts), possibly `snippets/pcard-badges.liquid` / `product-badges.liquid` (bestseller or date-based badge), `snippets/price.liquid` (bidi isolation of ILS prices if Hebrew/number ordering is wrong: wrap amounts in `<span dir="ltr">`), `snippets/card-product.liquid` if the Figma card adds a wishlist/rating slot (otherwise prefer a theme setting-driven `mk-card-product` snippet and switch the `render 'card-product'` calls only in our own sections). Avoid editing `sections/header.liquid` (3,104 lines, high update churn); use its blocks and CSS overrides instead.
7. Performance guardrails: keep `enable_product_compare` off unless required (saves `compare.css` + `compare.js` on every page), consider `enable_scroll_animations: false` for Lighthouse mobile, never enable `show_image_of_first_product` in mega menu blocks with this catalog, keep `products_per_page` at 20-24 with `pagination: load_more` or `number`, and watch for multiple `fetchpriority="high"` images on Home. Any new mk- section CSS must stay small and be the only stylesheet that section loads.
8. Data models not provided by Hyper (need metaobjects/metafields plus `mk-` sections): brands (name, logo, description, collection link), FAQ (if it must be searchable or shared across pages), legal pages (plain `page.json` suffices), opening hours (footer `working_hours` is a single text field), reviews/ratings (none), wishlist (none). Bundles: Hyper's sections are UI only; inventory/pricing/discount enforcement needs a separate decision (Shopify Bundles / cart transform / automatic discount) before Phase 5.
9. Hyper update path (docs: "code customizations are not transferred automatically"): keep all mk- files and the CUSTOMIZATIONS.md list so a new theme version can be re-patched by copying `assets/mk-*`, `sections/mk-*`, `snippets/mk-*`, `locales/he*.json`, JSON templates and re-applying the few MK-CUSTOM blocks.
10. Hebrew locale: create `locales/he.json` (421 keys, copy from `en.default.json`) and optionally `he.schema.json`; set the store default language to Hebrew. JS-facing strings come from `js-variables.liquid` automatically once the locale exists.

## Appendix A. Reusable Hyper classes and element APIs (for mk- code)

- Buttons: `.btn` + `.btn--primary | --secondary | --outline | --white | --plain | --underline | --link | --icon | --icon-circle | --inherit | --danger | --small | --medium | --large | --extra-small | --square | --loading`; label wrapper `<span class="btn__text">`; spinner via `render 'loading-spinner'`; icon buttons via `snippets/button-icon.liquid`; `snippets/button.liquid` renders a button from `label/link/style/icon` settings (icon list `none, caret-right, caret-left, arrow-right, arrow-left, close, home, search, hamburger, pencil, plus, cart, account, sign-in, chat, download, upload, heart, play-outline, pause, stop, speaker, setting`).
- Typography: `h1`-`h6` / `.h1`-`.h6`, `.hd1`, `.hd2`; `.text-sm-extra`, `.text-sm`, `.text-base`, `.text-lg`, `.text-body`, `.text-subtext`, `.text-subheading`, `.text-pcard-title`, `.text-limit-1-line` .. `.text-limit-5-lines`, `.font-body`, `.font-body-bold`, `.font-body-bolder`, `.font-heading`, `.font-navigation`, `.text-upper`, `.text-nowrap`, `.text-center/left/right` (physical). `.rich-text`, `.rich-text--tight`, `.rich-text__subheading` for section headers (`snippets/section-heading.liquid`, `.section__header`, `.s__header`).
- Layout: `.page-width`, `.page-width--fixed|--full|--narrow|--small`, `.section`, `.section--padding`, `.section__container`, `.f-grid` (+ `--f-columns-*`, `.f-grid--gap-*`, `.f-grid--row-gap-*`), `.f-column` and `.swipe-mobile` / `.swipe-mobile__inner` (horizontal scroll on mobile; both are styled in section/component CSS files such as `collection.css`, `cart.css`, `section-main-product.css`, not in theme.css), `.v-scrollable`, utilities `.flex .grid .hidden .block .inline-flex .relative .absolute .inset-full .items-center .justify-between .gap-1..` plus `sm:|md:|lg:|xl:|xxl:` prefixed variants.
- Media: `.media-wrapper` with `style="--aspect-ratio: W/H"` (absolute child), `.media`, `.media--adapt`, `.blocks-radius`, `.blocks-radius-md`, `.blocks-radius-sm`, `.theme-radius` (no overflow clip), `.hover-wrapper` + `.hover-scale-up` (image hover zoom, gated by `enable_image_hover_effects`; `.hover-scale-up` is defined in `component-card-img-with-product.css`, so check the file is loaded before relying on it), `<motion-element data-motion="fade-up|zoom-out-sm|..." data-motion-delay="50">`, `<video-element>`, `snippets/video.liquid`, `render 'icons'` / `icon-*.liquid` snippets with `size: '2xs|extra-small|small|medium|large'`.
- Color: wrap any element in `.color-{{ scheme_id }}` to switch the full variable set; `.desktop-color-*` / `.mobile-color-*` for per-breakpoint schemes; `.color-inherit` on cards sharing the parent background.
- Overlays: `<modal-component id="X" class="modal" hidden>`, `<drawer-component id="X" class="drawer drawer--right" hidden>` or subclasses; any element with `aria-controls="X"` toggles it (`ModalComponent` queries `[aria-controls="${this.id}"]`, theme.js 660), `open` attribute reflects state, Escape closes, focus is trapped with `FoxTheme.a11y.trapFocus`, `<body>` gets `modal-showing` then `modal-show` classes while any modal is open (theme.js 641-645); `.fixed-overlay` backdrop, `.drawer__inner`, `.drawer__header-title`, `.drawer__close-btn`, `.drawer__body`, `.drawer__footer`. Events: `modal:handleAfterShow`, `modal:handleAfterHide`, `toggle`.
- Accordion: `<details is="accordion-details" class="accordion-details">` + `<summary class="accordion-details__summary">` + `.accordion-details__content`; `<accordion-group>` for exclusive opening.
- Forms: `.form-control`, `.form-control--select`, `.select`, `.switch-slider`, `.swatches` / `.swatch-item` / `.swatch-color`; newsletter via `render 'newsletter-form', form_id`.
- Cart integration from custom code: submit a `<form is="product-form" data-type="add-to-cart-form">` or call `fetch(FoxTheme.routes.cart_add_url, { ...FoxTheme.utils.fetchConfig('javascript'), body })` then `FoxTheme.pubsub.publish(FoxTheme.pubsub.PUB_SUB_EVENTS.cartUpdate, { cart })`; listen to `document` `cart:updated` or subscribe to `cartUpdate`.
- Responsive JS: subscribe to `document` events `matchMobile/unmatchMobile`, `matchTablet/unmatchTablet`, `matchLaptop/unmatchLaptop`; read `FoxTheme.config.mqlMobile` etc.; sliders through `new FoxTheme.Carousel(el, options, [FoxTheme.Swiper.Autoplay]).init()`.

## Appendix B. Docs findings (docs.foxecom.com/hyper-theme, fetched 2026-10-07)

- Update guide: "Any code customizations in your current theme are not transferred automatically to a new theme version. You'll need to manually duplicate and move custom code." Recommended procedure: duplicate theme as backup, add the new version from the Theme Store, copy edited `templates/*.json` and `config/settings_data.json`, re-create custom templates, re-install app embeds. This confirms the project rule of keeping all custom code in prefixed files plus a short list of core edits.
- Header page: layouts "Logo left", "Logo center", "Logo left, search center"; sticky "Always" or "On scroll up"; "Enable collapse on scrolling" minimises the header; mobile toggles for social icons, language and country selectors; mega menu is documented on a separate "Mega menu" page (blocks matched by menu title, as in the code).
- Products bundle page: "Customers can choose variants before adding the bundle to the cart", "Add all to cart button at the bottom", hotspots highlight (desktop) or scroll to (mobile) the product card; no mention of bundle pricing, inventory grouping or discounts, consistent with the `items[]` POST found in `products-bundle.js`.
- Collection/product pages in the docs are one-paragraph pointers to the template selector; detailed settings live on the "Collection template" / "Product template" sub-pages (not fetched).
