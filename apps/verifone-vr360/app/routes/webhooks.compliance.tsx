// Mandatory privacy webhooks. The app stores no customer PII of its own beyond what is
// inside request/response XML logs, which are pruned by the worker; shop/redact clears
// everything for the shop.

import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic, payload } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);

  switch (topic) {
    case "CUSTOMERS_DATA_REQUEST":
      // Nothing stored per customer outside Shopify; the merchant answers from VR360.
      break;
    case "CUSTOMERS_REDACT": {
      const orderIds = ((payload as { orders_to_redact?: number[] }).orders_to_redact ?? []).map(String);
      if (orderIds.length) {
        await db.requestLog.deleteMany({ where: { shop, orderId: { in: orderIds } } });
        await db.document.updateMany({
          where: { shop, orderId: { in: orderIds } },
          data: { requestXml: null, responseXml: null },
        });
      }
      break;
    }
    case "SHOP_REDACT":
      await db.$transaction([
        db.requestLog.deleteMany({ where: { shop } }),
        db.document.deleteMany({ where: { shop } }),
        db.syncRun.deleteMany({ where: { shop } }),
        db.skuCache.deleteMany({ where: { shop } }),
        db.shopSettings.deleteMany({ where: { shop } }),
        db.session.deleteMany({ where: { shop } }),
      ]);
      break;
  }

  return new Response();
};
