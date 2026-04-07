import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_protected/plants/")({
  component: PlantsPage,
})

function PlantsPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold">Plants</h1>
    </div>
  )
}
