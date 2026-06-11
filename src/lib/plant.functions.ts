import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";
import { ensureSession } from "@/lib/auth.functions";
import { ImportRepository } from "@/repositories/import.repository.ts";
import z from "zod";

export const importPlant = createServerFn({ method: "POST" })
  .inputValidator((data: { plant: string }) => data)
  .handler(async ({ data }) => {
    await ensureSession();
    const instance = await env.IMPORT_PLANT_WORKFLOW.create({
      params: { plant: data.plant },
    });
    const importsRepository = new ImportRepository(env.DB);
    await importsRepository.insert({ id: instance.id, plantName: data.plant });
    return { instanceId: instance.id };
  });

export type ImportState = "pending" | "running" | "complete" | "errored";

export type ImportStatus = {
  id: string;
  plantName: string;
  createdAt: string;
  state: ImportState;
  error?: { name: string; message: string };
  plantId?: number;
};

function mapState(status: string): ImportState {
  switch (status) {
    case "queued":
      return "pending";
    case "running":
    case "waiting":
    case "waitingForPause":
      return "running";
    case "complete":
      return "complete";
    default:
      return "errored";
  }
}

export const getImportStatuses = createServerFn({ method: "GET" }).handler(
  async () => {
    await ensureSession();
    const importsRepository = new ImportRepository(env.DB);
    const allImports = await importsRepository.findAll();

    const statuses: Array<ImportStatus> = await Promise.all(
      allImports.map(async (imp) => {
        try {
          const instance = await env.IMPORT_PLANT_WORKFLOW.get(imp.id);
          const result = await instance.status();
          const output = result.output as { plantId: number } | undefined;
          return {
            id: imp.id,
            plantName: imp.plantName,
            createdAt: imp.createdAt.toISOString(),
            state: mapState(result.status),
            error: result.error ?? undefined,
            plantId: output?.plantId,
          };
        } catch {
          return {
            id: imp.id,
            plantName: imp.plantName,
            createdAt: imp.createdAt.toISOString(),
            state: "errored" as const,
          };
        }
      })
    );

    return statuses;
  }
);

const deleteImportStatusSchema = z.object({
  id: z.string(),
});

export const deleteImportStatus = createServerFn({ method: "POST" })
  .validator(deleteImportStatusSchema)
  .handler(async ({ data }) => {
    await ensureSession();
    const importsRepository = new ImportRepository(env.DB);
    await importsRepository.deleteById(data.id);
  });
