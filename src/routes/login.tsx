import { createFileRoute, redirect } from "@tanstack/react-router"
import { getSession } from "@/lib/auth.functions"
import { LoginForm } from "@/components/login-form.tsx"

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const session = await getSession()
    if (session) {
      throw redirect({ to: "/" })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <img src="/logo.png" alt="Gieter logo" className="w-20 self-center" />
        <LoginForm />
      </div>
    </div>
  )
}
