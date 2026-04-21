# TaskFlow AI

![CI](https://github.com/pablof/taskflow-ai/actions/workflows/ci-cd.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Supabase](https://img.shields.io/badge/Supabase-postgres-green)

Kanban task manager with AI chat and semantic search. Built with Next.js 15 App Router, Supabase, Claude (Anthropic), and Voyage AI embeddings. UI is in Spanish.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, Turbopack) |
| Database | Supabase (Postgres + pgvector) |
| Auth | Supabase Auth |
| AI Chat | Claude `claude-sonnet-4-6` via Anthropic SDK |
| Semantic search | Voyage AI `voyage-3.5` (1024-dim halfvec) |
| Drag & drop | `@dnd-kit` |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Tests | Vitest (unit) + Playwright (E2E) |
| Deploy | Vercel |

## Local setup

**Prerequisites:** Node 20+, a Supabase project with `pgvector` enabled.

```bash
git clone https://github.com/pablof/taskflow-ai.git
cd taskflow-ai
npm install
```

Copy the env template and fill in your values:

```bash
cp .env.example .env.local   # or create .env.local manually
```

Required variables:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ANTHROPIC_API_KEY=
VOYAGE_API_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # only needed for scripts/embed-all-tasks.ts
```

Run migrations against your Supabase project (via the Supabase CLI or dashboard), then:

```bash
npm run dev        # http://localhost:3000
```

## Commands

```bash
npm run dev             # Dev server (Turbopack)
npm run build           # Production build
npm run lint            # ESLint
npx tsc --noEmit        # Type check
npm run test            # Vitest unit tests
npm run test:coverage   # Unit tests + coverage report
npm run test:e2e        # Playwright E2E (requires TEST_USER_* env vars)
```

## CI / CD

Every push and pull request runs:

1. ESLint (`--max-warnings 0`)
2. TypeScript (`tsc --noEmit`)
3. Vitest unit tests + coverage
4. `next build`

Merges to `main` additionally trigger an automatic deploy to Vercel production.

Required repository secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, plus all app env vars. See [CONTRIBUTING.md](CONTRIBUTING.md) for the full list.

## Architecture overview

```
/login          unauthenticated entry point
/dashboard      protected; renders KanbanBoardClient + TaskChat
/               prototype with mock data (not connected to Supabase)
```

- **Server Actions** (`src/actions/`) handle all mutations and Claude/Voyage AI calls.
- **KanbanBoard** is dynamically imported with `ssr: false` to avoid `@dnd-kit` hydration issues.
- **Embeddings** are upserted into `task_embeddings` (Supabase) after every create/update; semantic search uses cosine similarity via the `match_task_embeddings` RPC.

See [CLAUDE.md](CLAUDE.md) for the full architecture reference.
