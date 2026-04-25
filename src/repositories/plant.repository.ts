import { drizzle } from "drizzle-orm/d1"
import { eq } from "drizzle-orm"
import * as plantSchema from "@/db/schemas/plant"
import { plant } from "@/db/schemas/plant"
import { PlantMapper } from "@/mappers/plant.mapper"
import type { PlantEntity } from "@/entities/plant.entity"

type InsertPlantData = Pick<PlantEntity, "name" | "type" | "sources" | "status">

class PlantRepository {
  private readonly db: ReturnType<typeof drizzle>

  constructor(d1: D1Database) {
    this.db = drizzle(d1, { schema: plantSchema })
  }

  async insert(data: InsertPlantData): Promise<PlantEntity> {
    const now = new Date().toISOString()

    const [row] = await this.db
      .insert(plant)
      .values({
        name: data.name,
        type: data.type,
        sources: data.sources,
        status: data.status,
        updatedAt: now,
      })
      .returning()

    return PlantMapper.toEntity(row)
  }

  async findById(id: number): Promise<PlantEntity | null> {
    const [row] = await this.db
      .select()
      .from(plant)
      .where(eq(plant.id, id))
      .limit(1)

    return row ? PlantMapper.toEntity(row) : null
  }
}

export { PlantRepository }
export type { InsertPlantData }
