import type { WorkflowEvent } from "cloudflare:workers";
import { WorkflowEntrypoint, WorkflowStep } from "cloudflare:workers";
import { NonRetryableError } from "cloudflare:workflows";
import { TavilySearchService } from "@/services/tavily-search.service";
import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { PlantRepository } from "@/repositories/plant.repository";
import { TaskRepository } from "@/repositories/task.repository";
import { PlantService } from "@/services/plant.service";
import { plantCareSchema } from "@/domain/plant-care";
import { buildPlantCarePrompt } from "./plant-care-prompt";

type Params = { plant: string };

export class ImportPlantWorkflow extends WorkflowEntrypoint<Env, Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
    const plantName = event.payload.plant;
    const searchService = new TavilySearchService(
      process.env["TAVILY_API_KEY"]
    );

    const searchResponse = await step.do("search", async () => {
      const response = await searchService.search(
        `${plantName} onderhoudskalender België`,
        { country: "Belgium" }
      );

      if (!response.results.length) {
        throw new NonRetryableError(
          `No search results found for plant: ${plantName}`
        );
      }

      return response;
    });

    const extractResponse = await step.do("extract content", async () => {
      const urls = searchResponse.results.map((r) => r.url);
      const response = await searchService.extractContent(urls);

      if (!response.results.length) {
        throw new NonRetryableError(
          `No content could be extracted for plant: ${plantName}`
        );
      }

      return response;
    });

    const generatedPlan = await step.do("generate plan", async () => {
      // todo: should this logic also be moved into a service of its own?
      const { system, prompt } = buildPlantCarePrompt(
        plantName,
        extractResponse.results
      );

      const { output } = await generateText({
        model: openai("gpt-5-mini-2025-08-07"),
        output: Output.object({ schema: plantCareSchema }),
        system,
        prompt,
      });

      if (!output.tasks.length) {
        throw new NonRetryableError(
          `AI generated a plan with no tasks for plant: ${plantName}`
        );
      }

      return output;
    });

    return await step.do("persist plant", async () => {
      const plantRepository = new PlantRepository(this.env.DB);
      const taskRepository = new TaskRepository(this.env.DB);
      const plantService = new PlantService(plantRepository, taskRepository);

      const { plant } = await plantService.createFromImport(generatedPlan);

      return { plantId: plant.id };
    });
  }
}
