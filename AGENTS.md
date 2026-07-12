# Development Rules: SvelteKit, Svelte 5, Drizzle ORM

## 1. Svelte 5 Runes (UI State)

- **Strictly use Runes** (`$state`, `$derived`, `$effect`, `$props`, `$bindable`) for all component state.
- **Do not use** Svelte 4 reactivity patterns (`export let`, `$:`, `onMount` unless strictly necessary for DOM binding).
- Deconstruct `$props()` immediately for clarity: `let { data, form } = $props();`
- Keep effects (`$effect`) minimal. Prefer derived state (`$derived`) for computed values to prevent infinite render loops.
- UI state that doesn't trigger reactivity should remain standard let/const variables.

## 2. Drizzle ORM (Database)

- **Query Structure:** Prefer Drizzle's relational query API (`db.query.tableName.findMany()`) for nested reads to
  reduce boilerplate. Use the query builder API (`db.select().from()`) for complex aggregations or specific filtering.
- **Mutations:** Always use explicit `returning()` calls if the UI requires immediate update after `insert`, `update`,
  or `delete`.
- **Schema Management:** Keep schema definitions in `src/lib/server/db/schema.ts`. Use strict TypeScript types provided
  by Drizzle (`InferSelectModel`, `InferInsertModel`).
- **Edge Deployment:** Ensure database connections utilize Supabase connection pooling (port 6543) to prevent connection
  exhaustion on Vercel Edge functions.
