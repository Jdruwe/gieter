import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { tanstackStartCookies } from "better-auth/tanstack-start"
import { createDb } from "@/db"
import { env } from "cloudflare:workers"

export const auth = betterAuth({
  database: drizzleAdapter(createDb(env.DB), {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [tanstackStartCookies()],
})
