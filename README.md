# DevOnboard

> AI-assisted developer onboarding copilot — turn weeks of manual repo setup into minutes of automated engineering flow.

Built for **IBM Bob 2.0 Agents**. DevOnboard is a MERN application: a React dashboard guides new engineers through environment setup, commit history, documentation Q&A, and environment validation, backed by an Express + MongoDB API with JWT auth and manager/engineer role separation.

---

## Screenshots

| Welcome | Setup Checklist | Commit History |
|---|---|---|
| ![Welcome](boilerplates/welcome_devonboard/screen.png) | ![Setup](boilerplates/setup_checklist_devonboard/screen.png) | ![Commits](boilerplates/commit_history_devonboard/screen.png) |

| Docs Q&A | Environment Validator | Manager Settings |
|---|---|---|
| ![Docs](boilerplates/documentation_q_a_devonboard/screen.png) | ![Validator](boilerplates/environment_validator_devonboard/screen.png) | ![Manager](boilerplates/manager_settings_devonboard/screen.png) |

---

## Features

- **JWT auth with role separation** — managers and engineers sign in; workflow editing is manager-only (enforced in both the UI routes and the API)
- **Welcome & Role Selection** — two sign-in paths: manager (workspace admin) and engineer (onboarding)
- **Setup Checklist** — task list served from the API with guided steps and progress tracking
- **Commit History** — filterable commit feed with diff inspector and plain-English setup-impact explanations
- **Documentation Q&A** — searchable knowledge base with verified answers, code snippets, and param tables
- **Environment Validator** — automated health checks with one-click auto-fix and JSON export
- **Manager Settings** — reorder, edit, and delete workflow tasks with changes persisted to MongoDB
- **Onboarding Completion** — readiness ring, verified badges, first-issue assignment, mentor contact

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v20+
- npm v9+ (comes with Node)

### Run locally

```bash
# 1. Clone
git clone https://github.com/your-org/devonboard.git
cd devonboard

# 2. Install dependencies (two apps)
cd server && npm install && cd ..
cd devonboard-app && npm install && cd ..

# 3. Start the API (terminal 1)
cd server && npm run dev          # http://localhost:4000

# 4. Start the web app (terminal 2)
cd devonboard-app && npm run dev  # http://localhost:5173 (proxies /api to :4000)
```

Open [http://localhost:5173](http://localhost:5173) and sign in:

| Account | Password (dev) | Lands on |
|---|---|---|
| `manager` | `password123` | `/manager` — full workflow editing |
| `engineer` | `password123` | `/setup` — read-only checklist |

Without `MONGODB_URI` set, the server runs against an in-memory MongoDB seeded with demo accounts and tasks (data resets on restart). Set `MONGODB_URI` for persistence.

### Build for production

```bash
cd devonboard-app
npm run build        # outputs to devonboard-app/dist/
npm run preview      # serve the production build locally
```

### Type check

```bash
cd server && npm run typecheck
cd ../devonboard-app && npm run typecheck
```

---

## Environment Variables

The API reads configuration from `server/.env` (see [`server/.env.example`](server/.env.example)):

| Variable | Purpose |
|---|---|
| `PORT` | API port (default `4000`) |
| `MONGODB_URI` | MongoDB connection string; omit to use the in-memory fallback |
| `JWT_SECRET` | Secret for signing auth tokens (set a strong value in production) |
| `CORS_ORIGIN` | Allowed web origin (default `http://localhost:5173`) |
| `DEMO_MANAGER_PASSWORD` / `DEMO_ENGINEER_PASSWORD` | Passwords for seeded demo accounts |

The root [`.env.example`](.env.example) documents optional future integrations (GitHub token, Slack webhook, Vault SSO) — none are wired up yet.

---

## Project Structure

```
devonboard/
├── server/                  # Express + Mongoose API
│   ├── src/
│   │   ├── index.ts         # App entry (CORS, JSON, routes)
│   │   ├── routes.ts        # /api/auth + /api/tasks endpoints
│   │   ├── auth.ts          # JWT signing, requireAuth / requireManager middleware
│   │   └── db.ts            # Connection, models, in-memory fallback + seed
│   └── .env.example
│
├── devonboard-app/          # React + TypeScript application (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/      # AppShell, RequireAuth / RequireManager guards
│   │   │   └── ui/          # Button, Badge, Card, Terminal, CopyButton, Toast, Input
│   │   ├── pages/           # One file per screen (7 screens)
│   │   ├── lib/
│   │   │   ├── api.ts       # Fetch wrapper with JWT header
│   │   │   ├── AuthContext.tsx  # Login/logout state (localStorage-backed)
│   │   │   └── utils.ts     # cn() helper
│   │   └── App.tsx          # Router + auth guards + layout
│   ├── tailwind.config.ts   # Design tokens (colors, type, spacing, radius)
│   └── package.json
│
├── boilerplates/            # Original static HTML reference screens (read-only)
│   ├── welcome_devonboard/
│   ├── setup_checklist_devonboard/
│   ├── commit_history_devonboard/
│   ├── documentation_q_a_devonboard/
│   ├── environment_validator_devonboard/
│   ├── manager_settings_devonboard/
│   ├── onboarding_completion_devonboard/
│   └── technical_precision_dark/DESIGN.md   # Canonical design system
│
├── .env.example             # Future integration variables (not yet wired)
├── AGENTS.md                # AI agent guidance (see also .bob/rules-*/)
└── LICENSE
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript (strict) |
| Build tool | Vite 8 |
| Styling | Tailwind CSS v3 |
| Routing | React Router v7 |
| Icons | Lucide React |
| Fonts | Geist + Geist Mono (Google Fonts CDN) |
| API | Express 5 (Node 20+, tsx) |
| Database | MongoDB via Mongoose (in-memory fallback for dev) |
| Auth | JWT bearer tokens, bcrypt password hashing |

---

## Design System

All colors, typography, spacing, and component specs originate from [`boilerplates/technical_precision_dark/DESIGN.md`](boilerplates/technical_precision_dark/DESIGN.md) and are codified in [`devonboard-app/tailwind.config.ts`](devonboard-app/tailwind.config.ts).

**Key palette:**
- Canvas: `#0a0e14` · Card: `#181c22` · Border: `#262c36`
- Primary / git-green: `#3fb950` · Blue: `#58a6ff` · Amber: `#d29922` · Red: `#f85149`
- Text: `#f0f6fc` · Muted: `#8b949e`

---

## Route Map

| Route | Screen | Access |
|---|---|---|
| `/` | Welcome (role-based sign-in) | public |
| `/setup` | Setup Checklist | signed-in |
| `/commits` | Commit History | signed-in |
| `/docs` | Documentation Q&A | signed-in |
| `/validator` | Environment Validator | signed-in |
| `/manager` | Manager Settings | manager only |
| `/complete` | Onboarding Completion | signed-in |

Route guards live in the client (`RequireAuth` / `RequireManager`); the API enforces the same rules server-side (`requireAuth` / `requireManager` middleware).

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/DOT-XXXX-short-description`
3. Read [`AGENTS.md`](AGENTS.md) for coding conventions before making changes
4. Run `npm run typecheck` before committing
5. Open a pull request — the PR template will auto-populate from commit messages

---

## License

[MIT](LICENSE) © 2025 DevOnboard Contributors
