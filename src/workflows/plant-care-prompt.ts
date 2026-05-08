import z from "zod"

// The contract between what GPT returns and what gets persisted.
// Test this schema against known good/bad AI responses independently of the workflow.
export const plantCareSchema = z.object({
  name: z.string().describe("Name of the plant"),
  type: z.string().describe("Type of plant, e.g. flowers, tree, etc."),
  sources: z
    .array(z.string())
    .describe("List of relevant links used to create the maintenance plan"),
  tasks: z.array(
    z.object({
      description: z.string().describe("Description of the maintenance task"),
      deadline: z.object({
        month: z
          .number()
          .describe(
            "Numeric month of the year, e.g. 1 for January, 12 for December"
          ),
        day: z
          .number()
          .describe("Numeric day of the month, e.g. 1 for the first day"),
      }),
      products: z
        .array(z.string())
        .describe(
          "List of products needed to complete the task, e.g. specific fertilizers, tools, etc."
        ),
    })
  ),
})

export type PlantCarePlan = z.infer<typeof plantCareSchema>

type ExtractionResult = {
  title: string | null
  url: string
  rawContent: string
}

export function buildPlantCarePrompt(
  plantName: string,
  extractionResults: ExtractionResult[]
): { system: string; prompt: string } {
  const system = `
- Only use the <extraction-results> as a source of truth, do NOT generate something of your own
- Generate output in Dutch, even if the input is in another language.
- Avoid using vague references like 'in three months' or 'late autumn.' Always calculate and state the exact deadline or scheduled date for a task to ensure maintenance logs remain actionable and unambiguous.
- Sort maintenance tasks by date ascending
- Providing enough details when pruning info is shared
`

  const prompt = `
<task-context>
  You are a helpful plant assistant that creates a maintenance plan requested by the user.
</task-context>

<background-data>
  <extraction-results>
    ${extractionResults
      .map(
        (result) => `
    <result>
      <title>${result.title}</title>
      <url>${result.url}</url>
      <content>${result.rawContent}</content>
    </result>`
      )
      .join("\n")}
  </extraction-results>
</background-data>

<the-ask>
  The user request a plan to be made for: <plant>${plantName}</plant>
</the-ask>
`

  return { system, prompt }
}
