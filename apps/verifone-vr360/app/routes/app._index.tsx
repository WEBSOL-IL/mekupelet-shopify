// Overview: configuration state and recent activity.

import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import prisma from "../db.server";
import { loadSettings } from "../lib/settings.server";
import { authenticate } from "../shopify.server";
import { formatDateTime } from "../lib/format";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  const settings = await loadSettings(shop);

  const [documents, failedDocuments, lastSync, lastRequest] = await Promise.all([
    prisma.document.count({ where: { shop, status: "SUCCESS" } }),
    prisma.document.count({ where: { shop, status: "FAILED" } }),
    prisma.syncRun.findFirst({ where: { shop }, orderBy: { startedAt: "desc" } }),
    prisma.requestLog.findFirst({ where: { shop }, orderBy: { createdAt: "desc" } }),
  ]);

  return {
    shop,
    configured: Boolean(settings.connection.endpoint && settings.connection.password),
    autoIssue: settings.document.autoIssue,
    stockEnabled: settings.stock.enabled,
    locationChosen: Boolean(settings.stock.locationId),
    documents,
    failedDocuments,
    lastSync: lastSync
      ? { at: formatDateTime(lastSync.startedAt), status: lastSync.status, kind: lastSync.kind }
      : null,
    lastRequest: lastRequest
      ? { at: formatDateTime(lastRequest.createdAt), method: lastRequest.method, ok: lastRequest.ok }
      : null,
  };
};

export default function Index() {
  const data = useLoaderData<typeof loader>();

  return (
    <s-page heading="Verifone VR360">
      {!data.configured && (
        <s-banner heading="האפליקציה עדיין לא מחוברת לוריפון" tone="warning">
          <s-paragraph>
            הזינו את סיסמת VR360 בעמוד <s-link href="/app/settings">ההגדרות</s-link> והריצו &quot;בדיקת חיבור&quot;.
          </s-paragraph>
        </s-banner>
      )}

      <s-section heading="מצב">
        <s-stack direction="block" gap="small">
          <s-paragraph>
            <s-text type="strong">חיבור לוריפון: </s-text>
            <s-badge tone={data.configured ? "success" : "critical"}>
              {data.configured ? "מוגדר" : "חסרה סיסמה"}
            </s-badge>
          </s-paragraph>
          <s-paragraph>
            <s-text type="strong">הפקה אוטומטית בתשלום: </s-text>
            <s-badge tone={data.autoIssue ? "success" : "neutral"}>{data.autoIssue ? "פעיל" : "כבוי"}</s-badge>
          </s-paragraph>
          <s-paragraph>
            <s-text type="strong">סנכרון מלאי: </s-text>
            <s-badge tone={data.stockEnabled ? "success" : "neutral"}>{data.stockEnabled ? "פעיל" : "כבוי"}</s-badge>
            {data.stockEnabled && !data.locationChosen && (
              <s-badge tone="warning">לא נבחר מחסן (Location)</s-badge>
            )}
          </s-paragraph>
        </s-stack>
      </s-section>

      <s-section heading="פעילות">
        <s-stack direction="block" gap="small">
          <s-paragraph>
            מסמכים שהופקו: <s-text type="strong">{String(data.documents)}</s-text>
            {data.failedDocuments > 0 && (
              <>
                {" "}
                · כשלים: <s-text tone="critical">{String(data.failedDocuments)}</s-text>
              </>
            )}
          </s-paragraph>
          <s-paragraph>
            סנכרון מלאי אחרון:{" "}
            {data.lastSync ? `${data.lastSync.at} (${data.lastSync.kind}, ${data.lastSync.status})` : "טרם רץ"}
          </s-paragraph>
          <s-paragraph>
            קריאה אחרונה לוריפון:{" "}
            {data.lastRequest
              ? `${data.lastRequest.at} — ${data.lastRequest.method} (${data.lastRequest.ok ? "הצליח" : "נכשל"})`
              : "אין"}
          </s-paragraph>
        </s-stack>
      </s-section>

      <s-section slot="aside" heading="שלבי ההקמה">
        <s-ordered-list>
          <s-list-item>הזנת סיסמת VR360 ובדיקת חיבור</s-list-item>
          <s-list-item>בחירת מחסן (Location) לסנכרון המלאי</s-list-item>
          <s-list-item>מיפוי אמצעי התשלום אחרי הזמנת בדיקה</s-list-item>
        </s-ordered-list>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
