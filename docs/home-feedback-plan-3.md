# Home + menu feedback, round 3 (Word doc, 2026-10-19) — plan

Plan only. 22 notes with 18 screenshots, audited against Hyper 1.5.0, the live store and the current
JSON. Tiers: T1 settings / T2 `mk-custom.css` / T3 `mk-` files / T4 logged core edit.
Rounds 1–2: `docs/home-menu-feedback-plan.md`, `docs/home-feedback-plan-2.md`.

## A. Widgets (third-party apps)

| # | Note | Found | How | Tier |
|---|---|---|---|---|
| A1 | Accessibility button: left side, a bit lower, under the menu (desktop + mobile) | Not part of the theme: an app embed loaded from `vee-crm.com` / `cdn.nfcube.com` (Vee accessibility). The sandbox cannot load it, so I cannot see its element | Position = the app's own settings (side: left, bottom/top offset). If the app has no offset setting: a 3-line CSS override once I know its element id (send a screenshot of the app settings or the element) | app settings (+T2) |
| A2 | Nothing may sit on top of the open menu drawer or the cart drawer (chat bubble "מיקה", accessibility button) | Hyper's drawers use z-index 1 (menu) / 32 (cart); app widgets usually use 9999+ | CSS: while a drawer is open, lift the drawer and its overlay above everything (`z-index: 2147483000`), our own elements only, no change to the apps. Verified with a fake widget | T2 |

## B. Menus

| # | Note | Found | How | Tier |
|---|---|---|---|---|
| B1 | Search placeholder "מה תרצו לחפש?" | Locale `general.search.placeholder` = "מה תרצו למצוא?" | Change the string (he.json) | T1 |
| B2 | Toys mega menu: "ספרים" under "משחקים לכל מטרה" (5 columns, books below column 5) | The mega menu is a CSS grid with one column per sub-menu | `menu_columns: 5` and CSS placing the 6th group under the 5th column (`grid-column`) for this block only | T1 + T2 |
| B3 | "לפי גיל": all 12 age values like the filter (גיל לידה … 8 ומעלה) + visual items on desktop | Now 6 groups + 6 gift links; the `custom_card` block waits for photos | Menu: 12 items, each to the collection filtered by that single value; column "מתנות לפי גיל" stays. Visual: switch the block to `product_list` ("מומלצים", 3 products) so the menu is visual today; photo cards later: Customize → Header → block "לפי גיל" → Promo images 1–5 (that is where the images of the visual menus are controlled) | T1 (data + block) |
| B4 | Skills menu per the sheet: תינוקות (0-1), פעוטות (1-2), ילדים (3-5), ילדים גדולים (6+), ראשית קריאה; drop "לפי חודשים"; "על הרצף" stays on the left | 38 of the 40 sheet items are values of the skills metafield → each links to `/collections/all?filter.p.m.custom.skills=<value>`. Not values: "חיזוק חגורת כתפיים" (closest choice: "חיזוק פלג גוף עליון") and "ההמלצות של אורלי" (collection?). The screenshot cuts the sheet | Rebuild the menu from the sheet (`menus.json` → `create-menus.py`). Needs the sheet tab exported (or pasted) so nothing is misread | T1 (data) |
| B5 | Boxes menu: the 5 surprise boxes + "מארזים" | Those boxes do not exist as products yet (only "קופסה בהפתעה - יצירה וחוג עם עינב"); collection "קופסאות בהפתעה" has 1 product, "מארזי יצירה - Re-Cycle-Me" 0 | Menu items need targets: create the 5 box products (phase 5, names + prices from you) or link to the surprise-boxes collection for now | data |
| B6 | Remove the line under "חגים ומסיבה" / "מתנות" | Our dropdown heading has a bottom border (CSS block 13) | Remove the border | T2 |
| B7 | "חגים ומסיבה" as a column inside "כלי בית ואקססוריז"; "סנדלים ונעלי טרום הליכה" inside "בגדי ילדים" | Menu data | `menus.json`: move the item (8 children) under כלי בית, sandals under בגדי ילדים, home block `menu_columns: 5`; top-level item removed | T1 (data) |
| B8 | How are the images of the visual menu controlled? | — | Customize → Header → the menu's block → Promo image 1–5 (custom cards) or Product list (products' own photos) | — |
| B9 | Mobile menu bottom: footer blue `#312E7D`; login row tighter with grey `#E9E9E9` | CSS block 15 (black band) | Band `#312E7D`, white icons; login row full-width grey `#E9E9E9`, dark text, padding 1.2rem | T2 |

## C. Footer

| # | Note | Found | How | Tier |
|---|---|---|---|---|
| C1 | Contact row: 2 per row on mobile, like the designer's version | `multicolumn-icon` has `columns_mobile` (1/2/3), now 1. The designer's footer frame was never exported (only the note "opening hours on one line" in the frame map) | `columns_mobile: 2`; to match the designer's version I need the footer frame export (`docs/figma/EXPORT-CHECKLIST.md`) | T1 (+ export) |
| C2 | Second line clickable, third line removed | Block text is rich text: links allowed | Phone → `tel:`, WhatsApp → `wa.me`, address → Waze link inside the text; button labels emptied | T1 |

## D. Home

| # | Note | Found | How | Tier |
|---|---|---|---|---|
| D1 | Slider arrows centred on the circles | Offset tuned for the old 8rem circle (block 12), circles are now 12.4rem | `--swiper-navigation-top-offset: 6.2rem` | T2 |
| D2 | Featured rows on desktop: a line under the heading like the template | The template shows a sub-line (description) under the heading, link aligned to it; Hyper setting `description` per section, empty today | Fill `description` per row (text from you, e.g. "המוצרים שנכנסו השבוע" / "הכי נמכרים" / "מבצעים לזמן מוגבל"); the link row aligns to the bottom | T1 |
| D3 | Mobile: the link reads "הכל" in every row | One label per section in Hyper | CSS for < 768px: the label text replaced by "הכל" (desktop keeps the long label) | T2 |
| D4 | Age tiles: full-cover photo; option without the pill (click only); link "הכל" with caret and no underline | Cover photo already works (block → Photo). Pill is always shown | New section setting "Show labels" (off = photo only, label kept for screen readers); label "הכל", caret, no underline like the rows | T3 + T1 |
| D5 | Reviews: pick a few from Google now | google.com is unreachable from the sandbox (checked again) | You choose 3–6 reviews and send name / stars / date / text (or screenshots); I put them in the reviews section | content |
| D6 | "mekupelet_toys@" not shown | `mk-instagram` heading = the handle (the @ moves because of bidi) | Hide the text, keep the icon link; or show it as "@mekupelet_toys" correctly (say which) | T1/T2 |
| D7 | Still deliberating the age section (banner + 6 tiles) | Today: 6 tiles with photos. The banner variant = Hyper `grid-banner`, switchable later | Decide after the photos are in | — |

## Packages

1. **Settings + CSS now (A2, B1, B2, B6, B9, C1, C2, D1, D3, D4, D6)**: one commit, screenshots.
2. **Navigation data (B3, B7)** now; **B4** after the sheet tab arrives; **B5** after the box products exist.
3. **Content from the merchant**: A1 (accessibility app settings), D2 (row descriptions), D5 (reviews), C1 (footer frame export).
