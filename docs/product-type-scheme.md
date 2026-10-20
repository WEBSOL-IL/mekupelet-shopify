# Product type scheme (v2, approved 2026-10-20, written to the store)

The merchant replaced the 55 fine types of 2026-10-19 by **20 product types** (`docs/import/product-types-20.xlsx`,
sheet "20 Product Types"). The fine type is kept per product in the metafield **custom.product_subtype**
(single line text, choice list of the 61 old values, pinned, storefront-readable) so nothing is lost: 
filters and collections can use either level. The Shopify standard category set on 2026-10-19 per fine type
stays (it is more specific than the 20).

| Product type (20) | Sub-types (custom.product_subtype) |
|---|---|
| משחקי קופסה וקלפים | משחק קופסה, משחק קלפים, משחק זיכרון והתאמה |
| פאזלים | פאזל |
| משחקי חשיבה ולמידה | משחק חשיבה ולוגיקה, משחק למידה, ערכת מדע |
| משחקי בנייה והרכבה | משחק מגנטים, משחק קוביות והרכבה, קופסה בהרכבה |
| בובות ובתי בובות | בובה, בובת בד ורכים, בית בובות ואביזרים |
| משחקי דמיון ותפקידים | דמויות ומשחק דמיון, מטבח ואביזרי בישול |
| כלי רכב | כלי רכב צעצוע |
| צעצועים לתינוקות | צעצוע עץ, צעצוע אלקטרוני, רעשן ונשכן, מובייל, משטח פעילות |
| משחקי חוץ ותנועה | צעצוע משיכה ודחיפה, עגלה והליכון, משחק תנועה וחוץ, בימבה ורכיבה |
| משחקי מים ואמבטיה | משחק לאמבטיה, צעצוע לחוף ולים |
| ערכות יצירה | ערכת יצירה, תפירה, רקמה וסריגה, ערכת תכשיטים ואופנה, אוריגמי ונייר |
| חומרי יצירה | חוברת צביעה וציור, צבעים וכלי ציור, מדבקות, חול, גבס ובצק |
| ספרים | ספר |
| כלי נגינה | כלי נגינה |
| תחפושות ואביזרים | קעקועים, תחפושת, מסכה, כתר וכובע |
| מוצרי תינוקות | מנשא וטטרה, אביזרי עגלה ואמבטיה, סינר, טקסטיל לתינוק |
| לבית ולחדר הילדים | כלי אוכל ושתייה, כלי בית ונוי, אחסון, מצעים וכריות, תאורה, נר |
| ביגוד ואקססוריז | תיק וארנק, טיפוח, בגד ילדים, בגד ים, נעליים |
| מסיבות וניירת | קישוט למסיבה, כרטיס ברכה, כלי כתיבה ומחברות |
| מארזים ומתנות | קופסת הפתעה, מארז |

## How it was applied

1. `scripts/create-choice-definition.py docs/import/subtype-choices.json --execute` created the sub-type definition.
2. `scripts/remap-product-types.py --execute` (mapping in `docs/import/product-type-mapping.json`) set the new
   `productType` and the sub-type on every typed product (1,791); the 34 products without a type stay empty.
3. Search & Discovery (merchant): filter "סוג מוצר" = Product type; optional second filter "תת-סוג" on the metafield.

## v1 (2026-10-19, superseded)

55 fine types from `scripts/propose-product-types.py` (leaf collection → title keyword → vendor), each with a
Shopify standard category; they live on as the sub-types above.
