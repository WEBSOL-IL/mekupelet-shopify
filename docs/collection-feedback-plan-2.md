# Collection page feedback, round 2 (PDF "עמוד קולקציה הערות", 2026-10-22) — plan

Plan only. 9 notes, audited against Hyper 1.5.0, the live `/collections/משחקי-חשיבה-וקופסה` and
our round-1 work (`docs/collection-feedback-plan.md`, packages 1, 2, 5 live; package 3 = badges was
waiting on this round). Tiers: T1 settings / T2 `mk-custom.css` / T3 `mk-` files / T4 logged core edit.

| # | Note | Found | How | Tier |
|---|---|---|---|---|
| 1 | Mobile: description centred, 2–3 lines + "קרא עוד", a bit smaller | Banner block `show_description` prints `collection.description` in full. Hyper ships a `read-more` element (used by rich-text: `data-toggle-class="text-limit-N"`, toggle button with view more / view less strings) | Wrap the description in Hyper's `read-more` on mobile (3-line clamp, "קרא עוד" / "פחות" strings), centred, 1.4rem. One logged edit in `main-collection-banner.liquid` (block setting "Line limit on mobile") | T4 (small) + T2 |
| 2 | Desktop: all filter groups closed by default | `expand_filter_groups` lists 6 labels | Empty the setting in both collection templates | T1 |
| 3 | "קטגוריה" vs "קטגוריות נבחרות": only one | Two different things: **קטגוריות נבחרות** = our sub-categories box (`mk-subcategories`, the menu children of the collection, navigation); **קטגוריה** = the Search & Discovery filter on `custom.category` (narrows the current list; shows parent values such as "משחקים וצעצועים" as noise) | Recommendation: keep the sub-categories box, rename it "קטגוריות" (locale), and you delete the S&D filter "קטגוריה" (the new "סוג מוצר" filter covers the "what is it" axis). Alternative: delete our box and keep the S&D filter | T1 + S&D |
| 4 | Desktop sidebar scroll: cannot reach the last filter | Hyper's sidebar is `sticky-element` (offset 7.2rem) with no height limit: when it is taller than the viewport its bottom is unreachable until the page end | CSS: `max-height: calc(100vh - 7.2rem); overflow-y: auto` with a thin scrollbar | T2 |
| 5a | After choosing a sort, the control "stays weird" | The `<select>` keeps a thick focus outline after the click | CSS: outline only on keyboard focus (`:focus-visible`), none after a mouse click | T2 |
| 5b | Mobile: filter and sort the same size, square buttons | Filter button and sort select have different widths/heights | CSS: both `flex: 1`, height 4.4rem, same border/radius, the count below | T2 |
| 6 | Chips: how do they work, where is it controlled, show all ages | `mk-filter-chips` mirrors one S&D filter group (setting "filter group label" = מתאים לגיל) and takes the values Shopify returns for the current collection, so an age with no products in that collection is not listed. Manual chips exist as blocks | New setting "Fixed values (one per line)": the 12 ages always render, in that order; values without products link to the filtered page and show it empty. Control: Customize → collection template → section "MK Filter chips" (label, fixed values, "הכל" chip, manual chips) | T3 |
| 7 | Labels: "חדש" = last 30 days, "__% הנחה", best sellers manual / via a collection | Badges today are tag-driven (`חדש`, `רב מכר`, none in use). Every product was created in 2026-07 (import), so a 30-day rule flags nothing today and only real new products from now on. Sale badge already shows the percentage from compare-at price as "-20%" | Logged edit in `pcard-badges.liquid` + theme settings (MK group): `mk_new_days` (30) → "חדש" when `created_at` is within N days (tag stays as a manual override); percentage badge text "20% הנחה" (locale string); best seller = tag `רב מכר` **or** membership in a collection you choose (`mk_bestseller_collection`, e.g. a manual collection "רב מכר" you curate; cheap per card, no catalog loop). A smart collection cannot tag products without Shopify Flow | T4 + T1 |
| 8a | Clear button: one line, not two | `facet-clear-all` has Hyper's `btn--link` underline **and** our `text-decoration: underline` | Drop ours | T2 |
| 8b | Mobile: remove the line under the toolbar, make the chip smaller | Our round-1 divider (E2) and chip size | Remove the border, chip 3.2rem / 1.3rem | T2 |
| 9 | Background image on some collections only | Already built in round 1: template `collection.mk-banner` + collection metafield `foxtheme.collection_banner` (falls back to the collection image). Without the template the page shows the plain title | Nothing to build: per collection choose Theme template `mk-banner` and upload the banner to the metafield (`docs/merchant-checklist.md` rows "תמונת רקע לקולקציה"). If you prefer "no image = no banner" on the default template instead of a second template, that is one setting change | — |

## Packages

1. **CSS + settings (2, 4, 5a, 5b, 8a, 8b)**: one commit, 390/1440 screenshots.
2. **Description read-more (1)** and **chips fixed values (6)**: small code, same day.
3. **Badges (7)**: logged core edit + settings; needs the collection handle for best sellers (or tag only).
4. **Merchant**: delete the S&D filter "קטגוריה" (3), curate the best-seller collection or tags (7), templates/images for banner collections (9).
