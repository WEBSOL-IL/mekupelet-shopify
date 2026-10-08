// Settings page: same sections as the WooCommerce plugin's VR360 tab, plus the
// Shopify-specific fields (location, gateway mapping, auto credit, notifications).

import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useActionData, useFetcher, useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { loadSettings, saveSettings } from "../lib/settings.server";
import { parseSettingsForm } from "../lib/settings.form";
import { PAYMENT_TYPES, type Settings } from "../lib/settings.schema";
import { connectionTest, documentCheck, wsdlCheck } from "../vr360/diagnostics.server";
import { listLocations, listRecentGateways } from "../lib/shopify-admin.server";
import { env } from "../lib/env.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, admin } = await authenticate.admin(request);
  const settings = await loadSettings(session.shop);

  const [locations, gateways] = await Promise.all([
    listLocations(admin).catch(() => []),
    listRecentGateways(admin).catch(() => []),
  ]);

  // Never send the password to the browser.
  const safe = { ...settings, connection: { ...settings.connection, password: "" } };
  const gatewayRows = Array.from(new Set([...Object.keys(settings.payments.map), ...gateways])).sort();

  return {
    settings: safe,
    hasPassword: settings.connection.password !== "",
    locations,
    gatewayRows,
    triggerUrls: {
      today: `${env.appUrl}/sync/today?token=${settings.stock.triggerToken || "<token>"}`,
      month: `${env.appUrl}/sync/month?token=${settings.stock.triggerToken || "<token>"}`,
    },
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "save");
  const current = await loadSettings(shop);

  switch (intent) {
    case "wsdl":
      return { intent, result: await wsdlCheck(current) };
    case "connection":
      return { intent, result: await connectionTest(shop, current) };
    case "doc-check":
      return {
        intent,
        result: await documentCheck(
          shop,
          current,
          Number(form.get("doc_store_no") ?? 0),
          String(form.get("doc_no") ?? ""),
        ),
      };
    default: {
      const parsed = parseSettingsForm(form, current);
      if (!parsed.settings) {
        return { intent: "save", ok: false, errors: parsed.errors ?? {} };
      }
      await saveSettings(shop, parsed.settings, { keepPassword: parsed.keepPassword });
      return { intent: "save", ok: true, errors: {} as Record<string, string> };
    }
  }
};

type DiagnosticData = { intent: string; result: { ok: boolean; report: string } };

function Report({ data }: { data?: DiagnosticData }) {
  if (!data?.result) return null;
  return (
    <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
      <pre
        dir="ltr"
        style={{ margin: 0, maxHeight: "340px", overflow: "auto", whiteSpace: "pre-wrap", textAlign: "left" }}
      >
        {data.result.report}
      </pre>
    </s-box>
  );
}

function DiagnosticButton({ intent, label }: { intent: string; label: string }) {
  const fetcher = useFetcher<DiagnosticData>();
  const busy = fetcher.state !== "idle";
  return (
    <s-stack direction="block" gap="small">
      <fetcher.Form method="post">
        <input type="hidden" name="intent" value={intent} />
        <s-button type="submit" {...(busy ? { loading: true } : {})}>
          {label}
        </s-button>
      </fetcher.Form>
      {fetcher.data && (
        <s-banner tone={fetcher.data.result.ok ? "success" : "critical"}>
          <Report data={fetcher.data} />
        </s-banner>
      )}
    </s-stack>
  );
}

function DocCheck({ storeNo }: { storeNo: number }) {
  const fetcher = useFetcher<DiagnosticData>();
  const busy = fetcher.state !== "idle";
  return (
    <s-stack direction="block" gap="small">
      <fetcher.Form method="post">
        <input type="hidden" name="intent" value="doc-check" />
        <s-grid gridTemplateColumns="1fr 1fr auto" gap="base" alignItems="end">
          <s-number-field label="חנות" name="doc_store_no" defaultValue={String(storeNo)} min={1}></s-number-field>
          <s-text-field label="מספר חשבונית" name="doc_no" placeholder="לדוגמה 149729"></s-text-field>
          <s-button type="submit" {...(busy ? { loading: true } : {})}>
            שלוף פרטי חשבונית
          </s-button>
        </s-grid>
      </fetcher.Form>
      <s-paragraph color="subdued">
        שליפת חשבונית שקיימת בוריפון (GetInvoiceDetails), כדי לראות באיזה פנקס, מחירון ולקוח משתמש הממשק הקיים.
      </s-paragraph>
      {fetcher.data && (
        <s-banner tone={fetcher.data.result.ok ? "success" : "critical"}>
          <Report data={fetcher.data} />
        </s-banner>
      )}
    </s-stack>
  );
}

export default function SettingsPage() {
  const { settings, hasPassword, locations, gatewayRows, triggerUrls } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const saveResult = actionData && actionData.intent === "save" ? actionData : undefined;
  const errors: Record<string, string> = (saveResult && "errors" in saveResult && saveResult.errors) || {};
  const s: Settings = settings as Settings;

  return (
    <s-page heading="הגדרות Verifone VR360">
      {saveResult && "ok" in saveResult && saveResult.ok && (
        <s-banner tone="success" heading="ההגדרות נשמרו"></s-banner>
      )}
      {saveResult && "ok" in saveResult && !saveResult.ok && (
        <s-banner tone="critical" heading="ההגדרות לא נשמרו">
          <s-unordered-list>
            {Object.entries(errors).map(([field, message]) => (
              <s-list-item key={field}>
                {field}: {message}
              </s-list-item>
            ))}
          </s-unordered-list>
        </s-banner>
      )}

      <form method="post" data-save-bar>
        <input type="hidden" name="intent" value="save" />
        <s-stack direction="block" gap="large">
          <s-section heading="חיבור ל-VR360">
            <s-paragraph color="subdued">
              פרטי ההתחברות לשירות ה-SOAP של Verifone VR360 (קובץ services.asmx). את הפרטים יש לקבל מוריפון.
            </s-paragraph>
            <s-stack direction="block" gap="base">
              <s-url-field
                label="כתובת שירות (Endpoint)"
                name="connection.endpoint"
                defaultValue={s.connection.endpoint}
                details="לדוגמה: http://SERVER/R360.Server.IIS/services/services.asmx"
                error={errors["connection.endpoint"]}
              ></s-url-field>
              <s-grid gridTemplateColumns="1fr 1fr 1fr" gap="base">
                <s-number-field
                  label="מספר רשת (ChainID)"
                  name="connection.chainId"
                  defaultValue={String(s.connection.chainId)}
                  min={0}
                ></s-number-field>
                <s-text-field label="שם משתמש" name="connection.username" defaultValue={s.connection.username}></s-text-field>
                <s-password-field
                  label="סיסמה"
                  name="connection.password"
                  autocomplete="new-password"
                  details={hasPassword ? "שמורה ומוצפנת. השאירו ריק כדי לא לשנות." : "טרם הוזנה."}
                ></s-password-field>
              </s-grid>
            </s-stack>
          </s-section>

          <s-section heading="הגדרות מסמך">
            <s-stack direction="block" gap="base">
              <s-grid gridTemplateColumns="1fr 1fr 1fr" gap="base">
                <s-number-field
                  label="מספר חנות יוצרת (StoreNo)"
                  name="document.storeNo"
                  defaultValue={String(s.document.storeNo)}
                  details="החנות שממנה יורד המלאי ושעל שמה נרשמת החשבונית."
                  min={0}
                ></s-number-field>
                <s-number-field
                  label="חנות אספקה (SupplyStoreNo)"
                  name="document.supplyStoreNo"
                  defaultValue={String(s.document.supplyStoreNo)}
                  details="אם 0 — ישמש מספר החנות היוצרת."
                  min={0}
                ></s-number-field>
                <s-number-field
                  label="סוג מסמך (DocType)"
                  name="document.docType"
                  defaultValue={String(s.document.docType)}
                  details="חשבונית מס/קבלה = 1."
                  min={0}
                ></s-number-field>
              </s-grid>
              <s-select
                label="מקור מספר מסמך (DocNo)"
                name="document.docNoSource"
                value={s.document.docNoSource}
                details="מספר ההזמנה נשלח תמיד בשדה האסמכתא (Reference). נומרטור מחייב פנקס מוגדר לחנות בוריפון — אחרת שגיאה 421."
              >
                <s-option value="numerator">0 — וריפון מקצה את מספר החשבונית (נומרטור)</s-option>
                <s-option value="order">מספר ההזמנה ב-Shopify (לא מומלץ)</s-option>
              </s-select>
              <s-grid gridTemplateColumns="1fr 1fr 1fr" gap="base">
                <s-text-field label="מספר פנקס (NotebookID)" name="document.notebookId" defaultValue={s.document.notebookId}></s-text-field>
                <s-text-field label="מחירון (PriceList)" name="document.priceList" defaultValue={s.document.priceList}></s-text-field>
                <s-number-field
                  label='אחוז מע"מ ברירת מחדל'
                  name="document.vatPercent"
                  defaultValue={String(s.document.vatPercent)}
                  step={0.01}
                  min={0}
                  max={100}
                  details='משמש כאשר לא ניתן לגזור את אחוז המע"מ משורת ההזמנה.'
                ></s-number-field>
              </s-grid>
              <s-grid gridTemplateColumns="1fr 1fr" gap="base">
                <s-text-field
                  label='מק"ט משלוח'
                  name="document.shippingSku"
                  defaultValue={s.document.shippingSku}
                  details="קוד פריט בוריפון עבור דמי משלוח. משלוח נשלח כשורת פריט."
                ></s-text-field>
                <s-text-field
                  label='מק"ט עמלות/תוספות'
                  name="document.feeSku"
                  defaultValue={s.document.feeSku}
                  details='קוד פריט עבור טיפים/עמלות. אם ריק — ישמש מק"ט המשלוח.'
                ></s-text-field>
              </s-grid>
              <s-checkbox
                label="סימון המסמך כסגור (Published)"
                name="document.published"
                defaultChecked={s.document.published}
                details='הממשק הקיים ברשת שולח "לא" — מומלץ להשאיר כבוי.'
              ></s-checkbox>
              <s-checkbox
                label="שליחת החשבונית במייל ללקוח (SendDocByMail)"
                name="document.sendDocByMail"
                defaultChecked={s.document.sendDocByMail}
              ></s-checkbox>
              <s-checkbox
                label="הפקה אוטומטית כשההזמנה משולמת (orders/paid)"
                name="document.autoIssue"
                defaultChecked={s.document.autoIssue}
                details="רק אם טרם הופקה חשבונית להזמנה דרך האפליקציה. אם ממשק אחר מפיק חשבוניות אוטומטית — כבו כדי למנוע כפילות."
              ></s-checkbox>
              <s-checkbox
                label="זיכוי מלא אוטומטי בביטול הזמנה"
                name="document.autoCreditOnCancel"
                defaultChecked={s.document.autoCreditOnCancel}
              ></s-checkbox>
              <s-checkbox
                label="זיכוי חלקי אוטומטי בהחזר כספי"
                name="document.autoCreditOnRefund"
                defaultChecked={s.document.autoCreditOnRefund}
              ></s-checkbox>
            </s-stack>
          </s-section>

          <s-section heading="לקוח">
            <s-stack direction="block" gap="base">
              <s-checkbox
                label="זיהוי/הקמת לקוח לפי אימייל"
                name="customer.lookupByEmail"
                defaultChecked={s.customer.lookupByEmail}
                details="לפני ההפקה: חיפוש הלקוח בוריפון לפי האימייל (GetCustomer); אם לא נמצא — הקמה (CreateOrUpdateCustomer). בכשל — לקוח ברירת המחדל."
              ></s-checkbox>
              <s-number-field
                label="מספר לקוח ברירת מחדל (CustomerNo)"
                name="customer.defaultCustomerNo"
                defaultValue={String(s.customer.defaultCustomerNo)}
                min={0}
                details='מספר "לקוח מזדמן/אתר סחר" כפי שמוגדר ב-VR360.'
              ></s-number-field>
              <s-checkbox
                label="שליחת פרטי לקוח לא מזוהה (UnidentifiedCustomer)"
                name="customer.sendUnidentified"
                defaultChecked={s.customer.sendUnidentified}
              ></s-checkbox>
            </s-stack>
          </s-section>

          <s-section heading="סנכרון מלאי מוריפון">
            <s-stack direction="block" gap="base">
              <s-checkbox label="הפעלת סנכרון מלאי" name="stock.enabled" defaultChecked={s.stock.enabled}></s-checkbox>
              <s-grid gridTemplateColumns="1fr 1fr" gap="base">
                <s-number-field
                  label="חנות מלאי (StoreNo)"
                  name="stock.storeNo"
                  defaultValue={String(s.stock.storeNo || "")}
                  min={0}
                  details="אם ריק — חנות האספקה (SupplyStoreNo)."
                ></s-number-field>
                <s-select
                  label="מחסן ב-Shopify (Location)"
                  name="stock.locationId"
                  value={s.stock.locationId}
                  placeholder="בחרו מחסן"
                  details="הכמויות מוריפון נכתבות למחסן הזה בלבד."
                >
                  {locations.map((loc) => (
                    <s-option key={loc.id} value={loc.id}>
                      {loc.name}
                    </s-option>
                  ))}
                </s-select>
              </s-grid>
              <s-checkbox
                label="סנכרון בעדכון מוצר"
                name="stock.onProductUpdate"
                defaultChecked={s.stock.onProductUpdate}
                details="כשמוצר נשמר ב-Admin — משיכת המלאי של כל הווריאנטים שלו מוריפון מיד."
              ></s-checkbox>
              <s-grid gridTemplateColumns="1fr 1fr" gap="base" alignItems="end">
                <s-checkbox label="סנכרון שינויי היום (מתוזמן)" name="stock.today" defaultChecked={s.stock.today}></s-checkbox>
                <s-number-field
                  label="תדירות (דקות)"
                  name="stock.todayIntervalMinutes"
                  defaultValue={String(s.stock.todayIntervalMinutes)}
                  min={5}
                ></s-number-field>
              </s-grid>
              <s-grid gridTemplateColumns="1fr 1fr" gap="base" alignItems="end">
                <s-checkbox label="סנכרון 30 יום (מתוזמן)" name="stock.month" defaultChecked={s.stock.month}></s-checkbox>
                <s-number-field
                  label="תדירות (שעות)"
                  name="stock.monthIntervalHours"
                  defaultValue={String(s.stock.monthIntervalHours)}
                  min={1}
                ></s-number-field>
              </s-grid>
              <s-checkbox
                label="קיזוז מלאי משוריין"
                name="stock.minusReserved"
                defaultChecked={s.stock.minusReserved}
                details="הכמות באתר = מלאי פחות מלאי משוריין (ReservedStock) בוריפון."
              ></s-checkbox>
              <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
                <s-stack direction="block" gap="small">
                  <s-text type="strong">כתובות טריגר למערכת Cron חיצונית</s-text>
                  <s-paragraph>
                    שינויי היום: <code dir="ltr">{triggerUrls.today}</code>
                  </s-paragraph>
                  <s-paragraph>
                    30 יום: <code dir="ltr">{triggerUrls.month}</code>
                  </s-paragraph>
                  <s-checkbox label="החלפת האסימון (Token) בשמירה — מנתק קריאות חיצוניות קיימות" name="stock.rotateToken"></s-checkbox>
                </s-stack>
              </s-box>
            </s-stack>
          </s-section>

          <s-section heading="מיפוי אמצעי תשלום">
            <s-paragraph color="subdued">
              לכל gateway ב-Shopify (כפי שמופיע בטרנזקציות ההזמנה) נבחר סוג תשלום ב-VR360. הרשימה כוללת את ה-gateways
              מהזמנות 90 הימים האחרונים. כרטיסי מתנה של Shopify ושוברי BuyMe נשלחים כ&quot;מימוש זיכוי&quot;.
            </s-paragraph>
            <s-stack direction="block" gap="base">
              {gatewayRows.map((gateway) => (
                <s-grid key={gateway} gridTemplateColumns="1fr 1fr" gap="base" alignItems="end">
                  <s-text-field label="Gateway" name="payment_gateway" defaultValue={gateway} readOnly></s-text-field>
                  <s-select label="סוג תשלום ב-VR360" name="payment_type" value={String(s.payments.map[gateway] ?? 3)}>
                    {Object.entries(PAYMENT_TYPES).map(([value, label]) => (
                      <s-option key={value} value={value}>
                        {label}
                      </s-option>
                    ))}
                  </s-select>
                </s-grid>
              ))}
              <s-grid gridTemplateColumns="1fr 1fr" gap="base" alignItems="end">
                <s-text-field label="Gateway נוסף (ידני)" name="payment_gateway" placeholder="לדוגמה: tranzila"></s-text-field>
                <s-select label="סוג תשלום ב-VR360" name="payment_type" value="3">
                  {Object.entries(PAYMENT_TYPES).map(([value, label]) => (
                    <s-option key={value} value={value}>
                      {label}
                    </s-option>
                  ))}
                </s-select>
              </s-grid>
              <s-grid gridTemplateColumns="1fr 1fr" gap="base">
                <s-text-field
                  label="קידומת קוד הנחה של BuyMe"
                  name="payments.voucherDiscountPrefix"
                  defaultValue={s.payments.voucherDiscountPrefix}
                  details="קוד הנחה שמתחיל בקידומת הזו נרשם כמימוש שובר (VoucherRedeeming)."
                ></s-text-field>
                <s-text-field
                  label="Gateway של BuyMe"
                  name="payments.voucherGateway"
                  defaultValue={s.payments.voucherGateway}
                  details="אם אפליקציית BuyMe יוצרת טרנזקציה — שם ה-gateway שלה."
                ></s-text-field>
              </s-grid>
            </s-stack>
          </s-section>

          <s-section heading="התראות">
            <s-stack direction="block" gap="base">
              <s-email-field
                label="אימייל להתראות"
                name="notifications.email"
                defaultValue={s.notifications.email}
              ></s-email-field>
              <s-checkbox
                label="התראה כשהפקה אוטומטית נכשלת"
                name="notifications.onAutoIssueFailure"
                defaultChecked={s.notifications.onAutoIssueFailure}
              ></s-checkbox>
            </s-stack>
          </s-section>

          <s-button type="submit" variant="primary">
            שמירת הגדרות
          </s-button>
        </s-stack>
      </form>

      <s-section heading="בדיקות">
        <s-stack direction="block" gap="large">
          <s-stack direction="block" gap="small">
            <s-text type="strong">בדיקת חיבור</s-text>
            <s-paragraph color="subdued">
              קריאת GetCustomer ללקוח ברירת המחדל עם הפרטים השמורים. יש לשמור את ההגדרות לפני הבדיקה.
            </s-paragraph>
            <DiagnosticButton intent="connection" label="בדוק חיבור" />
          </s-stack>
          <s-divider></s-divider>
          <s-stack direction="block" gap="small">
            <s-text type="strong">בדיקת מבנה שירות (WSDL)</s-text>
            <s-paragraph color="subdued">
              מציג את שמות השדות המדויקים במבנה שורות הקבלה והחשבונית של השרת שלכם — לאבחון שגיאות מבנה (למשל 315).
            </s-paragraph>
            <DiagnosticButton intent="wsdl" label="משוך את מבנה השירות מהשרת" />
          </s-stack>
          <s-divider></s-divider>
          <s-stack direction="block" gap="small">
            <s-text type="strong">בדיקת חשבונית קיימת</s-text>
            <DocCheck storeNo={s.document.storeNo} />
          </s-stack>
        </s-stack>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
