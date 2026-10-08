// refunds/create -> partial credit note for that refund (when enabled).

import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { enqueueDocumentJob } from "../lib/queue.server";
import { loadSettings } from "../lib/settings.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, payload } = await authenticate.webhook(request);
  const refund = payload as { id?: number | string; order_id?: number | string };
  const refundId = refund.id !== undefined ? String(refund.id) : "";
  const orderId = refund.order_id !== undefined ? String(refund.order_id) : "";
  if (!refundId || !orderId) return new Response();

  const settings = await loadSettings(shop);
  if (settings.document.autoCreditOnRefund) {
    await enqueueDocumentJob("credit-refund", { shop, orderId, refundId, source: "auto" });
  }

  return new Response();
};
