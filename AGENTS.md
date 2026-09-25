# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## New Contributor Setup

```bash
git clone https://github.com/your-org/devonboard.git
cd devonboard/devonboard-app
npm install
npm run dev          # http://localhost:5173
```

All commands must be run from **`devonboard-app/`**, not the repo root.
Copy `.env.example` → `.env` only if wiring up GitHub/Slack/Vault integrations.

## Project Overview

**DevOnboard Onboarding Copilot** — a React + TypeScript SPA that guides new engineers through repository onboarding. The app lives in `devonboard-app/`. The original static HTML boilerplates in `boilerplates/` remain as visual reference — do not modify them.

## React App Structure (`devonboard-app/`)

```
devonboard-app/
├── src/
│   ├── components/
│   │   ├── layout/AppShell.tsx   ← sidebar nav wrapping all /dashboard routes
│   │   └── ui/                  ← Button, Badge, Card, Input, Terminal, CopyButton, Toast
│   ├── pages/                   ← one file per screen
│   ├── lib/utils.ts             ← cn() helper (clsx + tailwind-merge)
│   └── App.tsx                  ← BrowserRouter + Routes
├── tailwind.config.ts           ← ALL design tokens (colors, type, spacing, radius)
└── index.html                   ← Geist font CDN link lives here
```

## Commands (run from `devonboard-app/`)

| Command | Purpose |
|---|---|
| `npm run dev` | Start dev server (Vite HMR) |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript check without emitting |

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
- **Mock data lives in the page file** as `const` arrays — not in a separate `data/` directory.
- **AppShell sidebar** uses `NavLink` from react-router-dom with `isActive` for the active green left-rail highlight.
- **Toast component** manages its own show/hide state via `useEffect`; just pass `visible: boolean` and `onDismiss` callback.
