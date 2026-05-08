import path from "node:path"
import {
  cloudflareTest,
  readD1Migrations,
} from "@cloudflare/vitest-pool-workers"
import { defineConfig } from "vitest/config"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig(async () => {
  const migrationsPath = path.join(__dirname, "migrations")
  const migrations = await readD1Migrations(migrationsPath)

  return {
    plugins: [
      tsconfigPaths(),
      cloudflareTest({
        main: "./src/server.test.ts",
        wrangler: { configPath: "./wrangler.jsonc" },
        miniflare: {
          bindings: { TEST_MIGRATIONS: migrations },
        },
      }),
    ],
    test: {
      include: ["tests/**/*.test.ts"],
      setupFiles: ["./tests/setup/apply-migrations.ts"],
    },
  }
})
