import type { InferSelectModel } from "drizzle-orm"
import type { plant } from "@/db/schemas/plant"
import { PlantEntity } from "@/entities/plant.entity"

type PlantRow = InferSelectModel<typeof plant>

class PlantMapper {
  static toEntity(row: PlantRow): PlantEntity {
    return new PlantEntity(row.id, row.name, row.type, row.status, row.sources)
  }

  static toEntityList(rows: PlantRow[]): PlantEntity[] {
    return rows.map((row) => PlantMapper.toEntity(row))
  }
}

export { PlantMapper }
