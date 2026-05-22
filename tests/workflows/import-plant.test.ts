import { introspectWorkflowInstance } from "cloudflare:test"
import { env } from "cloudflare:workers"
import { it, expect } from "vitest"
import { plantCareSchema } from "@/domain/plant-care"

// A known-valid AI response parsed through the real schema — guarantees the
// fixture matches the contract the workflow passes to PlantService.
const mockGeneratedPlan = plantCareSchema.parse({
  name: "Roos",
  type: "bloem",
  sources: ["https://example.com/roos-verzorging"],
  tasks: [
    {
      description: "Snoeien na de winter",
      deadline: { month: 3, day: 15 },
      products: ["snoeischaar", "wondbehandelingsmiddel"],
    },
    {
      description: "Bemesten in het groeiseizoen",
      deadline: { month: 5, day: 1 },
      products: ["rozenmeststof"],
    },
  ],
})

const mockSearchResult = {
  results: [{ url: "https://example.com/roos-verzorging" }],
}

const mockExtractResult = {
  results: [
    {
      url: "https://example.com/roos-verzorging",
      title: "Roos verzorging kalender",
      rawContent: "Snoei rozen in maart. Bemest in mei.",
    },
  ],
}

it("persists a plant and returns its id after a successful import", async () => {
  const instanceId = crypto.randomUUID()

  await using instance = await introspectWorkflowInstance(
    env.IMPORT_PLANT_WORKFLOW,
    instanceId
  )

  // Mock only the external steps — Tavily and OpenAI are never called.
  // "persist plant" runs for real against the local D1.
  await instance.modify(async (m) => {
    await m.disableSleeps()
    await m.mockStepResult({ name: "search" }, mockSearchResult)
    await m.mockStepResult({ name: "extract content" }, mockExtractResult)
    await m.mockStepResult({ name: "generate plan" }, mockGeneratedPlan)
  })

  await env.IMPORT_PLANT_WORKFLOW.create({
    id: instanceId,
    params: { plant: "Roos" },
  })

  await expect(instance.waitForStatus("complete")).resolves.not.toThrow()

  const output = await instance.getOutput()
  expect(output).toEqual({ plantId: expect.any(Number) })
})
