#!/usr/bin/env python3
"""Propose one Shopify `product_type` per product (Hebrew, flat list, "what the item is").

Input: a JSON dump of every product (scripts/dump-products.py or the inline query in docs/progress.md)
with handle, title, vendor, tags, collections (handles). Sources, in priority order:
  1. the product's leaf collections in the main menu (docs/import/menus.json), mapped by LEAF_TO_TYPE;
  2. keyword rules on the title (KEYWORDS, first match wins);
  3. the product's mid-level collection (MID_TO_TYPE);
  otherwise "לבדיקה" (needs a human decision).
Writes docs/import/out/product-type-proposal.xlsx (one row per product, type + source + confidence)
and prints the distribution. Nothing is written to the store: apply with scripts/apply-product-types.py
after the merchant reviews the sheet.

Run: python3 -I scripts/propose-product-types.py <products.json>
"""
import json, re, sys, collections, os

# --- the scheme: type -> (Shopify standard category for Google/Shop, family) --------------------
SCHEME = {
    # משחקים
    'משחק קופסה': ('Toys & Games > Games > Board Games', 'משחקים'),
    'משחק חשיבה ולוגיקה': ('Toys & Games > Puzzles > Brain Teasers', 'משחקים'),
    'משחק קלפים': ('Toys & Games > Games > Card Games', 'משחקים'),
    'פאזל': ('Toys & Games > Puzzles > Jigsaw Puzzles', 'משחקים'),
    'משחק זיכרון והתאמה': ('Toys & Games > Games', 'משחקים'),
    'משחק מגנטים': ('Toys & Games > Toys > Educational Toys', 'משחקים'),
    'משחק למידה': ('Toys & Games > Toys > Educational Toys', 'משחקים'),
    'משחק קוביות והרכבה': ('Toys & Games > Toys > Building Toys', 'משחקים'),
    'משחק תנועה וחוץ': ('Toys & Games > Outdoor Play Equipment', 'משחקים'),
    'משחק לאמבטיה': ('Toys & Games > Toys > Bath Toys', 'משחקים'),
    'ערכת מדע': ('Toys & Games > Toys > Educational Toys > Science Kits', 'משחקים'),
    # צעצועים
    'בובה': ('Toys & Games > Toys > Dolls, Playsets & Toy Figures > Dolls', 'צעצועים'),
    'בובת בד ורכים': ('Toys & Games > Toys > Stuffed Animals & Plush Toys', 'צעצועים'),
    'בית בובות ואביזרים': ('Toys & Games > Toys > Dolls, Playsets & Toy Figures > Dollhouses', 'צעצועים'),
    'דמויות ומשחק דמיון': ('Toys & Games > Toys > Dolls, Playsets & Toy Figures > Toy Playsets', 'צעצועים'),
    'כלי רכב צעצוע': ('Toys & Games > Toys > Toy Vehicles', 'צעצועים'),
    'מטבח ואביזרי בישול': ('Toys & Games > Toys > Pretend Play > Play Kitchens & Food', 'צעצועים'),
    'כלי נגינה': ('Toys & Games > Toys > Musical Toys', 'צעצועים'),
    'צעצוע משיכה ודחיפה': ('Toys & Games > Toys > Push & Pull Toys', 'צעצועים'),
    'עגלה והליכון': ('Toys & Games > Toys > Push & Pull Toys', 'צעצועים'),
    'צעצוע עץ': ('Toys & Games > Toys', 'צעצועים'),
    'בימבה ורכיבה': ('Toys & Games > Toys > Riding Toys', 'צעצועים'),
    'צעצוע אלקטרוני': ('Toys & Games > Toys > Electronic Toys', 'צעצועים'),
    'צעצוע לחוף ולים': ('Toys & Games > Toys > Beach & Sand Toys', 'צעצועים'),
    # לתינוקות
    'רעשן ונשכן': ('Baby & Toddler > Baby Toys & Activity Equipment > Rattles', 'לתינוקות'),
    'מובייל': ('Baby & Toddler > Baby Toys & Activity Equipment > Baby Mobiles', 'לתינוקות'),
    'משטח פעילות': ('Baby & Toddler > Baby Toys & Activity Equipment > Play Mats & Gyms', 'לתינוקות'),
    'מנשא וטטרה': ('Baby & Toddler > Baby Transport Accessories', 'לתינוקות'),
    'אביזרי עגלה ואמבטיה': ('Baby & Toddler > Baby Transport Accessories', 'לתינוקות'),
    'סינר': ('Baby & Toddler > Nursing & Feeding > Bibs', 'לתינוקות'),
    'טקסטיל לתינוק': ('Baby & Toddler > Baby Bedding', 'לתינוקות'),
    # יצירה
    'ערכת יצירה': ('Arts & Entertainment > Hobbies & Creative Arts > Arts & Crafts > Art & Craft Kits', 'יצירה'),
    'חוברת צביעה וציור': ('Arts & Entertainment > Hobbies & Creative Arts > Arts & Crafts > Art & Craft Kits', 'יצירה'),
    'צבעים וכלי ציור': ('Arts & Entertainment > Hobbies & Creative Arts > Arts & Crafts > Art & Crafting Materials', 'יצירה'),
    'מדבקות': ('Arts & Entertainment > Hobbies & Creative Arts > Arts & Crafts > Art & Crafting Materials', 'יצירה'),
    'חול, גבס ובצק': ('Arts & Entertainment > Hobbies & Creative Arts > Arts & Crafts > Art & Crafting Materials > Craft Clay', 'יצירה'),
    'קעקועים': ('Arts & Entertainment > Party & Celebration > Party Supplies', 'יצירה'),
    'תפירה, רקמה וסריגה': ('Arts & Entertainment > Hobbies & Creative Arts > Arts & Crafts > Art & Craft Kits', 'יצירה'),
    'ערכת תכשיטים ואופנה': ('Arts & Entertainment > Hobbies & Creative Arts > Arts & Crafts > Art & Craft Kits', 'יצירה'),
    'אוריגמי ונייר': ('Arts & Entertainment > Hobbies & Creative Arts > Arts & Crafts > Art & Crafting Materials > Craft Paper', 'יצירה'),
    # ספרים
    'ספר': ('Media > Books', 'ספרים'),
    # חגים ומסיבה
    'תחפושת': ('Apparel & Accessories > Costumes & Accessories > Costumes', 'חגים ומסיבה'),
    'מסכה': ('Apparel & Accessories > Costumes & Accessories > Costume Accessories > Masks', 'חגים ומסיבה'),
    'כתר וכובע': ('Apparel & Accessories > Costumes & Accessories > Costume Accessories', 'חגים ומסיבה'),
    'קישוט למסיבה': ('Arts & Entertainment > Party & Celebration > Party Supplies', 'חגים ומסיבה'),
    'כרטיס ברכה': ('Arts & Entertainment > Party & Celebration > Gift Giving > Greeting & Note Cards', 'חגים ומסיבה'),
    # כלי בית ואקססוריז
    'כלי אוכל ושתייה': ('Baby & Toddler > Nursing & Feeding > Baby & Toddler Tableware', 'כלי בית'),
    'כלי בית ונוי': ('Home & Garden > Decor', 'כלי בית'),
    'אחסון': ('Home & Garden > Household Supplies > Storage & Organization', 'כלי בית'),
    'מצעים וכריות': ('Home & Garden > Linens & Bedding', 'כלי בית'),
    'תאורה': ('Home & Garden > Lighting', 'כלי בית'),
    'נר': ('Home & Garden > Decor > Candles', 'כלי בית'),
    'תיק וארנק': ('Apparel & Accessories > Handbags, Wallets & Cases', 'אקססוריז'),
    'כלי כתיבה ומחברות': ('Office Supplies > General Office Supplies', 'אקססוריז'),
    'טיפוח': ('Health & Beauty > Personal Care', 'אקססוריז'),
    'בגד ילדים': ('Apparel & Accessories > Clothing', 'בגדים'),
    'בגד ים': ('Apparel & Accessories > Clothing > Swimwear', 'בגדים'),
    'נעליים': ('Apparel & Accessories > Shoes', 'בגדים'),
    # קופסאות
    'קופסה בהרכבה': ('Toys & Games', 'קופסאות'),
    'קופסת הפתעה': ('Toys & Games', 'קופסאות'),
    'מארז': ('Toys & Games', 'קופסאות'),
}

# menu leaf collection handle -> type (higher in the list = higher priority when a product has several)
LEAF_TO_TYPE = [
    ('פאזלים', 'פאזל'), ('משחקי-קלפים', 'משחק קלפים'), ('משחקי-קופסה', 'משחק קופסה'), ('מגנטים', 'משחק מגנטים'),
    ('משחקי-הרכבה', 'משחק קוביות והרכבה'), ('משחקי-מדע', 'ערכת מדע'), ('משחקי-תנועה', 'משחק תנועה וחוץ'),
    ('משחקים-לחצר', 'משחק תנועה וחוץ'), ('לאמבטיה-ולבריכה', 'משחק לאמבטיה'),
    ('כרטיסיות', 'משחק למידה'), ('משחקי-למידה', 'משחק למידה'), ('משחקים-דידקטיים', 'משחק למידה'),
    ('לימוד-צבעים-מספרים-וצורות', 'משחק למידה'), ('ביסוס-הקשרי-מילה-תמונה', 'משחק למידה'), ('משחקים-באנגלית', 'משחק למידה'),
    ('בתי-בובות-ואביזרים', 'בית בובות ואביזרים'), ('מטבח-ואביזרי-בישול', 'מטבח ואביזרי בישול'), ('כלי-רכב-ותחבורה', 'כלי רכב צעצוע'),
    ('כלי-נגינה', 'כלי נגינה'), ('עגלות-מריצות-והליכונים', 'עגלה והליכון'), ('בובות', 'בובה'),
    ('בעלי-חיים-וטבע', 'דמויות ומשחק דמיון'), ('משחקי-דמיון-ודמויות', 'דמויות ומשחק דמיון'), ('משחקי-דמיון', 'דמויות ומשחק דמיון'),
    ('נשכנים-רעשנים-כדורי-פעילות', 'רעשן ונשכן'), ('מוביילים', 'מובייל'), ('מזרני-פעילות', 'משטח פעילות'),
    ('מנשאים-טטרות-רכים', 'מנשא וטטרה'), ('תיקי-עגלה-אביזרים-לעגלה-אמבטיה', 'אביזרי עגלה ואמבטיה'), ('סינרים', 'סינר'),
    ('כריות-הנקה-טקסטיל', 'טקסטיל לתינוק'), ('בגדי-תינוקות', 'בגד ילדים'),
    ('מדבקות-וחוברות-הדבקה', 'מדבקות'), ('חול-גבס-ובצק', 'חול, גבס ובצק'), ('קעקועים', 'קעקועים'),
    ('תפירה-ריקמה-וסריגה', 'תפירה, רקמה וסריגה'), ('אופנה-ותכשיטים', 'ערכת תכשיטים ואופנה'), ('נייר-וקארדסטוק', 'אוריגמי ונייר'),
    ('בובות-ערכות-יצירה-ואומנות', 'ערכת יצירה'), ('פעילות-חושית-סנסורית', 'ערכת יצירה'), ('צביעה-ציור-למידה-ועיצוב', 'חוברת צביעה וציור'),
    ('ספרים-בעברית', 'ספר'), ('ספרים-באנגלית', 'ספר'),
    ('סכום-ואביזרים-לילדים', 'כלי אוכל ושתייה'), ('כלי-מטבח-ובישול', 'כלי אוכל ושתייה'), ('אביזרי-נוי', 'כלי בית ונוי'),
    ('פופים-וארגזים-אחסון', 'אחסון'), ('מצעים-וכריות', 'מצעים וכריות'), ('תאורה', 'תאורה'), ('נרות', 'נר'),
    ('תיקים-וארנקים', 'תיק וארנק'), ('כלי-כתיבה', 'כלי כתיבה ומחברות'), ('מחברות', 'כלי כתיבה ומחברות'), ('מוצרי-יופי-וטיפוח', 'טיפוח'),
    ('בגדי-ים-ומוצרים-לקיץ', 'בגד ים'), ('חורף', 'בגד ילדים'),
    ('משחקים-לנסיעה', None), ('מונטסורי', None), ('משחקים-התפתחותיים', None), ('משחקי-חברה-וחשיבה', None), ('צעצועי-עץ', None),
]
MID_TO_TYPE = {
    'תחפושות': 'תחפושת', 'מסיכות': 'מסכה', 'כתרים-וכובעים': 'כתר וכובע', 'קישוטים-ושולחן-מסיבה': 'קישוט למסיבה',
    'אביזרים-וקישוטים-לחגים': 'קישוט למסיבה', 'כרטיסי-ברכה': 'כרטיס ברכה', 'hanukkah': 'קישוט למסיבה', 'חנוכה': 'קישוט למסיבה',
    'ספרים': 'ספר', 'surprise-boxes': 'קופסת הפתעה', 'קופסאות-בהרכבה': 'קופסה בהרכבה', 'בגדי-ילדים': 'בגד ילדים',
    'סנדלים-ונעלי-טרום-הליכה': 'נעליים', 'כלי-אוכל': 'כלי אוכל ושתייה', 'כלי-בית': 'כלי בית ונוי',
}
# title keywords (regex, first match wins); the title axis is checked before the weak leaves (צעצועי עץ, חשיבה)
KEYWORDS = [
    (r'סודוקו|סולוג\'יק|לוגיק|חידות|חידה|סמארט ?גיימס|smart ?games|איי קיו|IQ|קרוקו לוקו|תפוס ת', 'משחק חשיבה ולוגיקה'),
    (r'רביעיות|רביעיה|מלחמה|קלף', 'משחק קלפים'), (r'יוגי|תלת.?מימד|3D', 'פאזל'), (r'סמארטמקס|smartmax', 'משחק מגנטים'),
    (r'כריכה קשה|כריכה רכה|דפי קרטון|ספר\b', 'ספר'), (r'מצלמה|אלקטרוני|דיגיטלי|מקרן|ווקי', 'צעצוע אלקטרוני'),
    (r'בימבה|רכיבה|קורקינט|אופני|ריידר|rider', 'בימבה ורכיבה'), (r'גלגל ים|דלי|חוף|לים\b|שייט|ספינת|צוללת', 'צעצוע לחוף ולים'),
    (r'זכוכית|ואזה|אגרטל|צנצנת|קערת|מגש|כד\b|פסל|מראה', 'כלי בית ונוי'), (r'חצאית|טוטו|חליפ|חגורת איפור|תיק איפור', 'בגד ילדים'),
    (r'מיומנות|השחלה|פינצט', 'משחק למידה'), (r'שולחן כלי עבודה|כלי עבודה|נגרות', 'דמויות ומשחק דמיון'), (r'ברייל|לספור|חשבון', 'משחק למידה'),
    (r'פאזל', 'פאזל'), (r'משחק קלפים|קלפים', 'משחק קלפים'), (r'זיכרון|זכרון|התאמה|דומינו|לוטו|בינגו', 'משחק זיכרון והתאמה'),
    (r'מגנט', 'משחק מגנטים'), (r'קוביות|הרכבה|לגו|בניה|בנייה|מגדל', 'משחק קוביות והרכבה'),
    (r'ספר\b|ספרון|חוברת סיפור', 'ספר'), (r'מדבקות|מדבקה', 'מדבקות'), (r'קעקוע', 'קעקועים'),
    (r'צביעה|ציור|לצבוע|צבעי|צבעים|טושים|עפרונות|גירים|פנדה|מברשות', 'חוברת צביעה וציור'),
    (r'אוריגמי|נייר|קארדסטוק', 'אוריגמי ונייר'), (r'בצק|חול קינטי|גבס|פלסטלינה|חימר', 'חול, גבס ובצק'),
    (r'תפירה|רקמה|סריגה|אריגה|חרוזים|צמידים|תכשיט', 'ערכת תכשיטים ואופנה'), (r'יצירה|ערכת|ערכה', 'ערכת יצירה'),
    (r'מובייל', 'מובייל'), (r'רעשן|נשכן|כדור פעילות', 'רעשן ונשכן'), (r'משטח פעילות|מזרן|מזרון|ג\'ים', 'משטח פעילות'),
    (r'מנשא|טטרה|סלינג', 'מנשא וטטרה'), (r'סינר|ביב', 'סינר'), (r'שמיכ|כרית|מצעים|מגבת', 'מצעים וכריות'),
    (r'בית בובות|רהיטי בובות', 'בית בובות ואביזרים'), (r'בובת בד|בובה רכה|פרוותי|קטיפה', 'בובת בד ורכים'), (r'בובה|בובות|בובת', 'בובה'),
    (r'מטבח|בישול|אפייה|קפה|פיצה|עוגה|סופר|קופה', 'מטבח ואביזרי בישול'),
    (r'רכבת|מכונית|משאית|מטוס|אוטו|טרקטור|רכב|מסוק|ספינה|סירה|מסלול', 'כלי רכב צעצוע'),
    (r'תוף|גיטרה|קסילופון|מטלופון|פסנתר|כלי נגינה|חליל|מרקס|נגינה', 'כלי נגינה'),
    (r'משיכה|דחיפה|גלגלים', 'צעצוע משיכה ודחיפה'), (r'עגלה|הליכון|מריצה', 'עגלה והליכון'),
    (r'דמויות|דמות|פיגור|חיות|דינוזאור|בעלי חיים|חווה|חיות', 'דמויות ומשחק דמיון'),
    (r'תחפושת|כנפיים|גלימה', 'תחפושת'), (r'מסכה|מסיכה', 'מסכה'), (r'כתר|כובע|נזר', 'כתר וכובע'),
    (r'ברכה|כרטיס', 'כרטיס ברכה'), (r'בלונ|גרלנד|שרשרת נייר|קישוט|מפיות|צלחות|מסיבה|נרות ליום הולדת|פיניאטה', 'קישוט למסיבה'),
    (r'נר\b|נרות', 'נר'), (r'תיק|ארנק|ילקוט', 'תיק וארנק'), (r'קערה|כוס|בקבוק|צלחת|סכו|מזלג|כף|קופסת אוכל|לאנץ', 'כלי אוכל ושתייה'),
    (r'מנורה|תאורה|לילה', 'תאורה'), (r'אחסון|ארגז|סל\b|פוף', 'אחסון'),
    (r'בגד ים|חליפת ים|ביקיני', 'בגד ים'), (r'חולצ|מכנס|שמלה|גרביים|גרבי|מעיל|סווטשירט|בגד', 'בגד ילדים'), (r'נעל|סנדל', 'נעליים'),
    (r'מדע|ניסוי|חפירת|שלד|טלסקופ|מיקרוסקופ|חרקים', 'ערכת מדע'), (r'אמבטיה|למים|בריכה', 'משחק לאמבטיה'),
    (r'כדור|טניס|חבל|קפיצה|כדורגל|מטקות|רוכב|ספורט|חצר', 'משחק תנועה וחוץ'),
    (r'משחק קופסה|משחק חשיבה|משחק|אסטרטגיה', 'משחק קופסה'),
    (r'קופסה בהרכבה', 'קופסה בהרכבה'), (r'קופסת הפתעה', 'קופסת הפתעה'), (r'מארז', 'מארז'),
    (r'למידה|לימוד|אותיות|מספרים|צורות|שעון|כרטיסיות', 'משחק למידה'),
]
VENDOR_TO_TYPE = {
    'פוקסמיינד': 'משחק חשיבה ולוגיקה', 'orchard toys': 'משחק קופסה', 'dodoland': 'פאזל', 'WE ARE GOMMU': 'בובה',
    'QUUT': 'צעצוע לחוף ולים', 'fatbraines': 'משחק למידה', 'zoo family': 'צעצוע אלקטרוני', 'Banana Panda': 'פאזל',
    'ספארי': 'דמויות ומשחק דמיון', 'viking': 'כלי רכב צעצוע', 'classic world': 'צעצוע עץ', 'פלנטויס': 'צעצוע עץ',
    'minikoioi': 'כלי אוכל ושתייה', 'i play green sprouts': 'רעשן ונשכן', 'stephen joseph': 'בגד ילדים', 'קלוטז': 'ערכת מדע',
    '4M': 'ערכת מדע', 'APLI': 'ערכת יצירה', 'djeco': 'ערכת יצירה', 'Jabadabado': 'צעצוע עץ', 'מרי מרי': 'קישוט למסיבה',
}
WEAK_LEAVES = {'צעצועי-עץ': 'צעצוע עץ', 'משחקי-חברה-וחשיבה': 'משחק קופסה', 'משחקים-התפתחותיים': 'משחק למידה', 'מונטסורי': 'משחק למידה'}


def main():
    src = sys.argv[1]
    P = [p for p in json.load(open(src, encoding='utf-8')) if p['handle'] != 'gift-wrap']
    leaf_rank = {h: i for i, (h, t) in enumerate(LEAF_TO_TYPE)}
    rows, dist, src_count = [], collections.Counter(), collections.Counter()
    for p in P:
        hs = [c['handle'] for c in p['collections']['nodes']]
        ptype, source, conf = None, '', ''
        strong = sorted([h for h in hs if h in leaf_rank and dict(LEAF_TO_TYPE)[h]], key=lambda h: leaf_rank[h])
        if strong:
            ptype, source, conf = dict(LEAF_TO_TYPE)[strong[0]], 'קולקציה: ' + strong[0], 'גבוהה'
        if not ptype:
            for rx, t in KEYWORDS:
                if re.search(rx, p['title']):
                    ptype, source, conf = t, 'מילה בשם: ' + rx.split('|')[0].replace('\\b', ''), 'בינונית'
                    break
        if not ptype:
            for h in hs:
                if h in WEAK_LEAVES:
                    ptype, source, conf = WEAK_LEAVES[h], 'קולקציה כללית: ' + h, 'נמוכה'
                    break
        if not ptype and p['vendor'] in VENDOR_TO_TYPE:
            ptype, source, conf = VENDOR_TO_TYPE[p['vendor']], 'מותג: ' + p['vendor'], 'נמוכה'
        if not ptype:
            for h in hs:
                if h in MID_TO_TYPE:
                    ptype, source, conf = MID_TO_TYPE[h], 'קטגוריה: ' + h, 'בינונית'
                    break
        if not ptype:
            ptype, source, conf = 'לבדיקה', '', ''
        dist[ptype] += 1
        src_count[conf or 'ללא'] += 1
        rows.append((p['handle'], p['title'], p['vendor'], ptype, SCHEME.get(ptype, ('', ''))[1], conf, source, ', '.join(c['title'] for c in p['collections']['nodes'] if c['handle'] not in ('all', 'new-arrivals', 'best-sellers', 'on-sale'))[:120]))
    print('confidence:', dict(src_count))
    for t, n in dist.most_common():
        print(f'{n:5d}  {t}')
    os.makedirs('docs/import/out', exist_ok=True)
    try:
        from openpyxl import Workbook
        wb = Workbook(); ws = wb.active; ws.title = 'product types'; ws.sheet_view.rightToLeft = True
        ws.append(['handle', 'שם המוצר', 'מותג', 'סוג מוצר מוצע', 'משפחה', 'ביטחון', 'מקור', 'קולקציות'])
        for r in rows: ws.append(list(r))
        ws2 = wb.create_sheet('scheme'); ws2.sheet_view.rightToLeft = True
        ws2.append(['סוג מוצר', 'משפחה', 'קטגוריה סטנדרטית של Shopify (Google)', 'מוצרים'])
        for t, (cat, fam) in SCHEME.items(): ws2.append([t, fam, cat, dist.get(t, 0)])
        for w in (ws, ws2):
            for col, width in zip('ABCDEFGH', (12, 48, 16, 24, 12, 10, 28, 60)): w.column_dimensions[col].width = width
        wb.save('docs/import/out/product-type-proposal.xlsx'); print('wrote docs/import/out/product-type-proposal.xlsx')
    except ImportError:
        import csv
        with open('docs/import/out/product-type-proposal.csv', 'w', encoding='utf-8-sig', newline='') as f:
            csv.writer(f).writerows(rows)
        print('openpyxl missing: wrote CSV instead')


if __name__ == '__main__':
    main()
