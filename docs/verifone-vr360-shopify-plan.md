# תוכנית: אפליקציית Shopify ל-Verifone VR360 (חשבוניות + סנכרון מלאי)

## 1. רקע ומטרה
הפלאגין הקיים (`verifone-vr360-woocommerce` 1.8.1, WEBSOL) נקרא במלואו (6 קבצים, ~3,100 שורות). הוא עושה חמישה דברים:

| יכולת | איך זה עובד בווקומרס |
|---|---|
| חשבונית מס/קבלה (`CreateInvoice`) | כפתור במסך ההזמנה + הפקה אוטומטית בסטטוס "בטיפול". שורות לפי SKU (מוריד מלאי בוריפון), משלוח כשורת פריט עם מק"ט משלוח, עמלות עם מק"ט עמלות, קופונים מגולמים במחיר השורה, "הנחת סל" (נקודות) מגולמת יחסית, ספיגת הפרשי אגורות, חישוב מע"מ בכותרת מהשורות (דגל 4221), DocNo מהנומרטור או ממספר ההזמנה, Reference = מספר הזמנה (דגל 4222). |
| תקבולים | מיפוי אמצעי תשלום → סוג VR360 (מזומן 1, צ'ק 2, אשראי 3, מימוש זיכוי 4). אשראי עם אובייקט `creditCard` (4 ספרות, מותג, אישור סליקה). שוברי BuyMe דרך Multipass: שורת `VoucherRedeeming` לכל תנועה עם `CreditVoucher{CreationStoreId, CreditVoucherNumber, AcceptUnknownCreditVoucher}`, הצלבת סכומים לפני הפקה. |
| לקוח | חיפוש בוריפון לפי אימייל (`GetCustomer ByEmail`), הקמה (`CreateOrUpdateCustomer`), שמירת מספר הלקוח על ההזמנה, נפילה ללקוח ברירת מחדל + בלוק `UnidentifiedCustomer`. |
| זיכויים | זיכוי מלא (היפוך כל החשבונית, `CR-<order>`), זיכוי חלקי מאובייקט Refund (פריטים/משלוח/עמלות שסומנו), החזרת מלאי בכמות שלילית, העתק PDF (`GetCustomerInvoicePDF` עם נפילה ל-`GetSignedDocument`). |
| סנכרון מלאי (`GetStock`) | שלושה תרחישים: שמירת מוצר, שינויי היום כל 20 דק', 30 יום כל 8 שעות; נעילה, קיזוז מלאי משוריין, מלאי שלילי = 0, יומן 50 ריצות, טריגר חיצוני עם token. |

המטרה: אותן יכולות בדיוק עבור החנות החדשה ב-Shopify (`yxmgh4-cn.myshopify.com`), בארכיטקטורה שמתאימה ל-Shopify (אין "פלאגין": צריך אפליקציה עם שרת משלה).

החלטות שהתקבלו: Node.js (Remix, התבנית הרשמית של Shopify) על שרת של WEBSOL; הגרסה הראשונה כוללת הכול; אמצעי תשלום: סליקה ישראלית, PayPal, BuyMe; נגישות שרת וריפון עדיין לא ידועה.

## 2. ארכיטקטורה

```
Shopify Admin ──(session token)──▶ App (Remix, Node 20, Polaris)      ──SOAP/XML──▶ VR360 services.asmx
   │  Admin UI Extension (כרטיס בהזמנה)   │  Prisma + PostgreSQL
   │  Webhooks: orders/paid, orders/cancelled, refunds/create, products/update, app/uninstalled
   └──(Admin GraphQL 2026-01)◀──── Worker: תור עבודות + מתזמן (BullMQ + Redis)
```

- **אפליקציה מותאמת (custom app) לחנות אחת**, דרך Dev Dashboard, לא App Store. התקנה דרך קישור התקנה; אפשר להרחיב לרשת חנויות בעתיד (מודל Shop בבסיס הנתונים כבר מרובה חנויות).
- **שלושה תהליכים בקונטיינר אחד (docker compose)**: `web` (Remix: ממשק ניהול, webhooks, API לבלוק ההזמנה), `worker` (BullMQ: הפקות, זיכויים, סנכרונים, ריצות מתוזמנות), `postgres` + `redis`. למה תור ולא קריאה ישירה: Shopify דורש תשובה ל-webhook תוך 5 שניות ומבצע ניסיונות חוזרים; וריפון איטי לפעמים; תור נותן idempotency, ניסיון חוזר מבוקר ונעילה לכל הזמנה.
- **לקוח SOAP** משוכפל מהלוגיקה הקיימת: XML ידני (SOAP 1.1, `http://tempuri.org/`), שמירת סדר אלמנטים, `extract_tag` ללא namespace, אותם רמזי שגיאה (315/408/421/431-434), ניסיון שמות פעולה חלופיים ל-PDF, קיצוץ יומן ל-20K. מימוש ב-TypeScript עם `undici` + `fast-xml-parser`; בלי ספריית SOAP.
- **ממשק ניהול** = דף האפליקציה ב-Admin (Polaris, RTL/עברית), עם אותם טאבים כמו הפלאגין.
- **כרטיס בעמוד ההזמנה** = Admin UI Extension ב-target `admin.order-details.block.render`: סטטוס החשבונית, כפתורי הפקה/זיכוי/PDF, תיבת "אפשר הפקה חוזרת". הבלוק קורא metafields של ההזמנה ומדבר עם השרת שלנו דרך `fetch` מאומת ב-session token.
- **פעולה מרוכזת** ברשימת ההזמנות (`admin.order-index.selection-action.render`): "הפקת חשבוניות להזמנות שנבחרו" (תחליף לעמודת "חשבונית" של ווקומרס שאי אפשר להוסיף ב-Shopify). סינון ברשימה לפי תגיות `vr360:invoiced` / `vr360:failed`.

### הרשאות (scopes)
`read_orders, write_orders` (metafields ותגיות על הזמנות), `read_customers, write_customers` (metafield מספר לקוח בוריפון), `read_products, read_inventory, write_inventory, read_locations` (סנכרון מלאי). ללא גישה לתשלומים מעבר ל-`read_orders` (פרטי טרנזקציה נכללים בו).

## 3. מודל נתונים
**PostgreSQL (Prisma)**
- `Shop` – דומיין, access token מוצפן, גרסת API, מצב התקנה.
- `Settings` – אותם מפתחות כמו בפלאגין: חיבור (endpoint, chain_id, username, password מוצפנים), מסמך (store_no, supply_store_no, doc_type, docno_source, notebook_id, price_list, vat_percent, published, send_doc_by_mail, auto_issue, shipping_sku, fee_sku), לקוח (customer_sync, default_customer_no, send_unidentified), מלאי (enabled, store_no, on_product_update, today/month + תדירויות, minus_reserved, trigger_token, location_id ב-Shopify), מיפוי תשלומים (gateway → סוג VR360, לפי שמות ה-gateways שנמצאו בהזמנות החנות).
- `Document` – מסמך שהופק: order_id, kind (invoice / credit_full / credit_refund), refund_id, vr360_doc_no, store_no, customer_no, request_xml, response_xml, status, error, created_at. זהו מקור האמת (לא metafield), מאפשר חסימת כפילויות ו-audit.
- `RequestLog` – כל קריאת SOAP (method, קוד HTTP, משך, בקשה/תשובה מקוצצות, מסיכת סיסמה ומספרי כרטיס).
- `SyncRun` – יומן ריצות סנכרון (סוג, מקור, סטטוס, התקבלו/עודכנו/ללא שינוי/חסר, משך, הודעה); נשמרות 200 אחרונות.
- `SkuCache` – SKU → inventoryItemId + variantId + tracked, מתרענן ב-`products/update` וב-backfill לילי (כדי לא לחפש 4,000 מק"טים בכל ריצה).

**ב-Shopify (נראה לסוחר ולאפליקציות אחרות)**
- Metafields על הזמנה, namespace `vr360`: `invoice_no`, `store_no`, `invoice_at`, `credit_no`, `credit_at`, `refund_credits` (JSON), `customer_no`, `last_error`.
- Metafield על לקוח: `vr360.customer_no` (במקום על ההזמנה בלבד: לקוח חוזר לא מחופש שוב).
- תגיות הזמנה: `vr360:invoiced`, `vr360:credited`, `vr360:failed` (לסינון ברשימת ההזמנות ול-Flow).
- במקום "הערת הזמנה" של ווקומרס (אין API להערות ציר הזמן): שורת היסטוריה בכרטיס ההזמנה מתוך `Document` + metafield `last_error`; אופציונלי: הוספה ל-`order.note`.

## 4. זרימות

### 4.1 הפקת חשבונית
1. טריגר: לחיצה בכרטיס ההזמנה, פעולה מרוכזת, או webhook `orders/paid` כש-`auto_issue` דולק (המקבילה ל"בטיפול"; הזמנות COD/ידניות שאינן paid לא יופקו אוטומטית).
2. ה-webhook נענה מיד (200) ומכניס עבודה `issue-invoice:{orderId}` לתור עם מפתח ייחודי → ניסיונות חוזרים של Shopify לא יוצרים כפילות.
3. ה-worker נועל את ההזמנה (`SELECT ... FOR UPDATE` על `Document`), שולף את ההזמנה המלאה ב-GraphQL (lineItems עם sku/variant/discountAllocations/taxLines, shippingLines, transactions עם gateway/kind/status/paymentDetails/receiptJson, customer, shippingAddress, discountCodes, cancelledAt, currency).
4. בניית הבקשה (סעיף 5), קריאה ל-`CreateInvoice`, שמירת `Document`, כתיבת metafields + תגית, הודעה חזרה לבלוק.
5. כשלים: נשמרים ב-`Document.error` + `vr360.last_error`, תגית `vr360:failed`, ואם זו הפקה אוטומטית — התראת מייל לסוחר (אופציונלי).

### 4.2 זיכויים
- **זיכוי מלא**: כפתור "זיכוי" בכרטיס, או webhook `orders/cancelled` כשההגדרה "זיכוי אוטומטי בביטול" דולקת. אותה לוגיקה: היפוך הכותרת, השורות והתקבולים, `DocNo=0`, `Reference=CR-<order>`.
- **זיכוי חלקי**: webhook `refunds/create` (יש בו `refund_line_items` עם SKU וכמות, `refund_shipping_lines`, `transactions` של ההחזר). נוצר `Document` מסוג credit_refund עם `Reference=CR-<order>-<refundId>`. אופציה בהגדרות: אוטומטי / רק דרך כפתור "זיכוי להחזר" ברשימת ההחזרים בכרטיס.
- החזרת מלאי בוריפון בכמות שלילית, כמו היום. ב-Shopify עצמה המלאי מוחזר לפי בחירת הסוחר בטופס ההחזר (restock) — ואז סנכרון המלאי משווה בחזרה לוריפון.

### 4.3 PDF
כפתור "הורדת העתק" → השרת קורא `GetCustomerInvoicePDF` (עם הנפילות הקיימות) ומחזיר את הקובץ לדפדפן; לא נשמר אצלנו.

### 4.4 לקוח
`customer.email` → metafield `vr360.customer_no` על הלקוח → `GetCustomer ByEmail` → `CreateOrUpdateCustomer` (ForeignCustomerId = `SHC-<customerId>` / `SHO-<orderId>` ללקוח אורח) → נפילה ללקוח ברירת מחדל. אותו סדר ואותה מדיניות "כשל לא חוסם".

### 4.5 סנכרון מלאי
- אותם שלושה תרחישים: `products/update` (עדכון מוצר ב-Admin → `GetStock` ל-SKU של כל הווריאנטים שלו), "שינויי היום" כל N דקות, "30 יום" כל N שעות. מתזמן אמיתי (BullMQ repeatable jobs) במקום WP-Cron, לכן אין תלות בתנועה באתר; הטריגרים החיצוניים (`/sync/today?token=`) נשארים לתאימות.
- החלת הכמויות: `inventorySetQuantities(name: "available", reason: "correction", ignoreCompareQuantity: true, referenceDocumentUri: "gid://vr360-sync/SyncRun/<id>")` על location אחד שנבחר בהגדרות (המחסן של האתר). רק ווריאנטים עם `tracked = true`, מלאי שלילי = 0, קיזוז משוריין לפי הגדרה. קיבוץ עד 250 פריטים לקריאה, עם כיבוד rate limit (cost-based) של GraphQL.
- SKU כפול בין ווריאנטים → נרשם כאזהרה ומדולג (לא מעדכנים בעיוורון).

### 4.6 בדיקות חיבור
בדף ההגדרות: "משיכת WSDL" (כמו היום, להשוואת שמות אלמנטים), "בדיקת חיבור" (`GetCustomer` על הלקוח ברירת המחדל), "בדיקת מסמך" (`GetInvoiceDetails` למספר מסמך ידני) — כולן קיימות בפלאגין ומועתקות.

## 5. מיפוי Shopify → VR360 (ההבדלים האמיתיים מווקומרס)

| נושא | ווקומרס | Shopify | החלטה |
|---|---|---|---|
| מק"ט | `product->get_sku()` | `lineItem.sku` (מהווריאנט) | זהה; שורה ללא SKU חוסמת כמו היום. מוצרי "קופסה" (שלב 5) יישלחו לפי רכיביהם. |
| מחיר שורה אחרי הנחות | `get_total + tax` | `discountedTotalSet` (כולל הנחות שורה וחלק יחסי של קוד הנחה) | `TotalPrice = discountedTotal`, `UnitPrice = TotalPrice/qty`, `DiscountPercent=0` (כמו היום). |
| משלוח | shipping total | `shippingLines[].discountedPriceSet` | שורת פריט עם מק"ט משלוח, גם ב-0. |
| עמלות | Fee items | ב-Shopify אין fees; יש טיפ (`totalTipReceived`) ומיסי יבוא | טיפ נשלח עם מק"ט עמלות אם קיים. |
| הנחת סל / נקודות | YITH points | אפליקציית נקודות תופיע כקוד הנחה או כ-gift card | אותו מנגנון: גילום יחסי כשסך השורות גדול מסך התקבולים. |
| קופונים | coupon codes | `discountCodes` | ל-Details בלבד. |
| מע"מ | `is_vat_exempt`, חילוץ | `taxesIncluded`, `taxLines[].ratePercentage` לכל שורה | אחוז מהשורה אם קיים, אחרת ברירת מחדל 18%; `taxExempt` על הלקוח → 0. |
| אמצעי תשלום | gateway id + מטא | `transactions` (kind SALE/CAPTURE, status SUCCESS, `gateway`) | מיפוי לפי `gateway` בהגדרות (ברירת מחדל: `paypal`→מזומן, `gift_card`→מימוש זיכוי, אחר→אשראי). הזמנה עם כמה טרנזקציות = כמה שורות תקבול. |
| פרטי אשראי | סריקת מטא | `paymentDetails` (CardPaymentDetails: `company`, `number` ממוסך), `receiptJson` של הסולק (לא יציב) | 4 ספרות ומותג מהשדות המוטיפסים; מספר אישור מ-`receiptJson` לפי מפתחות ידועים של הסולק (Tranzila `ConfirmationCode`, Grow/Pelecard לפי דוגמה אמיתית) עם מיפוי מותג כמו היום. |
| BuyMe | Multipass (`_mpwc_transactions`) | תלוי באינטגרציה של BuyMe ל-Shopify: כקוד הנחה (discount application `title` = BuyMe) או כ-gift card / כ-transaction של gateway ייעודי | נבנה "מזהה שובר" מודולרי: קוד הנחה שמתחיל בקידומת מוגדרת, או transaction של gateway מוגדר → שורת `VoucherRedeeming`. **פתוח לבירור** איך BuyMe מתחבר ל-Shopify (ראו סעיף 9). |
| כרטיסי מתנה של Shopify | אין | transaction `gateway: gift_card` | `VoucherRedeeming` עם מספר הכרטיס (4 אחרונות) כ-`CreditVoucherNumber` — לבירור מול וריפון. |
| מספר מסמך | מספר הזמנה | `order.name` (#1001 → 1001) | אותה הגדרה "מקור DocNo"; `Reference`/`ExtDocID` = מספר ההזמנה; `Reference2` מספרי. |
| כתובת משלוח | shipping/billing | `shippingAddress` / `billingAddress` (address1, address2, city, zip, phone) | אותו פיצול רחוב/מספר בית. |
| מטבע | ILS בלבד | `currencyCode` | חסימה אם לא ILS (Markets כבויים). |
| הערת לקוח | customer note | `order.note` | `ShipmentNotes`. |

## 6. ממשק ניהול (Polaris, עברית, RTL)
1. **הגדרות**: חיבור ל-VR360 (עם "בדיקת WSDL" ו"בדיקת חיבור"), הגדרות מסמך, לקוח, סנכרון מלאי (כולל בחירת Location ו-URL-ים של טריגר חיצוני), מיפוי אמצעי תשלום (רשימת ה-gateways נשלפת מ-90 הימים האחרונים של הזמנות + שדה חופשי), התראות.
2. **מסמכים**: טבלת כל ההפקות/זיכויים עם סטטוס, קישור להזמנה, הורדת PDF, "נסה שוב".
3. **סנכרון מלאי**: יומן ריצות, כפתורי "הרץ עכשיו" (היום / 30 יום / מק"ט בודד), תצוגת פריטים שלא נמצאו באתר.
4. **יומן בקשות**: XML של בקשה/תשובה לכל קריאה (לאבחון מול וריפון), עם חיפוש לפי הזמנה.
5. **כרטיס בעמוד ההזמנה**: מצב (לא הופקה / הופקה מספר X בתאריך / זוכתה), כפתורים: הפקה, הפקה חוזרת (עם אישור), זיכוי מלא, זיכוי להחזר (לכל החזר), הורדת PDF; שגיאה אחרונה עם הרמז של וריפון.

## 7. אבטחה ואמינות
- אימות: OAuth של Shopify + session tokens לבלוק ולדפי הניהול; HMAC לכל webhook; token חזק ל-URL-ים חיצוניים; הפרדת הרשאות לפי צוות החנות (רק staff עם הרשאת apps).
- סודות (סיסמת VR360, access token) מוצפנים ב-DB (AES-256-GCM עם מפתח מסביבה); מסיכה ביומנים; מספר כרטיס מלא לעולם לא נשמר (רק 4 אחרונות).
- Idempotency: מפתח עבודה ייחודי לכל (הזמנה, סוג מסמך, refund); נעילת שורה; `Document` קיים = חסימת כפילות אלא אם "הפקה חוזרת" סומנה במפורש.
- ניסיונות חוזרים: רק על שגיאות תקשורת/5xx של וריפון (לא על שגיאות עסקיות 4xx של VR360), עם backoff; התראה אחרי 3 כשלים.
- Rate limits של Shopify: לקוח GraphQL עם ניהול cost ו-throttle; bulk מוגבל ל-250 מק"טים לקריאה.
- Webhook `app/uninstalled` + GDPR webhooks (חובה גם לאפליקציה מותאמת): ניקוי נתוני הלקוח.

## 8. פריסה והפעלה
- **קוד**: ריפו נפרד `verifone-vr360-shopify` (לא בתוך ריפו התבנית). `npm create @shopify/app` → תבנית Remix + Prisma; תיקיות: `app/` (Remix), `app/vr360/` (client, invoice-builder, credit-builder, stock-sync, customer-resolver), `worker/`, `extensions/order-block/`, `extensions/orders-bulk-action/`, `prisma/`, `docker/`.
- **שרת WEBSOL**: Docker Compose (web, worker, postgres, redis), דומיין קבוע עם TLS (Caddy/Traefik), גיבוי יומי ל-DB, Sentry/לוגים מרכזיים. דרישות מינימום: 2 vCPU, 2GB RAM.
- **וריפון**: אם services.asmx נגיש מהאינטרנט — רישום IP השרת ברשימה הלבנה של וריפון; אם לא — WireGuard/Cloudflare Tunnel מהשרת לרשת הפנימית, או קונטיינר "relay" קטן בתוך הרשת הפנימית (HTTP→SOAP) עם token. ה-client מקבל `VR360_BASE_URL` ולא אכפת לו באיזו דרך.
- **Shopify**: אפליקציה ב-Dev Dashboard (אותו חשבון של האפליקציה שיצרנו לייבוא), `shopify app deploy` לפריסת ה-extensions, גרסת API `2026-01` עם בדיקה רבעונית.

## 9. שאלות פתוחות (לפני בנייה)
1. **וריפון**: נגישות השרת (אינטרנט/VPN), סביבת בדיקות (חנות/נומרטור לבדיקות כדי לא ללכלך מספור אמיתי), אישור ייצוג כרטיסי מתנה של Shopify ו-BuyMe כ"מימוש זיכוי".
2. **BuyMe ב-Shopify**: איזו אינטגרציה תותקן (אפליקציה של BuyMe? קודי הנחה ייעודיים? gift cards?). המיפוי ייקבע לפי זה.
3. **סולק**: מי הסולק הסופי (Tranzila/Grow/Pelecard/Cardcom). צריך הזמנת בדיקה אחת מכל סולק כדי לראות את מבנה `receiptJson` ואת מספר האישור.
4. **מדיניות הפקה אוטומטית**: ב-`orders/paid` (מומלץ) או ב-fulfillment? וזיכוי אוטומטי בביטול/החזר — כן/לא.
5. **Location**: איזה location ב-Shopify מייצג את מחסן האתר (כרגע יש אחד: ניר צבי).
6. מק"ט משלוח ומק"ט עמלות בוריפון — אותם ערכים כמו בווקומרס?

## 10. שלבי עבודה והערכות
| שלב | תוכן | הערכה |
|---|---|---|
| 0 | סביבה: ריפו, Docker, Dev Dashboard app, scopes, webhooks, DB, מסגרת ניהול עם טאב חיבור + בדיקת WSDL/חיבור | 2 ימים |
| 1 | לקוח SOAP + Invoice Builder (כולל לקוח, תקבולים, מע"מ, גילום הנחות) + בדיקות יחידה מול XML שנרשם בווקומרס | 4 ימים |
| 2 | כרטיס ההזמנה (extension), הפקה ידנית, PDF, metafields/תגיות, יומן מסמכים ובקשות | 3 ימים |
| 3 | הפקה אוטומטית (תור + webhooks), פעולה מרוכזת, התראות | 2 ימים |
| 4 | זיכוי מלא + זיכוי חלקי מהחזרים | 2 ימים |
| 5 | סנכרון מלאי: SkuCache, שלושת התרחישים, טריגרים חיצוניים, יומן ריצות, בחירת location | 3 ימים |
| 6 | בדיקות קצה-לקצה מול סביבת הבדיקות של וריפון, הקשחה, תיעוד ומסירה | 3 ימים |

סה"כ כ-19 ימי עבודה, תלוי בזמינות וריפון לבדיקות.

## 11. אימות (הגדרת "גמור")
- בדיקות יחידה: בונה החשבונית מקבל הזמנות JSON מוקלטות (אשראי, PayPal, קוד הנחה, gift card, BuyMe, משלוח חינם, פטור ממע"מ) ומייצר XML זהה בשדותיו למה שהפלאגין יצר באותם מקרים (נשווה ליומני `vr360` מהאתר הישן).
- בדיקות אינטגרציה מול וריפון (סביבת בדיקות): הפקה, הפקה כפולה נחסמת, זיכוי מלא, זיכוי חלקי, PDF, לקוח חדש/קיים, 433/434 מטופלים עם הרמז הנכון.
- סנכרון: שינוי מלאי בוריפון → תוך N דקות מתעדכן ב-Shopify עם היסטוריית מלאי שמציינת את האפליקציה; SKU חסר נרשם; מלאי שלילי → 0.
- עומס: 200 הזמנות ביום, 4,000 מק"טים בריצת 30 יום, בלי חריגה מ-rate limit.
- אבטחה: webhook עם HMAC שגוי נדחה, טריגר חיצוני עם token שגוי נדחה, אין סודות ביומנים.
