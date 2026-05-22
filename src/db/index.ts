import { drizzle } from "drizzle-orm/d1"
import * as authSchema from "@/db/schemas/auth"
import * as plantSchema from "@/db/schemas/plant.ts"

export function createDb(d1: D1Database) {
  return drizzle(d1, {
    schema: {
      ...authSchema,
      ...plantSchema,
    },
  })
}
