# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev             # Start dev server with Turbopack at http://localhost:3000
npm run build           # Production build (Turbopack)
npm run start           # Start production server (after build)
npm run lint            # Run ESLint (plain eslint locally; CI uses stricter `npx next lint --max-warnings 0`)
npm run test            # Run unit tests (Vitest)
npm run test:watch      # Unit tests in watch mode
npm run test:coverage   # Unit tests + v8 coverage (20% threshold; scoped to src/actions/tasks.ts and src/hooks/use-tasks-by-status.ts)
npm run test:e2e        # Run Playwright E2E suite
npm run test:e2e:ui     # Playwright UI mode
npx vitest run src/actions/__tests__/tasks.test.ts   # Run a single test file
npx eslint . --fix      # Lint and auto-fix
npx tsc --noEmit        # Type check
```

E2E tests require these extra env vars in `.env.local`:
```
TEST_USER_EMAIL=      # email of a test Supabase user
TEST_USER_PASSWORD=   # password for that test user
```

Backfill embeddings for all existing tasks (requires `SUPABASE_SERVICE_ROLE_KEY`):
```bash
npx ts-node --esm scripts/embed-all-tasks.ts
```

## Architecture

TaskFlow AI is a Next.js 15 (App Router) kanban task manager backed by Supabase, with AI chat powered by Claude and semantic search via Voyage AI embeddings.

### Auth & routing flow

- `/login` — unauthenticated entry point; uses a Server Action inline in the page to call `supabase.auth.signInWithPassword` and redirect to `/dashboard`
- `/dashboard` — protected Server Component; fetches the session via `@/lib/supabase/server`, redirects to `/login` if unauthenticated, then fetches tasks server-side via `getTasks()` and renders `KanbanBoardClient` alongside `TaskChat`
- `/` (root) — prototype page using hardcoded mock tasks; not connected to Supabase

### Supabase client pattern

Two separate clients must be used depending on context:
- `@/lib/supabase/client.ts` — `createBrowserClient` for Client Components
- `@/lib/supabase/server.ts` — `createServerClient` (async, reads cookies) for Server Components and Server Actions

### Kanban board layering

The kanban board is split across three layers to work around SSR limitations of `@dnd-kit`:

1. **`KanbanBoardClient`** (`kanban-board-client.tsx`) — thin wrapper that dynamically imports `KanbanBoard` with `ssr: false`
2. **`KanbanBoard`** (`kanban-board.tsx`) — `'use client'`; owns all DnD state via three custom hooks and renders `KanbanColumn` instances inside a `DndContext`
3. **`KanbanColumn`** / **`SortableTaskCard`** / **`TaskCard`** — presentational components

**`NewTaskModal`** (`new-task-modal.tsx`) — `'use client'` modal rendered in the dashboard header; submits via `createTask()` and resets form state on success.

**`TaskChat`** (`components/chat/task-chat.tsx`) — `'use client'` chat panel that maintains local message history and calls the `chat()` Server Action per message. Rendered alongside the kanban board in the dashboard.

### Custom hooks (all `'use client'`)

- `useTasksByStatus` — memoizes tasks grouped by status
- `useMoveTask` — holds optimistic local task state; applies the status change immediately, rolls back on error, and syncs with server refreshes via `useEffect`
- `useKanbanDnd` — encapsulates `@dnd-kit` sensor setup, drag start/end handlers, and active task tracking

### Server Actions

- `src/actions/tasks.ts` — `getTasks()` fetches tasks ordered by `position`; `updateTaskStatus()` updates status and fires `embedTask()` in the background (non-blocking, embedding errors are swallowed and logged); `createTask()` inserts a new task with auto-positioned `position` and triggers embedding. **No delete or full-update actions exist yet** — add these when implementing those features.
- `src/actions/chat.ts` — `chat()` calls Claude (`claude-sonnet-4-6`) with a full task summary injected into the system prompt, plus semantic search results for context. The system prompt and all responses are in **Spanish**; do not change the language. The chat action fetches all tasks directly (not via `getTasks()`) to avoid session/cookie issues.
- `src/actions/search.ts` — `searchTasks()` embeds the query via Voyage AI then calls the `match_task_embeddings` Supabase RPC

### AI / semantic search pipeline

Embeddings are stored in the `task_embeddings` table (1024-dim `halfvec`, HNSW index for cosine similarity).

- `src/lib/embeddings.ts` — wraps Voyage AI REST API (`voyage-3.5` model); exports `embedDocuments` (batch, `document` input type) and `embedQuery` (single, `query` input type)
- `src/lib/embed-task.ts` — `taskToContent()` serializes a task to a plain-text string; `embedTask()` upserts into `task_embeddings`
- Embeddings are updated automatically after `updateTaskStatus` and `createTask`, and can be backfilled in bulk via `scripts/embed-all-tasks.ts` (uses service role key to bypass RLS)

### Data model (`src/types/tasks.ts`)

`Task` maps directly to the Supabase `tasks` table. Key fields: `status` (`todo | in_progress | done`), `priority` (`low | medium | high | critical`), `position` (integer for ordering within a column), `user_id`, `due_date` (nullable ISO string, not yet surfaced in the UI).

`KANBAN_COLUMNS` and `PRIORITY_CONFIG` are the single source of truth for column order and priority display — extend these when adding new statuses or priorities.

### Database migrations (`supabase/migrations/`)

| File | Purpose |
|------|---------|
| `001_profiles.sql` | User profiles |
| `002_tasks.sql` | Tasks table |
| `003_rls.sql` | Row-level security policies for tasks |
| `004_enable_vector.sql` | Enables `pgvector` extension |
| `005_task_embeddings.sql` | `task_embeddings` table + RLS + HNSW index |
| `006_match_embeddings.sql` | `match_task_embeddings` RPC for cosine similarity search |

### Voyage AI integration

Voyage AI is called directly via `fetch` to `https://api.voyageai.com/v1/embeddings` — there is no npm package dependency. The `next.config.ts` webpack alias for `voyageai` is a legacy artifact and does not affect the current implementation.

### UI language

The entire UI (column labels, chat interface, AI system prompt, error messages) is in **Spanish**. `KANBAN_COLUMNS` labels and `PRIORITY_CONFIG` labels in `src/types/tasks.ts` are the canonical Spanish strings used everywhere. When adding new UI text or extending the AI prompt, keep Spanish throughout.

### Environment variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ANTHROPIC_API_KEY=
VOYAGE_API_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # only needed for scripts/embed-all-tasks.ts
```

## Mandatory rules

- TypeScript strict — never use `any`
- Server Components by default; `'use client'` only when necessary
- Server Actions for all mutations
- RLS enabled on all tables
- `useMemo` for expensive computations
- Error handling in all try/catch blocks

## CI / CD

Pipeline: `.github/workflows/ci-cd.yml`

| Job | Trigger | Steps |
|-----|---------|-------|
| `ci` | every push / PR to `main` or `master` | lint → tsc → vitest --coverage → next build |
| `deploy-production` | push to `main` only (after `ci` passes) | vercel pull → vercel build --prod → vercel deploy --prebuilt --prod |

Required repository secrets (Settings → Secrets → Actions):
`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ANTHROPIC_API_KEY`, `VOYAGE_API_KEY`, `GROQ_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `TEST_USER_EMAIL`, `TEST_USER_PASSWORD`

To get Vercel IDs locally:
```bash
npm install --global vercel@latest
vercel login
vercel link        # creates .vercel/project.json with org + project IDs
```

When context is long: use `/compact` before continuing, `/cost` after each task.