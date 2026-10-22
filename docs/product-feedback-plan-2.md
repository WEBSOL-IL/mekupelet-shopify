# Product page feedback, round 2 (Word doc "עמוד מוצר - הערות", 2026-10-22) — delta plan

The document repeats the 2026-10-14 notes (its screenshots are from before packages 1–6) and adds a
few. Checked every line against the live product page (`/products/261`, 1440 + 390,
`docs/screenshots/product-feedback-2/before/`). Tiers: T1 settings / T2 `mk-custom.css` /
T3 `mk-` files / T4 logged core edit.

## Already live (from `docs/product-feedback-plan.md`, packages 1–6)

Brand line thin/grey/small · inventory wording · gift wrap as a real 3 ₪ product (the old
"3 ש״ח22%ח" property is gone) · tab spacing made uniform · "למוצרים נוספים" chips white on hover ·
recommendations and "עוד מהמותג" as Home-style carousels · feature boxes under the gallery
without frame, Hyper icons, as wide as the image · grey age chips under the short description ·
"מתאים לגיל" accordion · labels above the title with the ages in fixed colours · "תמונות אמיתיות
ששלחתם לי" and "סרטונים" sections (metafields) · mobile thumbnail strip.

## New or changed in this round

| # | Note | Live today | How | Tier |
|---|---|---|---|---|
| 1 | Brand: a little less space below it, underline on hover | 1.3rem grey, no underline at all, ~2.4rem to the title | CSS: block margin 2.4 → 1.2rem, `a:hover { text-decoration: underline }` | T2 |
| 2 | Inventory: the dot on the right and smaller, text black, only the dot coloured (Story reference) | Dot on the left (after the text), 1.2rem, text in the status colour | CSS: dot first (`order: 0`), 0.8rem, text `--mk-color-text`, dot keeps green / orange / red | T2 |
| 3 | Gift wrap text: fix the ₪ | Reads "הוספת אריזת מתנה בתוספת 3.00 ₪" (drawer too) | One-word logged edit in Hyper's `snippets/gift-wrapping.liquid` (`money` → `money_without_trailing_zeros`) → "3 ₪" | T4 (1 word) |
| 4 | Open description tab: space under the heading line and under the text | Hyper accordion content sits right under the rule | CSS: content padding-block 1.2rem 1.6rem (our description tab and Hyper's metafield tabs alike) | T2 |
| 5 | Space above "למוצרים נוספים" | 2.4rem after the last tab | CSS: 3.6rem | T2 |
| 6 | Boxes like the babysitter reference, "also BuyMe there" | 3 boxes (standard, shipping, payment) | Set 4 boxes in the `icon-with-text` block: משלוחים · איסוף עצמי · החלפות והחזרות · שוברי BuyMe (Hyper line icons: truck, map-pin, arrows-counter-clockwise, ticket/gift). Texts from you | T1 |
| 7 | "מתאים מגיל: X" with the earliest age (Story reference) | Chips list every age | Optional line "מתאים מגיל: 3 שנים" above the chips (`mk-age-chips` mode `from`, earliest value by the fixed order of the 12 ages) | T3 (small) |
| 8 | Gallery: mobile smaller like מוצצים / בייביסיטר, desktop like מוצצים | Vertical thumbs at the far left on desktop, main image + thumb strip on mobile | I cannot open those sites from here: send a screenshot of each (mobile + desktop) and I match sizes/ratios | needs input |
| 9 | Club points line ("חברי מועדון צוברים כ-11 נקודות") | Nothing (no loyalty app) | A static `text` block under the buy button is possible now; real points need the loyalty app (decision pending) | T1 / app |
| 10 | Reviews look (summary, photo, stars, pagination) | Static testimonials | Judge.me install (checklist §9e) → then the widget replaces the section | app |
| 11 | "תמונות אמיתיות ששלחתם לי" inside the accordion (Koala) | Separate section below the product | Option: an accordion tab rendering the same metafield as a photo grid (custom_liquid tab), with or without the section | T3 (small) |

## Package

1. **Now (1–5)**: CSS + the one-word gift-wrap edit, screenshots 390/1440.
2. **With your input**: 6 (box texts), 7 (yes/no), 8 (screenshots), 9 (text or app), 11 (section / tab / both).
