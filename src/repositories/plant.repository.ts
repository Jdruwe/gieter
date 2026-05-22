import { createDb } from "@/db"
import { plant, type Plant } from "@/db/schemas/plant"

type InsertPlantData = Pick<Plant, "name" | "type" | "sources" | "status">

class PlantRepository {
  private readonly db: ReturnType<typeof createDb>

  constructor(d1: D1Database) {
    this.db = createDb(d1)
  }

  async insert(data: InsertPlantData): Promise<Plant> {
    const [row] = await this.db
      .insert(plant)
      .values({
        name: data.name,
        type: data.type,
        sources: data.sources,
        status: data.status,
        updatedAt: new Date(),
      })
      .returning()

    return row
  }
}

export { PlantRepository }
export type { InsertPlantData }
