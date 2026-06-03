import { Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import type { ImportStatus } from "@/lib/plant.functions";
import { DataTable } from "@/components/ui/data-table";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cva } from "class-variance-authority";
import { Badge } from "@/components/ui/badge.tsx";

const statusBadgeVariants = cva("", {
  variants: {
    state: {
      pending: "border-yellow-200 bg-yellow-100 text-yellow-800",
      running: "border-blue-200 bg-blue-100 text-blue-800",
      complete: "border-green-200 bg-green-100 text-green-800",
      errored: "border-red-200 bg-red-100 text-red-800",
    },
  },
});

const statusBadgeLabels: Record<ImportStatus["state"], string> = {
  pending: "Queued",
  running: "Importing...",
  complete: "Complete",
  errored: "Failed",
};

function StatusBadge({ status: { state } }: { status: ImportStatus }) {
  return (
    <Badge className={statusBadgeVariants({ state })}>
      {statusBadgeLabels[state]}
    </Badge>
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
];

interface ImportStatusesTableProps {
  data: ImportStatus[];
}

function ImportStatusesTable({ data }: ImportStatusesTableProps) {
  return (
    <TooltipProvider>
      <DataTable columns={columns} data={data} />
    </TooltipProvider>
  );
}

export { ImportStatusesTable, type ImportStatusesTableProps };
