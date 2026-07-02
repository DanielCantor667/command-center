# StatusBar

## Purpose

Low-priority, always-visible system information strip at the bottom of the shell.

## Responsibilities

- Render version, theme, connection, branch, build and FPS as static, informational text.

All values are informational only — no live data source in this sprint (server component, no
hooks, no client state).

## API

| Prop | Type | Default | Description |
|---|---|---|---|
| `className` | `string` | — | Extra classes. |
| ...rest | `ComponentPropsWithoutRef<'footer'>` (minus `children`) | — | Forwarded to the root `<footer>`. |

## Accessibility

Root landmark: native `<footer>` (contentinfo role when not nested inside `main`/`aside`).

## Usage Example

```tsx
import { StatusBar } from '@/shell/status-bar';

<StatusBar />
```

## Known Limitations

- All values are hardcoded placeholders (`v0.1.0-dev`, `main`, `60` FPS, etc.) — none reflect real
  build/runtime state yet.

## Future Extensions

- Real version (from `package.json`), real git branch, real FPS meter, real connection/online
  status, real theme (via `useTheme()`), real build status (CI integration).
