// Stock sync: run log and manual triggers.

import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useFetcher, useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import prisma from "../db.server";
import { authenticate } from "../shopify.server";
import { formatDateTime, formatDuration } from "../lib/format";
import { enqueueStockJob } from "../lib/queue.server";
import { loadSettings } from "../lib/settings.server";

const KIND_LABELS: Record<string, string> = { TODAY: "שינויי היום", MONTH: "30 יום", PRODUCT: "מוצר", SKU: 'מק"ט' };
const SOURCE_LABELS: Record<string, string> = { SCHEDULE: "מתוזמן", TRIGGER: "טריגר חיצוני", MANUAL: "ידני", WEBHOOK: "עדכון מוצר" };
const STATUS_LABELS: Record<string, string> = { RUNNING: "רץ", SUCCESS: "הצליח", FAILED: "נכשל", SKIPPED: "דולג" };
const STATUS_TONES: Record<string, "success" | "critical" | "warning" | "neutral"> = {
  RUNNING: "warning",
  SUCCESS: "success",
  FAILED: "critical",
  SKIPPED: "neutral",
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const settings = await loadSettings(session.shop);
  const runs = await prisma.syncRun.findMany({ where: { shop: session.shop }, orderBy: { startedAt: "desc" }, take: 50 });
  return {
    enabled: settings.stock.enabled,
    runs: runs.map((r) => ({
      id: r.id,
      at: formatDateTime(r.startedAt),
      kind: KIND_LABELS[r.kind] ?? r.kind,
      source: SOURCE_LABELS[r.source] ?? r.source,
      status: r.status,
      received: r.received,
      updated: r.updated,
      unchanged: r.unchanged,
      missing: r.missing,
      duration: formatDuration(r.durationMs),
      message: r.message ?? "",
    })),
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const form = await request.formData();
  const kind = String(form.get("kind") ?? "");
  if (kind === "today" || kind === "month") {
    await enqueueStockJob(kind === "today" ? "sync-today" : "sync-month", { shop: session.shop, source: "MANUAL" });
    return { ok: true, message: "הריצה נוספה לתור." };
  }
  if (kind === "skus") {
    const skus = String(form.get("skus") ?? "")
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!skus.length) return { ok: false, message: 'יש להזין לפחות מק"ט אחד.' };
    await enqueueStockJob("sync-skus", { shop: session.shop, source: "MANUAL", skus });
    return { ok: true, message: `סנכרון ${skus.length} מק"טים נוסף לתור.` };
  }
  return { ok: false, message: "פעולה לא מוכרת." };
};

export default function StockPage() {
  const { runs, enabled } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const busy = fetcher.state !== "idle";

  return (
    <s-page heading="סנכרון מלאי מוריפון">
      {!enabled && <s-banner tone="warning" heading="סנכרון המלאי כבוי בהגדרות"></s-banner>}
      {fetcher.data && <s-banner tone={fetcher.data.ok ? "success" : "critical"}>{fetcher.data.message}</s-banner>}

      <s-section heading="הרצה ידנית">
        <s-stack direction="block" gap="base">
          <s-stack direction="inline" gap="base">
            <fetcher.Form method="post">
              <input type="hidden" name="kind" value="today" />
              <s-button type="submit" {...(busy ? { loading: true } : {})}>
                שינויי היום
              </s-button>
            </fetcher.Form>
            <fetcher.Form method="post">
              <input type="hidden" name="kind" value="month" />
              <s-button type="submit" {...(busy ? { loading: true } : {})}>
                30 יום
              </s-button>
            </fetcher.Form>
          </s-stack>
          <fetcher.Form method="post">
            <input type="hidden" name="kind" value="skus" />
            <s-grid gridTemplateColumns="1fr auto" gap="base" alignItems="end">
              <s-text-field label='מק"טים (מופרדים בפסיק)' name="skus" placeholder="12345, 67890"></s-text-field>
              <s-button type="submit" {...(busy ? { loading: true } : {})}>
                סנכרן מק&quot;טים
              </s-button>
            </s-grid>
          </fetcher.Form>
        </s-stack>
      </s-section>

      <s-section heading="יומן ריצות סנכרון" padding="none">
        <s-table>
          <s-table-header-row>
            <s-table-header listSlot="primary">מועד</s-table-header>
            <s-table-header>סוג</s-table-header>
            <s-table-header>מקור</s-table-header>
            <s-table-header>סטטוס</s-table-header>
            <s-table-header format="numeric">התקבלו</s-table-header>
            <s-table-header format="numeric">עודכנו</s-table-header>
            <s-table-header format="numeric">ללא שינוי</s-table-header>
            <s-table-header format="numeric">מק&quot;ט חסר</s-table-header>
            <s-table-header format="numeric">משך</s-table-header>
            <s-table-header>הודעה</s-table-header>
          </s-table-header-row>
          <s-table-body>
            {runs.map((run) => (
              <s-table-row key={run.id}>
                <s-table-cell>{run.at}</s-table-cell>
                <s-table-cell>{run.kind}</s-table-cell>
                <s-table-cell>{run.source}</s-table-cell>
                <s-table-cell>
                  <s-badge tone={STATUS_TONES[run.status] ?? "neutral"}>{STATUS_LABELS[run.status] ?? run.status}</s-badge>
                </s-table-cell>
                <s-table-cell>{String(run.received)}</s-table-cell>
                <s-table-cell>{String(run.updated)}</s-table-cell>
                <s-table-cell>{String(run.unchanged)}</s-table-cell>
                <s-table-cell>{String(run.missing)}</s-table-cell>
                <s-table-cell>{run.duration}</s-table-cell>
                <s-table-cell>{run.message}</s-table-cell>
              </s-table-row>
            ))}
          </s-table-body>
        </s-table>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
