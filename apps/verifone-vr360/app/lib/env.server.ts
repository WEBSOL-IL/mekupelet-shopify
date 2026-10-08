// Typed access to process.env with fail-fast for the values the app cannot run without.

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable ${name}`);
  }
  return value;
}

export const env = {
  get databaseUrl() {
    return required("DATABASE_URL");
  },
  get redisUrl() {
    return process.env.REDIS_URL || "redis://localhost:6379";
  },
  get encryptionKey() {
    return required("APP_ENCRYPTION_KEY");
  },
  get appUrl() {
    return process.env.SHOPIFY_APP_URL || "";
  },
  get vr360TimeoutMs() {
    const raw = Number(process.env.VR360_TIMEOUT_MS);
    return Number.isFinite(raw) && raw > 0 ? raw : 60_000;
  },
  get isProduction() {
    return process.env.NODE_ENV === "production";
  },
};
