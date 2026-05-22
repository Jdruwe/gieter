import { eq } from "drizzle-orm"
import type { Import } from "@/db/schemas/plant"
import { imports } from "@/db/schemas/plant"
import { createDb } from "@/db"

class ImportRepository {
  private readonly db: ReturnType<typeof createDb>

  constructor(d1: D1Database) {
    this.db = createDb(d1)
  }

  async insert(data: Pick<Import, "id" | "plantName">): Promise<Import> {
    const [row] = await this.db.insert(imports).values(data).returning()
    return row
  }

  async findAll(): Promise<Array<Import>> {
    return this.db.select().from(imports).all()
  }

  async deleteById(id: Import["id"]): Promise<void> {
    await this.db.delete(imports).where(eq(imports.id, id))
  }
}

export { ImportRepository }
