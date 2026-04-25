import type { InferSelectModel } from "drizzle-orm"
import type { tasks } from "@/db/schemas/plant"
import { TaskEntity } from "@/entities/task.entity"

type TaskRow = InferSelectModel<typeof tasks>

class TaskMapper {
  static toEntity(row: TaskRow): TaskEntity {
    return new TaskEntity(
      row.id,
      row.plantId,
      row.description,
      row.deadlineMonth,
      row.deadlineDay,
      row.products
    )
  }

  static toEntityList(rows: TaskRow[]): TaskEntity[] {
    return rows.map((row) => TaskMapper.toEntity(row))
  }
}

export { TaskMapper }
