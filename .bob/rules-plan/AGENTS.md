# Plan Mode — Architecture Constraints (Non-Obvious Only)

## Core Architectural Constraints

- **No global state management.** All state is local to each page component via `useState`. Do not plan for Redux, Zustand, or Context — pages are independent enough not to need it.
- **No shared data layer.** Mock data lives as typed `const` arrays inside each page file. Plans that involve a `data/` directory or API layer require a backend that doesn't exist yet.
- **Welcome page is not in AppShell.** Route `/` renders `Welcome.tsx` standalone. All other routes are children of the `<AppShell>` layout route in `App.tsx`. Any new full-viewport page must be added outside the layout route.
- **Tailwind config is the token authority.** [`devonboard-app/tailwind.config.ts`](../../devonboard-app/tailwind.config.ts) contains all canonical design values. Any visual change must update the config first if new tokens are needed.

## Adding Features — What to Reuse

- Always use `src/components/ui/` primitives — never re-implement toast, copy-button, terminal block, or badge logic in a page.
- `cn()` from `src/lib/utils.ts` is required for all conditional class logic — plan accordingly.

## Dependency Constraints

- **React Router v7** is installed — use `useNavigate` for programmatic navigation, `NavLink` for active-state links.
- **Lucide React** is the only icon library. Do not plan to add Font Awesome or Material Symbols.
- No test framework is installed yet — plan for Vitest if tests are needed (it's the natural fit for Vite).

## Performance Notes

- The build is ~370 KB gzipped JS — no code splitting has been configured. If pages grow significantly, plan for `React.lazy` + route-based splitting.
- All fonts are Google Fonts CDN in `index.html` — no font optimization (subsetting) has been applied.
