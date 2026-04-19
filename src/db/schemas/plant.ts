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
    .$type<string[]>()
    .default(sql`'[]'`),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull(),
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
    .$type<string[]>()
    .default(sql`'[]'`),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull(),
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
