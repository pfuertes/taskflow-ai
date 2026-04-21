# Contributing to TaskFlow AI

## Branching strategy

```
main          ← production (auto-deploys to Vercel on every push)
  └── feat/short-description     ← new features
  └── fix/short-description      ← bug fixes
  └── chore/short-description    ← deps, config, tooling
```

- Branch off `main`, open a PR back to `main`.
- Branch names are lowercase kebab-case: `feat/semantic-search`, `fix/kanban-drag`.
- One logical change per PR. Keep diffs small.

## Before opening a PR

```bash
npm run lint          # zero warnings
npx tsc --noEmit      # zero type errors
npm run test          # all unit tests pass
npm run build         # build succeeds
```

## PR checklist

- [ ] Branch is up to date with `main`
- [ ] Lint, type check, and unit tests pass locally
- [ ] New UI text is in Spanish (see CLAUDE.md → UI language)
- [ ] New tables/columns have RLS policies (`supabase/migrations/`)
- [ ] No `any` types introduced
- [ ] Server mutations go through Server Actions, not API routes

## Secrets required

CI needs these repository secrets (Settings → Secrets → Actions):

| Secret | Used for |
|--------|----------|
| `VERCEL_TOKEN` | Vercel deploy |
| `VERCEL_ORG_ID` | Vercel deploy |
| `VERCEL_PROJECT_ID` | Vercel deploy |
| `NEXT_PUBLIC_SUPABASE_URL` | Build + runtime |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Build + runtime |
| `ANTHROPIC_API_KEY` | Claude chat |
| `VOYAGE_API_KEY` | Embeddings |
| `GROQ_API_KEY` | Reserved |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin scripts |
| `TEST_USER_EMAIL` | E2E tests |
| `TEST_USER_PASSWORD` | E2E tests |

## Commit style

```
feat: add delete task action
fix: roll back optimistic update on network error
chore: bump @dnd-kit to 6.3.1
```

Prefix: `feat` / `fix` / `chore` / `refactor` / `test` / `docs`.
