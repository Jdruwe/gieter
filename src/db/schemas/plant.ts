import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"
import { relations, sql } from "drizzle-orm"

export const plant = sqliteTable("plants", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  status: text("status", { enum: ["draft", "active"] })
    .notNull()
    .default("draft"),
  sources: text("sources", { mode: "json" })
    .notNull()
    .$type<Array<string>>()
    .default(sql`'[]'`),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
})

export const imports = sqliteTable("imports", {
  id: text("id").primaryKey(),
  plantName: text("plant_name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
})

export const tasks = sqliteTable("tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  plantId: integer("plant_id")
    .notNull()
    .references(() => plant.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  deadlineMonth: integer("deadline_month").notNull(),
  deadlineDay: integer("deadline_day").notNull(),
  products: text("products", { mode: "json" })
    .notNull()
    .$type<Array<string>>()
    .default(sql`'[]'`),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .notNull()
    .$defaultFn(() => new Date()),
})

export const plantsRelations = relations(plant, ({ many }) => ({
  tasks: many(tasks),
}))

export const tasksRelations = relations(tasks, ({ one }) => ({
  plant: one(plant, {
    fields: [tasks.plantId],
    references: [plant.id],
  }),
}))

export type Plant = typeof plant.$inferSelect
export type Task = typeof tasks.$inferSelect
export type Import = typeof imports.$inferSelect
