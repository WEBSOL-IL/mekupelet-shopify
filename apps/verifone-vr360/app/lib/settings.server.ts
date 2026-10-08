// Load / save the per-shop settings document (ShopSettings table).

import type { Prisma } from "@prisma/client";
import prisma from "../db.server";
import { decrypt, encrypt, isEncrypted, randomToken } from "./crypto.server";
import { DEFAULT_SETTINGS, settingsSchema, type Settings } from "./settings.schema";

/** Settings with the VR360 password decrypted. Missing keys fall back to defaults. */
export async function loadSettings(shop: string): Promise<Settings> {
  const row = await prisma.shopSettings.findUnique({ where: { shop } });
  if (!row) return structuredClone(DEFAULT_SETTINGS);
  const parsed = settingsSchema.safeParse(row.data);
  const settings = parsed.success ? parsed.data : structuredClone(DEFAULT_SETTINGS);
  if (!parsed.success) {
    console.error(`[settings] invalid settings for ${shop}, using defaults`, parsed.error.issues);
  }
  const stored = settings.connection.password;
  settings.connection.password = isEncrypted(stored) ? decrypt(stored) : stored;
  return settings;
}

/**
 * Persist settings. The password is encrypted before writing; pass `keepPassword: true`
 * to leave the stored password untouched (used when the form field was left empty).
 */
export async function saveSettings(
  shop: string,
  next: Settings,
  options: { keepPassword?: boolean } = {},
): Promise<Settings> {
  const current = await loadSettings(shop);
  const merged: Settings = {
    ...next,
    connection: {
      ...next.connection,
      password: options.keepPassword ? current.connection.password : next.connection.password,
    },
    stock: {
      ...next.stock,
      triggerToken: next.stock.triggerToken || current.stock.triggerToken || randomToken(),
    },
  };

  const data = {
    ...merged,
    connection: { ...merged.connection, password: encrypt(merged.connection.password) },
  } as Prisma.InputJsonValue;

  await prisma.shopSettings.upsert({
    where: { shop },
    create: { shop, data },
    update: { data },
  });
  return merged;
}

/** Shops that have settings stored (used by the worker scheduler). */
export async function listConfiguredShops(): Promise<string[]> {
  const rows = await prisma.shopSettings.findMany({ select: { shop: true } });
  return rows.map((r) => r.shop);
}
