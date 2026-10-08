// Stock jobs: sync-today, sync-month, sync-product, sync-skus, sku-backfill.
// Phase 0 stub: records a SKIPPED run so the schedule can be seen working end to end.
// Phase 5 replaces the body with the GetStock -> inventorySetQuantities pipeline.

import type { Job } from "bullmq";
import prisma from "../db.server";
import type { StockJobData, StockJobName } from "../lib/queue.server";

const KIND_BY_JOB = {
  "sync-today": "TODAY",
  "sync-month": "MONTH",
  "sync-product": "PRODUCT",
  "sync-skus": "SKU",
  "sku-backfill": "SKU",
} as const;

export async function processStockJob(job: Job<StockJobData, unknown, StockJobName>) {
  await prisma.syncRun.create({
    data: {
      shop: job.data.shop,
      kind: KIND_BY_JOB[job.name],
      source: job.data.source,
      status: "SKIPPED",
      message: "הסנכרון עדיין לא מומש (שלב 5).",
      durationMs: 0,
      finishedAt: new Date(),
    },
  });
  return { skipped: "not-implemented" };
}
