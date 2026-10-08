// Documents: every invoice / credit note issued through the app.

import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData, useSearchParams } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import prisma from "../db.server";
import { authenticate } from "../shopify.server";
import { formatDateTime } from "../lib/format";

const PAGE_SIZE = 25;
const KIND_LABELS: Record<string, string> = {
  INVOICE: "חשבונית מס/קבלה",
  CREDIT_FULL: "זיכוי מלא",
  CREDIT_REFUND: "זיכוי להחזר",
};
const STATUS_TONES: Record<string, "success" | "critical" | "warning"> = {
  SUCCESS: "success",
  FAILED: "critical",
  PENDING: "warning",
};
const STATUS_LABELS: Record<string, string> = { SUCCESS: "הופק", FAILED: "נכשל", PENDING: "בתהליך" };

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? 1) || 1);
  const where = { shop: session.shop };

  const [rows, total] = await Promise.all([
    prisma.document.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    prisma.document.count({ where }),
  ]);

  return {
    page,
    hasNext: page * PAGE_SIZE < total,
    rows: rows.map((d) => ({
      id: d.id,
      at: formatDateTime(d.createdAt),
      orderId: d.orderId,
      orderName: d.orderName,
      kind: KIND_LABELS[d.kind] ?? d.kind,
      status: d.status,
      docNo: d.vr360DocNo ?? "",
      error: d.error ?? "",
    })),
  };
};

export default function DocumentsPage() {
  const { rows, page, hasNext } = useLoaderData<typeof loader>();
  const [, setSearchParams] = useSearchParams();

  return (
    <s-page heading="מסמכים בוריפון">
      {rows.length === 0 && (
        <s-section>
          <s-paragraph>עדיין לא הופקו מסמכים. ההפקה מתבצעת מכרטיס ההזמנה או אוטומטית בתשלום (שלב 2 ו-3).</s-paragraph>
        </s-section>
      )}
      <s-section padding="none">
        <s-table
          paginate
          hasPreviousPage={page > 1}
          hasNextPage={hasNext}
          onPreviousPage={() => setSearchParams({ page: String(page - 1) })}
          onNextPage={() => setSearchParams({ page: String(page + 1) })}
        >
          <s-table-header-row>
            <s-table-header listSlot="primary">הזמנה</s-table-header>
            <s-table-header>סוג</s-table-header>
            <s-table-header>סטטוס</s-table-header>
            <s-table-header>מספר בוריפון</s-table-header>
            <s-table-header>מועד</s-table-header>
            <s-table-header>שגיאה</s-table-header>
          </s-table-header-row>
          <s-table-body>
            {rows.map((row) => (
              <s-table-row key={row.id}>
                <s-table-cell>
                  <s-link href={`shopify://admin/orders/${row.orderId}`}>{row.orderName}</s-link>
                </s-table-cell>
                <s-table-cell>{row.kind}</s-table-cell>
                <s-table-cell>
                  <s-badge tone={STATUS_TONES[row.status] ?? "neutral"}>{STATUS_LABELS[row.status] ?? row.status}</s-badge>
                </s-table-cell>
                <s-table-cell>{row.docNo}</s-table-cell>
                <s-table-cell>{row.at}</s-table-cell>
                <s-table-cell>{row.error}</s-table-cell>
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
