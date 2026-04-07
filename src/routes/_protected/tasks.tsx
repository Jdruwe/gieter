import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_protected/tasks")({
  component: TasksPage,
})

function TasksPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold">Tasks</h1>
    </div>
  )
}
