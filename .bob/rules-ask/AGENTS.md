# Ask Mode — Documentation Context (Non-Obvious Only)

## Where Things Live

- **React app:** `devonboard-app/` — this is the primary codebase for agents to work in.
- **Design system tokens:** [`devonboard-app/tailwind.config.ts`](../../devonboard-app/tailwind.config.ts) — generated from [`boilerplates/technical_precision_dark/DESIGN.md`](../../boilerplates/technical_precision_dark/DESIGN.md).
- **Static HTML references:** `boilerplates/` — read-only visual reference, not the active codebase.
- **UI primitives:** `devonboard-app/src/components/ui/` — Button, Badge, Card, Input, Terminal, CopyButton, Toast.
- **Routing:** defined in `devonboard-app/src/App.tsx`.

## Screen → Route Mapping

| Screen | File | Route |
|---|---|---|
| Welcome (role selection) | `src/pages/Welcome.tsx` | `/` |
| Setup Checklist | `src/pages/SetupChecklist.tsx` | `/setup` |
| Commit History | `src/pages/CommitHistory.tsx` | `/commits` |
| Documentation Q&A | `src/pages/DocumentationQA.tsx` | `/docs` |
| Environment Validator | `src/pages/EnvironmentValidator.tsx` | `/validator` |
| Manager Settings | `src/pages/ManagerSettings.tsx` | `/manager` |
| Onboarding Completion | `src/pages/OnboardingCompletion.tsx` | `/complete` |

## Counterintuitive Structure

- `Welcome.tsx` does NOT use AppShell — it has its own full-viewport layout. Only `/setup`, `/commits`, `/docs`, `/validator`, `/manager`, `/complete` use the sidebar shell.
- There is no backend, no API, and no database — all data is hardcoded `const` arrays in page files.
- `boilerplates/technical_precision_dark/DESIGN.md` is still the canonical color/spacing reference even though the React app has `tailwind.config.ts` — DESIGN.md is the source, the config is derived from it.
