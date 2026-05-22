import type {
  PlantRepository,
  InsertPlantData,
} from "@/repositories/plant.repository"
import type {
  TaskRepository,
  InsertTaskData,
} from "@/repositories/task.repository"
import type { Plant } from "@/db/schemas/plant"
import type { PlantCarePlan } from "@/domain/plant-care"

type CreateFromImportResult = {
  plant: Plant
}

class PlantService {
  constructor(
    private readonly plantRepository: PlantRepository,
    private readonly taskRepository: TaskRepository
  ) {}

  async createFromImport(
    output: PlantCarePlan
  ): Promise<CreateFromImportResult> {
    const plantData: InsertPlantData = {
      name: output.name,
      type: output.type,
      sources: output.sources,
      status: "draft",
    }

    const plant = await this.plantRepository.insert(plantData)

    const taskData: InsertTaskData[] = output.tasks.map((task) => ({
      description: task.description,
      deadlineMonth: task.deadline.month,
      deadlineDay: task.deadline.day,
      products: task.products,
    }))

    await this.taskRepository.insertMany(plant.id, taskData)

    return { plant }
  }
}

export { PlantService }
