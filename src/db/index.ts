import { drizzle } from "drizzle-orm/d1"
import { env } from "cloudflare:workers"
import * as authSchema from "@/db/schemas/auth"
import * as plantSchema from "@/db/schemas/plant.ts"

export const db = drizzle(env.DB, {
  schema: {
    ...authSchema,
    ...plantSchema,
  },
})
