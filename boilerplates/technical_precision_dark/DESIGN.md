---
name: Technical Precision Dark
colors:
  surface: '#10141a'
  surface-dim: '#10141a'
  surface-bright: '#353940'
  surface-container-lowest: '#0a0e14'
  surface-container-low: '#181c22'
  surface-container: '#1c2026'
  surface-container-high: '#262a31'
  surface-container-highest: '#31353c'
  on-surface: '#dfe2eb'
  on-surface-variant: '#bdcab8'
  inverse-surface: '#dfe2eb'
  inverse-on-surface: '#2d3137'
  outline: '#879484'
  outline-variant: '#3e4a3c'
  surface-tint: '#67df70'
  primary: '#67df70'
  on-primary: '#00390d'
  primary-container: '#3fb950'
  on-primary-container: '#004311'
  inverse-primary: '#006e21'
  secondary: '#a2c9ff'
  on-secondary: '#00315c'
  secondary-container: '#0071c7'
  on-secondary-container: '#f0f4ff'
  tertiary: '#d8baff'
  on-tertiary: '#430882'
  tertiary-container: '#bb8bfe'
  on-tertiary-container: '#4c188b'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#83fc89'
  primary-fixed-dim: '#67df70'
  on-primary-fixed: '#002105'
  on-primary-fixed-variant: '#005317'
  secondary-fixed: '#d3e4ff'
  secondary-fixed-dim: '#a2c9ff'
  on-secondary-fixed: '#001c38'
  on-secondary-fixed-variant: '#004882'
  tertiary-fixed: '#eddcff'
  tertiary-fixed-dim: '#d8baff'
  on-tertiary-fixed: '#290055'
  on-tertiary-fixed-variant: '#5b2b9a'
  background: '#10141a'
  on-background: '#dfe2eb'
  surface-variant: '#31353c'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.03em
  headline-xl-mobile:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 26px
    letterSpacing: -0.015em
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: -0.005em
  body-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0em
  label-md:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
  code-inline:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-sm: 0.5rem
  margin: 1.5rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system delivers a focused, high-density development environment engineered for flow state and technical clarity. Drawing direct aesthetic cues from modern code workbenches, the visual language prioritizes code legibility, low cognitive fatigue, and pixel-exact spatial feedback.

The identity is characterized by:
- **Atmospheric Charcoal Depth:** Layered dark surfaces that eliminate backlight glare while maintaining crisp contrast for continuous, long-session interaction.
- **Git-Status Semantics:** Functional, purposeful color calibration where mint green serves as the foundational primary indicator—representing positive verification, unstaged/staged additions, and computational readiness.
- **Precision Engineering:** Monoline structural dividers, compact spatial scales, and typography calibrated for mathematical baseline alignment.

## Colors

The palette balances utility-driven dark values with syntax-derived accents. Rather than using pure chromatic intensity for brand promotion, colors act as communicative telemetry across the interface.

### Palette Architecture
- **Primary (`#3FB950`):** Git addition mint green. Used for active commits, execution states, system health, and primary actions.
- **Secondary (`#58A6FF`):** Electric blue. Reserved for selection boundaries, interactive links, focused states, and structural reference tokens.
- **Tertiary (`#BC8CFF`):** Keyword lavender. Applied to metadata tags, language abstractions, and secondary syntactic hooks.
- **Neutral Canvas (`#0D1117`):** Deep charcoal substrate. Layered upward through `#161B22` (panel backgrounds) and `#21262D` (structural component frames and dividers).

### Supporting Semantic Accents
- **Destructive/Removal (`#F85149`):** Coral red for syntax removals, failed unit tests, and terminal execution breaks.
- **Warning/Pending (`#D29922`):** Amber gold for branch conflicts, dirty worktrees, and lint warnings.

## Typography

The typographic hierarchy centers on Geist, utilizing its high tabular clarity, tight metrics, and technical legibility across UI panels, diagnostic logs, and interactive controls.

- **Headlines:** Set with negative letter-spacing for structural authority within sparse panel headers, status banners, and modal dialogs.
- **Body:** Standardized on `body-md` (14px) for optimal high-density scanning across inspector lists, configuration trees, and interactive tables.
- **Labels:** Crisp, compact scales (`label-md` and `label-sm`) with slight tracking expansion to ensure instant readability in file trees, status pills, and keybinding badges.

## Layout & Spacing

The layout is built upon an ultra-dense, pane-oriented grid architecture designed to mimic professional IDE multi-view splits.

### Structural Framework
- **Panels & Splits:** Workspaces organize into vertical and horizontal panes bounded by explicit 1px rails.
- **Grid Strategy:** A fluid 12-column sub-grid governs internal forms, metric cards, and dashboard overviews, maintaining a compact `gutter` of 1rem (`16px`) that compresses to `gutter-sm` (`8px`) in nested activity sidebars.
- **Canvas Margins:** Fixed edge padding of `1.5rem` on wide displays, compressing to `1rem` on mobile viewports.

### Responsive Adapters
- **Desktop (1024px+):** Multi-pane split architecture with resizable sidebars, collapsible activity panels, and concurrent terminal drawers.
- **Tablet (768px – 1023px):** Sidebars collapse into icon-only rails or transient overlay drawers. Grids collapse to single- or dual-column configurations.
- **Mobile (< 768px):** Strict single-column stack. Toolbars shift to sticky bottom control rows with swipeable tab bars for active file context.

## Elevation & Depth

Depth is established through calibrated tonal layering and hairline wireframe borders rather than heavy ambient drop shadows. This preserves the sharp, tactile aesthetic of a code editor.

### Surface Tiers
- **Tier 0 (Root Base - `#0D1117`):** The primary canvas viewport, gutter margins, and editor backdrops.
- **Tier 1 (Panels & Trays - `#161B22`):** Primary sidebars, bottom consoles, tab headers, and file lists.
- **Tier 2 (Interactive Floating Layers - `#21262D`):** Command palettes, dropdown menus, context popovers, and hovered table records.

### Outlines & Borders
- All containers use a consistent `1px solid` border using `#30363D` for structural separation.
- Active or focused windows elevate border luminance to `#58A6FF` or `#3FB950` depending on context.

### Drop Shadows
- **Standard UI Elements:** Zero box-shadow; completely flat, bordered appearance.
- **Overlay Panels & Palettes (e.g., Quick Open):** Subtle diffused projection: `0 8px 24px rgba(1, 4, 9, 0.75)` combined with a 1px border of `#30363D`.

## Shapes

The design system uses a constrained roundedness level (`roundedness: 1`), enforcing technical discipline and maximum usable surface area.

- **Base Radius (0.25rem / 4px):** Applied to buttons, input controls, code blocks, chip badges, and context tabs.
- **Panel Radius (0.5rem / 8px):** Reserved for floating dialogs, command palettes, and primary viewport cards (`rounded-lg`).
- **Pills / Status Rings (Fully Rounded):** Restricted exclusively to dynamic telemetry indicators, git commit dots, and numeric counter capsules.

## Components

### Buttons
- **Primary:** Solid `#238636` background (hover: `#2EA043`, active: `#3FB950`), white Geist typography (`label-md`), 1px border in `rgba(240, 246, 252, 0.1)`. Height: 32px (standard) or 24px (compact/toolbar).
- **Secondary / Ghost:** Transparent or `#21262D` background with a `#30363D` border. Hover transitions background to `#30363D` and text to `#F0F6FC`.
- **Keyboard Shortcuts:** Secondary buttons embed right-aligned `<kbd>` chips styled in `#161B22` with a `1px solid #30363D` edge.

### Chips & Badges
- **Status Chips:** Height 20px, radius 4px, uppercase `label-sm`.
  - Added / Success: Tinted `#3FB9501A` background, `#3FB950` text, optional `#3FB950` pulsing dot.
  - Modified / Warning: Tinted `#D299221A` background, `#D29922` text.
  - Removed / Error: Tinted `#F851491A` background, `#F85149` text.
  - Keyword / Metadata: Tinted `#BC8CFF1A` background, `#BC8CFF` text.

### Input Fields & Search Bars
- Background `#0D1117`, 1px solid border `#30363D`, text color `#C9D1D9`, placeholder `#8B949E`.
- Focus state: `1px solid #58A6FF` border accompanied by an unblurred `0 0 0 1px #58A6FF` outline.
- Monospace-capable when editing paths, environment variables, or regex patterns.

### Lists & Tree Views
- Row heights: 28px standard, 22px dense.
- Hover state: Background changes to `#161B22` with seamless edge-to-edge highlights.
- Selected state: Background `#1F242C` with an active 2px left indicator rail colored `#3FB950` or `#58A6FF`.

### Checkboxes & Radios
- Square 14px boxes with 2px corner radius.
- Unchecked: `#161B22` surface with `#30363D` border.
- Checked: `#238636` background containing a sharp white SVG check icon. Focus ring matches `#58A6FF`.

### Cards & Code Blocks
- Framed in `#161B22` with a continuous `1px solid #30363D` border.
- Card headers feature an integrated top tab bar with active file breadcrumbs and subtle 1px divider lines.
- Code blocks embed an integrated terminal title bar showing language identifiers, execution duration, and one-click copy triggers.

### Command Palette (Specialty Component)
- Centered modal anchored 15% from the top viewport. Width: 640px.
- Background `#161B22` with a `1px solid #58A6FF` accent outline and ambient drop shadow.
- Top section contains a borderless search input with prompt icon `>`. Bottom section displays categorized file, symbol, and action results with trailing hotkey indicators.