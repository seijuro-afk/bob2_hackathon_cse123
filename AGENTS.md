# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## New Contributor Setup

```bash
git clone https://github.com/your-org/devonboard.git
cd devonboard

# API — terminal 1
cd server && npm install
npm run dev          # http://localhost:4000

# Web app — terminal 2
cd ../devonboard-app && npm install
npm run dev          # http://localhost:5173 (proxies /api to :4000)
```

Both apps have their own `package.json` and must be installed separately. Without `MONGODB_URI` the server uses an in-memory MongoDB seeded with demo accounts (`manager` / `engineer`, password `password123`) and 6 demo tasks — data resets on restart.

## Project Overview

**DevOnboard Onboarding Copilot** — a MERN app that guides new engineers through repository onboarding. Two packages:

- `server/` — Express 5 + Mongoose API: JWT auth with `manager`/`engineer` roles, task CRUD. `db.ts` holds models and the in-memory fallback + seed; `auth.ts` holds token signing and middleware.
- `devonboard-app/` — React 19 + TypeScript SPA that consumes the API through the Vite proxy.

The original static HTML boilerplates in `boilerplates/` remain as visual reference — do not modify them.

## Server Structure (`server/`)

```
server/src/
├── index.ts    ← app entry: CORS, JSON body parsing, mounts /api routes
├── routes.ts   ← /api/auth/login, /api/tasks CRUD + reorder
├── auth.ts     ← signToken, requireAuth, requireManager middleware
└── db.ts       ← connectDb, Task/User models, seedIfEmpty
```

### Server rules

- **Every protected route needs `requireAuth`** — including the write routes that also check `requireManager`. `requireManager` only reads `req.user`, which only `requireAuth` populates; a route with `requireManager` alone 403s everyone.
- **Write handlers validate types defensively** — `req.body` is treated as `unknown`; coerce with the `str()` / `strArray()` helpers in `routes.ts`.
- **Keep the API shape in one place** — `toClient()` maps Mongo docs to client JSON (`_id` → `id`). If you add a task field, update the schema in `db.ts`, `toClient()`, and the client's `ApiTask` in `devonboard-app/src/lib/api.ts`.
- **Imports use `.ts` extensions** (`./db.ts`) — `allowImportingTsExtensions` is on and `tsx` requires them at runtime.

## Client App Structure (`devonboard-app/`)

```
devonboard-app/
├── src/
│   ├── components/
│   │   ├── layout/AppShell.tsx     ← sidebar nav wrapping all /dashboard routes
│   │   ├── layout/RequireAuth.tsx  ← route guards (RequireAuth, RequireManager)
│   │   └── ui/                     ← Button, Badge, Card, Input, Terminal, CopyButton, Toast
│   ├── pages/                      ← one file per screen
│   ├── lib/api.ts                  ← api() fetch wrapper + ApiTask/AuthUser types
│   ├── lib/AuthContext.tsx         ← login/logout, JWT in localStorage
│   ├── lib/utils.ts                ← cn() helper (clsx + tailwind-merge)
│   └── App.tsx                     ← AuthProvider + BrowserRouter + route guards
├── tailwind.config.ts              ← ALL design tokens (colors, type, spacing, radius)
└── index.html                      ← Geist font CDN link lives here
```

### Client rules

- **Role separation is two layers** — `RequireManager` guards the `/manager` route in `App.tsx` and `AppShell` hides the nav link, but the API is the real enforcement point; never rely on the UI guards alone.
- **All data comes from `lib/api.ts`** — call `api<T>(path, { method, body })`; it attaches the JWT from localStorage and throws with the server's error message. Pages fetch in `useEffect` and render loading/error states.

## Commands (run from the app's own directory)

| Directory | Command | Purpose |
|---|---|---|
| `server/` | `npm run dev` | API dev server (tsx watch) on :4000 |
| `server/` | `npm run typecheck` | TypeScript check without emitting |
| `devonboard-app/` | `npm run dev` | Web app dev server (Vite HMR) on :5173 |
| `devonboard-app/` | `npm run build` | Production build |
| `devonboard-app/` | `npm run typecheck` | TypeScript check without emitting |

## Design Tokens

**Source of truth:** [`devonboard-app/tailwind.config.ts`](devonboard-app/tailwind.config.ts) — generated from [`boilerplates/technical_precision_dark/DESIGN.md`](boilerplates/technical_precision_dark/DESIGN.md).

Key token names as Tailwind classes:
- `bg-canvas-dark` (`#0a0e14`), `bg-canvas-subtle` (`#10141a`)
- `bg-card-surface` (`#181c22`), `border-card-border` (`#262c36`)
- `text-text-primary` (`#f0f6fc`), `text-text-muted` (`#8b949e`)
- `text-accent-green` (`#3fb950`), `text-accent-blue` (`#58a6ff`)
- `text-accent-amber` (`#d29922`), `text-accent-red` (`#f85149`)

## Non-Obvious Patterns

- **No `import React`** — the project uses the new JSX transform (`"jsx": "react-jsx"`). Adding it will cause a TS6133 unused-import error.
- **`cn()` is mandatory** for conditional Tailwind classes — never concatenate class strings directly.
- **Welcome page (`/`) bypasses AppShell** — it renders full-viewport. All other routes are wrapped inside `<AppShell>` via a layout route in `App.tsx`.
- **Lucide icon names differ from Material Symbols** — always check `lucide-react` exports. Material Symbols names like `AdminPanelSettings` don't exist; use the Lucide equivalent (e.g. `UserCog`).
- **SetupChecklist / ManagerSettings fetch tasks from the API** — manager edits persist to MongoDB; the checklist reflects them on next load.
- **AppShell sidebar** uses `NavLink` from react-router-dom with `isActive` for the active green left-rail highlight, and filters nav items by role (`managerOnly` flag).
- **Toast component** manages its own show/hide state via `useEffect`; just pass `visible: boolean` and `onDismiss` callback.
