import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_protected/settings")({
  component: SettingsPage,
})

function SettingsPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold">Settings</h1>
    </div>
  )
}
