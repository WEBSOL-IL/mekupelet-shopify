// BullMQ queues shared by the web process (producers) and the worker (consumers).

import { Queue, type JobsOptions } from "bullmq";
import IORedis from "ioredis";
import { env } from "./env.server";

export const QUEUE_DOCUMENTS = "vr360-documents";
export const QUEUE_STOCK = "vr360-stock";

export type DocumentJobName = "issue-invoice" | "credit-full" | "credit-refund";
export type StockJobName = "sync-today" | "sync-month" | "sync-product" | "sync-skus" | "sku-backfill";

export interface DocumentJobData {
  shop: string;
  orderId: string;
  /** manual | auto | bulk | webhook */
  source: string;
  refundId?: string;
  /** Allow issuing again although a successful document exists. */
  force?: boolean;
}

export interface StockJobData {
  shop: string;
  source: "SCHEDULE" | "TRIGGER" | "MANUAL" | "WEBHOOK";
  productId?: string;
  skus?: string[];
}

let connection: IORedis | undefined;
export function redisConnection(): IORedis {
  if (!connection) {
    connection = new IORedis(env.redisUrl, { maxRetriesPerRequest: null, enableReadyCheck: false });
  }
  return connection;
}

const defaultJobOptions: JobsOptions = {
  attempts: 3,
  backoff: { type: "exponential", delay: 30_000 },
  removeOnComplete: { age: 24 * 3600, count: 1000 },
  removeOnFail: { age: 7 * 24 * 3600 },
};

let documentsQueue: Queue<DocumentJobData, unknown, DocumentJobName> | undefined;
let stockQueue: Queue<StockJobData, unknown, StockJobName> | undefined;

export function getDocumentsQueue() {
  if (!documentsQueue) {
    documentsQueue = new Queue(QUEUE_DOCUMENTS, { connection: redisConnection(), defaultJobOptions });
  }
  return documentsQueue;
}

export function getStockQueue() {
  if (!stockQueue) {
    stockQueue = new Queue(QUEUE_STOCK, { connection: redisConnection(), defaultJobOptions });
  }
  return stockQueue;
}

/** Deterministic job ids: a webhook retry while the job is still queued is a no-op. */
export function documentJobId(name: DocumentJobName, data: DocumentJobData): string {
  return [name, data.shop, data.orderId, data.refundId ?? ""].join(":").replace(/[^\w:.-]/g, "_");
}

export async function enqueueDocumentJob(name: DocumentJobName, data: DocumentJobData) {
  return getDocumentsQueue().add(name, data, { jobId: `${documentJobId(name, data)}:${Date.now()}` });
}

export async function enqueueStockJob(name: StockJobName, data: StockJobData, options: JobsOptions = {}) {
  return getStockQueue().add(name, data, options);
}

export async function closeQueues(): Promise<void> {
  await Promise.all([documentsQueue?.close(), stockQueue?.close()]);
  await connection?.quit();
  documentsQueue = undefined;
  stockQueue = undefined;
  connection = undefined;
}
