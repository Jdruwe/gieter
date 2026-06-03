import { createFileRoute } from "@tanstack/react-router";
import {
  queryOptions,
  useSuspenseQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getImportStatuses } from "@/lib/plant.functions";
import { ImportStatusesTable } from "@/components/plants/import-statuses-table";
import { ImportPlant } from "@/components/plants/import-plant";
import { Separator } from "@/components/ui/separator.tsx";

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
  const queryClient = useQueryClient();
  const { data } = useSuspenseQuery(importStatusesOptions);

  function handleImportSuccess() {
    void queryClient.invalidateQueries({ queryKey: ["importStatuses"] });
  }

  // todo: wouldn't it be cleaner to use a modal?
  return (
    <div className="flex flex-col gap-8">
      <ImportPlant onSuccess={handleImportSuccess} />
      <Separator />
      <ImportStatusesTable data={data} />
    </div>
  );
}
