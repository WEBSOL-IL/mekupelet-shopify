// Document jobs: issue-invoice, credit-full, credit-refund.
// Phase 0 stub: records the job in the log and does nothing in VR360. Phases 1, 2 and 4
// replace the body with the invoice builder / credit builder.

import type { Job } from "bullmq";
import type { DocumentJobData, DocumentJobName } from "../lib/queue.server";

export async function processDocumentJob(job: Job<DocumentJobData, unknown, DocumentJobName>) {
  console.log(`[documents] ${job.name} for ${job.data.shop} order ${job.data.orderId} (source ${job.data.source}) — not implemented yet`);
  return { skipped: "not-implemented" };
}
