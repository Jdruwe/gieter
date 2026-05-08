import { applyD1Migrations } from "cloudflare:test"
import { env } from "cloudflare:workers"

// Runs before each test file. applyD1Migrations is idempotent — safe to call
// multiple times, it only applies migrations that haven't been applied yet.
await applyD1Migrations(env.DB, env.TEST_MIGRATIONS)
