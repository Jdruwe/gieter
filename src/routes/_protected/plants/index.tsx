import { createFileRoute } from "@tanstack/react-router";
import {
  queryOptions,
  useSuspenseQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getImportStatuses } from "@/lib/plant.functions";
import { ImportStatusesTable } from "@/components/plants/import-statuses-table";
import { ImportPlantDialog } from "@/components/plants/import-plant-dialog.tsx";
import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { PlusIcon } from "@phosphor-icons/react";

const importStatusesOptions = queryOptions({
  queryKey: ["importStatuses"],
  queryFn: getImportStatuses,
  refetchInterval: (query) => {
    const hasActive = query.state.data?.some(
      (s) => s.state === "pending" || s.state === "running"
    );
    return hasActive ? 3000 : false;
  },
});

export const Route = createFileRoute("/_protected/plants/")({
  loader: ({ context }) => {
    void context.queryClient.ensureQueryData(importStatusesOptions);
  },
  component: PlantsPage,
  pendingComponent: () => <div>I am loading...</div>,
});

function PlantsPage() {
  const { data } = useSuspenseQuery(importStatusesOptions);
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <Button className="w-fit" onClick={() => setImportDialogOpen(true)}>
        <PlusIcon size={32} /> Add New Plant
      </Button>
      <ImportStatusesTable data={data} />
      <ImportPlantDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
      />
    </div>
  );
}
