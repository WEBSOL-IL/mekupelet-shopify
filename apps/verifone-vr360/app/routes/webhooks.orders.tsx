// orders/paid -> issue invoice (when auto-issue is on)
// orders/cancelled -> full credit (when auto credit on cancel is on)
// The webhook only enqueues; the worker does the VR360 call (Shopify wants a 200 within 5s).

import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { enqueueDocumentJob } from "../lib/queue.server";
import { loadSettings } from "../lib/settings.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic, payload } = await authenticate.webhook(request);
  const order = payload as { id?: number | string; admin_graphql_api_id?: string };
  const orderId = order.id !== undefined ? String(order.id) : "";
  if (!orderId) return new Response();

  const settings = await loadSettings(shop);

  if (topic === "ORDERS_PAID" && settings.document.autoIssue) {
    await enqueueDocumentJob("issue-invoice", { shop, orderId, source: "auto" });
  } else if (topic === "ORDERS_CANCELLED" && settings.document.autoCreditOnCancel) {
    await enqueueDocumentJob("credit-full", { shop, orderId, source: "auto" });
  }

  return new Response();
};
