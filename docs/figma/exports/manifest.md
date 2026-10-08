# Figma exports manifest

| File | Node | Received | Size | Usable for |
|---|---|---|---|---|
| `home-desktop-preview-small.webp` | Home desktop (frame id to confirm: `1:266` original or `18:4094` revision) | 2026-10-08 | 471×2000 px (whole page) | section order, layout patterns only; not for measurement |
| `home-mobile-preview-small.webp` | Home mobile (`1:7075` original) | 2026-10-08 | 131×2000 px | section order, stacking patterns only |

Required for Phase 1 values: 2x PNG exports per `docs/figma/EXPORT-CHECKLIST.md` (a 1440 frame at 2x is 2880 px wide).

Merchant confirmed 2026-10-08: the two previews above show the **original** Home frames (`1:266` desktop,
`1:7075` mobile), not the revision `18:4094`.

## Home content assets (zip received 2026-10-08, stored in `assets/home/`, 48 files, ~25 MB)
Content for Shopify Files at build time; not design values. Files were renamed to the names the
templates reference (`shopify://shop_images/<name>`); upload them to Files unchanged (see
`docs/merchant-checklist.md`). Original Figma layer names are listed below for traceability.

| Role on Home | Files | Notes |
|---|---|---|
| Hero slide (desktop / mobile) | `HEADER_VALUE_DESKTOP.webp` 2000×530, `HEADER_VALUE_MOBILE.webp` 640×460 | already uploaded to the store (`templates/index.json` slideshow) |
| Logo | `logo.png` 741×192 | PNG; the softened logo `69:7519` should come as SVG |
| Category tiles (circles) | `image_23` (כלי אוכל), `image_24` (כלי בית bear), `image_25` (אביזרים bag), `image_26_1` (בגדי ילדים), `image_22` (ספרים), `image_21` (צעצועים ובובות), `image_20_1` (תחפושות mask) | 7 unique tiles; the frame repeats them to fill 14 slots → real list of categories still needed |
| Brand logos | `image_12` We Are Gommu, `image_13` Inspire My Play, `image_14` My Creative Box, `image_15` Ulanik, `image_16` Kooglo, `image_17_1` Jaba Daba Do, `image_18_1` Famokids, `image_27` Banana Panda | 8 logos, PNG; SVG preferred where available |
| Product photos (demo cards) | `Rectangle_12_7` (Kipod Cuttus), `Rectangle_12_8` (Engineering ride), `Rectangle_12_9` (Disney Princess game), `Rectangle_52_15` (Smart Sand), `Rectangle_52_16` (wooden rattle) | come from real products at build time, not from Files |
| Gift card image | `Rectangle_12_11.png` 2235×1758 | gift card product image |
| "רכישה לפי גיל" photo | `Rectangle_50_8.png` 1737×1497 (two kids), `Rectangle_50_9.png` smaller variant | section image |
| Age icons (6) | `fi_4416815` (0–6 m), `fi_2219796` (6–12 m), `fi_404956` (1–1.5 y), `fi_2423821` (1.5–2 y), `fi_105636` (2–3 y), `fi_105618` (3+ y) | Flaticon ids in file names; PNG 174 px → request SVG |
| Feature tiles icons (6) | `fi_2176706` (pacifier), `fi_3135064` (stroller), `fi_6027275` (bunny), `fi_2543848` (blocks), `fi_15452390` (brick), `fi_5574382` (dinosaur) | PNG 180 px → request SVG |
| Promo banner photo | `Rectangle_39.png` 3936×1230 (desktop), `Rectangle_39_1.png` 870×1440 (mobile) | |
| Testimonial product thumbs | reuse `Rectangle_12_7`, `Rectangle_52_15`, `Rectangle_52_16` | |
| Instagram feed thumbnails (5) | `2025-11-20_21.50.35_1`, `…35_2`, `…41_1`, `…41_2`, `…51_1_1` (544×724) | stills; actual reels/links needed for `shop-the-feed` |
| Instagram icon | `OBJECTS_1.png` 132×132 | new icon per `69:7521`; request SVG |
| Box photo | `image35.png` 1923×1434 | Mekupelet box (boxes section / about) |
| Kids photo | `Rectangle_69_1.png` 1425×1014 | two girls on pink/yellow; not placed on Home in the previews (about / banner?) |

## Full Figma export package (Google Drive, received 2026-10-08)
Source: the merchant's Drive file (124 MB zip, `exports/`). Contents: 58 frames PNG @2x
(`frames/`, kept locally only: 115 MB, gitignored; re-download from Drive when a new session needs
them), 28 assets (`assets/figma/`, tracked), fonts (already in `assets/mk-simplerpro-*.woff2`),
`tokens-devmode.txt` → `docs/figma/tokens-devmode.txt`, the package manifest →
`manifest-figma-package.md`, README → `README-figma-export.md`.
- `hero-revision-desktop.png` | 2880×1062, hero option B with baked text (reference only) | 2026-10-08
