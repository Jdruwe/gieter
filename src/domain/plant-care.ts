import z from "zod"

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
