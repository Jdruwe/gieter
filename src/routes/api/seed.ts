import { auth } from "@/lib/auth"
import { createFileRoute } from "@tanstack/react-router"
import { env } from "cloudflare:workers"

export const Route = createFileRoute("/api/seed")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const authHeader = request.headers.get("Authorization")
        const setupSecret = (env as Env).SETUP_SECRET

        if (!setupSecret || authHeader !== `Bearer ${setupSecret}`) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          })
        }

        const email = (env as Env).SEED_EMAIL
        const password = (env as Env).SEED_PASSWORD
        const name = (env as Env).SEED_NAME

        if (!email || !password || !name) {
          return new Response(
            JSON.stringify({
              error: "Missing SEED_EMAIL, SEED_PASSWORD or SEED_NAME env vars",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
          )
        }

        try {
          const result = await auth.api.signUpEmail({
            body: { email, password, name },
          })

          return new Response(
            JSON.stringify({ ok: true, userId: result.user.id }),
            { status: 201, headers: { "Content-Type": "application/json" } }
          )
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unknown error"
          return new Response(JSON.stringify({ error: message }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          })
        }
      },
    },
  },
})
