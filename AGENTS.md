# Development Rules: SvelteKit, Svelte 5, Drizzle ORM

## Stack

- Svelte 5 (with runes) + SvelteKit + TypeScript
- Drizzle ORM + Supabase
- TailwindCSS v4 + bits-ui
- Bun runtime
- Valibot validation

## Commands

```bash
bun dev
bun build

bun run check

bun run format
bun run lint
```

## 1. Svelte 5 Runes (UI State)

- **Strictly use Runes** (`$state`, `$derived`, `$effect`, `$props`, `$bindable`) for all component state.
- **Do not use** Svelte 4 reactivity patterns (`export let`, `$:`, `onMount` unless strictly necessary for DOM binding).
- Deconstruct `$props()` immediately for clarity: `let { data, form } = $props();`
- Keep effects (`$effect`) minimal. Prefer derived state (`$derived`) for computed values to prevent infinite render loops.
- UI state that doesn't trigger reactivity should remain standard let/const variables.
- Make use of remote functions

### Database / Drizzle

- Schema in `$lib/db/schema.ts`
- DB queries in `$lib/server/db/*.ts`
- Use `requireAuthMaybeAdmin()` for auth checks
- Use `handleDbError()` for consistent error handling
- Return pattern: `{ data: T, error: null } | { data: null, error: string }`

### Form Validation

Use **Valibot** (not Zod) for form schemas in `$lib/formSchemas.ts`.

### Error Handling

- Use SvelteKit's `error()` function for HTTP errors
- Log errors with console.error or structured logging with TAG
- Wrap DB operations in try/catch with proper error returns

## Data Fetching Conventions

This project follows a three-layer data fetching architecture: **Remote Functions** (client-safe server logic), **Drizzle DB Queries** (server-only database access), and **Frontend Data Fetching** (component-level async rendering).

### Remote Functions

Remote functions are SvelteKit server functions exposed to the client via `$app/server` utilities. They provide a type-safe bridge between client and server.

### Drizzle DB Queries

Database queries are server-only functions that interact directly with the database. They always return a consistent result object.

### Frontend Data Fetching

Frontend components fetch data using remote functions within `svelte:boundary` blocks. This enables streaming and progressive enhancement.

### Data Flow Summary

```
Component (Browser)
    ↓ calls
Remote Function ($lib/api/*.remote.ts)
    ↓ calls
Drizzle DB Query ($lib/server/db/*.ts)
    ↓ accesses
Database (Supabase PostgreSQL)
```

- **Remote functions**: Validation → Auth → DB Call → Error Handling → Return Data
- **DB functions**: Auth → Query Building → Error Handling → Structured Return
- **Components**: Await Remote → Handle States (pending/failed/success) → Render

## 3. UI

- Use shadcn-svelte UI components in `src/lib/components/ui`

## 4. Package Manager

- Always use `bun`
