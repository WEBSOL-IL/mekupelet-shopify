#!/usr/bin/env python3
"""Build the Hyper page templates for the pages migrated from the old Dawn store
(about, faq, accessibility, brands). Content was extracted from the old pages on 2026-10-08;
images were copied into this store's Files with the same filenames (scripts/migrate-files.py).
Usage: python3 -I scripts/build-migrated-pages.py <migrate-dir>"""
import json, sys, os

M = sys.argv[1]
HDR = "/*\n * ------------------------------------------------------------\n * IMPORTANT: The contents of this file are auto-generated.\n *\n * This file may be updated by the Shopify admin theme editor\n * or related systems. Please exercise caution as any changes\n * made to this file may be overwritten.\n * ------------------------------------------------------------\n */\n"
img = lambda name: f"shopify://shop_images/{name}"

def write(name, sections, order):
    with open(f"templates/{name}.json", "w", encoding="utf-8") as f:
        f.write(HDR + json.dumps({"sections": sections, "order": order}, ensure_ascii=False, indent=2) + "\n")
    print("wrote", name, order)

BREAD = {"type": "breadcrumbs", "settings": {"container": "fixed", "text_alignment": "start", "padding_top": 16, "padding_bottom": 12}}
MAIN = lambda: {"type": "main-page", "settings": {"container": "fixed", "text_alignment": "center", "heading_size": "h2", "heading_tag": "h1", "padding_top": 24, "padding_bottom": 24}}

def iwt(image, position, blocks, scheme="scheme-1"):
    return {"type": "image-with-text", "settings": {"container": "fixed", "color_scheme": scheme, "image": img(image), "image_position": position, "image_width": 50,
            "desktop_content_position": "center", "desktop_content_alignment": "left", "mobile_content_alignment": "inherit", "show_section_divider": False, "divider_width": "fixed", "padding_top": 50, "padding_bottom": 50},
            "blocks": {k: v for k, v in blocks}, "block_order": [k for k, _ in blocks]}
def heading(key, text): return (key, {"type": "heading", "settings": {"heading": text, "highlight_style": "none", "highlight_font_style": "italic", "highlight_style_color": "", "highlight_text_color": "", "heading_size": "h2", "heading_tag": "h2"}})
def text(key, html): return (key, {"type": "text", "settings": {"text": html, "subtext_color": False}})
def icon(key, image, title, body=""): return (key, {"type": "icon_with_text", "settings": {"icon": "none", "image": img(image), "icon_width": 48, "color": "#1c1c1c", "heading": title, "heading_size": "h5", "heading_tag": "h3", "text": f"<p>{body}</p>" if body else "", "vertical_alignment": "center"}})
def button(key, label, link, style="btn--primary"): return (key, {"type": "button", "settings": {"button_label": label, "button_link": link, "button_style": style, "button_icon": "none"}})

# ---------- About ----------
about = {
  "breadcrumbs": BREAD, "main": MAIN(),
  "story": iwt("Frame_524.png", "right", [
      heading("h1", "הסיפור שלנו"),
      text("t1", "<p>מקופלת נולדה מתוך אהבה עמוקה לילדים ומתוך הבנה אמיתית של עולם ההתפתחות. לא עוד חנות צעצועים, אלא מקום שבו כל משחק נבחר מתוך מחשבה, רגישות וידע מקצועי.</p><p>לאורך השנים פגשתי אלפי הורים וילדים, ראיתי מקרוב איך משחק נכון יכול לחזק ביטחון, לעודד סקרנות, לפתח מיומנויות וליצור רגעים של חיבור אמיתי. מכאן נולדה מקופלת – חנות שבה צעצועים הם לא רק משחק, אלא כלי משמעותי בהתפתחות הילד. כל מוצר באתר ובחנות נבחר בקפידה, מתוך אחריות אמיתית למה שנכנס לבית שלכם.</p>"),
      ("sub", {"type": "subheading", "settings": {"subheading": "העקרונות שלנו"}}),
      icon("i1", "Group_278_2.png", "והי עובדה", "והי עובדה מבוססת שדעתו של הקורא תהיה מוסחת על ידי"),
      icon("i2", "Group_278_1.png", "והי עובדה", "והי עובדה מבוססת שדעתו של הקורא תהיה מוסחת על ידי"),
      icon("i3", "Group_278.png", "והי עובדה", "והי עובדה מבוססת שדעתו של הקורא תהיה מוסחת על ידי")]),
  "about_me": iwt("Frame_525.png", "left", [
      heading("h1", "עליי"),
      text("t1", "<p>אני אורלי, מדריכת הורים ומדריכת התפתחות לגיל הרך.<br>כבר שנים שאני מלווה משפחות בתהליכים יומיומיים של גדילה, הצבת גבולות, חיזוק ביטחון והתמודדות עם אתגרים.<br><br>אני מאמינה שמשחק הוא אחד הכלים החשובים ביותר בהתפתחות – דרך משחק ילדים לומדים, חוקרים, מתנסים ומגלים את עצמם.<br>מקופלת היא המשך ישיר של הדרך המקצועית שלי.<br>כל משחק שתמצאו כאן נבחן לא רק בעיניים של אמא, אלא גם דרך ידע וניסיון מקצועי בשטח.</p>"),
      icon("i1", "fi_1261040.png", "מדריכת הורים מוסמכת מכון אדלר"),
      icon("i2", "fi_5193310.png", "מדריכת התפתחות לגיל הרך"),
      icon("i3", "fi_1322004.png", "תואר ראשון במדעי החברה עם התמחות בפסיכולוגיה וניהול")], scheme="scheme-4"),
  "store": iwt("Rectangle_128_5.png", "right", [
      heading("h1", "החנות בניר צבי"),
      text("t1", "<p>לצד האתר פועלת גם החנות הפיזית שלנו בניר צבי – מקום חמים, מזמין ומלא השראה.<br>בחנות אפשר להרגיש, לגעת, להתייעץ ולקבל הכוונה אישית בבחירת המשחק המתאים ביותר לילד שלכם.<br>אנחנו מאמינים בשירות אישי, בהקשבה ובהתאמה מדויקת לצרכים של כל משפחה.<br>נשמח לראות אתכם גם שם.</p>"),
      icon("i1", "Frame_527.png", "כתובת", "אשל 5, מושב ניר צבי"),
      icon("i2", "Frame_529.png", "טלפון", "077-7804800"),
      icon("i3", "Frame_526.png", "מייל", "sales@mekupelet.co.il"),
      icon("i4", "Frame_528.png", "שעות פתיחה", "א׳-ה׳ 10:00 – 14:00, 16:00 – 19:00<br>ו׳ וערבי חג: 10:00 – 14:00"),
      button("b1", "בניית מסלול", "https://waze.com/ul?q=%D7%90%D7%A9%D7%9C%205%20%D7%A0%D7%99%D7%A8%20%D7%A6%D7%91%D7%99&navigate=yes", "btn--secondary")]),
  "whatsapp": {"type": "multicolumn", "settings": {"container": "fixed", "color_scheme": "scheme-10", "section_header_alignment": "center", "section_header_alignment_mobile": "inherit", "subheading": "", "heading": "קבוצת ה-Whatsapp של מקופלת", "highlight_style": "none", "highlight_font_style": "italic", "highlight_style_color": "", "highlight_text_color": "", "heading_size": "h2", "heading_tag": "h2",
      "description": "<p>הצטרפו לקבוצת הוואטסאפ שלנו<br>רוצות להיות הראשונות לדעת?<br>בקבוצה שלנו מחכות לכן:</p>", "text_size": "text-base", "button_label": "להצטרפות לקבוצה", "button_link": "/collections/all", "button_style": "btn--primary", "button_icon": "none",
      "content_alignment": "center", "show_col_count": False, "show_image": True, "columns_desktop": 5, "column_gap": "medium", "row_gap": "inherit", "columns_mobile": "2", "swipe_on_mobile": True, "show_section_divider": False, "divider_width": "fixed", "padding_top": 50, "padding_bottom": 50},
      "blocks": {f"c{i}": {"type": "column", "settings": {"image": img(im), "title": "", "highlight_style": "none", "highlight_font_style": "italic", "highlight_style_color": "", "highlight_text_color": "", "heading_size": "h4", "text": f"<p>{t}</p>", "text_size": "text-base", "button_label": "", "button_link": "", "button_style": "btn--underline", "button_icon": "none"}}
                 for i, (im, t) in enumerate([("fi_4989448.png", "הטבות בלעדיות לחברות הקבוצה"), ("fi_2313792.png", "טיפים שבועיים להתפתחות ומשחק"), ("fi_2048778.png", "עדכונים על חזרה למלאי ומוצרים חדשים"), ("fi_15258242.png", "השראה לרעיונות משחק בבית"), ("fi_548427.png", "ועוד הפתעות קטנות ושוות")], 1)},
      "block_order": ["c1", "c2", "c3", "c4", "c5"]},
  "course": {"type": "image-with-text-overlay", "settings": {"container": "fixed", "image": img("Rectangle_39_3.png"), "image_mobile": img("Rectangle_39_2.png"), "desktop_height": "medium", "mobile_height": "medium", "overlay_opacity": 0, "enable_parallax": False, "parallax_direction": "vertical", "color_scheme": "scheme-1", "content_position": "middle-right", "content_alignment": "center", "content_position_mobile": "bottom-center-mobile", "content_alignment_mobile": "center", "padding_top": 20, "padding_bottom": 50, "enable_preload_image": False},
      "blocks": {"h": {"type": "heading", "settings": {"heading": "קורס הורות", "highlight_style": "none", "highlight_font_style": "italic", "highlight_style_color": "", "highlight_text_color": "", "heading_size": "h2", "heading_tag": "h2"}},
                 "t": {"type": "text", "settings": {"text": "<p>מעבר לחנות, אני מציעה גם קורס הורות המבוסס על ניסיון מקצועי וליווי אישי של שנים. הקורס מעניק כלים פרקטיים, ביטחון והבנה עמוקה יותר של עולמם של הילדים. מיועד להורים שרוצים לגדול יחד עם הילדים שלהם, להבין טוב יותר מצבים יומיומיים וליצור בית רגוע ובריא יותר.</p>", "text_size": "text-base"}},
                 "b": {"type": "button", "settings": {"button_label": "לפרטים על קורס ההורות", "button_link": "/collections/all", "button_style": "btn--primary", "button_icon": "none"}}},
      "block_order": ["h", "t", "b"]},
}
write("page.about", about, ["breadcrumbs", "main", "story", "about_me", "store", "whatsapp", "course"])

# ---------- FAQ ----------
faq = json.load(open(f"{M}/faq.json", encoding="utf-8"))
def tabs(key_prefix, heading_text, items, first_open=True):
    blocks = {f"{key_prefix}_{i}": {"type": "collapsible_item", "settings": {"icon": "none", "heading": it["q"], "content": it["a"], "custom_liquid": "", "page": "", "open": first_open and i == 1, "use_subtext_color": False}} for i, it in enumerate(items, 1)}
    return {"type": "collapsible-tabs", "settings": {"container": "fixed", "color_scheme": "scheme-1", "header_layout": "vertical", "section_header_alignment": "left", "section_header_alignment_mobile": "inherit", "subheading": "", "heading": heading_text, "highlight_style": "none", "highlight_font_style": "italic", "highlight_style_color": "", "highlight_text_color": "", "heading_size": "h3", "heading_tag": "h2", "description": "", "text_size": "text-base", "button_label": "", "button_link": "", "button_style": "btn--primary", "button_icon": "none", "column_gap": "large", "row_gap": "inherit", "item_style": "standard", "item_color_scheme": "scheme-1", "item_heading_font": "heading", "item_heading_size": "h5", "item_icon_size": "small", "padding_top": 30, "padding_bottom": 30, "show_section_divider": False, "divider_width": "fixed"},
            "blocks": blocks, "block_order": list(blocks)}
def faq_blocks():
    blocks, order = {}, []
    def add(key, typ, settings):
        blocks[key] = {"type": typ, "settings": settings}; order.append(key)
    tabs_spec = [("שאלות ותשובות", "fi_471664.png", faq["items"][:6], None),
                 ("טבלת מידות", "Vector_1.png", faq["items"][6:12], None),
                 ("טבלת מידות", "fi_687689.png", [], faq["size_guide"]),
                 ("רשימת חנויות", "fi_2792541.png", [], faq.get("store_list", ""))]
    for t, (title, icon_file, items, text_html) in enumerate(tabs_spec, 1):
        add(f"tab_{t}", "tab", {"title": title, "icon": img(icon_file)})
        for i, it in enumerate(items, 1):
            add(f"q_{t}_{i}", "item", {"question": it["q"], "answer": it["a"], "page": "", "open": i == 1})
        if text_html:
            add(f"text_{t}", "text", {"content": text_html, "page": ""})
    return blocks, order
fb, fo = faq_blocks()
faq_t = {"breadcrumbs": BREAD, "main": MAIN(),
         "tabs": {"type": "mk-faq-tabs", "settings": {"container": "fixed", "color_scheme": "scheme-1", "aria_label": "שאלות ותשובות", "padding_top": 20, "padding_bottom": 50}, "blocks": fb, "block_order": fo}}
write("page.faq", faq_t, ["breadcrumbs", "main", "tabs"])

# ---------- Accessibility (legal) ----------
acc = {"breadcrumbs": BREAD, "main": {"type": "main-page", "settings": {"container": "narrow", "text_alignment": "left", "heading_size": "h2", "heading_tag": "h1", "padding_top": 24, "padding_bottom": 40}},
       "faqs": tabs("f", "שאלות ותשובות", faq["items"][:6], first_open=True)}
write("page.accessibility", acc, ["breadcrumbs", "main", "faqs"])

# ---------- Brands ----------
brands = json.load(open(f"{M}/brands.json", encoding="utf-8"))
def logos(key, data, cols):
    blocks = {f"{key}_{i}": {"type": "logo", "settings": {"image": img(it["img"].split("/")[-1]), "image_link": ("" if it["href"] in ("#", "") else it["href"])}} for i, it in enumerate(data["items"], 1)}
    return {"type": "brand-logos", "settings": {"container": "fixed", "color_scheme": "scheme-1", "section_header_alignment": "center", "section_header_alignment_mobile": "inherit", "subheading": "", "heading": data["heading"] or "מותגי הבית", "highlight_style": "none", "highlight_font_style": "italic", "highlight_style_color": "", "highlight_text_color": "", "heading_size": "h2", "heading_tag": "h2", "description": "", "text_size": "text-sm", "button_label": "", "button_link": "", "button_style": "btn--underline", "button_icon": "none", "image_padding": "none", "image_width": "large", "columns_desktop": cols, "column_gap": "medium", "row_gap": "inherit", "grid_bordered": False, "columns_mobile": "2", "swipe_on_mobile": False, "padding_top": 40, "padding_bottom": 30, "show_section_divider": False, "divider_width": "fixed"},
            "blocks": blocks, "block_order": list(blocks)}
br = {"breadcrumbs": BREAD, "main": MAIN(), "house": logos("a", brands["brands__0_multicolumn_JNeyxL"], 4), "all": logos("b", brands["brands__1_multicolumn_kdmdLL"], 4)}
write("page.brands", br, ["breadcrumbs", "main", "house", "all"])
