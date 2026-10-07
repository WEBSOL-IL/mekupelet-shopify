# Figma design tokens (approved revision)

Extracted by script from `docs/figma/file.json` (REST `GET /v1/files`, geometry=paths). Scope: revision frames Home `18:4094`, Product `52:5172`, Collection `69:5443`, header/mega-menu `1:806`, and the mobile originals Home `1:7075`, Product `1:10570`, Collection `1:7815`. The originals `1:266`, `1:1794`, `1:949` were extracted separately only for the "original vs revision" comparison. Counts are node counts (every node that carries the value), so repeated card instances inflate them; use them as relative weight only.

Conventions: hex is `#RRGGBB`, `@NN%` is the paint opacity when < 100%. "fill / stroke / text" columns count nodes whose solid fill, stroke, or text fill uses the color. Frames column: Home, Prod, Coll, Hdr (desktop revision), mHome/mProd/mColl (mobile originals).

The file has **no shared styles** (`styles: {}` at the root) and only 9 local components (`header`, a few product-card and blog-card groups). All values below are per-node; there are no text styles or color styles to map 1:1, so Hyper theme settings / CSS variables will be the first place these tokens get names.

## 1. Colors

### 1.1 All colors found (sorted by usage)

| Color | fill | stroke | text | frames | example nodes |
|---|---|---|---|---|---|
| `#1C1C1C` | 223 | 12 | 288 | Home, Prod, Coll, Hdr, mHome, mProd, mColl | VECTOR Down_Arrow_3_; TEXT "מובילים"; TEXT "חדש באתר"; TEXT "במבצע" |
| `#FFFFFF` | 169 | 0 | 154 | Home, Prod, Coll, Hdr, mHome, mProd, mColl | TEXT "אשל 5, מושב ניר צבי"; TEXT "077-7804800"; TEXT "sales@mekupelet.co.il"; TEXT "שעות פתיחה: א’-ה’: 10:" |
| `#000000` | 56 | 60 | 148 | Home, Prod, Coll, Hdr, mHome, mProd, mColl | TEXT "פיתוח מיומנויות"; TEXT "הכי נמכרים"; TEXT "הכי חדש"; TEXT "מחיר מהנמוך לגבוה" |
| `#9B9B9B` | 1 | 38 | 65 | Home, Prod, Coll, mHome, mProd, mColl | TEXT "Moulim Roty"; TEXT "₪ 139"; stroke:LINE Line 8; REGULAR_POLYGON Polygon 1 |
| `#6B6B6B` | 6 | 0 | 70 | Home, Prod, Coll, Hdr, mHome, mProd, mColl | TEXT "11.06.2025"; TEXT "חיפוש"; TEXT "קטגוריה > תת־קטגוריה >"; TEXT "דף הבית > קטגוריה ראשי" |
| `#3B0D15` | 39 | 15 | 14 | Home, Prod, Coll, mHome, mProd | TEXT "חדש"; TEXT "בסט סלר"; VECTOR Vector; stroke:VECTOR Vector |
| `#E0E0E0` | 0 | 65 | 0 | Home, Prod, Coll, Hdr, mHome, mProd, mColl | stroke:FRAME Frame 52; stroke:FRAME Frame 53; stroke:FRAME Frame 54; stroke:FRAME Frame 57 |
| `#E66277` | 45 | 2 | 16 | Home, Prod, mHome, mProd, mColl | stroke:ELLIPSE Ellipse 19; ELLIPSE Ellipse 21; FRAME Frame 31; stroke:RECTANGLE Rectangle 40 |
| `#353535` | 18 | 3 | 37 | Home, Prod, Coll, Hdr, mHome, mProd | TEXT "קטגוריות נבחרות"; TEXT "בגדי ילדים"; TEXT "כלי אוכל"; TEXT "ספרים" |
| `#DDDDDD` | 20 | 38 | 0 | Home, Prod, Coll, Hdr, mHome, mProd | stroke:ELLIPSE Ellipse 5; stroke:RECTANGLE Rectangle 29; stroke:RECTANGLE Rectangle 22; stroke:RECTANGLE Rectangle 23 |
| `#007F94` | 45 | 1 | 1 | Home, Prod, Coll | stroke:ELLIPSE Ellipse 13; FRAME Frame 61; ELLIPSE Ellipse 15; FRAME Frame 53 |
| `#FFBF00` | 46 | 1 | 0 | Home, Prod, Coll | stroke:ELLIPSE Ellipse 19; VECTOR Vector; RECTANGLE Rectangle 30; RECTANGLE Rectangle 51 |
| `#FF5400` | 38 | 1 | 4 | Home, Prod, Coll | RECTANGLE Rectangle 34; TEXT "₪ 139"; RECTANGLE Rectangle 30; VECTOR Vector |
| `#FF75BA` | 31 | 1 | 0 | Home, Prod, Coll | VECTOR Vector; stroke:VECTOR Vector; RECTANGLE Rectangle 30; RECTANGLE Rectangle 51 |
| `#FFC010` | 24 | 0 | 0 | Home, Prod | VECTOR Vector |
| `#8FC597` | 20 | 0 | 0 | Prod, Coll, mProd | ELLIPSE Ellipse 22 |
| `#312E7D` | 18 | 0 | 0 | Home, Prod, Coll | RECTANGLE Rectangle 15; VECTOR Vector; VECTOR Icon_11_ |
| `#275A7A` | 18 | 0 | 0 | Prod, mProd | VECTOR Vector |
| `#008094` | 14 | 2 | 1 | Home, Prod, Coll | RECTANGLE Rectangle 73; TEXT "שם מלא"; RECTANGLE Rectangle 33; FRAME Frame 32 |
| `#DFDFDF` | 0 | 17 | 0 | Home, mHome | stroke:RECTANGLE Rectangle 3; stroke:RECTANGLE Rectangle 58; stroke:RECTANGLE Rectangle 62; stroke:RECTANGLE Rectangle 59 |
| `#EDEDED` | 0 | 17 | 0 | Prod, mProd | stroke:RECTANGLE Rectangle 12; stroke:RECTANGLE Rectangle 14; stroke:LINE Line 15; stroke:LINE Line 22 |
| `#FFE1D5` | 15 | 0 | 0 | mHome, mProd, mColl | FRAME Frame 51 |
| `#F9EDE8` | 10 | 0 | 0 | mHome, mProd | ELLIPSE Ellipse 13; ELLIPSE Ellipse 14; ELLIPSE Ellipse 15; RECTANGLE Rectangle 41 |
| `#3BD6D9` | 8 | 0 | 0 | Home, Prod, Coll | VECTOR Vector; RECTANGLE Rectangle 51 |
| `#F4F4F4` | 2 | 6 | 0 | Prod, Coll, mProd | stroke:LINE Line 14; stroke:LINE Line 15; stroke:LINE Line 16; FRAME Frame 247 |
| `#E9E9E9` | 7 | 0 | 0 | Home, Prod, Coll, Hdr, mHome, mProd, mColl | RECTANGLE Rectangle 1 |
| `#F5F5F5` | 7 | 0 | 0 | Prod | RECTANGLE Rectangle 44; RECTANGLE Rectangle 47; RECTANGLE Rectangle 48; VECTOR Vector |
| `#DBDCE0` | 0 | 6 | 0 | Prod, mProd | stroke:FRAME Frame 54; stroke:LINE Line 19; stroke:LINE Line 20 |
| `#F8F8F8` | 6 | 0 | 0 | Coll | RECTANGLE Rectangle 53; RECTANGLE Rectangle 57; RECTANGLE Rectangle 70; RECTANGLE Rectangle 71 |
| `#FCFCFC` | 5 | 0 | 0 | Prod, Coll, mHome, mProd, mColl | RECTANGLE Rectangle 15 |
| `#F8CF6A` | 5 | 0 | 0 | mHome | VECTOR Vector |
| `#EE8EBA` | 4 | 0 | 0 | Home, Prod | VECTOR Vector |
| `#FFFFFF @0%` | 4 | 0 | 0 | Home | RECTANGLE Rectangle 29 |
| `#3F3F3F` | 0 | 0 | 4 | Home, Prod, Coll, Hdr | TEXT "והי עובדה מבוססת שדעתו" |
| `#8761E8` | 4 | 0 | 0 | Home, Prod, Coll | VECTOR Vector |
| `#C1C0C0` | 0 | 4 | 0 | Prod | stroke:VECTOR Rectangle 49; stroke:VECTOR Rectangle 55; stroke:VECTOR Rectangle 53; stroke:VECTOR Rectangle 54 |
| `#67DBDE` | 4 | 0 | 0 | Coll | FRAME Frame 51 |
| `#838683` | 3 | 1 | 0 | mHome, mProd, mColl | VECTOR Down_Arrow_3_; stroke:RECTANGLE Rectangle 29 |
| `#E2E2E2` | 4 | 0 | 0 | mHome, mProd | RECTANGLE Rectangle 119; RECTANGLE Rectangle 120 |
| `#FFBF00 @25%` | 3 | 0 | 0 | Home, Prod | FRAME Frame 51 |
| `#67DBDE @25%` | 3 | 0 | 0 | Home, Prod | FRAME Frame 51 |
| `#00BA57` | 3 | 0 | 0 | Home, Prod | RECTANGLE Rectangle 30; RECTANGLE Rectangle 51 |
| `#353535 @0%` | 3 | 0 | 0 | Home, Prod, Coll | VECTOR Vector |
| `#F7F7F7` | 3 | 0 | 0 | Prod, mHome, mProd | RECTANGLE Rectangle 30; RECTANGLE Rectangle 14 |
| `#FF5400 @25%` | 2 | 0 | 0 | Home, Prod | FRAME Frame 51 |
| `#FF6920` | 1 | 1 | 0 | Home | FRAME Frame 52; stroke:FRAME Frame 52 |
| `#3BD6D9 @73%` | 2 | 0 | 0 | Home, Prod | RECTANGLE Rectangle 30 |
| `#000000 @20%` | 2 | 0 | 0 | Prod, Hdr | RECTANGLE Rectangle 15; RECTANGLE Rectangle 50 |
| `#5A5C74` | 0 | 0 | 2 | Prod, mProd | TEXT "על סמך 107 חוות דעת" |
| `#C1C1C1` | 0 | 0 | 2 | Coll | TEXT "99 999 ₪"; TEXT "0 ₪" |
| `#3D4753` | 2 | 0 | 0 | mHome | VECTOR Vector |
| `#4CAF50` | 1 | 0 | 1 | mProd | TEXT "במלאי"; VECTOR Vector |
| `#FF5500` | 1 | 0 | 0 | Home | FRAME Frame 52 |
| `#FF75BA @25%` | 1 | 0 | 0 | Home | FRAME Frame 51 |
| `#008298` | 1 | 0 | 0 | Home | FRAME Frame 31 |
| `#8761EB` | 1 | 0 | 0 | Home | RECTANGLE Rectangle 51 |
| `#00B255` | 1 | 0 | 0 | Prod | FRAME Frame 232 |
| `#FEFEFE` | 0 | 0 | 1 | Prod | TEXT "במלאי" |
| `#C0C0C0` | 0 | 1 | 0 | Prod | stroke:FRAME Frame 53 |
| `#70E1E3` | 1 | 0 | 0 | Coll | RECTANGLE Rectangle 69 |
| `#F3F3F3` | 1 | 0 | 0 | mHome | RECTANGLE Rectangle 36 |
| `#EC8155` | 1 | 0 | 0 | mProd | ELLIPSE Ellipse 26 |
| `#E6F7E7` | 1 | 0 | 0 | mProd | FRAME Frame 232 |
| `#FAFAFA` | 1 | 0 | 0 | mProd | VECTOR Vector |

### 1.2 Candidate roles (revision)

Derived from where each color sits in the tree (buttons, badges, cards, text). Where the revision is inconsistent, every variant is listed; the merchant/designer must pick one.

| Role | Value(s) in revision | Evidence | Note |
|---|---|---|---|
| Page background | `#FFFFFF` | frame fills of all three revision frames; card fills | — |
| Surface, light gray | `#F8F8F8` (Collection filter panels), `#F5F5F5` (Product thumbnails / USP icon bg), `#F7F7F7` (gallery bg), `#E9E9E9` (announcement bar) | Collection `Rectangle 53/57/70` 304px filter boxes; Product `Rectangle 44/47/48`; header `Rectangle 1` 1440x53 | 4 near-identical grays; propose 2 tokens (surface-1 `#F8F8F8`, surface-2 `#E9E9E9`) |
| Text primary | `#1C1C1C` (288 text nodes) and `#000000` (148 text nodes) | `#1C1C1C`: product titles, prices, nav items, body; `#000000`: Collection sidebar/sort text, product description | Two blacks used interchangeably; recommend one (`#1C1C1C`), flag to designer |
| Text secondary | `#6B6B6B` (dates, breadcrumbs, search placeholder), `#9B9B9B` (brand name on card, compare-at price, "139 ₪" in Collection), `#353535` (section titles, category labels, header search text), `#3F3F3F` (announcement bar text), `#5A5C74` ("על סמך 107 חוות דעת") | see examples in 1.1 | 5 grays for secondary text; propose 2 (muted `#6B6B6B`, subtle `#9B9B9B`) and map `#353535` to primary or headings |
| Heading color | `#353535` on Home section titles (`קטגוריות נבחרות`, `ביקורות`, `חדשים באתר?`), `#000000` on Collection title `תחפושות`, `#1C1C1C` elsewhere | TEXT nodes 32px/700 | inconsistent heading color between templates |
| Primary action (designer note: "blue") | `#007F94` (Product buy button `Frame 61` 406x44, `השאר משוב` button, `הוסף לעגלה` card button `Rectangle 73` 84x28, Collection selected-dot), `#008094` (Home `הצג את כל המותגים` button, surprise-box CTA `Rectangle 33`, `הוסף לעגלה` on Home cards), `#008298` (Home finder button `מצאו לי מוצרים` `Frame 31`) | 47 + 17 + 1 nodes | Three teal-blues within 1-2 units of each other: treat as ONE token `#007F94` (most used). The original used coral `#E66277` for all of these. |
| Primary action text | `#FFFFFF` | all button labels | — |
| Price highlight / sale price | `#FF5400` text on 4 price nodes (`₪ 139` sale price, `345 פריטים` item count) | Home/Product/Collection | sale price is orange, regular price `#1C1C1C`, compare-at `#9B9B9B` |
| Badge: new (`חדש`) | `#FFBF00` solid (Collection, r=4/15) or `#FFBF00 @25%` (Home/Product, pill r=60); text `#3B0D15` | `Frame 51` 44x25 | opacity and radius differ between templates |
| Badge: sale (`20% הנחה`) | `#FF5400` solid (Collection r=4) / `#FF5400 @25%` (Home, Product pill r=60); ALSO `#FF75BA` solid r=15 on the Product page main badge `52:5221` and `#FF75BA @25%` on one Home card `49:4469`; text `#1C1C1C` | `Frame 51` / `Frame 224` 67x25 | orange vs pink conflict, must be resolved |
| Badge: bestseller (`בסט סלר`) | `#67DBDE` solid (Collection r=4) / `#67DBDE @25%` (Home/Product pill r=60); text `#3B0D15` | `Frame 51` 60x25 | same opacity/radius inconsistency as the others |
| Badge text | `#3B0D15` (new, bestseller), `#1C1C1C` (sale) | 12px / 600 | dark-maroon badge text is a holdover from the original palette |
| Wishlist heart | icon `#1C1C1C` inside a 32x32 circle, stroke `#E0E0E0` 1px, no fill (default); active state = circle filled `#FF5500` (Home `18:4172`) or `#FF6920` fill+stroke (Home `49:4471`) with a white heart | `Frame 52` 32x32 r=80 | two different "active" oranges; pick one. Designer note says heart gets a new color: the only new color in the tree is this orange. |
| Review stars | `#FFBF00` (Home and Product reviews, `fi_2893811`, 15 nodes each); the newsletter illustration uses a near-duplicate `#FFC010` | `fi_2893811` 16x16 | original was `#F8CF6A` (Home) / `#E66277` (Product); mobile originals still show the old colors. Use `#FFBF00` everywhere. |
| Rating / availability dots | `#007F94` (selected), `#8FC597` (green = in stock), `#DDDDDD`, `#9B9B9B` stroke ring | Collection card color swatches `Ellipse 21-24` | in the original these were `#E66277` |
| In-stock pill | `#00B255` bg (`Frame 232` 57x24 r=40), text `#FEFEFE` (`במלאי`); low-stock dot `#FF5400` 8px (`נותרו 5 יחידות`); mobile uses `#4CAF50` / `#E6F7E7` | Product buy box | — |
| Borders, light | `#E0E0E0` 1px (icon circles, Collection filter dividers, header bottom `Line 9`, sort/filter chips), `#DDDDDD` 1px (product-card containers, search box, review cards, slider arrow circles), `#DFDFDF` 1px (brand tiles), `#EDEDED` 1px (Product accordions), `#C1C0C0` (Product complementary-card containers), `#DBDCE0` (qty stepper) | 65 + 38 + 17 + 17 + 4 + 6 stroke nodes | 6 near-identical grays; propose 2 tokens: border `#DDDDDD`, divider `#E0E0E0` |
| Nav / mega menu | panel `#FFFFFF` with drop shadow 0 4 4 `#000 @25%` (`1:874`), promo tile overlay `#000000 @20%` r=10 | `1:806` | designer note: replace the shadow with a gray border, no shadow |
| Newsletter band | `#3BD6D9 @73%` bg, title `#353535`, input `#FFFFFF`, checkbox stroke `#353535` | `Group 76` | in the original the band was the same cyan; unchanged |
| Footer | bg `#312E7D`, text `#FFFFFF`, social icons `#312E7D` glyph on white circle | `Group 138` 1440x375 | unchanged from original |
| Age pills (Home "רכישה לפי גיל") | `#00BA57`, `#FF5400`, `#FFBF00`, `#8761EB`, `#FF75BA`, `#3BD6D9` (one per pill), text `#FFFFFF` 20px | `Rectangle 51` 316x70 r=50 | 6 decorative brand colors; store as a small palette, not as semantic tokens |
| Category circle rings | stroke 1px `#007F94`, `#FFBF00`, `#008094`, `#E66277`, `#FF5400` (one per circle) | `Ellipse 13/18/19/20` 217px | same decorative palette; note `#E66277` (old primary) survives here |
| USP tile icons | `#3BD6D9`, `#FF75BA` (vector icons), tiles themselves have no fill, r=30 | `Layer_1` 79x84, 73x81 | icons are multi-color PNG/SVG, see 8. |
| Logo colors (new softened logo `Layer_1` 211x61) | `#8761E8`, `#3BD6D9` + others | `69:4762`, `69:7500` | export as SVG, do not re-color |

### 1.3 Original → revision color changes (desktop frames only)

| Change | Original | Revision |
|---|---|---|
| Primary action | `#E66277` coral (84 nodes) | `#007F94` / `#008094` / `#008298` teal-blue (`#E66277` drops to 2 nodes: one category ring, one Product color swatch) |
| Badge new | `#FCEECD` pale yellow | `#FFBF00` amber (solid or @25%) |
| Badge sale | `#FFE1D5` pale peach | `#FF5400` orange (solid or @25%), with a stray `#FF75BA` pink |
| Badge bestseller | `#DEF3F1` pale mint | `#67DBDE` cyan (solid or @25%) |
| Stars | `#F8CF6A` (Home), `#E66277` (Product) | `#FFBF00` |
| Product card | no container | bordered container `#DDDDDD` 1px r=10 (Home), `#C1C0C0` 1px r=10 + shadow (Product), `#DDDDDD` 1px r=10 (+ shadow on one) (Collection) |
| Wishlist active | not designed | `#FF5500` / `#FF6920` filled circle |
| Category circles | flat `#F9EDE8` fill (mobile) / image only (desktop) | 1px colored ring per circle |
| Age buttons | 6 outlined/gray buttons in a `#F3F3F3` band | 6 solid colored pills, no band |
| Footer social icons | `#1C1C1C` glyphs | `#312E7D` glyph on white circle |
| Colors gone | `#FCEECD`, `#DEF3F1`, `#F9EDE8`, `#F8CF6A`, `#FFE1D5` | — |

## 2. Typography

### 2.1 Font families

| Family | PostScript name | Weight | TEXT nodes (all 7 frames) | Where |
|---|---|---|---|---|
| SimplerPro_HLAR | SimplerPro_HLAR-Regular | 400 | 458 | everywhere |
| SimplerPro_HLAR | SimplerPro_HLAR-Semibold | 600 | 206 | everywhere |
| SimplerPro_HLAR | SimplerPro_HLAR-Bold | 700 | 136 | everywhere |
| 42dot Sans | (none, missing font) | 400 | 10 | Home revision only: 6 USP labels, surprise-box title (40px) + description + CTA label |
| Playfair Display | PlayfairDisplay-Bold | 700 | 1 | mobile Product only: `חוות דעת של לקוחות` (1:10759), clearly a leftover |

Notes:
- `SimplerPro_HLAR` (Simpler Pro, Hebrew/Latin, by Fontef) in Regular 400 / Semibold 600 / Bold 700 is the only real typeface. It is a commercial font: the merchant must confirm a web license and supply the woff2 files (3 weights, 2 files max to preload).
- `42dot Sans` has no PostScript name in the file, i.e. the font is not installed in the designer's Figma and renders as a fallback. The 9 nodes using it (USP labels, surprise-box copy) are almost certainly meant to be Simpler Pro 16/400 and 40/700; confirm with the designer.
- `textCase: UPPER` is set on 612 text nodes (desktop + mobile) and `TITLE` on 12. It has no effect on Hebrew but WOULD uppercase Latin strings such as `Moulim Roty`, `Kooglo`, `sales@mekupelet.co.il`, `3+ years`. Treat as a Figma artefact; do not implement `text-transform: uppercase`.
- Letter spacing is 0 everywhere. Line height is mostly `auto` (intrinsic); explicit values appear only on multi-line body copy and category/filter labels (listed below).

### 2.2 RTL evidence

| | RIGHT | CENTER | LEFT | autoResize WIDTH_AND_HEIGHT | HEIGHT | fixed |
|---|---|---|---|---|---|---|
| desk | 485 | 116 | 1 | 428 | 128 | 46 |
| mob | 144 | 61 | 1 | 123 | 76 | 7 |

`textAlignHorizontal: RIGHT` dominates (485 desktop / 144 mobile); CENTER is used for nav items, section titles, buttons, review cards and badges; LEFT appears once per set (`ניקוי` clear-filters link in Collection, which is at the left end of the filter bar, and one mobile node). Page layouts are mirrored (logo/nav start at the right edge, search/account icons at the left), i.e. a proper RTL design, not a flipped LTR one. Layout direction is also visible in the header: `Frame 27` (account/wishlist/cart icons) sits at x=64 (left) and the search box `Group 98` at x=1117..1376 (right); nav text runs right-to-left from x=1287.

### 2.3 Desktop combinations (Home, Product, Collection, Header)

| Family | Weight | Size | Line height | Count | Frames | Example nodes | Suggested role |
|---|---|---|---|---|---|---|---|
| SimplerPro_HLAR | 400 | 16 | auto | 200 | Home 33, Prod 61, Coll 105, Hdr 1 | TEXT "אשל 5, מושב ניר צבי"; TEXT "sales@mekupelet.co.il"; TEXT "שעות פתיחה: א’-ה’: 10:" | body / footer links / filter labels |
| SimplerPro_HLAR | 400 | 14 | auto | 110 | Home 10, Prod 24, Coll 25, Hdr 51 | TEXT "Moulim Roty"; TEXT "חיפוש"; TEXT "קטגוריה > תת־קטגוריה >" | small body: brand name, breadcrumb, sort options, finder selects, search |
| SimplerPro_HLAR | 600 | 12 | auto | 56 | Home 14, Prod 11, Coll 31 | TEXT "חדש"; TEXT "הוסף לעגלה"; TEXT "20% הנחה" | badge + card button label |
| SimplerPro_HLAR | 600 | 16 | auto | 48 | Home 8, Prod 4, Coll 36 | TEXT "₪ 139"; TEXT "קוביות עץ מגנטיות צבעו"; TEXT "139 ₪" | card title + price |
| SimplerPro_HLAR | 700 | 14 | auto | 42 | Home 11, Prod 11, Coll 11, Hdr 9 | TEXT "בלוג"; TEXT "הדרכת הורים"; TEXT "מבצעים" | mobile nav/footer title, button |
| SimplerPro_HLAR | 600 | 14 | auto | 29 | Home 14, Prod 7, Hdr 8 | TEXT "קוביות עץ מגנטיות צבעו"; TEXT "מצאו לי מוצרים"; TEXT "גיל" | button label (finder, show all brands, buy), card title (Home) |
| SimplerPro_HLAR | 700 | 20 | auto | 21 | Home 4, Prod 8, Coll 8, Hdr 1 | TEXT "חשוב לדעת"; TEXT "Winter Sale" | footer heading / mega-menu promo |
| SimplerPro_HLAR | 400 | 20 | auto | 10 | Home 7, Prod 3 | TEXT "הירשמו לניוזלטר ותהנו "; TEXT "שנתיים-שלוש (2-3)"; TEXT "3+ years (3+)" | age pill label, newsletter subtitle, product price |
| SimplerPro_HLAR | 700 | 24 | auto | 8 | Home 2, Prod 4, Coll 2 | TEXT "077-7804800"; TEXT "חדשים באתר?" | newsletter title, footer phone |
| 42dot Sans | 400 | 16 | auto | 8 | Home 8 | TEXT "משלוח עד הבית"; TEXT "ייעוץ אישי בוואטסאפ"; TEXT "משחקים שנבחרו בקפידה" | USP label (font fallback, see note) |
| SimplerPro_HLAR | 700 | 32 | auto | 7 | Home 5, Prod 2 | TEXT "ביקורות"; TEXT "רכישה לפי גיל"; TEXT "המוצרים שלנו" | section title (h2) |
| SimplerPro_HLAR | 400 | 16 | 24px | 6 | Home 4, Prod 2 | TEXT "משחקי מדע הם כלי חינוכ"; TEXT "אני מסכים/ה לקבל הודעו" | review body, consent text |
| SimplerPro_HLAR | 700 | 16 | 24px | 6 | Home 3, Prod 3 | TEXT "שם מלא" | mobile section title (h2) |
| SimplerPro_HLAR | 400 | 14 | 20px | 6 | Home 3, Prod 3 | TEXT "11.06.2025" | review date |
| SimplerPro_HLAR | 600 | 16 | 26px | 6 | Prod 6 | TEXT "תיאור פריט"; TEXT "מדד מקופלת להתפתחות הי"; TEXT "מתאים לגיל" | product accordion title |
| SimplerPro_HLAR | 700 | 16 | 40px | 6 | Coll 6 | TEXT "קטגוריות נבחרות"; TEXT "גיל"; TEXT "מותג" | filter group title (Collection) |
| SimplerPro_HLAR | 600 | 20 | 40px | 5 | Home 5 | TEXT "בגדי ילדים"; TEXT "כלי אוכל"; TEXT "ספרים" | category label under circles |
| SimplerPro_HLAR | 400 | 15 | auto | 5 | Coll 5 | TEXT "Jabadabado"; TEXT "מותג:"; TEXT "0–3 months" | active filter chip |
| SimplerPro_HLAR | 400 | 12 | auto | 4 | Coll 4 | TEXT "from"; TEXT "to"; TEXT "99 999 ₪" | price range from/to |
| SimplerPro_HLAR | 700 | 32 | 40px | 3 | Home 2, Coll 1 | TEXT "קטגוריות נבחרות"; TEXT "תחפושות" | section / collection title (h2) with explicit LH |
| SimplerPro_HLAR | 400 | 14 | 24px | 3 | Prod 3 | TEXT "1"; TEXT "2"; TEXT "3" |  |
| SimplerPro_HLAR | 400 | 16 | 26px | 3 | Prod 3 | TEXT "והי עובדה מבוססת שדעתו" | review text (PDP) |
| SimplerPro_HLAR | 400 | 14 | 18px | 3 | Prod 3 | TEXT "מוצרים בתקן אירופאי / "; TEXT "משלוח מהיר וחינם בקניי"; TEXT "אפשרויות תשלום נוחות ו" | product USP strip |
| SimplerPro_HLAR | 700 | 16 | auto | 1 | Home 1 | TEXT "חדש באתר" |  |
| 42dot Sans | 400 | 40 | 40px | 1 | Home 1 | TEXT "קופסת ההפתעה של מקופלת" | surprise-box title (font fallback, see note) |
| SimplerPro_HLAR | 600 | 20 | 30px | 1 | Prod 1 | TEXT "קוביות עץ מגנטיות צבעו" | product title (PDP) |
| SimplerPro_HLAR | 600 | 20 | auto | 1 | Prod 1 | TEXT "₪ 139" |  |
| SimplerPro_HLAR | 700 | 48 | auto | 1 | Prod 1 | TEXT "4.7" | rating number (4.7) |
| SimplerPro_HLAR | 400 | 16 | 40px | 1 | Coll 1 | TEXT "מיון" |  |
| SimplerPro_HLAR | 600 | 16 | 40px | 1 | Coll 1 | TEXT "345 פריטים" |  |

### 2.4 Mobile combinations (1:7075, 1:10570, 1:7815)

| Family | Weight | Size | Line height | Count | Frames | Example nodes | Suggested role |
|---|---|---|---|---|---|---|---|
| SimplerPro_HLAR | 400 | 14 | auto | 34 | mHome 21, mProd 7, mColl 6 | TEXT "אשל 5, מושב ניר צבי"; TEXT "sales@mekupelet.co.il"; TEXT "שעות פתיחה: א’-ה’: 10:" | small body: brand name, breadcrumb, sort options, finder selects, search |
| SimplerPro_HLAR | 400 | 10 | auto | 32 | mHome 8, mProd 8, mColl 16 | TEXT "Moulim Roty"; TEXT "139 ₪"; TEXT "אפשרויות תשלום נוחות ו" | mobile small text (brand, price, USP) |
| SimplerPro_HLAR | 400 | 12 | auto | 21 | mHome 1, mProd 14, mColl 6 | TEXT "והי עובדה מבוססת שדעתו"; TEXT "דף הבית > קטגוריה ראשי"; TEXT "נותרו 5 יחידות" | price range from/to |
| SimplerPro_HLAR | 700 | 14 | auto | 16 | mHome 8, mProd 4, mColl 4 | TEXT "חשוב לדעת"; TEXT "מצאו לי מוצרים"; TEXT "הצג את כל המותגים" | mobile nav/footer title, button |
| SimplerPro_HLAR | 600 | 10 | auto | 16 | mHome 4, mProd 4, mColl 8 | TEXT "139 ₪"; TEXT "משלוח חינם בכל הזמנה מ"; TEXT "המומלצים של טליה" |  |
| SimplerPro_HLAR | 600 | 8 | auto | 15 | mHome 4, mProd 3, mColl 8 | TEXT "20% הנחה" | mobile badge |
| SimplerPro_HLAR | 600 | 10 | 14px | 14 | mHome 4, mProd 2, mColl 8 | TEXT "קוביות עץ מגנטיות צבעו" | mobile card title |
| SimplerPro_HLAR | 700 | 16 | 24px | 8 | mHome 7, mProd 1 | TEXT "קטגוריות נבחרות"; TEXT "מותגי הבית"; TEXT "mekupelet_toys" | mobile section title (h2) |
| SimplerPro_HLAR | 400 | 12 | 20px | 6 | mHome 2, mProd 4 | TEXT "11.06.2025"; TEXT "אני מסכים/ה לקבל הודעו" |  |
| SimplerPro_HLAR | 400 | 16 | auto | 6 | mHome 6 | TEXT "0-6 חודשים"; TEXT "שנה וחצי (1.5-2)"; TEXT "6-12 חודשים" | body / footer links / filter labels |
| SimplerPro_HLAR | 600 | 14 | 26px | 6 | mProd 6 | TEXT "תיאור פריט"; TEXT "משלוחים, החזרות והחלפו"; TEXT "מדד מקופלת להתפתחות הי" |  |
| SimplerPro_HLAR | 600 | 14 | auto | 4 | mHome 1, mProd 3 | TEXT "עבור לקטגוריה"; TEXT "₪ 139"; TEXT "קנה עכשיו" | button label (finder, show all brands, buy), card title (Home) |
| SimplerPro_HLAR | 700 | 14 | 24px | 4 | mHome 1, mProd 3 | TEXT "שם מלא" |  |
| SimplerPro_HLAR | 700 | 12 | auto | 4 | mHome 1, mProd 2, mColl 1 | TEXT "האימייל שלך"; TEXT "והי עובדה מבוססת שדעתו" |  |
| SimplerPro_HLAR | 700 | 20 | auto | 3 | mHome 1, mProd 1, mColl 1 | TEXT "077-7804800" | footer heading / mega-menu promo |
| SimplerPro_HLAR | 400 | 12 | 18px | 3 | mProd 3 | TEXT "והי עובדה מבוססת שדעתו" |  |
| SimplerPro_HLAR | 400 | 12 | 24px | 3 | mProd 3 | TEXT "3"; TEXT "2"; TEXT "1" |  |
| SimplerPro_HLAR | 400 | 14 | 22px | 2 | mHome 2 | TEXT "זוהי עובדה מבוססת שדעת"; TEXT "משחקי מדע הם כלי חינוכ" |  |
| SimplerPro_HLAR | 700 | 16 | auto | 2 | mHome 1, mProd 1 | TEXT "חדשים באתר?" |  |
| SimplerPro_HLAR | 600 | 24 | 30px | 1 | mHome 1 | TEXT "מבצע מיוחד על צעצועים " | mobile promo banner title |
| SimplerPro_HLAR | 600 | 16 | 24px | 1 | mProd 1 | TEXT "קוביות עץ מגנטיות צבעו" |  |
| SimplerPro_HLAR | 600 | 12 | auto | 1 | mProd 1 | TEXT "במלאי" | badge + card button label |
| Playfair Display | 700 | 16 | auto | 1 | mProd 1 | TEXT "חוות דעת של לקוחות" |  |
| SimplerPro_HLAR | 700 | 36 | auto | 1 | mProd 1 | TEXT "4.7" | mobile rating number |
| SimplerPro_HLAR | 700 | 16 | 40px | 1 | mColl 1 | TEXT "תחפושות" | filter group title (Collection) |
| SimplerPro_HLAR | 600 | 12 | 40px | 1 | mColl 1 | TEXT "345 פריטים" |  |

### 2.5 Proposed type scale

| Token | Desktop | Mobile | Weight |
|---|---|---|---|
| h1 (surprise box / hero title) | 40/40 | 24/30 | 700 |
| h2 section title | 32/40 | 16/24 | 700 |
| h3 (newsletter title, product title) | 24 / 20/30 | 16/24 | 700 / 600 |
| nav / column title | 14 | 12-14 | 700 |
| body | 16/24 | 14/22 | 400 |
| body small | 14/20 | 12/18 | 400 |
| caption / badge | 12 | 8-10 | 600 |
| price | 16-20 | 10-14 | 600 |

Mobile sizes in the originals are very small (8px badges, 10px brand/price). Assumption for implementation: use 12px as the minimum rendered size and scale the rest; confirm with the designer.

## 3. Spacing and layout

### 3.1 Frame widths and content width

| Measure | Value | Evidence |
|---|---|---|
| Desktop frame | 1440 px | all desktop frames |
| Mobile frame | 320 px | all mobile frames (iPhone SE) |
| Desktop content max width | **1312 px** (gutters 64 px each side) | finder bar `Group 139` 1312x85 at x=64; Collection wrapper `Group 345` 1312 at x=63; surprise-box banner `Rectangle 39` 1312; review list rows 1312; header nav `Frame 5` 1133 wide centred (x=154..1287) |
| Header inner width | 1312 (icons at x=64, search box right edge at 1376) | `Frame 27` x=64, `Group 98` x=1117+259 |
| Mega menu inner width | 1271 (x=85..1356) | `Group 282` |
| Mobile content width | 290 px (15 px gutters) | finder card `Group 79` 290 at x=15, footer lines 290, grid cards at x=15/167 |
| Mobile drawer | 291 px wide, 29 px dark overlay on the left | `Group 258` x=29 |

Assumption above 1440: keep 1312 max width centred. Between 1024 and 1440: fluid with 64 px gutters shrinking to 32 px; tablet (768) is not designed, use the mobile component variants with 2-3 columns.

### 3.2 Grids

| Grid | Columns | Card | Gap | Evidence |
|---|---|---|---|---|
| Home product slider | 4 | 305 x 360 (content), new container 290 x 400 | 31 (x = 64, 400, 736, 1071) | `Group 179/158/159/101` |
| Home product slider containers (revision) | 4 | 290 x 400 r=10 | x = 70, 415, 751, 1087 (pitch 336-345, drawn by hand, does not align with the cards) | `Rectangle 67-70` |
| Home second slider ("קטגוריות נבחרות" at y=2783) | 4 | 295 x 404 r=10 border | x = 69, 406, 744, 1072 | groups `1`-`4` |
| Product complementary slider | 4 | 296 x 398 r=10 border + shadow | x = 74, 409, 736, 1075 | `Rectangle 49/53/54/55` |
| Collection grid | 4 + sidebar | 224 x 338 (card), containers 238 x 367 | column pitch 251 (gap 27), row pitch 368 (gap 30); sidebar 304 wide at the right (x=1007..1311 inside the 1312 wrapper), 30 px between grid and sidebar | `Group 182..244`, `Rectangle 53/57/70` |
| Home categories | 6 circles | 217 x 217 | see Home frame, labels 20/40 under circles | `Ellipse 13-20` |
| Home brands | 4 x 2 | 304 x 80, stroke `#DFDFDF` | row pitch 100 (gap 20); x pitch ~336 | `Rectangle 58-65` |
| Home USP tiles | 6 | 194 x 178 r=30 | — | `Rectangle 41-46` |
| Home Instagram | 5 | 272 x 362 | — | 5 image rectangles |
| Home reviews | 3 | 394 x 314 r=10 border | inside a 1240 wrapper, gap ~29 | `Group 77` |
| Mobile product grid | 2 | 138 x 183 | 14 horizontal (x=15, 167), 15 vertical (row pitch 198) | mobile Collection `Group 347` |
| Mobile categories | 3 circles | 84 x 84 | ~11 | `Ellipse 13-15` |

### 3.3 Auto-layout padding / itemSpacing histograms (all 7 frames)

Only 34% of containers (500 of 1480 frames/groups in the 7 frames) use auto-layout; the rest are absolute-positioned groups, so these histograms are indicative only.

| padding (px) | count | | itemSpacing (px) | count |
|---|---|---|---|---|
| 14 | 112 | | 10 | 161 |
| 5 | 108 | | 5 | 153 |
| 4 | 98 | | 20 | 31 |
| 10 | 74 | | 8 | 22 |
| 8 | 14 | | 16 | 20 |
| 30 | 8 | | 3 | 20 |
| 13 | 8 | | 9 | 19 |
| 9 | 8 | | 15 | 18 |
| 6 | 8 | | 4 | 14 |
| 1 | 4 | | 6 | 11 |
| 75 | 4 | | 25 | 8 |
| 7 | 4 | | 18 | 6 |
| 3 | 2 | | 30 | 3 |
|  |  | | 7 | 3 |
|  |  | | 12 | 3 |
|  |  | | 11 | 1 |

Spacing values that recur in absolute positions (section rhythm on Home revision): section title to content 40-60 px (`המוצרים שלנו` y=1266 → cards y=1384 = 118 incl. tabs; `מותגי הבית` 2330 → tiles 2410 = 80; `רכישה לפי גיל` 1847 → pills 1965 = 118), between sections 90-150 px, inside cards 16-17 px (card content inset: image at +39, text block at x+17), button height 28 (card), 44-48 (primary), 40 (search, secondary), 36 (mobile).

Proposed spacing scale: 4, 8, 10, 12, 16, 20, 24, 30, 40, 60, 80, 120.

## 4. Corner radii

| Radius | Count | Used on (examples) | Proposed token |
|---|---|---|---|
| 4 | 88 | GROUP Group 213 84x28; RECTANGLE Rectangle 73 84x28; GROUP Group 213 84x28 | buttons (card `הוסף לעגלה` 84x28, PDP buy 406x44, `השאר משוב`), Collection badges, qty stepper, mobile buttons → `--radius-sm` |
| 10 | 78 | RECTANGLE Rectangle 12 305x210; RECTANGLE Rectangle 12 305x210; RECTANGLE Rectangle 12 305x210 | product image `Rectangle 12` 305x210 / 224x154, product-card and review-card containers, mega-menu promo tile, search box (mobile) → `--radius-md` |
| 80 | 52 | FRAME Frame 52 32x32; FRAME Frame 52 32x32; FRAME Frame 53 32x32 | 32x32 icon circles (wishlist, compare, quick view) → `--radius-full` |
| 60 | 23 | FRAME Frame 51 44x25; FRAME Frame 51 67x25; FRAME Frame 51 60x25 | Home/Product badges 44-67x25 (pill) → `--radius-full` |
| 50 | 22 | GROUP Group 71 194x48.8; RECTANGLE Rectangle 33 194x48.8; GROUP Group 148 316x70 | age pills 316x70, surprise-box CTA 194x49, mobile `השאר משוב` → `--radius-full` |
| 5 | 17 | RECTANGLE Rectangle 34 74x4; RECTANGLE Rectangle 47 259x40; RECTANGLE Rectangle 66 259x40 | search box 259x40, Product thumbnails 136x160, finder selects → `--radius-sm` (merge with 4) |
| 70 | 14 | FRAME Frame 51 40x15; FRAME Frame 51 40x15; FRAME Frame 51 40x15 | mobile badges 40x15 (pill) |
| 100 | 11 | GROUP Group 139 1312x85; RECTANGLE Rectangle 3 1312x85; RECTANGLE Rectangle 22 259x45 | finder bar 1312x85, finder selects 259x45, finder button 157x45, heart icon frame → `--radius-full` |
| 2 | 10 | GROUP Group 118 686x96; RECTANGLE Rectangle 49 18x18; GROUP Group 118 686x96 | checkbox 18x18, consent group |
| 15 | 9 | FRAME Frame 224 67x25; FRAME Frame 51 44x25; RECTANGLE Rectangle 41 136x118 | Product main sale badge 67x25, one Collection `חדש` badge, mobile USP tiles 136x118 (inconsistent, see note) |
| 30 | 7 | RECTANGLE Rectangle 39 1312x410; RECTANGLE Rectangle 40 427x310; RECTANGLE Rectangle 41 194x178 | surprise-box banner 1312x410, its image card 427x310, USP tiles 194x178 → `--radius-xl` |
| 40 | 2 | FRAME Frame 232 57x24; FRAME Frame 232 52x20 | in-stock pill 57x24 |
| 9/9/0/0 | 1 | RECTANGLE image 115 294x265 | Home image 115 (top corners only) |
| 34 | 1 | FRAME Frame 32 157x45 | `הצג את כל המותגים` button 157x45 (one-off; same button is r=100 in the finder bar) |
| 18 | 1 | RECTANGLE Rectangle 44 194x178 | one USP tile `Rectangle 44` (others are 30: slip) |
| 20 | 1 | RECTANGLE Rectangle 39 290x480 | mobile promo banner 290x480 |
| 17 | 1 | RECTANGLE Rectangle 40 258x220 | mobile promo image 258x220 |

Badge radius conflict: pill (60/70) on Home/Product cards vs 4 (and one 15) on the Collection grid. Button radius conflict: 4 (most buttons) vs 34/50/100 (Home CTA buttons). Both need a decision; the designer note "square border around product cards" suggests the straighter Collection style is the newer intention.

## 5. Effects (shadows)

| Effect | Count | Where |
|---|---|---|
| DROP_SHADOW 0 4 blur 7.6 spread 0 `#000000 @15%` | 16 | Header/ELLIPSE Ellipse 5; Home/ELLIPSE Ellipse 5; M-Home/ELLIPSE Ellipse 5 |
| DROP_SHADOW 0 2 blur 4 spread 0 `#000000 @10%` | 5 | Collection/VECTOR Rectangle 29; Product/VECTOR Rectangle 49; Product/VECTOR Rectangle 53; Product/VECTOR Rectangle 54; Product/VECTOR Rectangle 55 |
| DROP_SHADOW 0 4 blur 11.4 spread 0 `#000000 @15%` | 2 | Collection/RECTANGLE Rectangle 57; Product/RECTANGLE Rectangle 57 |
| DROP_SHADOW 0 4 blur 4 spread 0 `#000000 @25%` | 7 | Header/RECTANGLE Rectangle 122; M-Home/ELLIPSE Ellipse 20 |
| DROP_SHADOW 0 4 blur 4.8 spread 0 `#000000 @15%` | 1 | M-Home/RECTANGLE Rectangle 3 |

Only drop shadows, no inner shadows or blurs. Mapping: slider-arrow circles `0 4 7.6 #000 15%`; product-card hover/active `0 2 4 #000 10%`; thumbnail active `0 4 11.4 #000 15%`; mega menu panel `0 4 4 #000 25%` (to be replaced by a border per designer note); mobile finder card `0 4 4.8 #000 15%`. Proposed: `--shadow-sm: 0 2px 4px rgb(0 0 0 / .10)`, `--shadow-md: 0 4px 8px rgb(0 0 0 / .15)`.

## 6. Strokes

| Weight | Color | Align | Count | Examples |
|---|---|---|---|---|
| 1 | `#000000` | INSIDE | 47 | Collection/RECTANGLE Rectangle 54; Product/RECTANGLE Rectangle 54; Product/VECTOR Vector |
| 1 | `#DDDDDD` | INSIDE | 38 | Home/ELLIPSE Ellipse 5; Home/RECTANGLE Rectangle 22; Home/RECTANGLE Rectangle 23; Home/RECTANGLE Rectangle 29 |
| 1 | `#E0E0E0` | INSIDE | 36 | Home/FRAME Frame 52; Home/FRAME Frame 53; Home/FRAME Frame 54; Home/FRAME Frame 57 |
| 1 | `#9B9B9B` | INSIDE | 20 | Collection/ELLIPSE Ellipse 24; Product/ELLIPSE Ellipse 24 |
| 1 | `#DFDFDF` | INSIDE | 17 | Home/RECTANGLE Rectangle 3; Home/RECTANGLE Rectangle 58; Home/RECTANGLE Rectangle 59; Home/RECTANGLE Rectangle 60 |
| 0.5 | `#E0E0E0` | INSIDE | 17 | M-Home/FRAME Frame 52; M-Product/FRAME Frame 227; M-Product/FRAME Frame 228; M-Product/FRAME Frame 52 |
| 1 | `#EDEDED` | CENTER | 14 | M-Product/LINE Line 15; Product/LINE Line 15; Product/LINE Line 22; Product/LINE Line 23 |
| 2 | `#3B0D15` | CENTER | 14 | M-Home/VECTOR _Path_; M-Home/VECTOR _Path_2; M-Home/VECTOR _Path_3; M-Home/VECTOR _Path_4 |
| 0.5 | `#9B9B9B` | CENTER | 14 | M-Collection/LINE Line 8; M-Home/LINE Line 8; M-Product/LINE Line 8 |
| 1 | `#E0E0E0` | CENTER | 12 | Collection/LINE Line 10; Collection/LINE Line 11; Collection/LINE Line 12; Collection/LINE Line 13 |
| 1 | `#000000` | CENTER | 11 | Collection/LINE Line 12; M-Product/LINE Line 18; M-Product/LINE Line 3; M-Product/LINE Line 4 |
| 1 | `#F4F4F4` | CENTER | 6 | Collection/LINE Line 14; Collection/LINE Line 15; Collection/LINE Line 16; Product/LINE Line 14 |
| 1 | `#1C1C1C` | INSIDE | 6 | M-Home/RECTANGLE Rectangle 49; M-Home/VECTOR Arrow 1; M-Home/VECTOR Arrow 2; M-Product/RECTANGLE Rectangle 49 |
| 1 | `#9B9B9B` | CENTER | 4 | Home/LINE Line 8; M-Product/LINE Line 8; Product/LINE Line 8 |
| 1 | `#C1C0C0` | INSIDE | 4 | Product/VECTOR Rectangle 49; Product/VECTOR Rectangle 53; Product/VECTOR Rectangle 54; Product/VECTOR Rectangle 55 |
| 1 | `#DBDCE0` | CENTER | 4 | M-Product/LINE Line 19; M-Product/LINE Line 20; Product/LINE Line 19; Product/LINE Line 20 |
| 2 | `#1C1C1C` | INSIDE | 3 | Home/VECTOR Arrow 1; Product/VECTOR Arrow 1 |
| 1 | `#353535` | INSIDE | 3 | Home/RECTANGLE Rectangle 49; Product/RECTANGLE Rectangle 49 |
| 1 | `#EDEDED` | INSIDE | 3 | M-Product/RECTANGLE Rectangle 12; Product/RECTANGLE Rectangle 12; Product/RECTANGLE Rectangle 14 |
| 1 | `#1C1C1C` | CENTER | 3 | M-Home/LINE Line 3; M-Home/LINE Line 4; M-Home/LINE Line 5 |
| 1 | `#008094` | INSIDE | 2 | Home/ELLIPSE Ellipse 18; Home/RECTANGLE ספרים  1 |
| 1 | `#E66277` | INSIDE | 2 | Home/ELLIPSE Ellipse 19; M-Home/RECTANGLE Rectangle 40 |
| 1 | `#DBDCE0` | INSIDE | 2 | M-Product/FRAME Frame 54; Product/FRAME Frame 54 |
| 1 | `#007F94` | INSIDE | 1 | Home/ELLIPSE Ellipse 13 |
| 1 | `#FFBF00` | INSIDE | 1 | Home/ELLIPSE Ellipse 19 |
| 1 | `#FF6920` | INSIDE | 1 | Home/FRAME Frame 52 |
| 0.8 | `#FF75BA` | CENTER | 1 | Home/VECTOR Vector |
| 1 | `#FF5400` | INSIDE | 1 | Home/ELLIPSE Ellipse 20 |
| 0.7 | `#000000` | INSIDE | 1 | Product/VECTOR Vector |
| 0.8 | `#000000` | OUTSIDE | 1 | Product/VECTOR Vector |
| 0.8 | `#3B0D15` | CENTER | 1 | Product/VECTOR Vector |
| 1 | `#C0C0C0` | INSIDE | 1 | Product/FRAME Frame 53 |
| 1 | `#838683` | INSIDE | 1 | M-Home/RECTANGLE Rectangle 29 |

Product-card border (designer: "square border around every product card"): revision draws a container **behind** each card, 1 px `#DDDDDD` (Home, Collection) or `#C1C0C0` (Product), radius 10, white fill, and on the Product page plus one Collection card also a `0 2 4 #000 10%` shadow. The containers are hand-drawn vectors (290x400, 295x404, 296x398, 238x367) that do not share one size with the 305x360 / 224x338 card groups, so the implementation should define the card as: image + content inside a bordered box with 16-17 px padding, radius 10 (or 0 if "square" is literal: ask).

Nav (designer: "gray border, no shadow"): header bottom edge `Line 9` 1 px `#E0E0E0` across 1440; mega menu `1:874` currently has shadow `0 4 4 #000 25%` and no stroke; intended: 1 px `#E0E0E0`/`#DDDDDD` border, no shadow. Search box: 1 px `#DDDDDD`, r=5, 259x40.

Other strokes: 0.5 px `#E0E0E0` on mobile icon circles and 0.5 px `#9B9B9B` dividers (sub-pixel: render as 1 px); 2 px `#3B0D15` paths are the mobile original logo; `#000000` 1 px INSIDE strokes (47) are Collection filter checkboxes `Rectangle 54` and vector icons.

## 7. Icon inventory (header, product card, USP, footer)

Node names starting with `fi_` are Flaticon imports. Sizes are the icon frame, not the glyph. Colors are the vector fills inside. The same `fi_` id is reused for different glyphs (e.g. `fi_2985150` is a chevron in the nav, a heart on cards, an arrow in sliders): identify by context, not by name.

| Area | Node name | Size | Count | Glyph colors | Context / label | Meaning (guess) | Example ids |
|---|---|---|---|---|---|---|---|
| Header desktop (instance 69:4756) | `fi_2985150` | 14x14 | 6 | #1C1C1C | הדרכת הורים, כלי בית ואקססוריז, קופסאות ומארזים | chevron / heart / arrow (context) | `I69:4756;156:323`, `I69:4756;156:299` |
| Header desktop (instance 69:4756) | `fi_2811806` | 16x16 | 1 | #353535 @0% | חיפוש | search (magnifier) | `I69:4756;144:137` |
| Header desktop (instance 69:4756) | `fi_5337564` | 20x20 | 1 | #1C1C1C |  | user / account | `I69:4756;144:141` |
| Header desktop (instance 69:4756) | `fi_1077035` | 20x20 | 1 | #1C1C1C |  | cart | `I69:4756;144:147` |
| Header desktop (instance 69:4756) | `fi_456283` | 20x20 | 1 | #353535 |  | wishlist / gift | `I69:4756;144:149` |
| Header desktop (loose revision icons) | `fi_5337564` | 20x20 | 1 | #1C1C1C |  | user / account | `69:4814` |
| Header desktop (loose revision icons) | `fi_1077035` | 20x20 | 1 | #1C1C1C |  | cart | `69:4820` |
| Header desktop (loose revision icons) | `fi_456283` | 20x20 | 1 | #353535 |  | wishlist / gift | `69:4822` |
| Header desktop (loose revision icons) | `fi_2811806` | 16x16 | 1 | #353535 |  | search (magnifier) | `69:4759` |
| Header + mega menu 1:806 | `fi_2985150` | 14x14 | 6 | #1C1C1C | הדרכת הורים, כלי בית ואקססוריז, קופסאות ומארזים | chevron / heart / arrow (context) | `1:814`, `1:819` |
| Header + mega menu 1:806 | `fi_2811806` | 16x16 | 1 | #353535 | חיפוש | search (magnifier) | `1:845` |
| Header + mega menu 1:806 | `fi_5337564` | 20x20 | 1 | #1C1C1C |  | user / account | `1:849` |
| Header + mega menu 1:806 | `fi_1077035` | 20x20 | 1 | #1C1C1C |  | cart | `1:855` |
| Header + mega menu 1:806 | `fi_456283` | 20x20 | 1 | #353535 |  | wishlist / gift | `1:857` |
| Header + mega menu 1:806 | `Group 96` | 40x40 | 1 | #1C1C1C,#FFFFFF |  | hero arrow | `1:866` |
| Header + mega menu 1:806 | `Group 97` | 40x40 | 1 | #1C1C1C,#FFFFFF |  | hero arrow | `1:870` |
| Header mobile 1:7663 (menu open) | `fi_1828859` | 16x16 | 1 | #1C1C1C | והי עובדה מבוססת שדע | hamburger | `1:7667` |
| Header mobile 1:7663 (menu open) | `fi_2985150` | 18x18 | 4 | #1C1C1C | גיל | chevron / heart / arrow (context) | `1:7685`, `1:7687` |
| Header mobile 1:7663 (menu open) | `Group 35` | 26x26 | 1 | #1C1C1C,#FFFFFF | והי עובדה מבוססת שדע | slider arrow 26px (mobile) | `1:7703` |
| Header mobile 1:7663 (menu open) | `Group 80` | 26x26 | 1 | #1C1C1C,#FFFFFF | והי עובדה מבוססת שדע | slider arrow 26px (mobile) | `1:7707` |
| Header mobile 1:7663 (menu open) | `Frame 59` | 44x16 | 1 | #1C1C1C | והי עובדה מבוססת שדע | account + cart icon pair (mobile) | `1:7711` |
| Header mobile 1:7663 (menu open) | `fi_2811806` | 16x16 | 1 | #1C1C1C | והי עובדה מבוססת שדע | search (magnifier) | `1:7720` |
| Header mobile 1:7663 (menu open) | `fi_2985150` | 14x14 | 11 | #1C1C1C | משחקים וצעצועים, לפי גיל, פיתוח מיומנויות | chevron / heart / arrow (context) | `1:7728`, `1:7733` |
| Header mobile 1:7663 (menu open) | `fi_2961937` | 12x12 | 1 | #6B6B6B |  | close (x) | `1:7785` |
| Header mobile 1:7663 (menu open) | `fi_3046120` | 14x14 | 1 | #FFFFFF |  | social: instagram | `1:7791` |
| Header mobile 1:7663 (menu open) | `fi_1384031` | 14x14 | 1 | #FFFFFF |  | social: whatsapp | `1:7794` |
| Header mobile 1:7663 (menu open) | `fi_3128208` | 14x14 | 1 | #FFFFFF |  | social: facebook | `1:7798` |
| Header mobile 1:7663 (menu open) | `fi_1384023` | 14x14 | 1 | #FFFFFF |  | social: tiktok/youtube | `1:7801` |
| Header mobile 1:7663 (menu open) | `fi_1384028` | 14x14 | 1 | #FFFFFF |  | social (5th) | `1:7803` |
| Product card / grid / filters | `Frame 52` | 32x32 | 22 | #1C1C1C |  | wishlist heart in 32px circle | `18:4153`, `49:4452` |
| Product card / grid / filters | `Frame 52` | 32x32 | 2 | #FFFFFF |  | wishlist heart in 32px circle | `18:4172`, `49:4471` |
| Product card / grid / filters | `Frame 53` | 32x32 | 4 | #1C1C1C |  | compare / quick-view in 32px circle | `18:4188`, `49:4487` |
| Product card / grid / filters | `Frame 54` | 32x32 | 2 | #1C1C1C |  | quick-view in 32px circle | `48:4381`, `49:4490` |
| Product card / grid / filters | `fi_2985150` | 16x16 | 7 | #1C1C1C | מיון, זוהי עובדה מבוססת שד | chevron / heart / arrow (context) | `69:5542`, `69:5566` |
| Product card / grid / filters | `fi_2961937` | 12x12 | 2 | #6B6B6B |  | close (x) | `69:5556`, `69:5563` |
| Product card / grid / filters | `Ellipse 21` | 12x12 | 18 | self #007F94 |  | color swatch | `69:5579`, `69:5600` |
| Product card / grid / filters | `Ellipse 24` | 20x20 | 18 | self #9B9B9B@1.0 |  | swatch ring (selected) | `69:5580`, `69:5601` |
| Product card / grid / filters | `Ellipse 22` | 12x12 | 18 | self #8FC597 |  | color swatch (green) | `69:5581`, `69:5602` |
| Product card / grid / filters | `Ellipse 23` | 12x12 | 18 | self #DDDDDD |  | color swatch (gray) | `69:5582`, `69:5603` |
| Product page buy box / accordions | `Frame 229` | 32x32 | 1 | stroke #000000@0.699999988079071,stroke #000000@ |  | zoom | `52:5187` |
| Product page buy box / accordions | `Frame 228` | 32x32 | 1 | #1C1C1C |  | share / zoom | `52:5191` |
| Product page buy box / accordions | `Frame 52` | 32x32 | 1 | #1C1C1C |  | wishlist heart in 32px circle | `52:5218` |
| Product page buy box / accordions | `Ellipse 25` | 34x34 | 1 | self #FFFFFF |  | gallery dot | `52:5231` |
| Product page buy box / accordions | `Ellipse 26` | 8x8 | 1 | self #FF5400 | נותרו 5 יחידות | stock dot | `52:5236` |
| Product page buy box / accordions | `Ellipse 21` | 16x16 | 1 | self #E66277 |  | color swatch | `52:5259` |
| Product page buy box / accordions | `Ellipse 24` | 24x24 | 1 | self #9B9B9B@1.0 |  | swatch ring (selected) | `52:5260` |
| Product page buy box / accordions | `Ellipse 22` | 16x16 | 1 | self #8FC597 |  | color swatch (green) | `52:5261` |
| Product page buy box / accordions | `Ellipse 23` | 16x16 | 1 | self #DDDDDD |  | color swatch (gray) | `52:5262` |
| Product page buy box / accordions | `fi_9146915` | 14x14 | 1 | #000000 |  | minus (accordion open) | `52:5268` |
| Product page buy box / accordions | `fi_9312231` | 14x14 | 1 | #000000 |  | plus (accordion closed) | `52:5273` |
| Product page buy box / accordions | `fi_9312231` | 16x16 | 5 | #000000 | כטקסט ברירת המחדל של | plus (accordion closed) | `52:5296`, `52:5302` |
| Product page buy box / accordions | `fi_9146915` | 16x16 | 1 | #000000 | כטקסט ברירת המחדל של | minus (accordion open) | `52:5326` |
| Product page buy box / accordions | `Layer_1` | 26x29 | 1 | #3B0D15,#FFFFFF,stroke #3B0D15@0.75 | מוצרים בתקן אירופאי  | USP illustration (multicolor) | `52:5822` |
| Product page buy box / accordions | `Layer_1` | 34x21 | 1 | #3B0D15,#F5F5F5 | אפשרויות תשלום נוחות | USP illustration (multicolor) | `52:5977` |
| Product page buy box / accordions | `fi_709790` | 14x14 | 1 | #275A7A | משלוח חינם בכל הזמנה | truck / shipping | `52:5563` |
| Product page buy box / accordions | `Layer_1` | 38x31 | 1 | #3B0D15,#F5F5F5,#FFFFFF,stroke #DDDDDD@1.0 |  | USP illustration (multicolor) | `52:5963` |
| Product page mobile 1:10570 | `fi_1828859` | 16x16 | 1 | #1C1C1C | והי עובדה מבוססת שדע | hamburger | `1:10574` |
| Product page mobile 1:10570 | `fi_2985150` | 15x15 | 1 | #838683 | שעות פתיחה: א’-ה’: 1 | chevron / heart / arrow (context) | `1:10579` |
| Product page mobile 1:10570 | `fi_3046120` | 16x16 | 1 | #1C1C1C |  | social: instagram | `1:10583` |
| Product page mobile 1:10570 | `fi_1384031` | 16x16 | 1 | #1C1C1C |  | social: whatsapp | `1:10586` |
| Product page mobile 1:10570 | `fi_3128208` | 16x16 | 1 | #1C1C1C |  | social: facebook | `1:10590` |
| Product page mobile 1:10570 | `fi_1384023` | 16x16 | 1 | #000000 |  | social: tiktok/youtube | `1:10593` |
| Product page mobile 1:10570 | `fi_2985150` | 20x20 | 4 | #000000 | שעות פתיחה: א’-ה’: 1 | chevron / heart / arrow (context) | `1:10595`, `1:10597` |
| Product page mobile 1:10570 | `fi_5337564` | 16x16 | 1 | #1C1C1C |  | user / account | `1:10616` |
| Product page mobile 1:10570 | `fi_1077035` | 16x16 | 1 | #1C1C1C |  | cart | `1:10622` |
| Product page mobile 1:10570 | `fi_2811806` | 16x16 | 1 | #000000 |  | search (magnifier) | `1:10624` |
| Product page mobile 1:10570 | `Ellipse 26` | 8x8 | 1 | self #EC8155 | נותרו 5 יחידות | stock dot | `1:10636` |
| Product page mobile 1:10570 | `Ellipse 21` | 12x12 | 1 | self #E66277 |  | color swatch | `1:10660` |
| Product page mobile 1:10570 | `Ellipse 24` | 20x20 | 1 | self #9B9B9B@1.0 |  | swatch ring (selected) | `1:10661` |
| Product page mobile 1:10570 | `Ellipse 22` | 12x12 | 1 | self #8FC597 |  | color swatch (green) | `1:10662` |
| Product page mobile 1:10570 | `Ellipse 23` | 12x12 | 1 | self #DDDDDD |  | color swatch (gray) | `1:10663` |
| Product page mobile 1:10570 | `fi_9146915` | 14x14 | 2 | #000000 | והי עובדה מבוססת שדע | minus (accordion open) | `1:10666`, `1:10719` |
| Product page mobile 1:10570 | `fi_9312231` | 14x14 | 6 | #000000 | והי עובדה מבוססת שדע | plus (accordion closed) | `1:10671`, `1:10729` |
| Product page mobile 1:10570 | `fi_709790` | 12x12 | 1 | #275A7A | משלוח חינם בכל הזמנה | truck / shipping | `1:10685` |
| Product page mobile 1:10570 | `fi_1828961` | 14x14 | 1 | #000000,stroke #000000@1.0 |  | star outline (rating input) | `1:10766` |
| Product page mobile 1:10570 | `fi_1828961` | 14x14 | 4 | #000000 |  | star outline (rating input) | `1:10769`, `1:10771` |
| Product page mobile 1:10570 | `fi_2893811` | 16x16 | 15 | #E66277 |  | star | `1:10790`, `1:10793` |
| Product page mobile 1:10570 | `Group 56` | 26x26 | 1 | #E66277 |  | pagination arrow | `1:10857` |
| Product page mobile 1:10570 | `fi_2985150` | 18x18 | 2 | #1C1C1C |  | chevron / heart / arrow (context) | `1:10863`, `1:10865` |
| Product page mobile 1:10570 | `Frame 228` | 24x24 | 1 | #4CAF50,#FAFAFA |  | share / zoom | `1:10871` |
| Product page mobile 1:10570 | `Frame 227` | 24x24 | 1 | #1C1C1C |  | share | `1:10875` |
| Product page mobile 1:10570 | `Frame 52` | 24x24 | 1 | #1C1C1C |  | wishlist heart in 32px circle | `1:10902` |
| Product page mobile 1:10570 | `fi_5484644` | 15x15 | 1 | #3B0D15 | אפשרויות תשלום נוחות | payment / card | `1:10912` |
| Product page mobile 1:10570 | `fi_709790` | 15x15 | 1 | #3B0D15 | משלוח מהיר וחינם בקנ | truck / shipping | `1:10919` |
| Product page mobile 1:10570 | `fi_18364880` | 15x15 | 1 | #3B0D15 | מוצרים בתקן אירופאי  | certificate / standard | `1:10949` |
| Product page mobile 1:10570 | `Arrow 1` | 16x0 | 1 | self #1C1C1C@1.0 | האימייל שלך | newsletter submit arrow | `1:10961` |
| Product page mobile 1:10570 | `Frame 52` | 20x20 | 2 | #1C1C1C |  | wishlist heart in 32px circle | `1:10970`, `1:10995` |
| Product page mobile 1:10570 | `Group 212` | 21x21 | 2 | #E66277,#FFFFFF |  | mobile wishlist heart | `1:10985`, `1:11010` |
| Product page mobile 1:10570 | `Group 171` | 22x22 | 1 | #1C1C1C,#FFFFFF | מוצרים משלימים | mobile slider arrow | `1:11018` |
| Product page mobile 1:10570 | `Group 177` | 22x22 | 1 | #1C1C1C,#FFFFFF | מוצרים משלימים | mobile slider arrow | `1:11022` |
| Footer | `fi_3046120` | 20x20 | 1 | #312E7D,#FFFFFF |  | social: instagram | `18:4516` |
| Footer | `fi_1384031` | 20x20 | 1 | #312E7D,#FFFFFF |  | social: whatsapp | `18:4519` |
| Footer | `fi_3128208` | 20x20 | 1 | #312E7D,#FFFFFF |  | social: facebook | `18:4523` |
| Footer | `fi_1384023` | 20x20 | 1 | #312E7D,#FFFFFF |  | social: tiktok/youtube | `18:4526` |
| Home categories / tabs | `Group 64` | 40x40 | 1 | #1C1C1C,#FFFFFF,stroke #DDDDDD@1.0 |  | slider arrow (40px circle, border) | `18:4118` |
| Home categories / tabs | `fi_2985150` | 18x18 | 2 | #1C1C1C |  | chevron / heart / arrow (context) | `49:4401`, `49:4394` |
| Home categories / tabs | `Group 366` | 40x40 | 1 | stroke #DDDDDD@1.0 |  | slider arrow (border) | `49:4404` |
| Home reviews | `fi_2893811` | 16x16 | 15 | #FFBF00 |  | star | `18:4284`, `18:4287` |
| Home finder bar | `fi_2985150` | 18x18 | 4 | #1C1C1C | גיל | chevron / heart / arrow (context) | `18:4384`, `18:4386` |
| Home Instagram | `Group 116` | 40x40 | 1 | #1C1C1C,#FFFFFF |  | slider arrow (40px circle, shadow) | `18:4464` |
| Home Instagram | `Group 117` | 40x40 | 1 | #1C1C1C,#FFFFFF |  | slider arrow (40px circle, shadow) | `18:4468` |
| Home USP band | `Layer_1` | 73x80.6 | 1 | #FF75BA,#FFFFFF,stroke #FF75BA@0.75 |  | USP illustration (multicolor) | `45:4166` |
| Home USP band | `Layer_1` | 79x84 | 1 | #3BD6D9 |  | USP illustration (multicolor) | `45:4161` |
| Home categories / tabs | `Group 365` | 40x40 | 1 | stroke #DDDDDD@1.0 |  | slider arrow (border) | `49:4397` |
| Home reviews | `Group 373` | 40x40 | 1 | #1C1C1C,stroke #DDDDDD@1.0 |  | slider arrow (border) | `49:4507` |
| Home reviews | `Group 374` | 40x40 | 1 | #1C1C1C,stroke #DDDDDD@1.0 |  | slider arrow (border) | `49:4515` |

Asset plan: export each distinct glyph once as an optimized SVG with `currentColor` fills into `assets/mk-icon-*.svg` (search, user, cart, wishlist, heart, heart-filled, chevron-down, arrow-left/right, star, star-outline, close, hamburger, plus, minus, truck, card, certificate, instagram, facebook, whatsapp, tiktok, youtube). The USP illustrations (`Layer_1` ~80x84, multicolor) and the 165x165 `אייקון -03/-04/-05` PNGs are content images (Shopify Files), not icons. The softened logo `Layer_1` 211x61 (`69:4762`, `69:7500`, `69:4746`, `69:6167`) is the new logo: export as SVG.

## 8. Image fills in the revision + mobile frames

All 44 referenced `imageRef`s exist in `docs/figma/images/` (44 distinct). One row per node; the same ref is reused for repeated cards.

| Frame | Node | Name | Size | scaleMode | File (`docs/figma/images/`) | Guess |
|---|---|---|---|---|---|---|
| Home | `98:4386` | image 115 | 294x265 | FILL | `b766c3520adff1cf370483b94b770720ae7fb74a.png` | second slider product image |
| Home | `69:4497` | יheder -15 1 | 1440x531 | FILL | `b29ccfe8a2466b42c3c6f7373a10f8ad1acd22bd.jpg` | hero option B (69:4497) |
| Home | `18:4096` | Rectangle 39 | 1312x410 | STRETCH | `0e75d2f82f7c6ad86b018eaf54916b7d43720511.png` | promo banner bg |
| Home | `18:4113` | image 20 | 129.6x149.1 | STRETCH | `48191a8a8e90572dae01cdb644021dbac9e1d497.png` | brand logo / category image |
| Home | `18:4130` | Rectangle 12 | 305x210 | STRETCH | `26e619c5938964506a1c85288e522582938c4640.png` | product image |
| Home | `18:4146` | Rectangle 12 | 305x210 | STRETCH | `26e619c5938964506a1c85288e522582938c4640.png` | product image |
| Home | `18:4160` | Rectangle 12 | 305x210 | STRETCH | `9fbc39a808a0efb2a657118ca9bb1b0f445884c6.png` | product image |
| Home | `18:4179` | Rectangle 12 | 305x210 | STRETCH | `dae79ed0f3a3e3d0b933553cc4dfae0cec29591c.png` | product image |
| Home | `49:4445` | Rectangle 12 | 305x210 | STRETCH | `26e619c5938964506a1c85288e522582938c4640.png` | product image |
| Home | `49:4459` | Rectangle 12 | 305x210 | STRETCH | `9fbc39a808a0efb2a657118ca9bb1b0f445884c6.png` | product image |
| Home | `49:4478` | Rectangle 12 | 305x210 | STRETCH | `dae79ed0f3a3e3d0b933553cc4dfae0cec29591c.png` | product image |
| Home | `18:4309` | Rectangle 52 | 101.1x80.3 | FILL | `4958ccc94fe32dd24dc6239df52ef2a96a7a3049.png` | reviewer avatar |
| Home | `18:4336` | Rectangle 52 | 101.1x80.3 | FILL | `fba44ca66a2b1297c181c699427a72d0f283b789.png` | reviewer avatar |
| Home | `18:4445` | Знімок екрана 2025-11-20 о 21. | 272x362 | FILL | `5e6767bb0c7e9ff17b5e2968ad264cda1256e107.png` |  |
| Home | `18:4446` | Знімок екрана 2025-11-20 о 21. | 272x362 | FILL | `12a11f933096585b95726ef9f4856c87773a336b.png` |  |
| Home | `18:4447` | Знімок екрана 2025-11-20 о 21. | 272x362 | FILL | `a2c6d268fe2c76dedbfcab01c4fa16826a034b0c.png` |  |
| Home | `18:4448` | Знімок екрана 2025-11-20 о 21. | 272x362 | FILL | `5cd3ccb12dd49f1a7fc928d09530c68541dd3769.png` |  |
| Home | `18:4449` | Знімок екрана 2025-11-20 о 21. | 272x362 | FILL | `9000ca91b1440f4b3c24ce8d259220c20e449f64.png` |  |
| Home | `18:4451` | OBJECTS 1 | 44x44 | STRETCH | `50253a43417be789c5218b20696d04d79f6fe0ac.png` | Instagram icon |
| Home | `18:4536` | image 12 | 204x35 | STRETCH | `4a9c11fc7cd50e5b1f312fdf5595ed432c7a5f0b.png` | brand logo / category image |
| Home | `18:4537` | image 13 | 144x56 | STRETCH | `e15253cb4b512ffcc3349c8416f44725039c72c4.png` | brand logo / category image |
| Home | `18:4538` | image 14 | 126x70 | STRETCH | `dfc1c6359efaeedb5b3dc937f8174029289a4e35.png` | brand logo / category image |
| Home | `18:4539` | image 15 | 143x51 | STRETCH | `9f3d55f751fbbb9cfba868ea8bc47a57d299c441.png` | brand logo / category image |
| Home | `18:4540` | image 16 | 62x62 | FILL | `5c708632fc498c10e38c2d44c70b5589bf86e64b.png` | brand logo / category image |
| Home | `18:4541` | image 17 | 77x63 | STRETCH | `c774c4b993429242d11f37ad595501a623821179.png` | brand logo / category image |
| Home | `18:4542` | image 18 | 63x63 | FILL | `3e629fc4e34b69c1a41edbee35ac4ea79e8af87e.png` | brand logo / category image |
| Home | `18:4619` | Rectangle 52 | 107x85 | FILL | `26e619c5938964506a1c85288e522582938c4640.png` | reviewer avatar |
| Home | `18:4620` | image 22 | 125x125 | FILL | `996f6ca2c0eb2b1624f90e26645ec9eb26aea441.png` | brand logo / category image |
| Home | `18:4622` | image 26 | 89x153 | STRETCH | `8d024ecf9e1753a1b4ca2238297314bfd62f6b06.png` | brand logo / category image |
| Home | `18:4623` | image 27 | 68x68 | FILL | `ebc280dfafd9a478c02738e32893474553f4972d.png` | brand logo / category image |
| Home | `31:4166` | אייקון -03 1 | 165x165 | FILL | `95ad704af0ab8b3497babad039d060ef23ac8bdb.png` | USP icon PNG |
| Home | `31:4167` | אייקון -04 1 | 165x165 | FILL | `76dd2aad2507e262a6bd14e87b48d38f2a77373a.png` | USP icon PNG |
| Home | `31:4168` | אייקון -05 1 | 165x165 | FILL | `fd343153cf0a53de3349e76ac5faff9f2510c08d.png` | USP icon PNG |
| Home | `35:4358` | לוגו  2 | 125x33 | FILL | `7b217eb30dae75ae83cd51c78c7659f97c661aff.png` | logo inside surprise box |
| Home | `45:4171` | image 112 | 90x90 | FILL | `41ab258fc9fdd982e6f8f2dc939833d8b5923b25.png` | USP icon |
| Home | `47:4289` | תינוקות  1 | 193x289 | STRETCH | `ace7cf3bcd2565a4c80e3fc5e821b2ff3d284bbd.png` | category image (babies) |
| Home | `47:4286` | ספרים  1 | 105x106 | FILL | `1cc808feff6d7b873c910adf64af42eb46f036ba.jpg` | category image (books) |
| Prod | `52:5185` | Rectangle 12 | 640x586 | FILL | `26e619c5938964506a1c85288e522582938c4640.png` | product image |
| Prod | `52:5223` | Rectangle 13 | 95x87 | FILL | `26e619c5938964506a1c85288e522582938c4640.png` | PDP main image |
| Prod | `52:5224` | Rectangle 14 | 95x87 | STRETCH | `4a439e5252819403c57407f444b0c0e95ec36820.png` | PDP gallery |
| Prod | `52:5230` | Rectangle 15 | 95x87 | FILL | `26e619c5938964506a1c85288e522582938c4640.png` | product / content image |
| Prod | `52:5382` | image 33 | 113x133 | FILL | `add729061588fbcdd69a5eb04559d67ebf17d264.png` |  |
| Prod | `52:5405` | image 33 | 113x133 | FILL | `609cc441a5f68c65d512e02f75d6e337de119d29.png` |  |
| Prod | `52:5428` | image 33 | 113x133 | FILL | `4a439e5252819403c57407f444b0c0e95ec36820.png` |  |
| Prod | `52:5480` | Rectangle 12 | 276x210 | STRETCH | `26e619c5938964506a1c85288e522582938c4640.png` | product image |
| Prod | `52:5496` | Rectangle 12 | 305x210 | STRETCH | `9fbc39a808a0efb2a657118ca9bb1b0f445884c6.png` | product image |
| Prod | `52:5515` | Rectangle 12 | 269x210 | STRETCH | `dae79ed0f3a3e3d0b933553cc4dfae0cec29591c.png` | product image |
| Prod | `52:5539` | Rectangle 12 | 272x210 | STRETCH | `26e619c5938964506a1c85288e522582938c4640.png` | product image |
| Coll | `69:5573` | Rectangle 12 | 224x154 | STRETCH | `26e619c5938964506a1c85288e522582938c4640.png` | product image |
| Coll | `69:5594` | Rectangle 12 | 224x154 | STRETCH | `26e619c5938964506a1c85288e522582938c4640.png` | product image |
| Coll | `69:5615` | Rectangle 12 | 224x154 | STRETCH | `26e619c5938964506a1c85288e522582938c4640.png` | product image |
| Coll | `69:5636` | Rectangle 12 | 224x154 | STRETCH | `26e619c5938964506a1c85288e522582938c4640.png` | product image |
| Coll | `69:5657` | Rectangle 12 | 224x154 | STRETCH | `9fbc39a808a0efb2a657118ca9bb1b0f445884c6.png` | product image |
| Coll | `69:5678` | Rectangle 12 | 224x154 | STRETCH | `9fbc39a808a0efb2a657118ca9bb1b0f445884c6.png` | product image |
| Coll | `69:5699` | Rectangle 12 | 224x154 | STRETCH | `9fbc39a808a0efb2a657118ca9bb1b0f445884c6.png` | product image |
| Coll | `69:5720` | Rectangle 12 | 224x154 | STRETCH | `9fbc39a808a0efb2a657118ca9bb1b0f445884c6.png` | product image |
| Coll | `69:5741` | Rectangle 12 | 224x154 | STRETCH | `dae79ed0f3a3e3d0b933553cc4dfae0cec29591c.png` | product image |
| Coll | `69:5762` | Rectangle 12 | 224x154 | STRETCH | `dae79ed0f3a3e3d0b933553cc4dfae0cec29591c.png` | product image |
| Coll | `69:5783` | Rectangle 12 | 224x154 | STRETCH | `dae79ed0f3a3e3d0b933553cc4dfae0cec29591c.png` | product image |
| Coll | `69:5804` | Rectangle 12 | 224x154 | STRETCH | `dae79ed0f3a3e3d0b933553cc4dfae0cec29591c.png` | product image |
| Coll | `69:5825` | Rectangle 12 | 224x154 | STRETCH | `dae79ed0f3a3e3d0b933553cc4dfae0cec29591c.png` | product image |
| Coll | `69:5846` | Rectangle 12 | 224x154 | STRETCH | `26e619c5938964506a1c85288e522582938c4640.png` | product image |
| Coll | `69:5865` | Rectangle 12 | 224x154 | STRETCH | `26e619c5938964506a1c85288e522582938c4640.png` | product image |
| Coll | `69:5884` | Rectangle 12 | 224x154 | STRETCH | `26e619c5938964506a1c85288e522582938c4640.png` | product image |
| Coll | `69:5903` | Rectangle 12 | 224x154 | STRETCH | `26e619c5938964506a1c85288e522582938c4640.png` | product image |
| Coll | `69:5922` | Rectangle 12 | 224x154 | STRETCH | `26e619c5938964506a1c85288e522582938c4640.png` | product image |
| Hdr | `1:810` | image 1 | 247x64 | FILL | `9ef4ad4d1a38a4414d0e565b150cbad893ef77af.png` | logo (original) |
| Hdr | `1:864` | HEADER_VALUE DESKTOP (1) 1 | 1440x530 | STRETCH | `e5aa85fadf3fe1bf04ab04a9948b81262a61c982.png` | hero option A |
| Hdr | `1:877` | Rectangle 50 | 284x159 | STRETCH | `0921015bbf8bda069c5926c265cc64848745c7cc.jpg` | product / content image |
| mHome | `1:7078` | image 1 | 109x28 | FILL | `9ef4ad4d1a38a4414d0e565b150cbad893ef77af.png` | logo (original) |
| mHome | `1:7120` | Rectangle 32 | 320x241 | FILL | `e5aa85fadf3fe1bf04ab04a9948b81262a61c982.png` | mobile hero |
| mHome | `1:7148` | image 26 | 36x61 | STRETCH | `8d024ecf9e1753a1b4ca2238297314bfd62f6b06.png` | brand logo / category image |
| mHome | `1:7150` | image 25 | 53x49 | STRETCH | `ee5fb6bb1e933ffc27625eb45e7877c24f15837e.png` | brand logo / category image |
| mHome | `1:7152` | image 24 | 50x47 | STRETCH | `fa6bb5341bb1ce36fa6a91814a85301e1a5d66dd.png` | brand logo / category image |
| mHome | `1:7161` | Rectangle 39 | 290x480 | STRETCH | `f782e42139c594a95ee885a7eee606a713cd7293.jpg` | promo banner bg |
| mHome | `1:7223` | OBJECTS 1 | 28x28 | FILL | `3112c92ac1121558c1357f3dd9fc1df4ef24e5dd.png` | Instagram icon |
| mHome | `1:7225` | Знімок екрана 2025-11-20 о 21. | 99x132 | FILL | `5e6767bb0c7e9ff17b5e2968ad264cda1256e107.png` |  |
| mHome | `1:7226` | Знімок екрана 2025-11-20 о 21. | 100x132 | FILL | `12a11f933096585b95726ef9f4856c87773a336b.png` |  |
| mHome | `1:7227` | Знімок екрана 2025-11-20 о 21. | 99x132 | FILL | `5cd3ccb12dd49f1a7fc928d09530c68541dd3769.png` |  |
| mHome | `1:7238` | Rectangle 52 | 76x60 | FILL | `26e619c5938964506a1c85288e522582938c4640.png` | reviewer avatar |
| mHome | `1:7295` | Rectangle 50 | 290x262 | FILL | `0921015bbf8bda069c5926c265cc64848745c7cc.jpg` | product / content image |
| mHome | `1:7362` | image 13 | 90x35 | STRETCH | `e15253cb4b512ffcc3349c8416f44725039c72c4.png` | brand logo / category image |
| mHome | `1:7364` | image 12 | 118x20 | STRETCH | `4a9c11fc7cd50e5b1f312fdf5595ed432c7a5f0b.png` | brand logo / category image |
| mHome | `1:7366` | image 16 | 37x37 | FILL | `5c708632fc498c10e38c2d44c70b5589bf86e64b.png` | brand logo / category image |
| mHome | `1:7368` | image 15 | 82x29 | STRETCH | `9f3d55f751fbbb9cfba868ea8bc47a57d299c441.png` | brand logo / category image |
| mHome | `1:7370` | image 18 | 37x37 | FILL | `3e629fc4e34b69c1a41edbee35ac4ea79e8af87e.png` | brand logo / category image |
| mHome | `1:7373` | image 17 | 46x37 | STRETCH | `c774c4b993429242d11f37ad595501a623821179.png` | brand logo / category image |
| mHome | `1:7374` | image 27 | 37x37 | FILL | `ebc280dfafd9a478c02738e32893474553f4972d.png` | brand logo / category image |
| mHome | `1:7375` | image 14 | 67x37 | STRETCH | `dfc1c6359efaeedb5b3dc937f8174029289a4e35.png` | brand logo / category image |
| mHome | `1:7388` | Rectangle 12 | 138x99 | STRETCH | `b8d0e86385e470f6ec719c05e33580ee8b8c1b0b.png` | product image |
| mHome | `1:7413` | Rectangle 12 | 138x99 | STRETCH | `b8d0e86385e470f6ec719c05e33580ee8b8c1b0b.png` | product image |
| mHome | `1:7454` | Rectangle 12 | 138x99 | STRETCH | `b8d0e86385e470f6ec719c05e33580ee8b8c1b0b.png` | product image |
| mHome | `1:7479` | Rectangle 12 | 138x99 | STRETCH | `b8d0e86385e470f6ec719c05e33580ee8b8c1b0b.png` | product image |
| mProd | `1:10573` | image 1 | 109x28 | FILL | `9ef4ad4d1a38a4414d0e565b150cbad893ef77af.png` | logo (original) |
| mProd | `1:10783` | image 33 | 76x89 | FILL | `add729061588fbcdd69a5eb04559d67ebf17d264.png` |  |
| mProd | `1:10808` | image 33 | 76x89 | FILL | `add729061588fbcdd69a5eb04559d67ebf17d264.png` |  |
| mProd | `1:10833` | image 33 | 76x89 | FILL | `add729061588fbcdd69a5eb04559d67ebf17d264.png` |  |
| mProd | `1:10868` | Rectangle 12 | 277x254 | STRETCH | `26e619c5938964506a1c85288e522582938c4640.png` | product image |
| mProd | `1:10869` | Rectangle 14 | 277x254 | STRETCH | `0921015bbf8bda069c5926c265cc64848745c7cc.jpg` | PDP gallery |
| mProd | `1:10969` | Rectangle 12 | 138x99 | STRETCH | `b8d0e86385e470f6ec719c05e33580ee8b8c1b0b.png` | product image |
| mProd | `1:10994` | Rectangle 12 | 138x99 | STRETCH | `b8d0e86385e470f6ec719c05e33580ee8b8c1b0b.png` | product image |
| mColl | `1:7818` | image 1 | 109x28 | FILL | `9ef4ad4d1a38a4414d0e565b150cbad893ef77af.png` | logo (original) |
| mColl | `1:7908` | Rectangle 69 | 290x187 | STRETCH | `0f7e3a2d5d0b6b24edb06e482424726a43096d3c.jpg` | product / content image |
| mColl | `1:7910` | Rectangle 12 | 138x99 | STRETCH | `b8d0e86385e470f6ec719c05e33580ee8b8c1b0b.png` | product image |
| mColl | `1:7935` | Rectangle 12 | 138x99 | STRETCH | `b8d0e86385e470f6ec719c05e33580ee8b8c1b0b.png` | product image |
| mColl | `1:7960` | Rectangle 12 | 138x99 | STRETCH | `b8d0e86385e470f6ec719c05e33580ee8b8c1b0b.png` | product image |
| mColl | `1:7985` | Rectangle 12 | 138x99 | STRETCH | `b8d0e86385e470f6ec719c05e33580ee8b8c1b0b.png` | product image |
| mColl | `1:8010` | Rectangle 12 | 138x99 | STRETCH | `b8d0e86385e470f6ec719c05e33580ee8b8c1b0b.png` | product image |
| mColl | `1:8035` | Rectangle 12 | 138x99 | STRETCH | `b8d0e86385e470f6ec719c05e33580ee8b8c1b0b.png` | product image |
| mColl | `1:8060` | Rectangle 12 | 138x99 | STRETCH | `b8d0e86385e470f6ec719c05e33580ee8b8c1b0b.png` | product image |
| mColl | `1:8085` | Rectangle 12 | 138x99 | STRETCH | `b8d0e86385e470f6ec719c05e33580ee8b8c1b0b.png` | product image |

