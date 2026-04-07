import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_protected/")({
  component: IndexPage,
})

function IndexPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold">Upcoming tasks</h1>
    </div>
  )
}
