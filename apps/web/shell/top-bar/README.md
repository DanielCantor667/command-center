# TopBar

## Purpose

Always-visible application context bar. Remains mounted for the entire app lifetime, never
scrolls, never disappears.

## Responsibilities

- Render `Brand` and the current module's label (from `WorkspaceStore`, falls back to
  "System Ready" when no module is selected).
- Render placeholder controls: command-palette button, theme-toggle button, clock, system status.

None of the placeholder controls are wired to real behavior yet — per the RFC, TopBar has "no
functionality except rendering" in this sprint.

## API

| Prop | Type | Default | Description |
|---|---|---|---|
| `className` | `string` | — | Extra classes. |
| ...rest | `ComponentPropsWithoutRef<'header'>` (minus `children`) | — | Forwarded to the root `<header>`. |

## Accessibility

- Root landmark: native `<header>` (banner role when not nested inside `main`/`aside`).
- `IconButton` placeholders expose `label` as their accessible name ("Open command palette",
  "Toggle theme").
- Icon glyphs (`⌘`, `◐`) are `aria-hidden`; the accessible name comes from `IconButton`'s
  required `label` prop.

## Usage Example

```tsx
import { TopBar } from '@/shell/top-bar';

<TopBar />
```

## Known Limitations

- Command-palette button, theme-toggle button, clock and system status are static placeholders —
  no click behavior, no live time, no real status. Intentional for this sprint.
- Clock renders a fixed `--:--` instead of live time, to avoid a client-only `setInterval` and the
  hydration-mismatch risk that comes with it. Deferred, not implemented, to stay within "no
  functionality except rendering".

## Future Extensions

- Wire the command-palette button to `Command Palette Behaviour` (explicitly out of scope,
  future RFC).
- Wire the theme-toggle button to `useTheme()` from `@command-center/ui`.
- Live clock, once a hydration-safe pattern is agreed on.
- Real system status / connection indicator.
