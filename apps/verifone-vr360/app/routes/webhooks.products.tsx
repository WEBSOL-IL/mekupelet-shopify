// products/update -> refresh the SKU cache for the product and (when enabled) pull its
// stock from VR360 right away, like the plugin's "sync on product save".

import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { enqueueStockJob } from "../lib/queue.server";
import { loadSettings } from "../lib/settings.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, payload } = await authenticate.webhook(request);
  const product = payload as { id?: number | string };
  const productId = product.id !== undefined ? String(product.id) : "";
  if (!productId) return new Response();

  const settings = await loadSettings(shop);
  if (settings.stock.enabled && settings.stock.onProductUpdate) {
    // Debounce: the same product saved twice within a minute runs once.
    await enqueueStockJob(
      "sync-product",
      { shop, source: "WEBHOOK", productId },
      { jobId: `sync-product:${shop}:${productId}:${Math.floor(Date.now() / 60_000)}`, delay: 5_000 },
    );
  }

  return new Response();
};
