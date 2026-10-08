// External trigger URLs kept for compatibility with the WooCommerce plugin:
//   GET /sync/today?token=…   GET /sync/month?token=…
// Requires ?shop=<domain> when more than one shop is installed; otherwise the single shop is used.

import type { LoaderFunctionArgs } from "react-router";
import { safeEqual } from "../lib/crypto.server";
import { enqueueStockJob } from "../lib/queue.server";
import { listConfiguredShops, loadSettings } from "../lib/settings.server";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const kind = params.kind;
  if (kind !== "today" && kind !== "month") {
    return json({ success: false, message: "סוג סנכרון לא מוכר." }, 400);
  }

  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";
  const shops = await listConfiguredShops();
  const shop = url.searchParams.get("shop") ?? (shops.length === 1 ? shops[0] : "");
  if (!shop || !shops.includes(shop)) {
    return json({ success: false, message: "חנות לא מזוהה." }, 404);
  }

  const settings = await loadSettings(shop);
  if (!token || !settings.stock.triggerToken || !safeEqual(settings.stock.triggerToken, token)) {
    return json({ success: false, message: "אסימון שגוי." }, 403);
  }
  if (!settings.stock.enabled) {
    return json({ success: false, message: "סנכרון המלאי כבוי בהגדרות." }, 409);
  }

  const job = await enqueueStockJob(kind === "today" ? "sync-today" : "sync-month", { shop, source: "TRIGGER" });
  return json({ success: true, queued: true, jobId: job.id });
};
