# Product type scheme (approved 2026-10-19, written to the store)

Today no product has a `product_type` or a Shopify standard category (0 of 1,824). Navigation lives in
collections (automated by the legacy WooCommerce category tags) and in `custom.category` (multi-value, mostly
parent levels: "משחקים וצעצועים" on 1,641 products, "משחקי חשיבה וקופסה" on 1,282).

## Principles

- `product_type` answers one question, **what is the item** (פאזל, בובה, ספר), never for whom (age), why
  (skill), from whom (brand) or when (holiday). Those stay in metafields, vendor and collections.
- One value per product, from a closed list (the sheet below). Hebrew, singular, no brand names.
- Each type maps to one Shopify **standard product category** (Google/Shop taxonomy): set together with the
  type, it feeds Google Shopping, the Shop app and tax rules, and it is what Shopify itself expects.
- Collections and the age / skills filters keep working as they are; the type adds a "סוג מוצר" filter in
  Search & Discovery and a clean axis for reports and recommendations.

## The list (61 types in 10 families) with the proposed counts

| Family | Type | Shopify standard category | Products |
|---|---|---|---|
| משחקים | משחק קופסה | Toys & Games > Games > Board Games | 126 |
| משחקים | משחק חשיבה ולוגיקה | Toys & Games > Puzzles | 32 |
| משחקים | משחק קלפים | Toys & Games > Games > Card Games | 51 |
| משחקים | פאזל | Toys & Games > Puzzles > Jigsaw Puzzles | 165 |
| משחקים | משחק זיכרון והתאמה | Toys & Games > Games | 28 |
| משחקים | משחק מגנטים | Toys & Games > Toys > Educational Toys | 49 |
| משחקים | משחק למידה | Toys & Games > Toys > Educational Toys | 93 |
| משחקים | משחק קוביות והרכבה | Toys & Games > Toys > Building Toys | 58 |
| משחקים | משחק תנועה וחוץ | Toys & Games > Outdoor Play Equipment | 29 |
| משחקים | משחק לאמבטיה | Toys & Games > Toys > Bath Toys | 9 |
| משחקים | ערכת מדע | Toys & Games > Toys > Educational Toys | 14 |
| צעצועים | בובה | Toys & Games > Toys > Dolls, Playsets & Toy Figures > Dolls | 46 |
| צעצועים | בובת בד ורכים | Toys & Games > Toys | 0 |
| צעצועים | בית בובות ואביזרים | Toys & Games > Toys > Dolls, Playsets & Toy Figures > Dollhouses | 54 |
| צעצועים | דמויות ומשחק דמיון | Toys & Games > Toys > Dolls, Playsets & Toy Figures > Toy Playsets | 72 |
| צעצועים | כלי רכב צעצוע | Toys & Games > Toys > Play Vehicles | 32 |
| צעצועים | מטבח ואביזרי בישול | Toys & Games > Toys > Pretend Play > Toy Kitchens & Play Food | 47 |
| צעצועים | כלי נגינה | Toys & Games > Toys > Musical Toys | 19 |
| צעצועים | צעצוע משיכה ודחיפה | Baby & Toddler > Baby Toys & Activity Equipment > Push & Pull Toys | 3 |
| צעצועים | עגלה והליכון | Baby & Toddler > Baby Toys & Activity Equipment > Push & Pull Toys | 14 |
| צעצועים | צעצוע עץ | Toys & Games > Toys | 29 |
| צעצועים | בימבה ורכיבה | Toys & Games > Toys > Riding Toys | 3 |
| צעצועים | צעצוע אלקטרוני | Toys & Games > Toys | 11 |
| צעצועים | צעצוע לחוף ולים | Toys & Games > Toys > Beach & Sand Toys | 32 |
| לתינוקות | רעשן ונשכן | Baby & Toddler > Baby Toys & Activity Equipment > Baby Activity Toys > Rattles | 57 |
| לתינוקות | מובייל | Baby & Toddler > Baby Toys & Activity Equipment > Baby Mobiles | 7 |
| לתינוקות | משטח פעילות | Baby & Toddler > Baby Toys & Activity Equipment > Play Mats & Gyms | 3 |
| לתינוקות | מנשא וטטרה | Baby & Toddler > Baby Transport Accessories | 9 |
| לתינוקות | אביזרי עגלה ואמבטיה | Baby & Toddler > Baby Transport Accessories | 3 |
| לתינוקות | סינר | Baby & Toddler > Nursing & Feeding > Feeding Essentials > Bibs | 4 |
| לתינוקות | טקסטיל לתינוק | Home & Garden > Linens & Bedding > Bedding | 3 |
| יצירה | ערכת יצירה | Arts & Entertainment > Hobbies & Creative Arts > Arts & Crafts > Art & Craft Kits | 84 |
| יצירה | חוברת צביעה וציור | Arts & Entertainment > Hobbies & Creative Arts > Arts & Crafts > Art & Craft Kits | 195 |
| יצירה | צבעים וכלי ציור | Arts & Entertainment > Hobbies & Creative Arts > Arts & Crafts > Art & Crafting Materials | 0 |
| יצירה | מדבקות | Arts & Entertainment > Hobbies & Creative Arts > Arts & Crafts > Art & Crafting Materials | 66 |
| יצירה | חול, גבס ובצק | Arts & Entertainment > Hobbies & Creative Arts > Arts & Crafts > Art & Crafting Materials > Pottery & Sculpting Materials > Clay & Modeling Dough | 46 |
| יצירה | קעקועים | Arts & Entertainment > Party & Celebration > Party Supplies | 11 |
| יצירה | תפירה, רקמה וסריגה | Arts & Entertainment > Hobbies & Creative Arts > Arts & Crafts > Art & Craft Kits | 8 |
| יצירה | ערכת תכשיטים ואופנה | Arts & Entertainment > Hobbies & Creative Arts > Arts & Crafts > Art & Craft Kits | 35 |
| יצירה | אוריגמי ונייר | Arts & Entertainment > Hobbies & Creative Arts > Arts & Crafts > Art & Crafting Materials > Art & Craft Paper | 51 |
| ספרים | ספר | Media > Books | 60 |
| חגים ומסיבה | תחפושת | Apparel & Accessories > Costumes & Accessories > Costumes | 5 |
| חגים ומסיבה | מסכה | Apparel & Accessories > Costumes & Accessories > Masks | 0 |
| חגים ומסיבה | כתר וכובע | Apparel & Accessories > Costumes & Accessories > Costume Accessories | 6 |
| חגים ומסיבה | קישוט למסיבה | Arts & Entertainment > Party & Celebration > Party Supplies | 4 |
| חגים ומסיבה | כרטיס ברכה | Arts & Entertainment > Party & Celebration > Gift Giving > Greeting & Note Cards | 14 |
| כלי בית | כלי אוכל ושתייה | Home & Garden > Kitchen & Dining > Tableware | 6 |
| כלי בית | כלי בית ונוי | Home & Garden > Decor | 31 |
| כלי בית | אחסון | Home & Garden > Household Supplies > Storage & Organization | 8 |
| כלי בית | מצעים וכריות | Home & Garden > Linens & Bedding | 5 |
| כלי בית | תאורה | Home & Garden > Lighting | 2 |
| כלי בית | נר | Home & Garden > Decor > Home Fragrances > Candles | 15 |
| אקססוריז | תיק וארנק | Apparel & Accessories > Handbags, Wallets & Cases | 7 |
| אקססוריז | כלי כתיבה ומחברות | Office Supplies > General Office Supplies | 6 |
| אקססוריז | טיפוח | Health & Beauty > Personal Care | 0 |
| בגדים | בגד ילדים | Apparel & Accessories > Clothing | 18 |
| בגדים | בגד ים | Apparel & Accessories > Clothing > Swimwear | 1 |
| בגדים | נעליים | Apparel & Accessories > Shoes | 2 |
| קופסאות | קופסה בהרכבה | Toys & Games | 0 |
| קופסאות | קופסת הפתעה | Toys & Games | 0 |
| קופסאות | מארז | Toys & Games | 3 |
| — | לבדיקה (no rule matched) | — | 33 |

## How the draft was built (`scripts/propose-product-types.py`)

Sources in priority order, with the confidence written next to every product in
`docs/import/out/product-type-proposal.xlsx` (sheet "product types"; sheet "scheme" = this list):

1. a **leaf collection of the main menu** (e.g. פאזלים → פאזל): 1041 products, high confidence;
2. a **keyword in the title** (first rule that matches): 612 products, medium;
3. a **generic collection or the brand** (צעצועי עץ, פוקסמיינד → משחק חשיבה ולוגיקה…): 138 products, low;
4. nothing matched: 33 products marked לבדיקה (mostly books and home decor under vendor "מוצרים נוספים").

## Next steps

1. Merchant reviews the sheet (column "סוג מוצר מוצע"; fix any row, rename or merge types in the list).
2. `scripts/apply-product-types.py <sheet> --execute` (to write) sets `productType` and the standard category
   via `productUpdate` in batches, and reports the result. Nothing is written before the review.
3. Add the "סוג מוצר" filter in Search & Discovery (Product type) and, if wanted, the type under the title on
   the product card (Hyper setting `pcard_show_type`).
