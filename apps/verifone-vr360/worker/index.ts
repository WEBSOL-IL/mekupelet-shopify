// Worker process: consumes the document and stock queues and keeps the repeatable
// stock-sync schedules in step with each shop's settings.
//
// Phase 0: queue wiring, scheduler and log pruning. The processors are stubs that are
// filled in by phases 1–5 (see app/jobs/*).

import { Worker, type Job } from "bullmq";
import prisma from "../app/db.server";
import {
  QUEUE_DOCUMENTS,
  QUEUE_STOCK,
  closeQueues,
  redisConnection,
  type DocumentJobData,
  type DocumentJobName,
  type StockJobData,
  type StockJobName,
} from "../app/lib/queue.server";
import { processDocumentJob } from "../app/jobs/documents.server";
import { processStockJob } from "../app/jobs/stock.server";
import { reconcileSchedules } from "./scheduler";

const SCHEDULE_REFRESH_MS = 5 * 60_000;
const LOG_RETENTION_DAYS = 90;
const SYNC_RUNS_KEPT = 200;

async function pruneLogs(): Promise<void> {
  const cutoff = new Date(Date.now() - LOG_RETENTION_DAYS * 24 * 3600 * 1000);
  await prisma.requestLog.deleteMany({ where: { createdAt: { lt: cutoff } } });

  const shops = await prisma.syncRun.groupBy({ by: ["shop"] });
  for (const { shop } of shops) {
    const keep = await prisma.syncRun.findMany({
      where: { shop },
      orderBy: { startedAt: "desc" },
      skip: SYNC_RUNS_KEPT,
      take: 1,
      select: { startedAt: true },
    });
    if (keep[0]) {
      await prisma.syncRun.deleteMany({ where: { shop, startedAt: { lt: keep[0].startedAt } } });
    }
  }
}

async function main(): Promise<void> {
  const connection = redisConnection();

  const documents = new Worker<DocumentJobData, unknown, DocumentJobName>(
    QUEUE_DOCUMENTS,
    (job: Job<DocumentJobData, unknown, DocumentJobName>) => processDocumentJob(job),
    { connection, concurrency: 1 }, // VR360 numerators: one document at a time
  );
  const stock = new Worker<StockJobData, unknown, StockJobName>(
    QUEUE_STOCK,
    (job: Job<StockJobData, unknown, StockJobName>) => processStockJob(job),
    { connection, concurrency: 1 },
  );

  for (const worker of [documents, stock]) {
    worker.on("completed", (job) => console.log(`[worker] ${job.queueName}/${job.name} #${job.id} completed`));
    worker.on("failed", (job, error) =>
      console.error(`[worker] ${job?.queueName}/${job?.name} #${job?.id} failed:`, error.message),
    );
  }

  await reconcileSchedules();
  const scheduleTimer = setInterval(() => reconcileSchedules().catch(console.error), SCHEDULE_REFRESH_MS);
  await pruneLogs().catch(console.error);
  const pruneTimer = setInterval(() => pruneLogs().catch(console.error), 6 * 3600 * 1000);

  console.log("[worker] started");

  const shutdown = async (signal: string) => {
    console.log(`[worker] ${signal}, shutting down`);
    clearInterval(scheduleTimer);
    clearInterval(pruneTimer);
    await Promise.all([documents.close(), stock.close()]);
    await closeQueues();
    await prisma.$disconnect();
    process.exit(0);
  };
  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

main().catch((error) => {
  console.error("[worker] fatal", error);
  process.exit(1);
});
