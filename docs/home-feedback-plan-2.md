# Home + menu feedback, round 2 (Word doc "תיקונים לעמוד הבית", 2026-10-14) — plan

Plan only, nothing changed on the store. 16 notes with 13 screenshots, audited against Hyper 1.5.0,
the live Home (`/`), the live navigation and our current `templates/index.json` /
`sections/header-group.json`. Baseline screenshots: `docs/screenshots/home-feedback-2/before/`.
Tiers: T1 settings / T2 `mk-custom.css` / T3 `mk-` files / T4 logged core edit.
The first round (2026-10-11) is in `docs/home-menu-feedback-plan.md`; everything there is live.

## A. Product rows and cards

| # | Note | Today (verified) | How | Tier | Effort |
|---|---|---|---|---|---|
| A1 | Mobile: a bit less space between the products (image3) | Hyper swipe grid: cards 42vw wide, 12px gap (`f-grid--gap-medium`), page padding 15px | CSS for < 768px only: `.featured-collection .swipe-mobile__inner { column-gap: 0.8rem }` (desktop gap untouched) | T2 | XS |
| A2 | The scroll-hint bar under the row like baby-star (image2) | **Already there**: Hyper `show_progress_bar: true` on the 4 product rows (2px line, dark part = position; see `before/featured-390.png`). Missing on the category circles (no Hyper setting; the element `scroll-progress-bar` is global in theme.js) | Make it a little more visible (3px, dark) on mobile; add it to the category slider with a 3-line logged edit in `collection-list-slider.liquid` (same markup Hyper uses in featured-collection) | T2 (+T4 optional) | XS |
| A3 | Card price: the new price to the **left** of the struck price | Hyper prints sale first → in RTL the sale price is on the right, the struck one on its left (`30.00 ₪` at x=1328, `40.00 ₪` at x=1257) | CSS: `.f-price--on-sale .f-price__sale .f-price-item--regular { order: -1 }` → struck price first (right), new price to its left. Applies everywhere (Home, collection, product, drawer) | T2 | XS |
| A4 | "חדש באתר" rows: heading and link on one row on mobile (image7), like the template on desktop (image10), a bit more space between sections | Sections are `section_header_alignment: center` → link under the heading. Hyper's `left` alignment puts heading at the start and link at the end **on desktop only**; on mobile Hyper forces the button to a new row (`order: 9; margin-top: 1.2rem`) | T1: `section_header_alignment: left` on the 4 product rows + brands (desktop = template). T2: on mobile `.section__header { flex-direction: row; justify-content: space-between; align-items: baseline }` and the button back to `order: 0; margin: 0`. Spacing: `padding_top 30 → 40`, `padding_bottom 10 → 24` on the rows | T1 + T2 | S |
| A5 | "לכל המותגים" on the heading row + smaller caret (image11) | Same cause as A4 (mobile stacks); the caret is Hyper's 1.6rem icon | Covered by A4; CSS: `.section__header--buttons .btn--plain svg { width: 1rem; height: 1rem }` | T2 | XS |

## B. Header and menus

| # | Note | Today (verified) | How | Tier | Effort |
|---|---|---|---|---|---|
| B1 | "משחקים וצעצועים": 6 sub-menus in the designed order | **Done on 2026-10-11** (live menu, screenshot `before/mega-toys-1440.png`): משחקי חשיבה וקופסה · צעצועים ובובות · ערכות יצירה ואומנות · לתינוקות · משחקים לכל מטרה · ספרים. The list in the doc came through empty ("לפי הסדר הנכון כאן:" → nothing) | Confirm the current order or send the list; a change is a 2-minute `create-menus.py` run | T1 (data) | — |
| B2 | "לפי גיל": both ages and gifts, maybe visual | Menu has 6 gift links only (מתנות ללידה … לגיל חמש), rendered as a simple dropdown. Hyper mega-menu blocks for this item: `custom_card` (up to 5 image cards with heading + link, next to the menu columns) or `sidebar` (collection image per item) | Make "לפי גיל" a 2-column mega menu: column "לפי גיל" = the 6 age groups of the Home pills, each linking to the filtered collection (`/collections/all?filter.p.m.custom.age_range=…`, same filter as the product-page chips); column "מתנות לפי גיל" = the 6 existing gift links. Visual: a `custom_card` header block for this menu with 5 (max) age photo cards. Menu change via `create-menus.py`, block via header-group.json | T1 (data + block) | S |
| B3 | Dropdowns (לפי גיל, חגים ומסיבה, מתנות): align everything to one line, remove the underline (image9) | Our heading li has no inline padding, Hyper's links have 2rem → the item text starts 2rem left of the heading. The underline is Hyper's hover/open effect on `.menu__item-text` (1px gradient) | CSS: `.mk-dropdown-heading { padding-inline: 2rem }`; `.header .menu__item-text { background-image: none }` (no underline on hover/open for every item) | T2 | XS |
| B4 | Mobile menu bottom: background for the login + social area, icons centred, like the design (image1) | Transparent; login row at the start, 4 bordered round icons | CSS: `.menu-drawer__footer` as a dark band (design: black; alternative the footer purple `#312E7D`), full width, login row white, social icons white without circles, centred | T2 | S |

## C. Age section (image8 → alternatives)

| # | Option | Hyper | How | Tier | Effort |
|---|---|---|---|---|---|
| C1 | Pills with icon + text in a row (image5) | **Yes**: the category bar of `banners-with-categories` (`category` blocks: image + heading + link; bar colour scheme) | Replace `mk-age-pills` by that section with 6 `category` blocks; needs 6 small icons/photos | T1 | S |
| C2 | 6 photo tiles with the age, each linking to the filtered age page (image13) — recommended | **Yes**: `grid-banner` (4–6 columns, `banner-card` blocks with image, heading, link, `column_span`/`row_span`, mobile swipe). Image13 is its first preset (one 2×2 banner + tiles) | `grid-banner` with `columns: 6`: either 6 tiles in one row (2 rows of 3 on mobile or swipe), or `columns: 5` with a 2×2 banner + 6 tiles exactly like image13. Each tile: photo (merchant), heading "0-6 חודשים"…, link to the filtered collection. `mk-age-pills` section stays in the code, unused | T1 | S |

## D. Reviews, newsletter, brand spotlight

| # | Note | Today (verified) | How | Tier | Effort |
|---|---|---|---|---|---|
| D1 | Pull Google reviews with an app until a review system is chosen | No app. Hyper's testimonials are static (3 placeholder cards). The sandbox cannot reach Google, and Judge.me does not import Google reviews either | Options: (a) paste real Google reviews into the testimonials blocks now (0 scripts); (b) a Google-reviews widget app (Reputon "Google Reviews", Elfsight, Trustoo): external script ~100–200 KB on every page → needs approval, costs Lighthouse points; (c) Judge.me/Yotpo later for product reviews. Recommendation: (a) now, (c) later | decision | — |
| D2 | Newsletter checkbox: aligned with the text line, not above it; smaller disclaimer; white box (image4) | Our consent row: box at the first of 3 lines (`align-items: flex-start`), text `text-base` 1.6rem, native box tinted by `accent-color` (teal on teal) | T1: `newsletter_term_size: text-sm`. T2: `align-items: center`, text 1.3rem/1.8rem, box `appearance: none` 1.8rem white with 1px dark border, dark ✓ when checked, visible focus ring | T1 + T2 | XS |
| D3 | A hidden section like image12 for one brand | Image12 = Hyper `featured-collection` with `show_banner: true` on the collection block (promotion card with image, heading, button) and tabs when several blocks | Add a `featured-collection` section to index.json (after the brands grid), **disabled**, one block = the brand's collection with its banner (image + heading + "לכל המוצרים" button), 5 columns, same look as the rows. The merchant enables it in the editor when wanted | T1 | XS |

## Packages (proposed order)

1. **Rows, header, newsletter (A1–A5, B3, B4, D2, D3 skeleton)**: settings + CSS, no decisions needed except B4's colour (default: black like the design). One commit, screenshots 390/1440.
2. **Age section (C2 or C1)**: after the choice and the 6 photos (or icons). Links are ready (same filter as the chips).
3. **"לפי גיל" mega menu (B2)**: after the structure is approved and up to 5 photos arrive. Menu via `create-menus.py --only main-menu`.
4. **Progress bar on the category slider (A2, optional core edit)** together with package 1 if approved.
5. **Reviews (D1)**: merchant decision.

## Questions

1. B1: confirm the current toys order (the list in the doc came through empty).
2. C: option C2 (6 photo tiles, with or without the big banner) or C1 (pills with icons)? Send 6 photos.
3. B2: ages column = the 6 Home groups (0-6, 6-12, 12-18 חודשים, שנה וחצי-שנתיים, 2-3, 3+)? Up to 5 photo cards?
4. B4: black band like the design, or the footer purple?
5. D1: Google reviews — (a) paste manually, (b) app (which), or (c) wait for Judge.me?
6. D3: which brand, and the banner image/heading?
