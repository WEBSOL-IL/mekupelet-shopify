# Merchant admin checklist (Hebrew instructions, English handles)

Everything here is admin-side setup that the theme code expects. Handles and file names must match
exactly. Updated 2026-10-08 for the Home page (approximate build).

## 1. קבצים (Content → Files)
העלו את כל הקבצים מהתיקייה `docs/figma/exports/assets/home/` (48 קבצים) ל-**Content → Files**,
בלי לשנות שמות. התבנית מפנה אליהם לפי שם (`shopify://shop_images/<שם>`), ולכן ברגע שהקובץ
קיים הוא יופיע אוטומטית. חשובים לעמוד הבית:

| שימוש | קבצים |
|---|---|
| קטגוריות (עיגולים) | `cat-tableware.png`, `cat-home.png`, `cat-accessories.png`, `cat-kids-clothing.png`, `cat-books.png`, `cat-toys-dolls.png`, `cat-costumes.png` |
| רכישה לפי גיל | `photo-age-kids.png`, `icon-age-0-6.png`, `icon-age-6-12.png`, `icon-age-1-1-5.png`, `icon-age-1-5-2.png`, `icon-age-2-3.png`, `icon-age-3-plus.png` |
| מותגי הבית | `brand-we-are-gommu.png`, `brand-inspire-my-play.png`, `brand-my-creative-box.png`, `brand-famokids.png`, `brand-ulanik.png`, `brand-kooglo.png`, `brand-jaba-daba-do.png`, `brand-banana-panda.png` |
| באנר מבצע | `banner-promo-desktop.png`, `banner-promo-mobile.png` |
| אריחי אייקונים | `icon-tile-pacifier.png`, `icon-tile-stroller.png`, `icon-tile-bunny.png`, `icon-tile-blocks.png`, `icon-tile-brick.png`, `icon-tile-dino.png` |
| אינסטגרם | `insta-1.png` … `insta-5.png` |
| ביקורות (זמני) | `product-demo-kipod.png`, `product-demo-rattle.png`, `product-demo-smart-sand.png` |

אם Shopify משנה שם קובץ בגלל התנגשות (למשל `cat-home-1.png`), עדכנו את הסקשן בעורך או ספרו לי.

## 2. קולקציות (Products → Collections)
צרו את הקולקציות הבאות עם ה-handle המדויק (בשדה "URL and handle"). התוכן יכול להיות אוטומטי לפי תגיות.

| handle | כותרת | הצעה לתנאי אוטומטי |
|---|---|---|
| `best-sellers` | מובילים | תגית `רב מכר` |
| `new` | חדש באתר | תגית `חדש` (או תאריך יצירה) |
| `sale` | במבצע | מחיר השוואה > מחיר |
| `orly-picks` | המומלצים של אורלי | ידני |
| `tableware` | כלי אוכל | לפי סוג מוצר / תגית |
| `home` | כלי בית | |
| `accessories` | אביזרים | |
| `kids-clothing` | בגדי ילדים | |
| `books` | ספרים | |
| `toys-dolls` | צעצועים ובובות | |
| `costumes` | תחפושות | |
| `age-0-6`, `age-6-12`, `age-1-1-5`, `age-1-5-2`, `age-2-3`, `age-3-plus` | רכישה לפי גיל | תגיות `גיל-0-6`, `גיל-6-12`, `גיל-12-18`, `גיל-18-24`, `גיל-24-36`, `גיל-3-plus` |
| `we-are-gommu`, `inspire-my-play`, `my-creative-box`, `famokids`, `ulanik`, `kooglo`, `jaba-daba-do`, `banana-panda` | מותגים | ספק (Vendor) = שם המותג |

בעמוד הבית יש 14 עיגולי קטגוריה בעיצוב ורק 7 תמונות; שלחו לי את רשימת 14 הקטגוריות הסופית.

## 3. תגיות למוצרים (Badges + Finder)
- `חדש` → תג "חדש" על הכרטיס (ירוק). `רב מכר` → תג "רב מכר" (כחול). מבצע מזוהה אוטומטית ממחיר השוואה.
- תגיות גיל (ל"מצאו לי מתנה" ולקולקציות הגיל): `גיל-0-6`, `גיל-6-12`, `גיל-12-18`, `גיל-18-24`, `גיל-24-36`, `גיל-3-plus`.

## 4. סינון (Search & Discovery app → Filters)
הפעילו פילטרים: **Tag**, **Vendor**, **Product type**, **Price**. בלי זה הכפתור "מצאו לי מתנה" יוביל
לקולקציה בלי סינון. אם תעדיפו מטא-שדה לגיל במקום תגיות, ספרו לי ואעדכן את הפרמטר בסקשן.

## 5. תפריטים (Content → Menus)
| handle | שימוש | פריטים |
|---|---|---|
| `main-menu` | ניווט ראשי (קיים, יש בו 3 פריטי דמו) | 11 פריטי העיצוב: משחקים ומשחקיות, לפי גיל, מותגים, ספרים, … (שלחו רשימה סופית) |
| `footer-1` … `footer-4` | 4 עמודות הפוטר "חשוב לדעת" | אודות, משלוחים, מדיניות החזרות, תנאי שימוש, אזור אישי, הצהרת נגישות, FAQ, Gift Card, Blog, Brands |
| `footer` | תפריט תחתון (קיים) | |

## 6. עמודים
- `pages/brands` (כפתור "צפו בכל המותגים" מפנה לשם; ייבנה ב-Phase 4).

## 7. מה אני לא עושה
לפי הכללים אני לא יוצר/משנה מוצרים, קולקציות, תפריטים, קבצים או הגדרות חנות. הכול כאן בידיים שלכם.
