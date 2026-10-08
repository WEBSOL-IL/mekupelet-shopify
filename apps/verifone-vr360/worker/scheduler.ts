// Repeatable stock-sync jobs per shop, derived from settings (replaces WP-Cron).

import { getStockQueue } from "../app/lib/queue.server";
import { listConfiguredShops, loadSettings } from "../app/lib/settings.server";

function schedulerId(shop: string, kind: "today" | "month"): string {
  return `stock:${kind}:${shop}`;
}

export async function reconcileSchedules(): Promise<void> {
  const queue = getStockQueue();
  const shops = await listConfiguredShops();
  const wanted = new Map<string, { every: number; name: "sync-today" | "sync-month"; shop: string }>();

  for (const shop of shops) {
    const settings = await loadSettings(shop);
    if (!settings.stock.enabled) continue;
    if (settings.stock.today) {
      wanted.set(schedulerId(shop, "today"), {
        every: settings.stock.todayIntervalMinutes * 60_000,
        name: "sync-today",
        shop,
      });
    }
    if (settings.stock.month) {
      wanted.set(schedulerId(shop, "month"), {
        every: settings.stock.monthIntervalHours * 3600_000,
        name: "sync-month",
        shop,
      });
    }
  }

  const existing = await queue.getJobSchedulers(0, 1000);
  for (const scheduler of existing) {
    if (!scheduler.key || !scheduler.key.startsWith("stock:")) continue;
    const want = wanted.get(scheduler.key);
    if (!want) {
      await queue.removeJobScheduler(scheduler.key);
    }
  }

  for (const [id, want] of wanted) {
    const current = existing.find((s) => s.key === id);
    if (current && current.every === want.every && current.name === want.name) continue;
    // BullMQ types the scheduler id with the queue's job-name type; it is a free-form key.
    await queue.upsertJobScheduler(id as "sync-today", { every: want.every }, {
      name: want.name,
      data: { shop: want.shop, source: "SCHEDULE" },
    });
  }
}
