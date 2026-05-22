import { Link, createFileRoute } from "@tanstack/react-router"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  CheckCircleIcon,
  ClockIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import type { ColumnDef } from "@tanstack/react-table"
import type { ImportState, ImportStatus } from "@/lib/plant.functions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getImportStatuses, importPlant } from "@/lib/plant.functions"

function StatusIcon({ status: { state, error } }: { status: ImportStatus }) {
  const icon = (() => {
    switch (state) {
      case "pending":
        return <ClockIcon className="size-4" />
      case "running":
        return <Spinner className="size-4" />
      case "complete":
        return (
          <CheckCircleIcon className="size-4 text-green-600" weight="fill" />
        )
      case "errored":
        return (
          <WarningCircleIcon
            className="size-4 text-destructive"
            weight="fill"
          />
        )
    }
  })()

  const label = (() => {
    switch (state) {
      case "pending":
        return "Queued"
      case "running":
        return "Importing..."
      case "complete":
        return "Complete"
      case "errored":
        return error ? `Failed: ${error.message}` : "Failed"
    }
  })()

  return (
    <Tooltip>
      <TooltipTrigger className="inline-flex cursor-default">
        {icon}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

const columns: Array<ColumnDef<ImportStatus>> = [
  {
    accessorKey: "plantName",
    header: "Name",
    cell: ({ row }) => {
      const { plantName, state, plantId } = row.original
      if (state === "complete" && plantId != null) {
        return (
          <Link
            to="/plants/$plantId"
            params={{ plantId: String(plantId) }}
            className="underline-offset-4 hover:underline"
          >
            {plantName}
          </Link>
        )
      }
      return plantName
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ getValue }) => formatDateTime(getValue() as string),
  },
  {
    accessorKey: "state",
    header: "Status",
    cell: ({ row }) => <StatusIcon status={row.original} />,
  },
]

function isActive(state: ImportState) {
  return state === "pending" || state === "running"
}

export const Route = createFileRoute("/_protected/plants/")({
  component: PlantsPage,
})

function PlantsPage() {
  const [plantName, setPlantName] = useState("")
  const [isPending, setIsPending] = useState(false)
  const [imports, setImports] = useState<Array<ImportStatus>>([])
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchStatuses = useCallback(async () => {
    try {
      const statuses = await getImportStatuses()
      setImports(statuses)
    } catch {
      // silently ignore poll failures
    }
  }, [])

  useEffect(() => {
    fetchStatuses()
  }, [fetchStatuses])

  useEffect(() => {
    const hasActive = imports.some((imp) => isActive(imp.state))

    if (hasActive && !pollRef.current) {
      pollRef.current = setInterval(fetchStatuses, 3000)
    } else if (!hasActive && pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }
  }, [imports, fetchStatuses])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!plantName.trim()) return

    setIsPending(true)

    try {
      await importPlant({ data: { plant: plantName.trim() } })
      setPlantName("")
      await fetchStatuses()
    } catch {
      // error handled inline
    } finally {
      setIsPending(false)
    }
  }

  const tableData = useMemo(() => imports, [imports])

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Plants</h1>

      <form onSubmit={handleSubmit} className="flex max-w-sm gap-2">
        <Input
          value={plantName}
          onChange={(e) => setPlantName(e.target.value)}
          placeholder="Plant name..."
          disabled={isPending}
        />
        <Button type="submit" disabled={isPending || !plantName.trim()}>
          {isPending ? "Starting..." : "Import"}
        </Button>
      </form>

      {imports.length > 0 && (
        <TooltipProvider>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TooltipProvider>
      )}
    </div>
  )
}
