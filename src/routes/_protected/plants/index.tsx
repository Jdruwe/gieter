import { createFileRoute } from "@tanstack/react-router";
import { importQueries } from "@/features/imports/queries";
import { ImportStatusesTable } from "@/features/imports/import-statuses-table";
import { ImportPlantDialog } from "@/features/imports/import-plant-dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { PlusIcon } from "@phosphor-icons/react";

export const Route = createFileRoute("/_protected/plants/")({
  loader: ({ context }) => {
    void context.queryClient.ensureQueryData(importQueries.statuses());
  },
  component: PlantsPage,
});

function PlantsPage() {
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <Button className="w-fit" onClick={() => setImportDialogOpen(true)}>
        <PlusIcon size={32} /> Add New Plant
      </Button>
      <ImportStatusesTable />
      <ImportPlantDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
      />
    </div>
  );
}
