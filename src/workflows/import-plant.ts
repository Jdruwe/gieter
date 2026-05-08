import type { WorkflowEvent } from "cloudflare:workers"
import { WorkflowEntrypoint, WorkflowStep } from "cloudflare:workers"
import { tavily } from "@tavily/core"
import { generateText, Output } from "ai"
import { openai } from "@ai-sdk/openai"
import { PlantRepository } from "@/repositories/plant.repository"
import { TaskRepository } from "@/repositories/task.repository"
import { PlantService } from "@/services/plant.service"
import { plantCareSchema, buildPlantCarePrompt } from "./plant-care-prompt"

type Params = { plant: string }

export class ImportPlantWorkflow extends WorkflowEntrypoint<Env, Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
    const tavilyClient = tavily({ apiKey: process.env["TAVILY_API_KEY"] })

    const searchResponse = await step.do("search", async () => {
      return await tavilyClient.search(
        `${event.payload.plant} onderhoudskalender België`,
        {
          country: "Belgium",
        }
      )
    })

    const extractResponse = await step.do("extract content", async () => {
      return await tavilyClient.extract(
        searchResponse.results.map((r) => r.url)
      )
    })

    const generatedPlan = await step.do("generate plan", async () => {
      const { system, prompt } = buildPlantCarePrompt(
        event.payload.plant,
        extractResponse.results
      )

      const { output } = await generateText({
        model: openai("gpt-5-mini-2025-08-07"),
        output: Output.object({ schema: plantCareSchema }),
        system,
        prompt,
      })

      return output
    })

    return await step.do("persist plant", async () => {
      const plantRepository = new PlantRepository(this.env.DB)
      const taskRepository = new TaskRepository(this.env.DB)
      const plantService = new PlantService(plantRepository, taskRepository)

      const { plant } = await plantService.createFromImport(generatedPlan)

      return { plantId: plant.id }
    })
  }
}
