import { drizzle } from "drizzle-orm/d1"
import { env } from "cloudflare:workers"
import * as authSchema from "./schema/auth"

export const db = drizzle((env as Env).DB, {
  schema: {
    ...authSchema,
  },
})
