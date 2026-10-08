// Request log: every SOAP call with its masked request and response XML.

import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useSearchParams } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import prisma from "../db.server";
import { authenticate } from "../shopify.server";
import { formatDateTime, formatDuration } from "../lib/format";

const PAGE_SIZE = 25;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const orderId = url.searchParams.get("orderId")?.trim() || undefined;
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1) || 1);
  const where = { shop: session.shop, ...(orderId ? { orderId } : {}) };

  const [rows, total] = await Promise.all([
    prisma.requestLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.requestLog.count({ where }),
  ]);

  return {
    orderId: orderId ?? "",
    page,
    hasNext: page * PAGE_SIZE < total,
    rows: rows.map((r) => ({
      id: r.id,
      at: formatDateTime(r.createdAt),
      method: r.method,
      ok: r.ok,
      httpStatus: r.httpStatus,
      duration: formatDuration(r.durationMs),
      orderId: r.orderId ?? "",
      error: r.error ?? "",
      request: r.request,
      response: r.response,
    })),
  };
};

export default function LogsPage() {
  const { rows, orderId, page, hasNext } = useLoaderData<typeof loader>();
  const [, setSearchParams] = useSearchParams();

  return (
    <s-page heading="יומן בקשות לוריפון">
      <s-section>
        <form
          method="get"
          onSubmit={(e) => {
            e.preventDefault();
            const value = (new FormData(e.currentTarget).get("orderId") as string) ?? "";
            setSearchParams(value ? { orderId: value } : {});
          }}
        >
          <s-grid gridTemplateColumns="1fr auto" gap="base" alignItems="end">
            <s-text-field label="סינון לפי מספר הזמנה (id)" name="orderId" defaultValue={orderId}></s-text-field>
            <s-button type="submit">סנן</s-button>
          </s-grid>
        </form>
      </s-section>

      <s-section padding="none">
        <s-table
          paginate
          hasPreviousPage={page > 1}
          hasNextPage={hasNext}
          onPreviousPage={() => setSearchParams({ ...(orderId ? { orderId } : {}), page: String(page - 1) })}
          onNextPage={() => setSearchParams({ ...(orderId ? { orderId } : {}), page: String(page + 1) })}
        >
          <s-table-header-row>
            <s-table-header listSlot="primary">מועד</s-table-header>
            <s-table-header>פעולה</s-table-header>
            <s-table-header>סטטוס</s-table-header>
            <s-table-header>הזמנה</s-table-header>
            <s-table-header format="numeric">משך</s-table-header>
            <s-table-header>שגיאה</s-table-header>
          </s-table-header-row>
          <s-table-body>
            {rows.map((row) => (
              <s-table-row key={row.id}>
                <s-table-cell>{row.at}</s-table-cell>
                <s-table-cell>{row.method}</s-table-cell>
                <s-table-cell>
                  <s-badge tone={row.ok ? "success" : "critical"}>{row.ok ? "הצליח" : `נכשל${row.httpStatus ? ` (${row.httpStatus})` : ""}`}</s-badge>
                </s-table-cell>
                <s-table-cell>{row.orderId}</s-table-cell>
                <s-table-cell>{row.duration}</s-table-cell>
                <s-table-cell>{row.error}</s-table-cell>
              </s-table-row>
            ))}
          </s-table-body>
        </s-table>
      </s-section>

      <s-section heading="XML">
        {rows.length === 0 && <s-paragraph>אין קריאות עדיין.</s-paragraph>}
        {rows.map((row) => (
          <details key={row.id} style={{ marginBlockEnd: "0.5rem" }}>
            <summary>
              {row.at} — {row.method} {row.ok ? "" : "(נכשל)"}
            </summary>
            <s-box padding="base" borderWidth="base" borderRadius="base" background="subdued">
              <pre dir="ltr" style={{ margin: 0, maxHeight: "300px", overflow: "auto", whiteSpace: "pre-wrap", textAlign: "left" }}>
                {`REQUEST:\n${row.request}\n\nRESPONSE:\n${row.response}`}
              </pre>
            </s-box>
          </details>
        ))}
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
