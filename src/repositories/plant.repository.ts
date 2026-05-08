import { drizzle } from "drizzle-orm/d1"
import { eq } from "drizzle-orm"
import * as plantSchema from "@/db/schemas/plant"
import { plant, type Plant } from "@/db/schemas/plant"

type InsertPlantData = Pick<Plant, "name" | "type" | "sources" | "status">

class PlantRepository {
  private readonly db: ReturnType<typeof drizzle>

  constructor(d1: D1Database) {
    this.db = drizzle(d1, { schema: plantSchema })
  }

  async insert(data: InsertPlantData): Promise<Plant> {
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

    return row
  }

  async findById(id: number): Promise<Plant | null> {
    const [row] = await this.db
      .select()
      .from(plant)
      .where(eq(plant.id, id))
      .limit(1)

    return row ?? null
  }
}

export { PlantRepository }
export type { InsertPlantData }
