// AES-256-GCM encryption for secrets at rest (VR360 password, trigger tokens).
// Format: v1.<iv base64>.<auth tag base64>.<ciphertext base64>

import { createCipheriv, createDecipheriv, randomBytes, timingSafeEqual } from "node:crypto";
import { env } from "./env.server";

const PREFIX = "v1";
const ALGO = "aes-256-gcm";

function key(): Buffer {
  const hex = env.encryptionKey;
  if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error("APP_ENCRYPTION_KEY must be 32 bytes, hex encoded (openssl rand -hex 32)");
  }
  return Buffer.from(hex, "hex");
}

export function encrypt(plain: string): string {
  if (plain === "") return "";
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key(), iv);
  const ciphertext = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [PREFIX, iv.toString("base64"), tag.toString("base64"), ciphertext.toString("base64")].join(".");
}

export function isEncrypted(value: string): boolean {
  return value.startsWith(`${PREFIX}.`) && value.split(".").length === 4;
}

export function decrypt(stored: string): string {
  if (stored === "") return "";
  if (!isEncrypted(stored)) {
    throw new Error("Stored secret is not in the expected encrypted format");
  }
  const [, ivB64, tagB64, ctB64] = stored.split(".");
  const decipher = createDecipheriv(ALGO, key(), Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(ctB64, "base64")), decipher.final()]).toString("utf8");
}

export function randomToken(bytes = 24): string {
  return randomBytes(bytes).toString("base64url");
}

/** Constant-time string comparison for tokens. */
export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}
