import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { importPlant } from "@/lib/plant.functions"

export const Route = createFileRoute("/_protected/plants/")({
  component: PlantsPage,
})

function PlantsPage() {
  const [plantName, setPlantName] = useState("")
  const [isPending, setIsPending] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!plantName.trim()) return

    setIsPending(true)
    setSuccessMessage(null)
    setError(null)

    try {
      await importPlant({ data: { plant: plantName.trim() } })
      setSuccessMessage(`Import started for "${plantName.trim()}"`)
      setPlantName("")
    } catch {
      setError("Failed to start import. Please try again.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="max-w-md p-6">
      <h1 className="mb-6 text-xl font-semibold">Plants</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={plantName}
            onChange={(e) => setPlantName(e.target.value)}
            placeholder="Plant name..."
            disabled={isPending}
            className="flex-1 rounded border px-3 py-2 text-sm disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isPending || !plantName.trim()}
            className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
          >
            {isPending ? "Starting..." : "Import"}
          </button>
        </div>

        {successMessage && (
          <p className="text-sm text-green-600">{successMessage}</p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </form>
    </div>
  )
}
