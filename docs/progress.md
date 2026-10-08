# Progress log

Any new session: read `CLAUDE.md`, then this file, then resume from "In progress".

## 2026-10-07 — session 1 (setup + Phase 0 start)

### Done
- Repo initialised on branch `claude/ecstatic-mccarthy-f3wp31`; `CLAUDE.md` (rules), `docs/` skeleton.
- Figma access verified. Frame map verified against canvas metadata (`docs/figma-frame-map.md`).
- Unknown frame `1:3455` / `1:12866` identified: digital course landing page.
- 17 designer annotations transcribed (`docs/figma-frame-map.md`).
- Screenshots of revision frames `18:4094`, `52:5172`, `69:5443` and header `1:806` reviewed.

### Blocked (needs merchant action)
- Environment network policy denies `mekupelet-store.myshopify.com`, `docs.foxecom.com`,
  `www.figma.com` (asset downloads). Shopify CLI is not installed and has no credentials
  (`SHOPIFY_CLI_THEME_TOKEN`). The Shopify claude.ai connector needs re-authentication.
- Therefore not yet done: `shopify theme list` (backup ID), `shopify theme pull` baseline
  commit, Hyper audit, baseline Lighthouse.

### In progress
- Phase 0 (Discovery). Figma side can continue; Hyper audit waits on theme pull.

### Open questions (for the merchant)
1. Course landing page (`1:3455`): in scope as a `page.course` template? Is the course sold
   as a digital product on Shopify or via an external link?
2. Reviews: existing/planned app, or Hyper native?
3. Wishlist: Hyper native or app?
4. Instagram feed on Home: app (needs approval) or static section with images in Files?
5. Designer annotations marked OPEN in `docs/figma-frame-map.md` (category PNGs, final hero
   image, surprise-box image, USP copy, `139:4423` reference).

## 2026-10-08 — session 2 (FIRST ACTIONS done, Phase 0 discovery)

### Done
- Theme identity resolved with the merchant: WORKING = `189111500994` (Hyper **1.5.0**, live,
  created 2026-10-07 23:37, published 23:42); BACKUP = `154698219714` (Hyper **1.4.0**, unpublished).
  Settings (`settings_data.current`, presets) and all `templates/*.json` are identical between
  them; the live theme is a clean vendor update (+7 files, 144 modified). CLAUDE.md updated.
- Store domain for the CLI is `yxmgh4-cn.myshopify.com` (merchant instruction; the Theme Access
  token is bound to it). `mekupelet-store.myshopify.com` serves the same store and is the only
  hostname this environment's network policy allows for storefront requests (used for Lighthouse).
- Shopify CLI 4.8.5 works with the new domain. Baseline pulled and committed untouched
  (`10e0398`, 468 files). `shopify theme check` on the baseline: 0 errors, 11 warnings
  (9 OrphanedSnippet, 1 ExcessiveSettingsCount, 1 LiquidComplexity).
- `shopify.theme.toml` added (store only, env `dev`; theme id must stay explicit).
- Figma: MCP quota exhausted (Starter plan, 20 calls/month). Merchant chose manual export;
  checklist written in `docs/figma/EXPORT-CHECKLIST.md` (Hebrew instructions, exact file names).
- Hyper docs read (sections list, product cards/badges/compare/quick view/mega menu/cart drawer,
  update process). Changelog page on docs.foxecom.com returns 404.
- Current theme state: `enable_rtl: true`, `language_support_rtl: he`, fonts Instrument Sans
  (n7/n5), `page_width: 1700`, `blocks_corner_radius: slightly`, cart type drawer, quick view off.
  **No Hebrew locale file** (`locales/` = en, de, es, fr, it, vi).
- Hyper audit (3 parallel read-only agents), baseline Lighthouse mobile and
  `docs/implementation-plan.md`: see below.
- Hyper audit done (architecture, commerce components, templates/locales) and folded into
  `docs/implementation-plan.md` §1. Baseline Lighthouse mobile (`docs/lighthouse/baseline.md`):
  Home 75 / Collection 72 / Product 69, CLS 0, TBT ~0.5 s. Script: `scripts/lighthouse-mobile.sh`.
- `docs/implementation-plan.md` written (audit, token map, global decisions + mobile adaptation,
  section mapping with tiers/effort, data models, asset inventory, 14 open questions).

### Blocked
- Figma values and the per-template original-vs-revision diff wait for the manual exports
  (`docs/figma/EXPORT-CHECKLIST.md`). The plan marks those parts **[needs Figma exports]**.
- Storefront requests to `yxmgh4-cn.myshopify.com` are denied by the environment network policy;
  `mekupelet-store.myshopify.com` (same store) works and is used for Lighthouse/curl.

### In progress
- Phase 0 waiting for merchant approval of `docs/implementation-plan.md` and answers to its
  open questions. No theme code before approval.

### Open questions (for the merchant)
See `docs/implementation-plan.md` §8 (Q1–Q14). Highest impact: Q5 Hebrew locale, Q6 Hebrew fonts,
Q7 origin of Hyper 1.5.0, Q13 performance toggles, Q14 custom stylesheet location, plus the
Figma exports.

## 2026-10-08 — session 2b (build started on merchant request: "approximate Home now, refine later")

### Done
- Merchant confirmed the preview screenshots are the ORIGINAL Home frames; sent Home content
  assets (48 files, catalogued and renamed in `docs/figma/exports/assets/home/`) and the Simpler Pro
  web fonts (400/600/700, Hebrew+Latin+Arabic, Hagilda license in `docs/fonts/`).
- Phase 1 foundations: `snippets/mk-fonts.liquid` + 3 woff2 in assets, `assets/mk-custom.css`
  (tokens, font routing, square card border, no nav shadow), one logged core edit in
  `layout/theme.liquid`. Settings: fonts switched to a system font (no CDN font loads), scheme-1
  button blue `#1d349a` (PROVISIONAL), `pcard_corner_radius: square`, badge tags `חדש` / `רב מכר`,
  page transition + scroll animations + compare + popup off, quick view popup → product page.
- Home (approximate): new `sections/mk-gift-finder.liquid` (+css/js) and `sections/mk-age-pills.liquid`
  (+css); `templates/index.json` rebuilt with 12 sections in the design order; footer group with
  contact block + 4 menu columns. Verified in the local preview at 1440/390 (`docs/screenshots/`),
  `shopify theme check` 0 errors. Everything is live on theme 189111500994 via `theme dev` sync.
- `docs/merchant-checklist.md`: Files upload, collections + handles, tags, filters, menus.
- `scripts/screenshot.mjs`: Playwright helper that works around the sandbox network policy.

- `locales/he.json` created (423 keys, mirrors `en.default.json`), live on the storefront (Hebrew is the
  published primary language). Note: the local `theme dev` proxy renders in English, so locale checks
  use the live URL; `scripts/screenshot.mjs` can capture both.

### In progress
- Nothing running. Next: refine from Figma 2x exports; merchant admin checklist.

### Blocked / waiting
- Figma 2x frame exports + Dev-Mode values → `docs/figma/EXPORT-CHECKLIST.md`. Until then all
  spacing/colors are provisional. Merchant admin work per `docs/merchant-checklist.md`
  (Files, collections, menus) — images and products show placeholders until done.
- Open questions Q1–Q14 in `docs/implementation-plan.md` (Q13/Q14 were decided provisionally:
  perf toggles off, custom stylesheet as a file).

## 2026-10-08 — session 2c (switch to the approved revision design)
- Merchant sent the revision Home preview (`docs/figma/exports/home-desktop-revision-preview-small.webp`)
  and confirmed it is the target. Colors sampled (PROVISIONAL): action teal `#198492`, accent orange
  `#d6713f`, footer navy `#322e7c`, newsletter cyan `#6fe3e4`, pill/ring palette (green, orange,
  yellow, purple, pink, cyan, teal), pastel badges.
- Settings: scheme-1 button teal + orange sale price; scheme-2 = navy footer; scheme-3 = cyan
  newsletter; badges pastel + percentage sale badge; cards "slightly" rounded; vendor shown.
- `templates/index.json`: 12 sections in the revision order; categories via `collection-list-slider`
  on the merchant's Hebrew-handle collections; product rows pull real products from `all` until
  best-sellers/new/sale exist; `mk-age-pills` now color-per-pill without icons/image; surprise-box
  banner with a white overlay card; feature icons in brand colors; footer on scheme-2.
- `assets/mk-custom.css` rewritten for the revision (header icons/search swap, category rings,
  tab underline, pastel badges, review cards). Verified live at 1440/390, theme check 0 errors.
- Known gaps (need exports or decisions): hero illustration, surprise-box photo, newsletter side
  patterns, colored feature icons, brand/Instagram images in Files, wishlist heart, always-visible
  "add to cart" button on the card (Hyper shows it on hover; needs a card snippet override),
  currency format `69.00 NIS` → `69 ₪` (store setting).
- Merchant feedback round 1 applied (live): finder RTL (root cause: `language_support_rtl: he` stopped
  matching and `dir="rtl"` disappeared; set the list blank so RTL applies to every language),
  categories 5 per row with visible arrows (Hyper caps the slider at 18 blocks, not 20), product card
  per sketch via CSS grid (always-visible "הוסיפו לסל" pill beside the price, vendor, 2-line title),
  age pill labels in the sketch format, brands button below the grid renamed "הצג את כל המותגים",
  new `sections/mk-feature-icons.liquid` with six flat SVG icons (`assets/mk-icon-*.svg`) in the
  sketch colors, reviews in the standard layout (image, name + date, text, stars), footer per sketch
  (bold phone, no icons, no payment icons; menu columns use `main-menu` as a stand-in until
  `footer-1..4` exist). Dev server had died once; new files were pushed with `theme push --only`.

- Round 2, token-exact refinement (live, commit "feat(home): token-exact refinement"): root cause of
  the "rules that did not apply" was the dev server dying before syncing `assets/mk-custom.css` and
  `config/settings_data.json`; pushed with `theme push --only` (remote JSON verified equal to the
  previous commit first, no editor changes lost). Fixed selectors: finder selects
  (`select.mk-gift-finder__select`), overlay heading (`.rich-text__heading` 36/400), Instagram author
  header (`.stf-card__info-link`), category arrows (outranks Hyper's `:has(...)` hover rule), card
  info order title → vendor → price (flex order), review card as a centered column (thumb, name,
  text, stars, date via `display: contents`), product sliders without the peeking 5th card
  (`content_overflow: false`), surprise-box card at the physical left (`content_position:
  middle-right` because Hyper's positions are logical). Screenshots
  `docs/screenshots/home-round2-2026-10-08-{1440,390}.jpg`. Theme check: 0 errors, 11 warnings.
- Still open on Home (need merchant input): hero illustration without baked text + surprise-box
  photo + newsletter side patterns (Figma assets, upload to Files), Instagram app decision, main
  menu + `footer-1..4` menus, social links, currency format `{{amount_no_decimals}} ₪`, product
  badges appear only once products carry the `חדש`/`רב מכר` tags, wishlist heart (no native
  wishlist in Hyper; app or skip), newsletter arrow-inside-field variant (kept Hyper's button).

- Navigation (2026-10-08, after the collections import ran in the merchant's session: 472
  collections, 154 categories / 316 brands, 26 roots): `scripts/create-menus.py` +
  `docs/import/menus.json` built `main-menu` (11 items per Figma 1:806, three levels where the
  tree has them) and `footer-1..4` (חשוב לדעת / שירות / קטגוריות / לפי גיל) with `menuUpdate` /
  `menuCreate`. Pages resolved through the Shopify connector (the app token has no pages scope).
  Header: four `promotion_banner` blocks with `menu_title` only (no promo images) turn the deep
  items into column mega menus (Hyper renders a plain dropdown otherwise); `menu_mobile` set.
  Footer blocks now point at footer-1..4. Verified live at 1440 (mega menus, dropdown, footer) and
  390 (drawer, sub-level, footer accordion): `docs/screenshots/nav-*` and `footer-menus-*`.
  Assumptions to confirm: "מתנות" → all products, "מותגים" → `/pages/brands` (page still to be
  created in Phase 4), "הדרכת הורים" → the blog (no categories yet), "חגים ומסיבה" and "מבצעים" got
  dropdowns although the design shows no chevron. Mega menu styling (14/600 headings, #6B6B6B
  links, #E0E0E0 dividers, shadow) is Phase 2 header work.

- Collection page round 1 (2026-10-08, live, Figma 69:5443 + mobile 1:7815/1:8411): template
  trimmed to breadcrumbs + banner + product grid (demo collection slider, rich text, popular
  search and marquee removed); banner on scheme-1 without image (32/40 title, 16px description);
  grid 4 columns / 24 per page / numbered pagination / vertical filters / no layout switcher;
  the demo image card kept as an empty scheme-3 block at position 11 for the merchant. CSS block 7:
  #F8F8F8 filter boxes with 16/700 headings over #E0E0E0 rules, orange item count, white bordered
  chips, plain "מיון" select, chevron breadcrumbs, mobile toolbar (filter button, count below).
  New: `snippets/mk-subcategories.liquid` ("קטגוריות נבחרות" box: children of the collection from
  `custom.children`, siblings + parent link on a leaf) injected by a logged core edit in
  `snippets/facets.liquid`; parent trail in `sections/breadcrumbs.liquid` (logged) from
  `custom.parent_handle`. `scripts/set-collection-children.py` created the `custom.children`
  (list.collection_reference) definition and filled it on the 18 parent collections (128 links).
  Locale: "{{ count }} פריטים", "ניקוי", "מיון", new key `collections.general.subcategories` in all
  7 locale files. Verified on /collections/all (toolbar, sidebar, cards) and on a leaf collection
  (breadcrumb trail); the sub-category box was verified with a temporary metafield on `frontpage`
  (removed afterwards) because the imported collections are still empty until products are tagged.
  Open: sort option names are English until the store language is Hebrew; Search & Discovery
  filters (גיל, מותג, היילייטס) are merchant setup; mobile sort lives in the filter drawer (Figma
  shows a separate dropdown); filter drawer styling and the age filter's two-column layout wait for
  real filters. Theme check 0 errors.

- Product page round 1 (2026-10-08, live, Figma 52:5172 + mobile 1:10570): template rebuilt
  (breadcrumbs, main, related, example reviews, newsletter; nine demo sections removed). Main
  blocks in the Figma order: badges, vendor, title (h3), short description (custom_liquid from
  `custom.short_description`), inventory, price, divider, variant picker (buttons + circle
  swatches), quantity + add to cart (no dynamic checkout), gift-wrap checkbox (line item
  property), free-shipping note (icon-with-text), pickup availability, accordions: תיאור פריט
  (`snippets/mk-product-description-tab.liquid`, because a rich-text setting cannot take
  product.description), משלוחים (page), and four metafield accordions via
  `{{ product.metafields.custom.* | metafield_tag }}` (hidden when empty by a logged core edit in
  `snippets/product-collapsible-tab.liquid`), collection pills (`snippets/mk-product-collections.liquid`),
  three feature boxes under the gallery (grid-icon-box, show_below_product_media). Gallery on the
  inline-end side via `flex-direction: row-reverse` (≥768). `scripts/create-product-metafields.py`
  created the five product metafield definitions. CSS block 8 (title 24/700, price 24 orange,
  55px teal button, bordered quantity, gray note pill, boxed features, accordion sizes).
  Lessons: JSON dynamic sources need `.value` or `| metafield_tag`; inline_richtext accepts
  single-line only. Verified on /products/261 at 1440 and 390 (all catalog products have one
  image and one variant, so thumbnails/swatches/compare price are unverified).
  Open: related heading overridden by a Translate & Adapt entry, currency format, reviews app,
  wishlist/share icons on the image, mobile title above the gallery (core edit, ask merchant).

- Finding (2026-10-08): shop primary locale is `en`, `he` is a published secondary locale, and the
  store holds hundreds of auto-translated Hebrew entries of Hyper's demo content
  (`translatableResources` ONLINE_STORE_THEME_JSON_TEMPLATE: 577 on product, 113 on collection).
  Outdated translations keep applying, so they override template values on the Hebrew storefront
  (related-products heading, `expand_filter_groups`, variant `size_title`, …). Fix = make Hebrew
  the primary language (merchant, Settings → Languages); alternative = `translationsRemove` for the
  theme's `he` entries. Added as the top item in docs/merchant-checklist.md.

- Merchant feedback round (2026-10-08, product + collection): the gallery-side rule had not applied
  (the wrapper is the `<product-info>` element, not a `.product-info` class); fixed with
  `product-info .product { flex-direction: row-reverse }` so the gallery sits on the left as in the
  sketch, thumbnails moved to the outer side for multi-image products. Feature boxes under the
  gallery restyled to the sketch: #F5F5F5 boxes with wine (#3B0D15) sketch icons from
  `assets/mk-icon-{shield-check,truck,credit-card}.svg` applied by CSS mask on Hyper's grid-icon-box
  (new `mk-icon-credit-card.svg`). Collection cards equal height: Hyper passed `adapt` ratio, so the
  image box is now a fixed 69% (Figma 305×210) with object-fit contain, card and wrapper 100%
  height, title reserved to two lines. Verified on /collections/all at 1440/390 and /products/261.

- Merchant feedback round 2 (2026-10-08): pulled every remote JSON first. The merchant edited
  index.json in the editor (11 brand logos with real images, category tiles with images and other
  collections, 351 keys): local index.json and product.json now start from the remote copies.
  settings_data.json on the remote still equalled the pre-token commit: the earlier settings push
  had been rejected silently (`buttons_height` 45 is not on the 2px step), so the token settings
  were never live; fixed with 46 and pushed (verified "pushed OK"). Brand logos: the merchant's
  PNGs are square, so the 80px box showed them at 56px; boxes now 100px with the logo up to 84px
  and 180px wide. Product sliders: `navigation_position: middle` on both Home rows and on related
  products plus the always-visible arrow rule extended to those sections; 2px padding so the card's
  bottom border is no longer clipped; related slider overflow hidden (no peeking card).

- Content pages migrated from the old Dawn store `mekupelet.myshopify.com` (2026-10-08; merchant
  allowed the host in the environment). Source pages were section-based Dawn templates, so each was
  rebuilt as a Hyper page template: `page.about` (image-with-text ×3, multicolumn WhatsApp,
  image-with-text-overlay course), `page.faq` (collapsible-tabs ×2 + rich-text size guide),
  `page.accessibility` (page body = the statement HTML + collapsible FAQs), `page.brands`
  (brand-logos ×2, 11 + 52 logos). 90 images copied into this store's Files with
  `scripts/migrate-files.py` (fileCreate from the old CDN URLs, same filenames; no CDN hotlinks).
  Templates generated by `scripts/build-migrated-pages.py` from the extracted content. Pages
  assigned through the Shopify connector (pageUpdate: אודות → about + title "אודות מקופלת",
  הצהרת-נגישות → accessibility + body, שאלות-ותשובות → faq, מותגים → brands; the merchant had
  created the last two). Menus updated: "מותגים" now points at the real page (main + footer-2),
  "שאלות ותשובות" added to footer-1. Not migrated: the Instagram/social strip at the end of About
  (Home has the feed). Old placeholder texts (lorem FAQ answers, "והי עובדה" principles, the
  "/collections/all" button links for WhatsApp and the course, "#" brand links) were kept as-is for
  the merchant to edit. Screenshots in `docs/screenshots/pages-*`.

- FAQ page round 2 (2026-10-08): the merchant wanted the old tab layout, so a new tier-3 section
  `sections/mk-faq-tabs.liquid` (+ `assets/mk-faq-tabs.css/.js`) renders a row of icon tab boxes
  (role=tablist, arrow keys, RTL aware) and one panel per tab; blocks are ordered: a `tab` block
  owns the `item` (accordion, Hyper's accordion-details) and `text` blocks that follow it. The
  FAQ template now uses it with the four old tabs and their icons from Files. Verified at 1440/390
  and tab switching on the live page; theme check unchanged (0 errors).

- Verifone VR360 app (2026-10-08): read the merchant's WooCommerce plugin
  (`verifone-vr360-woocommerce` 1.8.1: CreateInvoice with SKU lines, receipts, Multipass/BuyMe
  vouchers, customer lookup, credits, PDF, GetStock sync) and wrote the design for the Shopify
  equivalent in `docs/verifone-vr360-shopify-plan.md` (Remix app + worker on WEBSOL's server,
  order-details admin block, webhooks, inventorySetQuantities sync, data model, field mapping,
  security, ~19 working days). Planning only, nothing built; six open questions for the merchant
  and Verifone are listed in the plan.

## Next session runbook — collections import (merchant approved 2026-10-08)
Secrets `SHOPIFY_SHOP`, `SHOPIFY_CLIENT_ID`, `SHOPIFY_CLIENT_SECRET` were added to the environment
(Dev Dashboard app, scopes products/navigation/files) and load only in a NEW session. Decisions approved:
slug handles, update the 6 existing collections in place (do not create duplicates), skip the 7
internal WooCommerce rules, run via the script. Steps:
1. `python3 -I scripts/import-collections.py --check-access` (read-only: shop name + collection count).
2. Handle the `re-cycle-me` duplicate (rename the second to `re-cycle-me-2` or merge) and the 6
   existing collections (query by handle, use `collectionUpdate` with the plan's rules/image/metafields).
3. Pilot: `--execute --handles slug --skip-internal --limit 5` (5 brands), verify in admin.
4. Full run: `--execute --handles slug --skip-internal`; verify counts (154 categories, 316 brands)
   and images; log in `docs/import/out/result-log.json`.
5. Menus with `menuCreate`: footer-1..4 per the approved structure (pages / service / 6 top
   categories / 6 age collections) and the main menu (merchant to pick 11 of the 33 roots).
6. Product tagging is a separate step (needs a product migration file): `legacy-category-<id>` tags
   incl. ancestors + vendor normalization via `vendor_aliases`.
