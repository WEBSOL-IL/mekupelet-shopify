# Figma manual export checklist (for the merchant)

Why: the Figma MCP integration is limited to 20 calls per month on the team's Starter plan and
the quota is spent. Until it resets, all design values come from these exports.
File key `YOVayNJZ1olagd5NLKXMzJ`, page `0:1`. Node ids are in `docs/figma-frame-map.md`.

Where to put the files: a Google Drive folder shared with `asher.websol@gmail.com`
(folder name `mekupelet-figma-exports`), or directly under `docs/figma/exports/` in this repo
(the folder is gitignored except `manifest.md`). Keep the file names below exactly.

## הוראות בעברית

1. **פריימים (PNG, 2x)**: בוחרים את הפריים בפיגמה (לפי node id: הדביקו בשורת הכתובת
   `?node-id=18-4094`), בפאנל הימני `Export` → `PNG` → `2x` → Export. שם הקובץ כמו בטבלה.
2. **נכסים (SVG)**: בוחרים את האלמנט (לוגו, אייקון, badge) → `Export` → `SVG` (לסמן
   "Include id attribute" כבוי, "Outline text" דלוק). שם הקובץ כמו בטבלה.
3. **ערכי עיצוב (Dev Mode)**: עוברים ל-Dev Mode (מקש `Shift+D`), בוחרים את האלמנט,
   בפאנל הימני `Code` → `CSS` → `Copy`, ומדביקים לקובץ טקסט אחד `tokens-devmode.txt` עם כותרת
   לפני כל בלוק (למשל `## button-primary`). האלמנטים הנדרשים בטבלה 3.
4. **סגנונות**: צילום מסך של פאנל `Local styles` (צבעים + טקסט) → `styles-colors.png`,
   `styles-text.png`. אם יש פלאגין "Design Tokens" / "Tokens Studio" – ייצוא JSON גם מצוין.
5. כשסיימתם: שלחו הודעה "הייצוא מוכן" עם קישור לתיקייה.

## 1. Frames (PNG @2x)

Priority A (needed for Phase 0/1):

| File name | Node | What |
|---|---|---|
| `18-4094-home-desktop.png` | `18:4094` | Home, approved revision |
| `52-5172-product-desktop.png` | `52:5172` | Product, approved revision |
| `69-5443-collection-desktop.png` | `69:5443` | Collection, approved revision |
| `1-266-home-desktop-original.png` | `1:266` | Home original (for the diff) |
| `1-1794-product-desktop-original.png` | `1:1794` | Product original (for the diff) |
| `1-949-collection-desktop-original.png` | `1:949` | Collection original (for the diff) |
| `1-7075-home-mobile.png` | `1:7075` | Home mobile |
| `1-10570-product-mobile.png` | `1:10570` | Product mobile |
| `1-7815-collection-mobile.png`, `1-8109-collection-mobile-b.png` | `1:7815`, `1:8109` | Collection mobile |
| `1-806-header-desktop.png` | `1:806` | Header, mega menu open + USP bar |
| `1-7663-header-mobile.png`, `1-7515-header-mobile-b.png` | `1:7663`, `1:7515` | Mobile header / menu |
| `1-2285-minicart-desktop.png`, `1-2583-minicart-desktop-b.png` | `1:2285`, `1:2583` | Mini cart, 2 states |
| `1-11029-minicart-mobile.png`, `1-11180-minicart-mobile-b.png` | `1:11029`, `1:11180` | Mini cart mobile |
| `1-8411-filter-mobile.png` … | `1:8411`, `1:10169`, `1:8760`, `1:9101`, `1:9482`, `1:9824` | Collection filter/sort states (mobile) |

Priority B (Phase 4/5; can come later):

| File name | Node |
|---|---|
| `1-3123-about-desktop.png`, `1-11532-about-mobile.png` | `1:3123`, `1:11532` |
| `1-5823-legal-desktop.png`, `1-13383-legal-mobile.png` | `1:5823`, `1:13383` |
| `1-5916-faq-desktop.png`, `1-13515-faq-mobile.png` | `1:5916`, `1:13515` |
| `1-3983-brands-desktop.png`, `1-12147-brands-mobile.png` | `1:3983`, `1:12147` |
| `1-4180-brand-desktop.png`, `1-4781-brand-desktop-b.png`, `1-12270-brand-mobile.png`, `1-12572-brand-mobile-b.png` | `1:4180`, `1:4781`, `1:12270`, `1:12572` |
| `1-5487-blog-desktop.png`, `1-11862-blog-mobile.png` | `1:5487`, `1:11862` |
| `1-5586-article-desktop.png`, `1-11947-article-mobile.png` | `1:5586`, `1:11947` |
| `1-2885-giftcard-desktop.png`, `1-11334-giftcard-mobile.png` | `1:2885`, `1:11334` |
| `1-1598-boxes-desktop.png`, `1-1707-boxes-desktop-b.png`, `1-14520-boxes-mobile.png`, `1-14618-boxes-mobile-b.png` (+ `1-14696`, `1-14758`, `1-14884`) | boxes collection |
| `1-6078-assembled-desktop.png`, `1-6318-assembled-desktop-b.png`, `1-13666-assembled-mobile.png`, `1-13869-assembled-mobile-b.png` | assembled box |
| `1-6572-surprise-desktop.png`, `1-14085-surprise-mobile.png` | surprise box |
| `1-6850-package-desktop.png`, `1-14328-package-mobile.png` | ready-made package |
| `1-3455-course-desktop.png`, `1-12866-course-mobile.png` | course landing page (if in scope) |

## 2. Assets (SVG unless noted)

| File name | Node / where | Notes |
|---|---|---|
| `logo.svg` | `69:7519` | Softened logo (designer note `69:7520`) |
| `logo-options-*.png` | `141:4402`, `141:4435`, `134:4387`, `134:4385` | Header/logo options, PNG 2x, for reference only |
| `icon-instagram.svg` | new Instagram icon (note `69:7521`) | |
| `icon-usp-*.svg` | USP bar icons with solid white background (notes `69:7497`, `69:5434`, `69:5433`) | one file per icon, name by meaning (`icon-usp-shipping.svg`…) |
| `badge-new.svg`, `badge-sale.svg`, `badge-bestseller.svg` | product card badges in `18:4094` | export the whole badge (shape + text) and also note the fill colors in tokens |
| `icon-heart.svg`, `icon-heart-active.svg` | wishlist heart (note `69:5438`) | |
| `icon-star.svg` | review star, new color (note `69:7499`) | |
| `icon-cart.svg`, `icon-search.svg`, `icon-user.svg`, `icon-menu.svg`, `icon-chevron.svg`, `icon-arrow.svg`, `icon-close.svg`, `icon-filter.svg` | header / nav / slider icons | |
| `hero-option-a.png`, `hero-option-b.png` | `69:4498`, `69:4497` | PNG 2x, still OPEN which one is final |
| `payment-icons.svg` | footer | if present |

## 3. Dev Mode CSS values (`tokens-devmode.txt`)

One block per item, from the revision frames (`18:4094` / `52:5172` / `69:5443`):

- `button-primary` (blue action button), `button-primary-hover` if a hover variant exists,
  `button-secondary`, `button-outline`
- `product-card` (container with the square border), `product-card-title`, `product-card-price`,
  `product-card-compare-price`, `badge-new`, `badge-sale`, `badge-bestseller`
- `input` (search field / newsletter field), `input-focus` if exists
- `nav-bar` (gray border, no shadow), `mega-menu-panel`, `usp-bar`
- `h1`, `h2`, `h3`, `h4`, `body`, `body-small`, `caption`, `price`
- `section-heading` (any home section title), `link`
- `footer-background`, `footer-text`, `divider`

## 4. Manifest

After exporting, list every file in `docs/figma/exports/manifest.md` (file name, node id, date).
