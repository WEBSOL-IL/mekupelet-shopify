# Implementation plan — Phase 0 (Discovery)

Status: **draft for merchant approval**. Produced 2026-10-07. Read with `docs/hyper-audit.md`
(theme architecture facts) and `docs/figma-frame-map.md` (frame IDs, designer annotations).

## 0. How this plan was produced, and what is still unverified

| Source | Status |
|---|---|
| Hyper theme source (theme `154698219714`, 460 files) | Pulled read-only through the Admin GraphQL theme-files API and committed as the git baseline. md5-verified. |
| Shopify CLI (`shopify theme list/pull/push/dev`) | **Blocked.** The Theme Access token in the environment is rejected by Shopify with HTTP 401 (verified both directly and through `theme-kit-access.shopifyapps.com`). Nothing can be pushed or previewed locally until a fresh token is stored (see §9). |
| Figma frames 18:4094, 52:5172, 69:5443, 1:266, 1:1794 | Node trees with text, fills, strokes, radii, shadows and font styles fetched (depth 2). This is what the tokens and diff tables below are built from. |
| Figma screenshots, mobile frames, 1:949, deeper node levels, variables | **Blocked.** Figma MCP tool-call limit and REST API quota are both exhausted on the Starter plan (`Retry-After` ≈ 4.6 days, upgrade link offered by Figma). Visual verification of every item below, and the mobile adaptation, must be redone against screenshots when access returns. |
| Live storefront | Reachable. Used for the Lighthouse baseline and to confirm the published theme is Hyper demo content. |

Everything marked **VERIFY** below was derived from node data without seeing a render.

## 1. Design tokens (from the approved revision)

Colors (hex, as used in the revision frames):

| Token | Value | Where it appears | Hyper target |
|---|---|---|---|
| `brand-teal` (action "blue") | `#008094` / `#007f94` (1 unit apart, treat as one) | all CTA buttons, card add-to-cart, filter CTA, tag chips, category ring | `color_schemes.scheme-1.primary_accent` / button background |
| `brand-orange` | `#ff5400` | active tab underline, age pill, stripes, item-count text, active wishlist heart `#ff5500` | accent-2 (custom CSS var) |
| `brand-pink` | `#ff75ba` | sale badge (PDP), age pill, stripes, logo | badge sale |
| `brand-cyan` | `#3bd6d9` (`#67dbde`, `#70e1e3` tints) | newsletter band (73% alpha), age pill, in-grid promo tile, logo | newsletter scheme |
| `brand-yellow` | `#ffc010` / `#ffbf00` | "new" badge tint, rating box, age pill, illustrations | badge new |
| `brand-purple` | `#8761e8` / `#8761eb` | age pill, logo | — |
| `brand-green` | `#00ba57` / `#00b255` | age pill, "in stock" chip | success |
| `footer-navy` | `#312e7d` | footer background (Home revision); a light `#fcfcfc` variant is also present on PDP/Collection → **open question Q3** | footer color scheme |
| `text-primary` | `#1c1c1c` / `#000000` | body, PDP text | `text` |
| `text-heading` | `#353535` | all section headings, Home body | `heading` |
| `text-muted` | `#6b6b6b` (breadcrumbs, search placeholder), `#9b9b9b` (vendor, stars outline) | — | `text_subdued` |
| `border` | `#dddddd` (cards, inputs), `#e0e0e0` (lines, icon buttons), `#dfdfdf` (brand logo boxes), `#ededed` (PDP dividers), `#dbdce0` (qty box, review dividers), `#c1c0c0` (PDP related cards) | — | `border` (one value; the five greys are within 2 steps, propose `#dddddd` + `#e0e0e0` only) |
| `surface-soft` | `#f8f8f8` (filter groups), `#f5f5f5` (PDP USP tiles), `#f4f4f4` (chips) | — | `background_2` |
| `badge-text-dark` | `#3b0d15` | "new" badge text | — |
| Removed from the original | `#e66277` coral accent, `#f9ede8` peach surfaces | original frames only | do not use |

Typography (font family as embedded in Figma: `SimplerPro_HLAR` = **Simpler Pro**, Hebrew):

| Role | Size/line-height | Weight | Used for |
|---|---|---|---|
| Display | 40/40 | 400 (set in `42dot Sans`, see Q1) | surprise-box title |
| H2 section heading | 32/45 (also 32/40) | 700 | every section title, collection title |
| H3 | 24/34 | 700 | newsletter title |
| Category label / age pill | 20/40, 20/27 | 600 / 400 | category circles, age pills |
| Product title (PDP) | 20/30 | 600 | |
| Body | 16/22 | 400 | descriptions, footer, filters |
| Accordion title / toolbar | 16/26, 16/40 | 600–700 | PDP accordions, filter group titles |
| Small / UI | 14/19, 14/20 | 400 / 600 | breadcrumbs, prices, filter labels, sort menu |
| Badge | 12/17 | 600 | new/sale badges, card add-to-cart |

Radii: `4` (PDP buttons, qty, chips, card ATC), `5` (dropdowns, inputs, search), `10` (cards, images, thumbs, rating box), `15` (PDP sale badge), `30` (banner, USP tiles), `34`/`50`/`100` (pill buttons, age pills, filter bar), `60`/`80` (badges on cards, 32px icon buttons = circles).

Shadows: cards hover/related `0 2px 4px rgba(0,0,0,.10)`; dropdown menus `0 4px 11.4px rgba(0,0,0,.15)`; slider arrows `0 4px 7.6px rgba(0,0,0,.15)`.

Layout: 1440 frame, content width 1312 (64px gutters), 4-column product rows (card 290×400 on Home, 224×338 in Collection with a 304px right-hand filter column), header 189px tall (53px USP bar + 136px header incl. nav row at y162), footer 375px, newsletter band 386px.

Current Hyper settings that will change: `type_header_font`/`type_body_font` = Instrument Sans → Simpler Pro (self-hosted woff2, needs the licensed files from the designer/merchant, see Q2); `page_width` 1700 → 1440 (content 1312); `color_schemes.scheme-1.primary_accent` `#c4301c` → `#008094`; `color_badge_new`/`color_badge_hot` → design values; `buttons_corner_radius` "round" → see Q4; `enable_rtl` is already `true` with `language_support_rtl` = `he`.

## 2. Global decisions extracted from the revision (apply to every template)

1. Action buttons are teal `#008094` with white text (annotation 69:5441 "blue"). Pill radius on Home marketing CTAs, 4px on PDP commerce controls → **Q4**.
2. Navigation/header: grey 1px border, no shadow (69:5440); search field 259×40 r5 with `#dddddd` border; 3 header icons 20px; USP bar 53px `#e9e9e9` with 16px text `#3f3f3f`.
3. Every product card has a 1px `#dddddd` border, radius 10, image radius 10 (69:5436, 69:6240). Hover adds the 2/4 shadow (VERIFY).
4. Badges: "new" = `#ffbf00` at 25% with text `#3b0d15`; "sale" = `#ff75ba` solid with `#1c1c1c` text on PDP, but a 25% `#ff5400` tint on Home cards; a 25% `#67dbde` tint appears on a third card (probably "bestseller") → exact mapping needs the screenshot (**Q5**). Wishlist heart: outline circle 32px, active fill `#ff5500`.
5. Icons with solid white backgrounds (69:7497): 32px circular icon buttons with `#e0e0e0` border on cards/PDP; 40px white circles with shadow for slider arrows.
6. Star color changes (69:7499): rating summary box `#ffbf00`; star glyph color itself not resolvable from node data → **Q5**.
7. Softened logo (`69:7519`), new Instagram icon (69:7521): assets to export when Figma access returns.
8. Brand logos stay (69:5437); footer opening hours on one line (69:5434) — one text node, 289×44, 16/22.
9. Footer is 4 link columns + contact block + social row; dark navy (Home revision) → **Q3**.
10. Newsletter band spans full width with decorative colored stripes/illustrations at both edges (Home, PDP). Mobile treatment unknown → mobile proposal §4.

## 3. Original vs revision — diff per template

### 3.1 Home (`1:266` → `18:4094`)

| # | Section (top→bottom in revision) | Original | Revision | Change |
|---|---|---|---|---|
| 1 | Header + USP bar | same component | same, header instance updated (search box, icons) | styling only |
| 2 | Hero | image 1440×530 | image 1440×531 + small text/logo overlay (`68:4487` 384×23); two hero options `69:4498`/`69:4497` | **Q6** which image |
| 3 | **Product finder bar** (new) | — | 1312×85 pill, gradient bg, 4 dropdowns (גיל, מיומנות, מותג, טווח מחירים) + teal CTA 157×45 | **new section** |
| 4 | Featured categories | 7 circles 160px, no rings | 5 circles 217px with colored 1px rings (teal, orange, coral, teal, yellow), labels 20/600, slider arrows | re-styled, fewer items |
| 5 | "המוצרים שלנו" product tabs | 1 row 1352 wide | tabs with orange underline, 4 cards 290×400 bordered, arrows | card restyle |
| 6 | "רכישה לפי גיל" shop by age | full-width band 1440×659 with 2 big image tiles 330×330 and a 579×499 image | 6 colored pills 316×70 in 2 rows (green, orange, yellow / purple, pink, cyan), labels 20/400 white | **replaced** |
| 7 | "מותגי הבית" brands | 8 logo boxes 304×80 + button | identical, button teal pill | styling only |
| 8 | Second "קטגוריות נבחרות" | collection cards row 1352×425 | 4 cards 295×403 with ribbon icon 26×46, image 294×265 top-rounded | VERIFY content (collections cards vs product row) |
| 9 | Promo banner | "מבצע מיוחד…" image banner 1312×410 r30 with white card | **Surprise box** banner: title 40px, logo, text, teal pill CTA "להרכבת הקופסה" | content + CTA rewrite |
| 10 | USP icons | 6 tiles 194×178 r30, line icons 60px, 2-line labels (placeholder text) | 6 tiles with solid-background icons 165px (3 PNG images, 3 vectors) and 1-line labels | **new icons, new copy**; 2 of 6 icons still raster → asset request |
| 11 | Instagram "mekupelet_toys" | 5 images 272×362 + arrows | same | none |
| 12 | Reviews "ביקורות" | 3 cards 1312 wide | 3 cards 394×313 | styling (VERIFY) |
| 13 | Newsletter | band 1440×386 | band with stripes/illustrations, cyan 73% | styling |
| 14 | Footer | 1440×375 | navy `#312e7d` | color (Q3) |

### 3.2 Product (`1:1794` → `52:5172`)
Structure is identical (same node layout, same y positions). Changes are styling only: coral → teal on ATC (406×44 r4 `#007f94`), review CTA (173×40), tag chips; sale badge coral → pink `#ff75ba`; related/complementary cards get the bordered card (296×398, `#c1c0c0` + shadow); accordion set unchanged: תיאור פריט, משלוחים/החזרות/החלפות, **מדד מקופלת להתפתחות הילד**, **מתאים לגיל**, **מפתח מיומנויות**, פרטים נוספים; 3 USP tiles under the gallery (תקן, תשלום, משלוח חינם מעל 299 ₪); "למוצרים נוספים:" tag chips; reviews with yellow summary box and 3 rows + pagination; newsletter (two variants: `#f7f7f7` and cyan) and footer (two variants) overlaid → Q3.

### 3.3 Collection (`1:949` → `69:5443`)
Original not fetched (quota). Revision: breadcrumbs 14px grey; title 32/700 + description 16/22 (447px wide); divider; toolbar = layout toggles (50×40), item count "345 פריטים" in orange 16/600, sort dropdown (הכי נמכרים / הכי חדש / מחיר מהנמוך לגבוה / מחיר מהגבוה לנמוך) and "ניקוי" clear; right-hand filter column 304px with `#f8f8f8` groups: קטגוריות נבחרות (list), גיל, מיומנות, מחיר (range slider 264×81), היילייטס (checkbox list), מותג (long list 534px); 4-column grid of 224×338 bordered cards, 27px gaps; an in-grid promo tile 475×338 cyan r10 spanning 2 columns in row 3; footer. Diff vs original to be completed when 1:949 can be fetched.

## 4. Mobile adaptation proposal (320px, original mobile frames as pattern source)

The original mobile frames could not be fetched this session, so this proposal follows Hyper's existing mobile behaviour and must be checked against `1:7075`, `1:10570`, `1:7815`/`1:8109` and the filter states when access returns.

| Section | Proposal |
|---|---|
| Header | Hyper mobile header: hamburger + logo + cart/search; USP bar becomes a single-line scrolling announcement (Hyper `announcement-bar`), nav moves into `menu-drawer`. |
| Product finder bar | Stack into a card: 4 full-width selects + full-width CTA; collapsed by default behind a "חיפוש מהיר" toggle to protect LCP. |
| Categories | Horizontal swipe row (`swipe_on_mobile`), circles 120px, 2.5 visible. |
| Product rows / grids | 2 columns (`columns_mobile: 2`), card border kept, card ATC becomes icon-only 32px to keep 2 columns at 320. |
| Shop by age | 2 columns × 3 rows of pills, full width, 56px tall. |
| Brands | 2 columns × 4 rows of logo boxes, or swipe row; button below. |
| Surprise box banner | Image on top (16:9), white card below, full-width CTA. |
| USP tiles | Horizontal swipe row of 6 (`swipe_on_mobile`), 2.3 visible; icon 96px. |
| Instagram | Swipe row, 1.3 visible. |
| Reviews | Slider, 1 per view with progress bar. |
| Newsletter | Stripes/illustrations hidden under 768 (decorative only), band padding 40. |
| Footer | Accordion columns (Hyper footer already collapses on mobile), contact + hours + social at bottom. |
| Collection | Filters in drawer (`filter_type: drawer`), toolbar = filter button + sort + count; promo tile spans both columns. |
| Product | Gallery as swipe slider with dots, thumbnails hidden; sticky add-to-cart bar (Hyper `sticky-atc-bar`); USP tiles as 3 compact rows; accordions full width. |

## 5. Figma section → Hyper mapping (tier 1 = settings, 2 = CSS, 3 = new `mk-` section, 4 = core edit)

| Figma section | Hyper implementation | Tier | Justification | Effort |
|---|---|---|---|---|
| USP bar + header + nav | `sections/topbar.liquid` (text block) + `sections/header.liquid` settings + `mk-custom.css` overrides for border/no-shadow/search field | 1+2 | Hyper header has layouts, mega menu, predictive search, sticky; only chrome styling differs | M |
| Hero | `slideshow` (1 slide) or `image-with-text-overlay` | 1 | native; preload/fetchpriority handled by section setting | S |
| Product finder bar (age/skill/brand/price → collection URL with filter params) | **`mk-product-finder`** section (schema: target collection, 4 filter blocks mapping to Search & Discovery filter param names) | 3 | no Hyper equivalent; must emit native `filter.p.m.*`/`filter.v.price` URLs so it works with storefront filtering, zero catalog looping | M |
| Featured categories (circles with colored rings) | `collection-list-slider` (`rounded_card_image`, `card_image_ratio: 1/1`) + CSS for per-item ring color via block setting? Rings differ per item → either CSS nth-child cycle (tier 2) or a tiny `mk-` block setting (tier 3) | 1+2 | native slider, RTL supported | S |
| "המוצרים שלנו" tabs | `featured-products-tab` / `collection-tabs` (max 5 blocks) + card CSS | 1+2 | native | S |
| Shop by age pills | `buttons-with-icon` (`btn--primary`, per-block color via CSS nth-child or `mk-` block color setting) | 1+2 | native button grid with slider option | S |
| Brands grid | `brand-logos` (8 blocks, `grid_bordered`, button) | 1 | native | S |
| Second categories row | `collection-list` or `featured-collection` with banner blocks | 1 | VERIFY content first | S |
| Surprise box banner | `image-with-text` (image + heading/text/button blocks, badge block for logo) or `promotion-banner` | 1+2 | native, radius via CSS | S |
| USP icon tiles | `multicolumn-icon` (image per column, `columns_mobile`, `swipe_on_mobile`) | 1+2 | native | S |
| Instagram | `shop-the-feed` (manual images, `account` field) — no app | 1 | native; images uploaded to Files | S |
| Reviews on Home | `testimonials` (card layout) | 1 | native; real review data needs an app decision (Q7) | S |
| Newsletter band | `newsletter` + CSS for band color + optional decorative images (`image` blocks) | 1+2 | native form | S |
| Footer | `footer` blocks + `footer-group.json` + color scheme | 1 | native | S |
| Product card (global) | `snippets/card-product.liquid` via settings (`pcard_style: card`, `pcard_corner_radius`, `pcard_show_cart_button`, badges via tag lists), `mk-custom.css` for border color/radius/shadow and badge tints | 1+2 | Hyper card already has quick-add, hover image, swatches; heart/rating slots do not exist (see wishlist/reviews rows) | M |
| Collection page | `main-collection-banner` + `main-collection-product-grid` (`filter_type: vertical`, `pagination: number`, `columns_desktop: 4`, `image_card` block for the in-grid promo tile) + `facets` CSS | 1+2 | native storefront filtering, promo tile is a native block | M |
| Product page | `main-product` blocks (title, vendor, price, rating, variant picker, buy buttons, collapsible tabs ×6, icon boxes ×3, tags/collection chips) + CSS | 1+2 | Hyper's `product-information-blocks` covers the list; "מדד מקופלת", "מתאים לגיל", "מפתח מיומנויות" read metafields (§6) | M |
| Complementary / related | `related-products` + `product-complementary` snippet | 1 | native | S |
| Reviews on PDP / rating on cards | Hyper has no rating or review code at all; an app block (`@app`) in `main-product` or a custom snippet reading the app's metafield (Q7) | — | | — |
| Wishlist heart (cards + PDP) | Q12; if `mk-wishlist`: `mk-wishlist.js` + button injected via our own card snippet, not by editing `card-product.liquid` | 3 | | M |
| Mini cart | `cart-drawer` settings + CSS | 1+2 | native | S |
| About / FAQ / Legal / Blog / Article / Gift card | existing templates (`page.about.json`, `page.faq.json` with `collapsible-tabs`, `main-page`, `main-blog`, `main-article`, `gift_card.liquid`) reconfigured + CSS | 1+2 | | S each |
| Brands index / Brand page | `list-collections.json` (`main-list-collections`) if brands are collections; else `mk-brands-index` over a metaobject | 1 or 3 | depends on data model (§6) | M |
| Boxes (Phase 5) | technical proposal first | — | | — |

Core-file (tier 4) edits expected, each wrapped in `MK-CUSTOM` comments and logged in `docs/CUSTOMIZATIONS.md`:
- `layout/theme.liquid`: load `assets/mk-custom.css` after `rtl.css` and preload the two Hebrew font files (Hyper's own font preloads point at Instrument Sans; the theme fonts will be set to a system font so nothing unused loads).
- `templates/gift_card.liquid`: standalone document that ignores `enable_rtl`; needs `dir="rtl"` and the custom stylesheet.
- `snippets/price.liquid`: only if ILS prices misorder in Hebrew text (wrap the amount in `<span dir="ltr">`); decided after the first RTL render.
- Badges need no edit (tag lists + colors). A Hebrew `locales/he.json` is a new file, re-checked on every Hyper update.

## 6. Data model proposals

| Need | Proposal | Admin setup (merchant checklist, Phase 1) |
|---|---|---|
| Badge "new" | Hyper native: tag listed in setting `product_new_tags`, colors `color_badge_new` / `color_badge_new_text` (`snippets/pcard-badges.liquid`) | tag products `new` (or any tag listed in the setting) |
| Badge "sale" | Hyper native: `compare_at_price > price`, label style `pcard_sale_badge_type` (text / percentage / amount) | none |
| Badge "bestseller" | Hyper native "hot" badge: tag listed in `product_hot_tags`, colors `color_badge_hot` / `color_badge_hot_text`. The badge text is the tag itself, so the tag should be the Hebrew label (e.g. `בסט סלר`) | tag products |
| Age range (filter + PDP accordion "מתאים לגיל" + age pills) | product metafield `custom.age_range` (list of single-line text or metaobject `age_group` with label, slug, color, image). Filter via Search & Discovery on the metafield | create definition, expose as filter |
| Skills ("מיומנות"/"מפתח מיומנויות") | metaobject `skill` (name, icon) referenced from product metafield `custom.skills` (list) | create definition + filter |
| "מדד מקופלת להתפתחות הילד" | product metafield `custom.development_index` (rich text) | create definition |
| Highlights ("היילייטס") filter | product metafield `custom.highlights` (list of single-line text) or tags | create + filter |
| Brands | `product.vendor` for filtering (native) + metaobject `brand` (name, logo, description, banner, collection handle) for the brands index/brand page | create metaobject + entries |
| FAQ | metaobject `faq_item` (question, answer, category) rendered by `collapsible-tabs` custom_liquid or a small `mk-faq` section; or keep Hyper blocks (merchant edits in editor) | choose |
| Legal pages | one `page.legal.json` template with `main-page` + side TOC | pages |
| USP copy / opening hours / WhatsApp link | section/block settings (editor) | none |

## 7. Asset inventory (to export when Figma access returns)

Logo (softened, `69:7519`), new Instagram icon, 6 USP icons (3 still raster in Figma: `31:4166`–`31:4168`, request SVG/PNG from designer), category PNGs on brand-colored backgrounds (Q8), hero image (Q6), surprise box image (placeholder, Q9), brand logos ×8, Instagram images ×5, review avatars, filter chevron icon `fi_2985150`, header icons `fi_5337564`/`fi_1077035`/`fi_456283`, ribbon icon `fi_13652495`, Simpler Pro woff2 files (Q2).

## 8. Baseline Lighthouse (mobile, simulated throttling, Lighthouse 12.8.2, 2 runs each)

| Page | Perf | A11y | Best practices | SEO | FCP | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|---|
| Home `/` | 61 / 75 | 91 / 95 | 96 | 85 | 2.9s / 1.6s | 3.3s | 1056 / 529 ms | 0 |
| Collection `/collections/all` | 69 / 76 | 99 | 96 | 92 | 1.3s | 3.6s / 2.8s | 766 / 654 ms | 0 |
| Product `/products/100769` | 63 / 81 | 95 | 96 | 92 | 1.8s | 5.3s / 2.5s | 535 / 497 ms | 0 |

Notes: run-to-run variance is large on this container, so compare medians of 3+ runs per phase. Main costs: `vendor.js` (56 KB gz, ~35–49 KB unused), Shopify web pixels (`wpm`), portable-wallets on PDP, 215–249 requests, 7.1s main-thread on Home. The page is the Hyper demo content with English `lang`; numbers will shift once the real content and Hebrew fonts are in.

## 9. Admin / environment checklist for the merchant

1. **Theme Access token**: in Shopify admin → Apps → Theme Access, create a new password for this developer and store it in the cloud environment as `SHOPIFY_CLI_THEME_TOKEN` (the current value is rejected with 401). Without it: no `shopify theme push/dev`, no local preview, no theme check against the store.
2. **Figma**: either wait ~5 days for the Starter-plan quota to reset or upgrade the plan; otherwise export the frame screenshots manually and share them.
3. **Hebrew storefront language**: Settings → Languages → add Hebrew and make it default (the storefront currently renders `lang="en"`; Hyper's RTL switch is keyed to the `he` locale).
4. Fonts: provide the licensed Simpler Pro woff2 files (weights 400/600/700).
5. Metafield/metaobject definitions and Search & Discovery filters per §6 (exact list issued at the start of Phase 1).

## 10. Open questions (answers needed before Phase 1)

| # | Question |
|---|---|
| Q1 | Surprise-box title/text and the 6 USP labels are set in `42dot Sans` (no Hebrew glyphs) — a Figma fallback? Use Simpler Pro everywhere? |
| Q2 | Simpler Pro license and files (woff2 400/600/700). |
| Q3 | Footer: navy `#312e7d` (Home revision) or light `#fcfcfc`? Newsletter: cyan 73% or `#f7f7f7`? Both variants exist on PDP/Collection. |
| Q4 | Button radius: pill (Home CTAs) vs 4px (PDP add-to-cart, chips). Keep both by context, or unify? |
| Q5 | Exact badge mapping (new / sale / bestseller) and the new star color — needs a screenshot or the designer's values. |
| Q6 | Hero image: `69:4498` or `69:4497`? |
| Q7 | Reviews: app (needs approval) or Hyper native rating metafield? |
| Q8 | Category PNGs on brand-colored backgrounds — who supplies them? |
| Q9 | Surprise-box image is an AI placeholder — final image? |
| Q10 | USP copy shortening (69:5433) — designer or merchant? |
| Q11 | Course landing page `1:3455`: in scope? sold on Shopify or external? |
| Q12 | Wishlist: Hyper ships none (`favorite-products` is a curated showcase). The design shows a heart on every card and on the PDP. Options: (a) small `mk-wishlist` (localStorage, no account sync, no app), (b) an app (needs approval). Which? |
| Q13 | Instagram: static images in Files (proposed) vs an app. |
| Q14 | Second "קטגוריות נבחרות" row on Home: collections or a product row? |
| Q15 | `139:4423` "0-6 חודשים" reference image: what is it for? |
