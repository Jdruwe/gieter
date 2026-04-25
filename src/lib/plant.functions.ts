import { createServerFn } from "@tanstack/react-start"
import { env } from "cloudflare:workers"

export const importPlant = createServerFn({ method: "POST" })
  .inputValidator((data: { plant: string }) => data)
  .handler(async ({ data }) => {
    await env.IMPORT_PLANT_WORKFLOW.create({ params: { plant: data.plant } })
  })
