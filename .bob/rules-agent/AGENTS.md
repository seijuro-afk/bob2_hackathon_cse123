# Agent Mode — Coding Rules (Non-Obvious Only)

## React / TypeScript Conventions

- **No `import React`** — new JSX transform is active. Adding it causes TS error.
- **Always use `cn()` from `src/lib/utils.ts`** for conditional classes (clsx + tailwind-merge). Never string-concatenate Tailwind classes.
- Component files: PascalCase filename = default export, e.g. `MyComponent.tsx` → `export default function MyComponent`.
- All mock/static data goes **inside the page file** as a typed `const` array — not in a separate `data/` folder.

## Adding a New Screen

1. Create `src/pages/MyScreen.tsx` with a named default export.
2. Add a `<Route path="/my-route" element={<MyScreen />} />` inside the `<Route element={<AppShell />}>` block in `App.tsx`.
3. Add a nav item to the `NAV_ITEMS` array in `src/components/layout/AppShell.tsx`.
4. Use shared primitives from `src/components/ui/` — never re-implement Button, Badge, Toast, Terminal, CopyButton.

## Design Token Usage

- Tailwind token names come from [`devonboard-app/tailwind.config.ts`](../../devonboard-app/tailwind.config.ts).
- Use token class names (`bg-card-surface`, `text-accent-green`) — only fall back to arbitrary values (`bg-[#hex]`) for one-off shades not in the config.
- Never hardcode a color that exists as a token.

## Lucide Icons

- Icon names are PascalCase in Lucide but differ from Material Symbols. Always verify a name exports from `lucide-react` before using it (`npm run typecheck` will catch misses).
- Check equivalents: `AdminPanelSettings` → `UserCog`, `PlayArrow` → `Play`, `Verified` → `BadgeCheck`, `Login` → `LogIn`.

## Toast Usage

```tsx
const [toastVisible, setToastVisible] = useState(false)
<Toast message="Done!" visible={toastVisible} onDismiss={() => setToastVisible(false)} />
// trigger: setToastVisible(true)
```

## Keyboard Shortcuts

Use `useEffect` with `window.addEventListener('keydown', handler)` and clean up on unmount. Example pattern from `EnvironmentValidator.tsx`.
