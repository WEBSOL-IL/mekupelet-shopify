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
  Same day: the merchant answered all six (Verifone endpoint is a public IP, BuyMe via its Shopify
  app, Tranzila, auto-issue + auto-credit yes, location Nir Zvi, SKUs 555/973) and sent a screenshot
  of the live WooCommerce settings; plan §9 now holds the decisions, §9a the default settings to
  ship with, §9b what is still needed before testing (HTTPS/whitelist + test numerator at Verifone,
  one test order each from BuyMe and Tranzila). Still planning only.

- VR360 app, phase 0 (2026-10-08): merchant said "start building from phase 0". Scaffolded
  `apps/verifone-vr360/` from Shopify's official React Router template (React 19, Polaris web
  components, Prisma on PostgreSQL, BullMQ on Redis, docker-compose web/worker/postgres/redis).
  Done: Prisma schema + initial migration (Session, ShopSettings, Document, RequestLog, SyncRun,
  SkuCache); settings schema with the WooCommerce values as defaults and AES-256-GCM encryption of
  the VR360 password; SOAP client ported 1:1 (envelope, element order, extractTag, error hints
  315/408/421/431-434/452, PDF operation fallbacks, masked RequestLog); WSDL inspector; settings
  page with all plugin sections + Shopify location / gateway mapping / auto credit / alerts, and the
  three diagnostics (connection, WSDL, existing document); documents / stock / request-log pages;
  webhooks (orders/paid, orders/cancelled, refunds/create, products/update, compliance) that only
  enqueue; `/sync/today|month?token=` trigger URLs; worker with repeatable schedules reconciled
  from settings and log pruning. Job processors are stubs until phases 1–5. Verified locally:
  27 unit tests, typecheck, lint, build, migration against a local Postgres, worker schedules +
  trigger route end to end (SyncRun rows written). Not done (needs a Dev Dashboard login): creating
  the app / `client_id`, deploy, install on the store (README "First-time setup").

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

## Next session runbook — VR360 app (phase 1)
Per the merchant (2026-10-11): theme work continues in the existing session, the VR360 app
continues in a NEW session. Starting point for that session:
1. Code: `apps/verifone-vr360/` (README.md has setup, phase table and first-time Dev Dashboard
   steps). Design: `docs/verifone-vr360-shopify-plan.md` (§5 field mapping, §9a defaults).
2. Phase 1 = invoice builder: port `class-wc-vr360-invoice-builder.php` (the plugin zip is in
   the uploads of session 49395edf…; re-upload if missing) into `app/vr360/invoice-builder.ts`
   with recorded-order JSON fixtures under `tests/fixtures/` and the customer resolver
   (`GetCustomer ByEmail` → `CreateOrUpdateCustomer` → default customer). Then wire
   `app/jobs/documents.server.ts` (`issue-invoice`) to it, with the advisory lock + Document row.
3. Local checks: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`; a local
   Postgres + Redis were used for the smoke test (`service postgresql start`, `redis-server --daemonize yes`).
4. Still needed from the merchant: Dev Dashboard app (`npm run config:link`) or client_id/secret
   as env secrets, server domain, Verifone whitelist/HTTPS + test numerator, one test order each
   from Tranzila and BuyMe.

- Mobile header search (2026-10-11): merchant wants the search bar hidden on mobile behind an icon
  next to the menu button (like the reference screenshots). Hyper has no such option (3 header
  layouts, no mobile-search setting), but it has a `search-open` body state with its own close
  button and overlay, so the build is small: logged core edit in `sections/header.liquid`
  (`mk-search-toggle` button after the hamburger + deferred `assets/mk-header-search.js`), and
  `mk-custom.css` block 10 (`.header__search` hidden below 1024px until `body.search-open`, full
  width when open). Verified live at 390 (closed / open / closed via X, input focused, aria-expanded
  synced) and 1440 (unchanged); screenshots in `docs/screenshots/header-search/`. Pulled the
  merchant's editor version of `sections/header-group.json` (adds a disabled custom-liquid section)
  before touching the header. Theme check: 13 pre-existing Hyper warnings, 0 errors.

- Instagram heading (2026-10-11): the merchant added Instafeed to Home (Hyper "Apps" section, app
  block title "mekupelet_toys") and wants an Instagram icon before the heading with the whole
  heading linking to the profile. Hyper's Apps section has no heading and Instafeed renders its
  title client-side, so a tier-3 section `sections/mk-instagram.liquid` (heading + link + icon,
  size/tag/alignment, `@app` blocks) now wraps the same Instafeed block; the block's own title is
  emptied. `templates/index.json` rebased on the merchant's editor version (age-pill labels, gift
  finder order) with the Apps section swapped for `mk_instagram` at the same position. CSS block 11.
  Verified live at 390/1440: link, target=_blank, icon at the start (RTL right). The feed script
  host (cdn.nfcube.com) is unreachable from the sandbox, so the feed itself was only checked by
  leaving the app block untouched; merchant to confirm on a phone.
  Round 2: the merchant sent the colourful Instagram logo PNG, wanted on the LEFT of the text. Added
  `icon_image` (image_picker) + `icon_side` (start/left; left sets `dir="ltr"` on the link) to the
  section; the logo is sized 1em via CSS. Uploaded the trimmed 256px PNG to Files as
  `mk-instagram-logo.png` with the new `scripts/upload-file.py` (stagedUploadsCreate + fileCreate)
  and set it in `templates/index.json`. Verified live at 390/1440 (img rendered, 26/32px next to
  32/40px text).

- Home + menu feedback doc (2026-10-11): the merchant sent a Word doc with 17 requests
  (screenshots + baby-star/kipod references) and asked for a plan first. Audited each one
  against Hyper 1.5.0 and wrote `docs/home-menu-feedback-plan.md`: 11 are Hyper settings/CSS,
  2 need small logged core edits (dropdown heading, newsletter consent checkbox), 2 are data
  (navigation from the Google Sheet, missing collections), 2 are merchant decisions (reviews app,
  social links). Nothing implemented yet; waiting for the merchant's answers in §D.

- Feedback package 1 (2026-10-11): merchant said go. Done on the live theme, all T1/T2:
  OUTLET (menu item renamed via `create-menus.py`, Hyper `hightlight_link` block, star twinkle,
  red #e3262f, CSS so the colour wins over our menu colour); cart bubble #FF5400 + digit centred;
  mobile menu air above the first separator; category circles `card_image_width: medium` (80px)
  and arrows centred on the circle (`--swiper-navigation-top-offset: 4rem`); brand logos in Hyper's
  bordered 6-column grid with heading at the start and "לכל המותגים ‹" at the end (CSS 5c rewritten),
  2 columns on mobile; "הבחירות של אורלי" aligned with the featured-tab settings; `multicolumn-icon`
  contact row (4 empty columns, teal icons) added to the footer group above the footer. Adopted
  the merchant's editor changes first (custom-liquid section removed, logo widths). Screenshots in
  `docs/screenshots/feedback-pkg1/`. Theme check unchanged (13 Hyper warnings, 0 errors).
  Open: social links (merchant), OUTLET colour confirmation, the rest of the plan (packages 2–6).

- Feedback package 2 (2026-10-11): product card restyled in `mk-custom.css` block 4 (rewritten on
  Hyper's own card structure instead of our grid): no border, image edge to edge in a fixed 1:1 box,
  title clamped to 2 lines with an ellipsis and full width, brand regular weight, 0.2rem gaps,
  text start-aligned (`!important` needed against Hyper's alignment utilities), round 3.6rem teal
  icon add-to-cart at the image's bottom-left (inline end), always visible, label kept for screen
  readers. Verified on Home (1440/390) and the collection grid. Also: social links set in theme
  settings (Facebook, Instagram, TikTok, YouTube) → footer and mobile-drawer icons now render;
  WhatsApp (054-664-7175, wa.me link) placed in the footer contact row "כתבו לנו".
  Merchant answers logged: sections = latest products / best sellers / on sale with a sane limit;
  mega menu = first 3 products of the collection for now; missing collections = my call for now;
  reviews = pull from the Google Business profile until a review system exists.

- Feedback packages 3 + 4 (2026-10-11): created three automated collections with
  `scripts/create-home-collections.py` (new-arrivals = all products newest first, best-sellers =
  all products best selling, on-sale = compare-at price > 0; published to the Online Store) and
  replaced the tabbed "המוצרים שלנו" with three `featured-collection` sections (10 products each,
  heading + "לכל … ‹" plain link with Hyper's caret icon). Mega menus: the four empty
  `promotion_banner` blocks became `product_list` blocks ("מומלצים", first 3 products of each
  collection, 3 columns, 40% width / 34% for the 6-column toys menu); Hyper renders them on the
  left on desktop and as a 2-column row inside the mobile drawer. Screenshots in
  `docs/screenshots/feedback-pkg3/`. Google reviews cannot be fetched from the sandbox (google.com
  unresolvable); the merchant must paste the review texts.

- Feedback packages 5 + 6 (2026-10-11): main menu "משחקים וצעצועים" rebuilt per the Google Sheet
  (6 columns: משחקי חשיבה וקופסה, צעצועים ובובות, ערכות יצירה ואומנות, לתינוקות, משחקים לכל מטרה,
  ספרים; written with `create-menus.py --only main-menu --execute`). My call for the items without
  collections: column 5 holds only the three that exist (לחוץ ולחצר, לנסיעה, לאמבטיה ולבריכה) and
  links its heading to the toys collection; the six without products (יחידני, שיתופי, תחרותי,
  תחושה, לשחק לבד, עם ההורים) were left out until collections/tags exist. Existing extra items
  (אפייה לקטנטנים, פעילות חושית, מתנות ליולדת, כריות הנקה) kept at the end of their columns.
  Two logged core edits: dropdown heading in `snippets/desktop-menu.liquid`, consent checkbox in
  `sections/newsletter.liquid` (`consent_checkbox` setting, on for Home; native validation blocks
  submit until checked). CSS block 13. Screenshots in `docs/screenshots/feedback-pkg5-6/`.

- Cart drawer notes (PDF, 2026-10-11): all done with Hyper settings, locale strings and CSS
  block 14 — drawer message "משלוחים חינם בכל רכישה מעל 299 ₪" (cart_message), free-shipping
  threshold 299 (theme setting; the announcement bar still says 300, merchant's copy), footer
  tax/shipping note removed from the drawer (CSS `.cart-drawer .tax-note`; the 4 locale keys
  keep Hyper's Hebrew for the cart page), shipping-calculator button removed
  (`show_shipping_rates_calculator: false`, locale title back to Hyper's), view-cart button hidden
  (no Hyper setting), goal text and the note/shipping/coupon buttons in black, upsell row = Hyper's cart
  recommendations with a hand-picked list of 8 best sellers ≤59 ₪ (no collection source in Hyper)
  under "מוצרים משלימים עד 59 ₪" with a divider above; drawer upsell cards get the same icon-only
  add-to-cart. Verified with a curl-prefilled cart at 390/1440 (`docs/screenshots/cart-drawer/`).
  Note: a `theme pull` of locales/he.json returns the file with a `/* */` header; parse with the
  header stripped before diffing (a bad copy briefly emptied the local file; restored from git).
- Collection feedback doc (2026-10-11), plan in `docs/collection-feedback-plan.md`. Package 1 done
  (CSS block 7 + one template setting): sort control boxed like the filter button; active filter
  chips are light pills (#F8F8F8, round) with teal + white on hover; breadcrumb chevron now points
  the right way in RTL (U+203A, the glyph is bidi-mirrored) and the current page is in the text
  colour; mobile/tablet toolbar = filter + sort on one row (toolbar halves flattened with
  `display: contents`, drawer sort hidden), count below, 1px divider under the toolbar, 12px
  breadcrumbs; `pagination: infinite` in templates/collection.json (23 → 138 cards on scroll, no
  page numbers). Body class is `collection-template` (the old `.template-collection` rules never
  applied). Second-image hover: Hyper's own feature works with our card CSS (tested with an
  injected image), but all 1,824 products have exactly one image, so it is a content task.
  Screenshots: `docs/screenshots/collection-pkg1/` (before/ + after). Open: "__% הנחה" wording
  (package 3 with the badge edit), packages 2–5 per the plan.
- Collection feedback package 2 (2026-10-11), all T1 + 4 CSS lines: newsletter moved from
  index.json into `sections/footer-group.json` (`mk_newsletter`, order contact row → newsletter →
  footer, site-wide; merchant chose footer only); `mk-feature-icons` instance added to
  templates/collection.json after the grid (same 6 tiles as Home); new alternate template
  `templates/collection.mk-banner.json` = collection.json + banner `show_collection_image`,
  `as-bg`, small height, overlay 30, scheme-inverse, white title via CSS. Hyper's banner already
  reads `collection.metafields.foxtheme.collection_banner` (+ `_mobile`), so no dynamic source is
  needed; the merchant assigns the template per collection and optionally fills that metafield
  (checklist §9). A global `show_collection_image: true` was rejected because every category/brand
  collection has a tile image. Verified with `?view=mk-banner` on /collections/amos at 1440/390
  (`docs/screenshots/collection-pkg2/`). Keep collection.mk-banner.json in sync with collection.json.
- Collection sort translated (2026-10-12, feedback plan A4, merchant asked for it now): Hyper
  prints Shopify's `sort_options` names, which are localized only in the store's primary language
  (English here). Core edit in `snippets/facet-short.liquid` (MK-CUSTOM): names from
  `products.facets.sort_options.*` (he.json Hebrew, en.default.json + de/es/fr/it/vi English so
  MatchingTranslations stays clean) with fallback to Shopify's name, and values listed in the new
  theme setting `mk_sort_hidden` (settings_schema group "MK custom", default `manual,
  most-relevant, title-ascending, title-descending`) are left out unless active. Verified: collection
  dropdown + drawer show the 5 requested options in Hebrew, `?sort_by=manual` keeps "מומלצים"
  listed, search shows רלוונטיות + prices, selecting price-ascending reloads sorted. Note:
  /collections/all is set to alphabetical in the admin, so "שם, א-ת" stays listed there until the
  collection's default sort is changed. Logged in CUSTOMIZATIONS.md.
- Cart drawer round 2 (Word doc, 2026-10-12), CSS block 14 + one drawer setting: upsell heading
  "מוצרים שווים עד 59 ₪" at 18/700; upsell cards 3 per row on every width (28vw column on mobile)
  with the icon-only add-to-cart on desktop too (Hyper's text-button wrapper hidden, the md:hidden
  icon wrapper forced visible), 3.2rem icons, 13/14px title/price; free-shipping label centred and
  the progress bar green (`--mk-color-success` #27AE60, merchant liked the babystar look); list gap
  2.4 → 1.6rem via `ul:has(> .cart-item)` and 9rem/8rem thumbnails; heading "(3)" kept on one line
  (flex + nowrap, the custom element wrapped in Safari). Verified with 3 items at 390/1440
  (`docs/screenshots/cart-drawer/drawer-*.png`, `drawer-upsell-*.png`).
  Round 3 (2026-10-12): upsell add-to-cart icon absolutely positioned on the image's bottom
  inline-end corner (8px/8px, same as the collection cards; the list card's mobile wrapper sits
  inside `.product-card__image-wrapper`), and the drawer title at 18px below md to match the
  upsell heading.
- Skills metafield (2026-10-12, merchant Excel + approval): `custom.skills` was an empty
  rich_text_field; replaced (delete + create, same key so templates/product.json tab keeps working)
  with `list.single_line_text_field` + `choices` validation of 39 values
  (`docs/import/skills-choices.json`, `scripts/create-choice-definition.py`). New definition
  gid://shopify/MetafieldDefinition/306584256706, pinned, storefront PUBLIC_READ. Merchant asked
  about overlapping values (פאזלים ×3, קריאה ×2, ספרים ×2, אנגלית ×2, חשבון ×3): kept as given.
  Next: the product tab renders the list via `metafield_tag` (plain <ul>); chip styling when the
  first products carry values; S&D filter "מיומנות" on this field in collection package 5.
- Age metafield (2026-10-12, merchant list): `custom.age_range` single_line_text_field (0 values)
  replaced with list.single_line_text_field + 12 choices (`docs/import/age-choices.json`), new
  definition gid://shopify/MetafieldDefinition/306597986498. Script generalized to
  `scripts/create-choice-definition.py <config.json> [--execute]`. templates/product.json tab
  "מתאים לגיל" now joins the list with ", " (a bare `.value` would concatenate the array).
  These two fields are the S&D filters "גיל" and "מיומנות" for collection package 5; the Home
  age pills / gift finder still use the age tags and can move to this field later.
- Product data import from the merchant's Excel (2026-10-12, `scripts/import-product-data.py`,
  matched by variant barcode or SKU; merchant instruction): 1,794 of 1,824 products matched (30
  Shopify products without a matching barcode, 1,157 Excel rows without a product). Written:
  gallery images appended (≈4,380 media, existing main image kept first), custom.short_description
  on 1,794, custom.skills on 1,794 (choice list extended to 55 on the merchant's approval, second
  pass rewrote the lists), custom.age_range on 66 (the Excel "גילאים - מדויק" column is filled for
  86 rows only). Pass 1: 1,781 ok / 13 errors (duplicate list values, raw Hebrew/en-dash image
  URLs); pass 2 after fixes: 1,191 ok / 0 errors. Final dry run: 1 image left (a URL Shopify
  rejects). Lessons in the script: Shopify renames files (percent-encoding with "_", jpeg→jpg,
  truncation), rejects duplicate list values, needs encoded originalSource URLs.
- Collection package 5 (2026-10-12), theme side done, admin side pending: new product metafield
  `custom.category` ("קטגוריה", list + 25 choices = main-menu categories levels 0–1 that exist in
  the Excel, gift-by-age and sale groups left out; `docs/import/category-choices.json`), filled by
  `scripts/import-product-data.py` from `taxonomy:product_cat:names` (1,751 products, pass in
  progress). New section `sections/mk-filter-chips.liquid` + `assets/mk-filter-chips.css` (T3):
  chips from one S&D filter group by label (`collection.filters`, `url_to_add`/`url_to_remove`,
  active state, optional "הכל" chip via `products.facets.all`, counts) plus manual chip blocks;
  horizontal scroll on mobile with the page-gutter bleed. Added to templates/collection.json and
  collection.mk-banner.json before the grid with facet "גיל"; `expand_filter_groups` = "קטגוריה,
  גיל, מיומנות, מותג, מחיר". Verified with the live "זמינות" facet on `?view=mk-banner` at
  1440/390 (`docs/screenshots/collection-pkg5/`): chips render outside Hyper's paginate block,
  active chip filled, links carry the view param. Hero on the mk-banner template without an
  image no longer renders a black box. Merchant: create the 5 S&D filters per checklist §9.
  Category import done: 1,751 products, 0 errors (משחקים וצעצועים 1,641, משחקי חשיבה וקופסה
  1,282, ערכות יצירה 504, צעצועים ובובות 455, … מארזים/קופסאות 1 each); 43 matched products
  carry none of the 25 menu categories in the Excel.
  Merchant created the S&D filters (2026-10-12): live labels are "מתאים לגיל" (7 values),
  "מיומנות" (52), "מותג" (99), "מחיר", "זמינות"; no "קטגוריה" filter yet. Chips facet label and
  `expand_filter_groups` switched to the merchant's label "מתאים לגיל". Verified live at 1440/390
  with `?filter.p.m.custom.age_range=3+שנים`: chips active state, sidebar checkbox in sync, 26 of
  1,824 products (`docs/screenshots/collection-pkg5/live/`).
  "קטגוריה" filter added by the merchant: 23 values live, first group, "זמינות" removed; final
  order קטגוריה / מתאים לגיל / מיומנות / מותג / מחיר in sidebar and drawer; category=ספרים → 89
  products. Collection package 5 complete.
- Product page feedback (Word doc, 2026-10-14), plan in `docs/product-feedback-plan.md`. Package 1
  done (template settings, 6 locale strings, 1 snippet line, CSS block 8): info column aligned on
  one line (breadcrumbs custom_css padding 5 → 7rem, inventory dot moved after the text); vendor
  line 13px/400 grey without "מותג:" (locale `products.product.vendor` emptied, label span + Hyper's
  ::after underline hidden); inventory threshold 8, strings "מלאי נמוך - נותרו X במלאי" / "זמין
  במלאי", pulsing dot green/orange/red, progress bar hidden; description tab closed by default and
  chained with the metafield tabs (custom_liquid margin fix), smaller headings inside, green ✓
  bullets, metafield lists (age, skills) as grey chips; shipping note 32px above; "למוצרים נוספים"
  chips teal + white on hover; feature notes under the gallery without frame (Hyper inset shadow
  off), Hyper line icons, as wide as the main image; thumbnails at the far left on desktop
  (`!important` on the viewer margin / thumbs inset, Hyper's section CSS wins otherwise); mobile
  thumbnail strip (`mobile_thumbnails: show`); duplicate newsletter removed from product.json;
  gift-wrap property renamed "הוספת אריזת מתנה בתוספת 3 ₪" (the `"` was URL-encoded in the cart).
  Gotchas: block `content` settings are validated as dynamic sources, `| join: ', '` is rejected
  (so the earlier age-tab edit never reached the store; `| metafield_tag` is used instead), and the
  merchant deleted `custom.development_index`, so its tab block had to go for the template to push.
  Verified on /products/121790 at 1440/390 (`docs/screenshots/product-feedback/`).
- Product package 2, gift wrap (2026-10-14, merchant approved): `scripts/create-gift-wrap.py`
  created product "אריזת מתנה" (handle gift-wrap, 3 ₪, tag gift-wrap, untracked, no shipping,
  gid://shopify/Product/15513325764802, published), menu `gift-wrapping` → that product (Hyper's
  native gift-wrap hook) and an automated `all` collection ("מוצרים", best selling, rule tag ≠
  gift-wrap) so the wrap stays out of /collections/all (1,824 products, unchanged). Theme: the
  product-page block is now a custom_liquid rendering `snippets/mk-product-gift-wrap.liquid`, which
  reuses Hyper's `gift-wrapping` element/script (loaded by the drawer on every page); locale
  `general.cart.gift_wrapping.message_html` = "הוספת אריזת מתנה בתוספת {{ price }}" (drawer + PDP);
  gift note field hidden on the PDP. End-to-end test: check → cart attribute gift-wrapping + 3 ₪
  line; add to cart → 55 + 3 = 58 ₪. The old line-item property block is gone (it never charged).
- Product package 3, age (2026-10-14): `snippets/mk-age-chips.liquid` renders custom.age_range
  as links to `/collections/all?filter.p.m.custom.age_range=<value>` in two modes: grey chips under
  the short description (custom_liquid block `age_chips`) and coloured labels above the title
  (block `age_badges`, before `meta`; theme settings `mk_age_badges` on/off and `mk_age_colors`
  "value|#hex" per line, defaults from the Home age pills). Hyper's `badges` block was already the
  first block. Verified on /products/261 (3 שנים pink, 4-5 שנים teal) at 1440/390. theme check
  reports the snippet as orphaned (it is referenced from template JSON only), 0 errors.
- Product package 4, recommendations (2026-10-14): new `sections/mk-more-from-brand.liquid` (T3):
  brand collection from `product.collections` (custom.collection_kind = brand), first 50 products,
  same-age (custom.age_range) first, current product skipped, Hyper's product-slider + card-product
  markup (5 columns, bottom nav + progress line like Home, 2 columns mobile), button to the brand
  collection, hidden when the brand has < 3 other products. `related-products` renamed "מוצרים
  שחשבנו שתאהב", 5 columns, bottom nav, and a logged core edit renders same-age recommendations
  first and skips the gift-wrap product (it was recommended). Hyper's `recently-viewed-products`
  added ("מוצרים שצפית בהם לאחרונה", 5 columns). Order: main → brand → recommendations → recently
  viewed → reviews. Verified on /products/261 (djeco: 10 cards) after visiting /products/121790
  (1 recently viewed) at 1440/390 (`docs/screenshots/product-feedback/brand-*.png`).
- Product package 5, linked products (2026-10-14): definitions `custom.linked_products`
  (list.product_reference, "מוצרים קשורים") and `custom.variant_label` (single line, "תווית
  וריאציה"), both pinned + storefront read; `snippets/mk-linked-products.liquid` in a custom_liquid
  block after the price: current product first (framed, bold label) then the linked ones, 8rem
  thumbnails + label (variant_label or title), sold-out dimmed, locale
  `products.product.linked_products_label` = "דגמים נוספים". Demo group set on the three potty
  books (121790 טוסיקים / 121783 דובי / 121779 גילי); merchant fills real groups (JABADABADO
  kitchen). Verified at 1440/390 (`docs/screenshots/product-feedback/linked-*.png`).
- Product package 6, what needs no app (2026-10-14): reviews section heading "ביקורות" + 60px
  above (the review layout itself waits on the Judge.me / own-section decision); definitions
  `custom.customer_photos` (list.file_reference, images) and `custom.product_videos`
  (list.file_reference, videos) and one section `sections/mk-product-media.liquid` with a `source`
  setting, two instances in product.json ("סרטונים" 9:16, 4 columns; "תמונות אמיתיות ששלחתם לי"
  1:1, 5 columns), Hyper slider + video snippet, hidden when the list is empty. Demo: one uploaded
  image (`mk-demo-customer-photo.png`, Files) on /products/121790. Order now: main → videos →
  customer photos → brand → recommendations → recently viewed → reviews. Still open: reviews app,
  loyalty app (club points), both need the merchant's choice.
- Home feedback round 2 (2026-10-14, Word doc "תיקונים לעמוד הבית"): plan only in
  `docs/home-feedback-plan-2.md` (16 notes audited against Hyper and the live Home; baseline
  screenshots in `docs/screenshots/home-feedback-2/before/`). Findings: the toys menu order and the
  scroll progress bar are already live; price order, mobile card gap, heading/link rows, dropdown
  alignment + underline, drawer footer band, newsletter checkbox are CSS/settings (package 1); the
  age section becomes Hyper `grid-banner` (6 photo tiles) or `banners-with-categories` pills; "לפי
  גיל" becomes a 2-column mega menu with `custom_card` photos; the hidden brand section is a
  disabled `featured-collection` with banner. Waiting on the merchant's answers (6 questions).
- Home round 2, package 1 (2026-10-14): settings + CSS block 15, all live and verified at 390/1440
  (`docs/screenshots/home-feedback-2/pkg1/`): sale price now left of the struck price everywhere
  (`order: -1` on the compare item); the four product rows + brands use `section_header_alignment:
  left` (heading at the start, "לכל …" link at the end on one row, also on mobile via CSS), caret
  1rem, rows padded 40/24; mobile cards 8px apart, progress line 3px; dropdown heading padded like
  the items and no underline under open/hovered menu items; mobile menu footer = black band with
  the login row and white social icons centred; newsletter disclaimer `text-sm`, box centred on the
  text and white/dark via Hyper's checkbox variables (`--background`, `--border`, `--active`);
  hidden brand-spotlight section `mk_brand_spotlight` (featured-collection with banner, JABADABADO
  placeholder, `disabled: true`) after the brands grid. The announcement bar text (299 ₪) pulled
  from the editor. Not done: the progress line on the category circles (optional core edit).
- Home round 2, packages 2 + 3 (2026-10-14): age section rebuilt per the merchant's mockup
  ("אריחי תמונה" zip): `mk-age-pills` got a `layout: tiles` mode (heading + sub-line + end link,
  3 x 2 tinted r28 tiles, label pill with a white chevron circle; mobile 2 columns 4:3 as an
  assumption), block settings `image` / `product` (photo fallback = representative product's
  image, contained on the tint) / `tint`. Links now go to `/collections/all` filtered by
  `custom.age_range` (the old `age-*` collections never existed, the pills were 404s): 0-6 = גיל
  לידה + 0-3 + 3-6 חודשים … 3+ = 3 שנים, 4-5, 6-7, 8 ומעלה. Main menu: "לפי גיל" is now two
  columns, "לפי גיל" (the 6 groups, HTTP links to the filtered pages) and "מתנות לפי גיל" (the 6
  gift collections), written with `create-menus.py --only main-menu --execute`; header block
  `mega_age_cards` (custom_card, 2 columns, headings + links for 4 cards, photos pending) turns it
  into a mega menu. Hidden brand section left as is (merchant: later). Reviews: Judge.me free plan
  recommended, install steps in the checklist (§9e). Screenshots
  `docs/screenshots/home-feedback-2/pkg2-3/`.
- 2026-10-15: toys menu order confirmed by the merchant. Category circles: 7 per row,
  `card_image_width: large` + 12.4rem from 1280px (CSS 5b), verified at 1440/390. Product type
  scheme proposed (merchant's ask): `docs/product-type-scheme.md` (57 types in 9 families, each
  with a Shopify standard category) and `scripts/propose-product-types.py` → draft per product in
  `docs/import/out/product-type-proposal.xlsx` (1,041 high / 612 medium / 138 low confidence, 33
  unresolved). Nothing written to products; apply script comes after the merchant's review.
- Product types written (2026-10-19, merchant approved the scheme): `scripts/apply-product-types.py
  --execute` set `productType` + the Shopify standard category on 1,791 products (0 errors; 33 left
  without a type = the "לבדיקה" rows, mostly books/decor under vendor "מוצרים נוספים"; gift-wrap
  skipped). Taxonomy names fixed to real entries (Play Vehicles, Toy Kitchens & Play Food, Rattles,
  Bibs, Masks, Tableware, Candles…), 4 types keep a parent category (Puzzles, Educational Toys, Toys
  ×2). Report: `docs/import/out/product-types-report.json` (gitignored). The "סוג מוצר" filter must
  be created by the merchant in Search & Discovery; collection templates already open that group.
- Home round 3, package 1 (2026-10-19): live and verified at 390/1440
  (`docs/screenshots/home-feedback-3/pkg1/`). Search placeholder "מה תרצו לחפש?" (he.json). Toys
  mega menu 5 columns with "ספרים" under "משחקים לכל מטרה" (CSS 16: the columns become
  `display: contents`, groups placed on the grid, first four span two rows for the dividers). Open
  drawers above every app widget: the menu drawer sits inside the sticky header section, so
  `.header-section:has(.menu-drawer[open])` and the cart drawer get z-index 2147483000 (tested with
  a fake z 999999 widget). Dropdown heading without the line. Mobile menu footer: blue #312E7D
  band, login row grey #E9E9E9 (1.2rem). Contact row: 2 per row on mobile, phone / WhatsApp /
  address are links in the text (tel:, wa.me, Waze; numbers LTR + nowrap, WhatsApp number on its own line), buttons removed
  (the "מיקה" chat button kept). Circle arrows offset 6.2rem. Product rows on mobile read "הכל"
  (CSS swap, desktop keeps the label). Age tiles: "הכל ‹" link without underline, new setting
  `show_labels` (photo-only tiles, label kept for screen readers). Instagram handle visually hidden
  (icon stays the link). Left for the merchant: accessibility widget position (app settings), row
  descriptions, Google reviews text, footer frame export, skills sheet, box products.
- Home round 3, package 2 (2026-10-19): main menu rewritten with `create-menus.py --only main-menu
  --execute`: "לפי גיל" column = the 12 age values of the filter (גיל לידה … 8 ומעלה), each to
  `/collections/all?filter.p.m.custom.age_range=<value>`, next to "מתנות לפי גיל"; "חגים ומסיבה"
  (8 children) is now the 5th column of "כלי בית ואקססוריז" (block `menu_columns: 5`) and no longer
  a top-level item; "סנדלים ונעלי טרום הליכה" moved into "בגדי ילדים". The age mega menu block
  became a `product_list` ("מומלצים": 120646, 4669, 7721) so it is visual now; photo cards can
  replace it later (custom_card block with Promo images). Verified at 1440 and in the 390 drawer
  (`docs/screenshots/home-feedback-3/pkg2/`). Waiting on the merchant: skills sheet (B4), box
  products (B5), row descriptions, Google reviews, footer frame; accessibility widget position is
  done by the merchant in the app settings.
- Product types v2 (2026-10-20, merchant's Excel "Product Types"): 20 top-level types replace the 55
  fine ones; the fine type moves to the new metafield `custom.product_subtype` (single line, 61
  choices, created with `create-choice-definition.py docs/import/subtype-choices.json`). Mapping
  in `docs/import/product-type-mapping.json`, source workbook `docs/import/product-types-20.xlsx`.
  `scripts/remap-product-types.py --execute` wrote productType + sub-type on 1,791 products (0 errors, verified: 20 types, every typed product has a sub-type)
  (standard category untouched). Docs: `docs/product-type-scheme.md` v2, checklist rows for the
  two filters.
