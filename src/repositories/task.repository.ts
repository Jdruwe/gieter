import { drizzle } from "drizzle-orm/d1"
import * as plantSchema from "@/db/schemas/plant"
import { tasks } from "@/db/schemas/plant"
import { TaskMapper } from "@/mappers/task.mapper"
import type { TaskEntity } from "@/entities/task.entity"

type InsertTaskData = Pick<
  TaskEntity,
  "description" | "deadlineMonth" | "deadlineDay" | "products"
>

class TaskRepository {
  private readonly db: ReturnType<typeof drizzle>

  constructor(d1: D1Database) {
    this.db = drizzle(d1, { schema: plantSchema })
  }

  async insertMany(
    plantId: number,
    data: InsertTaskData[]
  ): Promise<TaskEntity[]> {
    const now = new Date().toISOString()

    const rows = await this.db
      .insert(tasks)
      .values(
        data.map((task) => ({
          plantId,
          description: task.description,
          deadlineMonth: task.deadlineMonth,
          deadlineDay: task.deadlineDay,
          products: task.products,
          updatedAt: now,
        }))
      )
      .returning()

    return TaskMapper.toEntityList(rows)
  }
}

export { TaskRepository }
export type { InsertTaskData }
