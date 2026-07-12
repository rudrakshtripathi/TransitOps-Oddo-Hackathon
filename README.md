<div align="center">

# 🚌 TransitOps

**A fleet management console for vehicles, drivers, trips, maintenance, and fuel — built with SvelteKit 2 and Svelte 5.**

[Getting Started](#getting-started) · [Project Structure](#project-structure) · [Architecture](#architecture) · [Roadmap](#roadmap)

</div>

---

## Overview

TransitOps is a single-page fleet operations console. It gives dispatchers, fleet managers, and drivers one place to track vehicles, assign drivers, schedule trips, log maintenance, monitor fuel spend, and review fleet-wide analytics.

This repository is a from-scratch **Svelte 5 / SvelteKit** port of an original React + Recharts prototype. It is not a transpile — state management, charting, and animation were each re-architected around Svelte's primitives rather than emulated on top of them.

> **Status:** functional prototype with an in-memory mock data layer. See [Roadmap](#roadmap) for what's needed to make this production-ready.

## Features

| Area | Capabilities |
|---|---|
| **Auth** | Role-based sign-in (`admin` / `manager` / `driver`) with role-gated write access across the app |
| **Dashboard** | KPI cards, revenue vs. fuel trend, fleet status breakdown, weekly distance, recent trips, maintenance alerts |
| **Vehicles** | Full CRUD, search, and filter by type/status |
| **Drivers** | Full CRUD, license tracking, performance rating, search and filter |
| **Trips** | Scheduling, cancellation, status lifecycle (`scheduled → in_progress → completed / cancelled`) |
| **Maintenance** | Service scheduling, priority levels, overdue detection, completion workflow |
| **Fuel & Expenses** | Refuel logging, per-liter cost tracking, aggregate spend and volume stats |
| **Analytics** | Six-month trip volume, revenue vs. fuel cost, driver on-time performance |
| **Settings** | Profile, dark mode, notification preferences |
| **Theming** | Full light/dark mode via CSS custom properties — no flash, no layout shift |

## Tech Stack

- **Framework:** [SvelteKit 2](https://kit.svelte.dev) on [Svelte 5](https://svelte.dev) (runes-based reactivity — no stores boilerplate)
- **Language:** TypeScript, strict mode
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com) (CSS-first config via `@theme`, zero `tailwind.config.js`)
- **Charts:** [LayerChart](https://layerchart.com) (D3-backed, Svelte-native — no React chart libraries)
- **Icons:** [lucide-svelte](https://lucide.dev)
- **Build:** Vite 8, static-site output via `@sveltejs/adapter-static`

No server, no database, no API layer — deliberately. See [Architecture](#architecture).

## Getting Started

### Prerequisites

- Node.js ≥ 20
- npm (or pnpm/yarn/bun — no lockfile-specific tooling is assumed)

### Installation

```bash
git clone <this-repo>
cd transitops-svelte
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Sign in with any email/password combination — the auth screen is a mocked front door, not a real auth flow. Pick a role from the toggle to see role-gated UI differences.

### Production build

```bash
npm run build   # outputs a static site to /build
npm run preview # serve the production build locally
```

### Type checking

```bash
npm run check
```

## Project Structure

```
src/
├── lib/
│   ├── data.ts                  # Mock domain data + design-system constants (badge colors, nav config)
│   ├── utils.ts                 # cn() class-merge helper
│   ├── state/
│   │   └── app-state.svelte.ts  # Global app state (auth, theme, sidebar) via Svelte 5 runes
│   └── components/
│       ├── AuthScreen.svelte
│       ├── Sidebar.svelte
│       ├── TopBar.svelte
│       ├── Badge.svelte / Btn.svelte / Modal.svelte
│       ├── FormField.svelte / Input.svelte / Select.svelte
│       ├── StatCard.svelte / EmptyState.svelte / SectionHeader.svelte
│       └── charts/               # LayerChart wrapper components, one per chart instance
├── routes/
│   ├── +layout.svelte            # Auth gate + app shell (sidebar/topbar/routing)
│   ├── +page.svelte              # Dashboard
│   ├── vehicles/+page.svelte
│   ├── drivers/+page.svelte
│   ├── trips/+page.svelte
│   ├── maintenance/+page.svelte
│   ├── fuel/+page.svelte
│   ├── analytics/+page.svelte
│   └── settings/+page.svelte
├── app.css                       # Design tokens (light/dark) + Tailwind entrypoint
└── app.html
```

Route filenames are load-bearing in SvelteKit: `+page.svelte` inside `routes/vehicles/` is what makes `/vehicles` resolve. Renaming these files breaks routing silently at the file level (you'll get a 404, not a build error), so leave the convention alone.

## Architecture

A few decisions worth knowing about before you extend this:

- **State is runes-based, not store-based.** `src/lib/state/app-state.svelte.ts` exposes a singleton object with `$state` fields behind getters. This was chosen over Svelte's older writable-store pattern because runes compose more predictably with derived state inside components. If you're used to Svelte 4, expect this to feel different.
- **No backend.** All data lives in `src/lib/data.ts` and is mutated in-memory via `$state` inside each route. Refreshing the page resets everything. This is intentional for a prototype — see [Roadmap](#roadmap) for what persistence would require.
- **No global chart abstraction.** Each chart is its own thin wrapper component around a LayerChart primitive (`AreaChart`, `BarChart`, `LineChart`, `PieChart`) bound to one specific dataset. This trades reusability for clarity — there are only 5 charts total, so a generic `<Chart config={...}>` abstraction would add indirection without paying for itself yet.
- **Static adapter, not Node/Vercel/Cloudflare.** The app is deployed as static HTML/JS with no server-side rendering of dynamic data, because there's no dynamic data to render server-side. Swap `@sveltejs/adapter-static` for a different adapter the moment you add a real backend.

## Roadmap

Ordered by what actually blocks production use, not by what's interesting to build:

- [ ] **Persistence layer** — replace `src/lib/data.ts` mutations with real API calls (REST or SvelteKit form actions + a database)
- [ ] **Real authentication** — the current login accepts any credentials; needs session handling and route protection in `hooks.server.ts`
- [ ] **Server-side authorization** — role checks currently live in the UI only (`appState.role`); a `manager`-gated delete button is not a security boundary, it's a convenience. Enforce this server-side before it matters.
- [ ] **Form validation** — client-side checks are minimal (empty-string guards); no schema validation (e.g. Zod) yet
- [ ] **Pagination** — tables render full datasets; fine at 8 rows, not fine at 8,000
- [ ] **Tests** — currently none. Component tests (Vitest + Testing Library) and route-level e2e (Playwright) are both absent

## License

MIT — see [`LICENSE`](./LICENSE).

---

<div align="center">
<sub>Built as a Svelte 5 / SvelteKit port of an original React prototype.</sub>
</div>