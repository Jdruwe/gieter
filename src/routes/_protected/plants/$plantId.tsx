import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_protected/plants/$plantId")({
  component: PlantDetailPage,
})

function PlantDetailPage() {
  const { plantId } = Route.useParams()

  return (
    <div>
      <h1 className="text-xl font-semibold">Plant {plantId}</h1>
    </div>
  )
}
