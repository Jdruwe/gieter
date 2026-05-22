import { createServerFn } from "@tanstack/react-start"
import { env } from "cloudflare:workers"
import { ensureSession } from "@/lib/auth.functions"

export const importPlant = createServerFn({ method: "POST" })
  .inputValidator((data: { plant: string }) => data)
  .handler(async ({ data }) => {
    await ensureSession()
    await env.IMPORT_PLANT_WORKFLOW.create({ params: { plant: data.plant } })
  })
