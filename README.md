# Gieter

A Belgian plant care assistant. Uses AI to generate Dutch-language plant maintenance plans, powered by TanStack Start on Cloudflare Workers.

## Stack

- **Framework:** TanStack Start (React SSR)
- **Runtime:** Cloudflare Workers
- **Database:** Cloudflare D1 (SQLite)
- **Auth:** better-auth
- **AI:** OpenAI via Vercel AI SDK + Tavily web search
- **Styling:** Tailwind CSS v4 + shadcn/ui

## Environment Variables

All variables are set in `.env` for local development. For production, use `wrangler secret put <NAME>`.

| Variable             | Description                                                             |
| -------------------- | ----------------------------------------------------------------------- |
| `BETTER_AUTH_SECRET` | Secret key for better-auth. Generate with `pnpm dlx auth@latest secret` |
| `BETTER_AUTH_URL`    | Base URL of the app (e.g. `http://localhost:3000`)                      |
| `SETUP_SECRET`       | Secret token to protect the `/api/seed` endpoint                        |
| `SEED_EMAIL`         | Email address for the initial admin account                             |
| `SEED_PASSWORD`      | Password for the initial admin account                                  |
| `SEED_NAME`          | Display name for the initial admin account                              |
| `TAVILY_API_KEY`     | Tavily API key for web search                                           |
| `OPENAI_API_KEY`     | OpenAI API key                                                          |

## Development

```bash
pnpm install
pnpm dev
```

## Auth & Database Setup

Authentication uses [better-auth](https://better-auth.com) with Cloudflare D1 as the database. Sign-ups are disabled — only the seeded account can sign in.

### First-time setup

**1. Apply migrations locally**

```bash
pnpm migrate:local
```

This applies `migrations/0001_auth.sql` to the local D1 database (stored in `.wrangler/`).

**2. Seed your account locally**

Fill in `SETUP_SECRET`, `SEED_EMAIL`, `SEED_PASSWORD` and `SEED_NAME` in `.env`, then:

```bash
curl -s -X POST http://localhost:3000/api/seed \
  -H "Authorization: Bearer <SETUP_SECRET>"
```

Returns `{ "ok": true, "userId": "..." }` on success. The endpoint is idempotent — calling it again when the user already exists returns a better-auth error.

### Adding new better-auth plugins

If you add plugins to `src/lib/auth.ts` that require schema changes (e.g. `admin`, `twoFactor`):

1. The `pnpm generate:auth` script currently fails because the CLI can't resolve `cloudflare:workers` in Node.js. Until this is resolved, add the required columns manually to a new numbered migration file (e.g. `migrations/0002_<name>.sql`) based on the plugin's schema docs.
2. Apply the new migration: `pnpm migrate:local` (local) or `pnpm migrate:prod` (production).

## Database Migrations

Migrations are plain SQL files in `migrations/` and are tracked by Wrangler in a `d1_migrations` table in the database.

| Script          | Command                                          | Description                               |
| --------------- | ------------------------------------------------ | ----------------------------------------- |
| `migrate:local` | `wrangler d1 migrations apply gieter-db --local` | Apply pending migrations to local D1      |
| `migrate:prod`  | `wrangler d1 migrations apply gieter-db`         | Apply pending migrations to production D1 |

## Deployment

**1. Set production secrets**

```bash
wrangler secret put BETTER_AUTH_SECRET
wrangler secret put BETTER_AUTH_URL
wrangler secret put SETUP_SECRET
wrangler secret put SEED_EMAIL
wrangler secret put SEED_PASSWORD
wrangler secret put SEED_NAME
wrangler secret put TAVILY_API_KEY
wrangler secret put OPENAI_API_KEY
```

**2. Apply migrations to production**

```bash
pnpm migrate:prod
```

**3. Deploy**

```bash
pnpm deploy
```

**4. Seed production account**

```bash
curl -s -X POST https://<your-worker>.workers.dev/api/seed \
  -H "Authorization: Bearer <SETUP_SECRET>"
```

## Available Scripts

| Script               | Description                                       |
| -------------------- | ------------------------------------------------- |
| `pnpm dev`           | Start local dev server                            |
| `pnpm build`         | Build for production                              |
| `pnpm deploy`        | Build and deploy to Cloudflare Workers            |
| `pnpm migrate:local` | Apply migrations to local D1                      |
| `pnpm migrate:prod`  | Apply migrations to production D1                 |
| `pnpm cf-typegen`    | Regenerate TypeScript types from `wrangler.jsonc` |
| `pnpm typecheck`     | Run TypeScript type checking                      |
| `pnpm lint`          | Run ESLint                                        |
| `pnpm format`        | Format code with Prettier                         |
| `pnpm test`          | Run tests                                         |

## Adding shadcn/ui Components

```bash
npx shadcn@latest add button
```

Components are placed in `src/components/ui/` and imported as:

```tsx
import { Button } from "@/components/ui/button"
```
