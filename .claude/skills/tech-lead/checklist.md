# SOLID Checklist — TypeScript / Next.js App Router

Use this checklist when reviewing any file. Mark each item ✅ pass / ❌ fail / ➖ not applicable.

---

## S — Single Responsibility Principle

A module/component/hook should have one reason to change.

- [ ] The component renders UI only — no business logic embedded inline
- [ ] Each custom hook has one job (state management OR side effects, not both)
- [ ] Server Actions do one thing (fetch OR mutate, not both in the same export)
- [ ] Utility functions are pure and concern-free
- [ ] No component both fetches data AND transforms it for display in the same body
- [ ] Types/constants are co-located with their domain, not scattered

**Next.js specifics:**
- [ ] Server Components do not mix data-fetching logic with render logic in a way that makes them hard to change independently
- [ ] `page.tsx` files delegate to feature components — they are not large monoliths

---

## O — Open/Closed Principle

Open for extension, closed for modification.

- [ ] Adding a new status/priority does NOT require editing multiple files (use `KANBAN_COLUMNS`, `PRIORITY_CONFIG` as the single source of truth)
- [ ] Hardcoded arrays of enum values (`['todo', 'in_progress', 'done']`) do not duplicate type definitions
- [ ] Component variants use config objects or maps, not `if/switch` chains
- [ ] New column types can be added by extending config, not modifying consumers

**Next.js specifics:**
- [ ] Route handlers use strategy pattern or middleware for cross-cutting concerns
- [ ] Layout slots are used for extension points rather than prop drilling

---

## L — Liskov Substitution Principle

Subtypes must be substitutable for their base types.

- [ ] Function overloads honor the original contract (no narrowed throws, no unexpected returns)
- [ ] Props interfaces do not contradict parent component contracts
- [ ] Generic constraints are tight enough to enforce substitutability
- [ ] `Promise<T>` return types are consistent — no mixing of `T | undefined` and `T`

---

## I — Interface Segregation Principle

Clients should not depend on interfaces they don't use.

- [ ] Props interfaces are minimal — no optional props that are only used in one variant
- [ ] Hook return objects expose only what callers need
- [ ] No "god hook" that returns 10+ values when callers use 2
- [ ] Types are split by use case — read model vs write model where appropriate
- [ ] `Task` type is not imported just to access one field when a narrower type would suffice

---

## D — Dependency Inversion Principle

High-level modules should not depend on low-level modules. Both should depend on abstractions.

- [ ] Hooks accept their async dependencies as parameters (e.g., `onMove` callback) rather than importing server actions directly
- [ ] Components receive data and callbacks via props — they don't import actions themselves
- [ ] Server Actions are injected or accessed via a service interface, not hard-imported inside hooks
- [ ] `createClient()` calls are isolated to a single layer (actions/server components), not scattered
- [ ] Tests can substitute dependencies without module mocking

**Next.js specifics:**
- [ ] Client Components receive data as props from Server Components — they don't fetch independently when avoidable
- [ ] Hook parameters type the callback at the abstraction level (`(id: string, status: TaskStatus) => Promise<void>`), not at the concrete action level

---

## TypeScript-specific checks

- [ ] No `any` — use `unknown` + type guards or proper generics
- [ ] Discriminated unions used instead of optional fields where semantics differ
- [ ] `as` casts are justified by a preceding type guard, not used to silence errors
- [ ] Return types are explicit on all exported functions
- [ ] `Record<K, V>` used for maps instead of `{ [key: string]: V }`
- [ ] Exhaustive checks on union types (`satisfies` or `never` switch default)

---

## Quick severity guide

| Finding | Severity |
|---------|----------|
| Hard-imported server action inside a hook | 🔴 Critical (DIP) |
| Hardcoded status array duplicating KANBAN_COLUMNS | 🔴 Critical (OCP) |
| Hook doing state + network + error recovery | 🟡 Medium (SRP) |
| Hardcoded magic value in JSX | 🟡 Medium (SRP) |
| Overly wide props interface | 🟢 Minor (ISP) |
| Missing explicit return type on exported fn | 🟢 Minor (TS) |
