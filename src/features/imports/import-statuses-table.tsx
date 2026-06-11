import { Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import type { ImportStatus } from "@/lib/plant.functions";
import { DataTable } from "@/components/ui/data-table";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cva } from "class-variance-authority";
import { Badge } from "@/components/ui/badge.tsx";
import { useSuspenseQuery } from "@tanstack/react-query";
import { importQueries } from "@/features/imports/queries";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu.tsx";
import { Button } from "@/components/ui/button.tsx";
import { DotsThreeIcon } from "@phosphor-icons/react";
import { useDeleteImportStatus } from "@/features/imports/use-delete-import-status";

const statusBadgeVariants = cva("", {
  variants: {
    state: {
      pending: "border-yellow-200 bg-yellow-100 text-yellow-800",
      running: "border-blue-200 bg-blue-100 text-blue-800",
      complete: "border-green-200 bg-green-100 text-green-800",
      errored: "cursor-pointer border-red-200 bg-red-100 text-red-800",
    },
  },
});

const statusBadgeLabels: Record<ImportStatus["state"], string> = {
  pending: "Queued",
  running: "In progress",
  complete: "Complete",
  errored: "Failed",
};

function StatusBadge({ status: { state, error } }: { status: ImportStatus }) {
  const badge = (
    <Badge className={statusBadgeVariants({ state })}>
      {statusBadgeLabels[state]}
    </Badge>
  );

  if (!error) return badge;

  return (
    <Dialog>
      <DialogTrigger render={badge} nativeButton={false} />
      <DialogContent className="lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{error.name}</DialogTitle>
        </DialogHeader>
        <div className="-mx-4 max-h-[50vh] scrollbar-thin overflow-y-auto px-4 wrap-anywhere">
          {error.message}
        </div>
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const columns: ColumnDef<ImportStatus>[] = [
  {
    accessorKey: "plantName",
    header: "Name",
    cell: ({ row }) => {
      const { plantName, state, plantId } = row.original;
      if (state === "complete" && plantId != null) {
        return (
          <Link
            to="/plants/$plantId"
            params={{ plantId: String(plantId) }}
            className="underline-offset-4 hover:underline"
          >
            {plantName}
          </Link>
        );
      }
      return plantName;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ getValue }) => formatDateTime(getValue<string>()),
  },
  {
    accessorKey: "state",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original} />,
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <ImportStatusActions status={row.original} />,
  },
];

function ImportStatusActions({ status }: { status: ImportStatus }) {
  const { mutate: deleteStatus } = useDeleteImportStatus();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" className="h-8 w-8 p-0" />}
      >
        <span className="sr-only">Open menu</span>
        <DotsThreeIcon className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => deleteStatus(status.id)}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ImportStatusesTableSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

function ImportStatusesTableContent() {
  const { data } = useSuspenseQuery({
    ...importQueries.statuses(),
    refetchInterval: (query) => {
      const hasActive = query.state.data?.some(
        (s) => s.state === "pending" || s.state === "running"
      );
      return hasActive ? 3000 : false;
    },
  });

  return (
    <TooltipProvider>
      <DataTable columns={columns} data={data} striped bordered />
    </TooltipProvider>
  );
}

function ImportStatusesTable() {
  return (
    <Suspense fallback={<ImportStatusesTableSkeleton />}>
      <ImportStatusesTableContent />
    </Suspense>
  );
}

export { ImportStatusesTable };
