import type { WorkflowEvent } from "cloudflare:workers"
import { WorkflowEntrypoint, WorkflowStep } from "cloudflare:workers"
import { tavily } from "@tavily/core"
import { generateText, Output } from "ai"
import { openai } from "@ai-sdk/openai"
import z from "zod"
import { PlantRepository } from "@/repositories/plant.repository"
import { TaskRepository } from "@/repositories/task.repository"
import { PlantService } from "@/services/plant.service"

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
      const { output } = await generateText({
        model: openai("gpt-5-mini-2025-08-07"),
        output: Output.object({
          schema: z.object({
            name: z.string().describe("Name of the plant"),
            type: z
              .string()
              .describe("Type of plant, e.g. flowers, tree, etc."),
            sources: z
              .array(z.string())
              .describe(
                "List of relevant links used to create the maintenance plan"
              ),
            tasks: z.array(
              z.object({
                description: z
                  .string()
                  .describe("Description of the maintenance task"),
                deadline: z.object({
                  month: z
                    .number()
                    .describe(
                      "Numeric month of the year, e.g. 1 for January, 12 for December"
                    ),
                  day: z
                    .number()
                    .describe(
                      "Numeric day of the month, e.g. 1 for the first day"
                    ),
                }),
                products: z
                  .array(z.string())
                  .describe(
                    "List of products needed to complete the task, e.g. specific fertilizers, tools, etc."
                  ),
              })
            ),
          }),
        }),
        system: `
					- Only use the <extraction-results> as a source of truth, do NOT generate something of your own
					- Generate output in Dutch, even if the input is in another language.
					- Avoid using vague references like 'in three months' or 'late autumn.' Always calculate and state the exact deadline or scheduled date for a task to ensure maintenance logs remain actionable and unambiguous.
					- Sort maintenance tasks by date ascending
					- Providing enough details when pruning info is shared
			`,
        prompt: `
    		<task-context>
    			You are a helpful plant assistant that creates a maintenance plan requested by the user.
    		</task-context>

    		<background-data>
    			<extraction-results>
    				${extractResponse.results
              .map(
                (result) => `
								<result>
									<title>${result.title}</title>
									<url>${result.url}</url>
									<content>${result.rawContent}</content>
								</result>
							`
              )
              .join("\n")}
					</extraction-results>
				</background-data>

    		<the-ask>
    			The user request a plan to be made for: <plant>${event.payload.plant}</plant>
    		</the-ask>
    		`,
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
