import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    setupFiles: ["tests/setup.ts"],
    fileParallelism: false,
    testTimeout: 15000,
    hookTimeout: 15000,
  },
});