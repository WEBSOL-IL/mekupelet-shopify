import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    env: {
      APP_ENCRYPTION_KEY: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
      DATABASE_URL: "postgresql://unused:unused@localhost:5432/unused",
      VR360_TIMEOUT_MS: "5000",
    },
  },
});
