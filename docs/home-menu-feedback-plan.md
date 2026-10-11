# Home + menu feedback (merchant doc, 2026-10-11) — audit and plan

Source: the merchant's Word document "אתר חדש מקופלת - עמוד הבית ותפריט" (21 screenshots; reference
sites baby-star.co.il and kipod). Every item was checked against what Hyper 1.5.0 ships before
deciding how to build it. Tiers as in CLAUDE.md: T1 settings/JSON, T2 `mk-custom.css`, T3 new
`mk-` files, T4 logged core edit.

## A. Header and menus

| # | Request | Hyper built-in? | How | Tier | Effort |
|---|---|---|---|---|---|
| A1 | "משחקים וצעצועים" mega menu: 6 sub-menus in the order of the Google Sheet (tab "חדש - ארכיטוקטורת אתר") | Yes: columns come from the Shopify navigation; the header block already has `menu_columns: 6` | Update the `main-menu` navigation (`docs/import/menus.json` → `scripts/create-menus.py --only main-menu --execute`). Sheet columns: 1 משחקי חשיבה וקופסה (משחקי קופסה, פאזלים, משחקי חשיבה, משחקי מדע, משחקי קוביות והרכבה, משחקי קלפים, משחקי למידה, משחקים התפתחותיים, משחקים באנגלית, מגנטים, כרטיסיות, משחקי תנועה, בהשראת מונטסורי) · 2 צעצועים ובובות · 3 ערכות יצירה ואומנות · 4 לתינוקות · 5 **משחקים לכל מטרה** (new) · 6 ספרים. Today the 5th column is missing and "מונטסורי" is a 6th heading. | T1 (data) | 1h + collections below |
| A1b | Collections that do not exist yet for the sheet items | — | Column 5 needs: משחק יחידני, משחק שיתופי, משחק תחרותי, משחקי תחושה, משחקים לשחק לבד, משחקים לשחק עם ההורים, משחקים לחוץ ולחצר (there is "משחקים לחצר"), and "משחקי קוביות והרכבה" (there is "משחקי הרכבה"). Need the merchant's decision: create new automated collections (by tag/rule) or link to the closest existing ones. | T1 (data) | 0.5h once decided |
| A2 | Visual block on the left of every mega menu (desktop) with recommended products of the category; same in the mobile drawer | **Yes**: header block type `product_list` (menu item, product list picker, heading, width %, 1–3 columns, vendor/type toggles). Rendered in the desktop mega menu and in the mobile drawer (`menu-drawer-details.liquid` handles `product_list`). Position: `promotion_position` exists only on the banner block; for products the column sits at the inline-end, which in RTL is the **left**, as wanted. | Replace the 4 `promotion_banner` blocks (משחקים וצעצועים, פיתוח מיומנויות, קופסאות ומארזים, כלי בית ואקססוריז) by `product_list` blocks; merchant picks 3–4 products per menu (or we pick the first of the collection). Reduce the gap to the divider with 2 lines of CSS. | T1 + T2 | 1h |
| A3 | Small dropdowns (לפי גיל, חגים ומסיבה, מתנות): add the parent's title as a heading above the items, like a mega-menu column heading | No: Hyper's simple dropdown has no heading | Small logged edit in `snippets/desktop-menu.liquid`: print `link.title` as `dropdown__heading` above `dropdown__nav` (+ 4 lines CSS). Alternative without core edit: turn each into a one-column mega menu — rejected, it would make every item a heading. | T4 (3 lines) | 0.5h |
| A4 | "מבצעים" → "OUTLET" with the red animated sparkle | **Yes**: header block `hightlight_link` with style `star_twinkle` + colour | Rename the menu item to OUTLET (navigation), add the block with `hl_link_title: OUTLET`, colour from the design (red / `#FF5400`). Mobile drawer gets the same highlight. | T1 | 15 min |
| A5 | Cart bubble: number not centred, colour `#FF5400` | Colour: **yes**, theme setting `color_cart_bubble` (now `#ff661f`). Centring: Simpler Pro's line-height offsets the digit. | Set the colour in theme settings; 2 lines CSS (`line-height: 1`, font-size 1.2rem). | T1 + T2 | 10 min |
| A6 | A little space above the separator line in the mobile menu | No | CSS: `padding-block-start` on the first `.menu-drawer__item`. | T2 | 5 min |
| A7 | Mobile menu bottom: login + social icons row (like Hyper's own drawer) | **Yes**: already enabled (`show_social_media_icons: true`, account link). The icons do not show because **no social links are set** in Theme settings → Social media (facebook/instagram/tiktok/youtube/whatsapp fields are empty). | Merchant enters the links (or sends them to me). The footer icons (item D1) appear from the same setting. | T1 | 5 min |

## B. Home sections

| # | Request | Hyper built-in? | How | Tier | Effort |
|---|---|---|---|---|---|
| B1 | Category circles smaller (like Hyper's demo) | **Yes**: `collection-list-slider` settings `card_image_width` (medium/large/full; now `full`), `columns_desktop` (now 8), `card_heading_size` | Set `card_image_width: medium` (or `large`), try 8–10 columns; our ring/colour CSS (block 5) adapts. | T1 | 15 min |
| B2 | Slider arrows vertically centred on the circle, not on circle+label | No (Hyper centres on the whole slide) | CSS: shift `.collection-list-slider .swiper-button` up by half the label height (`top: calc(50% - 2.2rem)`). | T2 | 10 min |
| B3 | Split "המוצרים שלנו" (3 tabs) into 3 separate sections, each with heading, a sub-link "לכל המוצרים החדשים ‹" with the menu chevron icon, linking to the collection | **Yes**: three `featured-collection` sections; the section header supports `button_label` + `button_link` + `button_style: btn--plain` + `button_icon: caret-left` (same chevron as the menu). Button placement under the heading when alignment is center. | Replace `featured_tabs` by 3 sections (בסט סלרס / חדש באתר / במבצע) in `templates/index.json`, each pointing at its collection with the link. Needs the real collections (today all three use "all"). | T1 | 45 min |
| B4 | "הבחירות של אורלי" must look like every featured collection | Yes | Same settings as the three new sections (columns 5, image ratio, navigation bottom, no overflow). | T1 | 10 min |
| B5 | Product card: no border, image full card width, title max 2 lines with "…" on desktop and mobile, brand not bold, tight line spacing, round icon add-to-cart over the image (kipod / baby-star reference, "like the theme's icon") | Partly: `pcard_title_line_limit` (2-lines, already), `pcard_show_vendor`, Hyper's icon ATC exists but only on mobile (`md:hidden`) and only on hover | Rewrite CSS block 4: drop border/radius/inner margins, image edge to edge, title `-webkit-line-clamp: 2` + ellipsis, vendor weight 400, gaps 0.2–0.4rem, ATC = round 3.6rem icon button positioned at the image's bottom-start corner, always visible (desktop too), keep the dark-teal hover. Verify on Home, Collection, Product related. | T2 | 1.5h |
| B6 | House brands like baby-star: heading + "לכל המותגים ‹" link, logos in a bordered grid, 2 columns on mobile | **Yes**: `brand-logos` has `grid_bordered`, `button_label/link/style/icon`, `columns_desktop`, `columns_mobile: 2`, `swipe_on_mobile` | Settings only: `grid_bordered: true`, `columns_desktop: 6`, `image_width: medium`, button `btn--plain` + `caret-left`, mobile 2 columns no swipe. Keep our 11 logos. | T1 | 15 min |
| B7 | Reviews: pull Google reviews with an app until a review system is chosen | No (Hyper's testimonials are static) | Options: (a) keep Hyper's testimonials and paste real Google reviews manually, zero scripts; (b) an app that embeds Google reviews (Reputon / Trustoo / Elfsight), adds an external script (~100–200 KB) → needs approval per our rules and costs Lighthouse points; (c) wait for Judge.me/Yotpo which also show on the product page. Recommendation: (a) now, (c) later. | merchant decision | — |
| B8 | Newsletter: the consent text should be a checkbox | No: Hyper's newsletter has `newsletter_term` rich text only, no checkbox | Logged edit in `snippets/newsletter-form.liquid`: a required `<label><input type="checkbox" required> …text…</label>` driven by a new section setting (`consent_checkbox`), falling back to plain text when off. Shopify's customer form has no server-side consent field, so the checkbox is a client-side requirement only. | T4 (8 lines) | 30 min |
| B9 | Add the contact-info row above the footer menus (Hyper screenshot: Customer Service / Call Us / Get in Touch / Address) | **Yes**: section `multicolumn-icon` (icon + title + text per column, column dividers, `standing-column` layout); it may be placed in the footer group. | Add it to `sections/footer-group.json` above `footer` with 4 empty columns; merchant fills texts. | T1 | 15 min |
| D1 | Footer: social icons missing | Yes (`show_social: true` already) | Same cause as A7: social links empty in theme settings. | T1 | with A7 |

## C. Order of work (one commit per row, screenshots at 1440/390)

1. **Quick settings batch (T1/T2, ~2h)**: A4 OUTLET highlight, A5 bubble, A6 spacing, B1 circles, B2 arrows, B6 brands grid, B4 Orly's picks, B9 contact row, social links if the merchant sends them.
2. **Product card restyle (B5, ~1.5h)**: CSS block 4 rewrite, checked on Home / Collection / Product.
3. **Home featured sections (B3, ~45 min)** once the three collections are named.
4. **Mega menu products (A2, ~1h)** once the merchant picks products (or approves "first products of the collection").
5. **Navigation (A1, A1b)** after the decision on the missing collections.
6. **Small core edits (A3 dropdown heading, B8 consent checkbox, ~1h)**, logged in CUSTOMIZATIONS.md.

## D. Questions for the merchant (block only their own rows)

1. A1b: create the missing collections (rules/tags) or map to existing ones?
2. A2: which products per mega menu, or "first 3 products of the collection"?
3. B3: which collections are "בסט סלרס", "חדש באתר", "במבצע" (handles)?
4. A7/D1: the social profile URLs (Facebook, Instagram, TikTok, YouTube, WhatsApp).
5. B7: reviews — option (a), (b) or (c)?
6. A4: OUTLET colour: red like baby-star, or the orange `#FF5400` of the cart bubble?
