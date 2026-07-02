# Workspace

## Purpose

Renders the active module. The only part of the Application Shell that changes when navigation
happens — `AppShell`, `Sidebar`, `TopBar` and `StatusBar` never remount.

## Responsibilities

- Read `currentModule` from `WorkspaceStore`.
- Show the initial state ("COMMAND CENTER / System Ready / Waiting for Modules...") when no
  module is selected.
- Show the selected module's name when one is selected.

No fake widgets, no placeholder cards, no business UI — this sprint does not implement any real
module content.

## API

| Prop | Type | Default | Description |
|---|---|---|---|
| `className` | `string` | — | Extra classes. |
| ...rest | `ComponentPropsWithoutRef<'main'>` (minus `children`) | — | Forwarded to the root `<main>`. |

## Accessibility

Root landmark: `<main aria-label="Workspace">`.

## Usage Example

```tsx
import { Workspace } from '@/shell/workspace';

<Workspace />
```

## Known Limitations

- Selecting a module only changes the title/description text — no real module is rendered yet.
  Intentional; real modules are out of scope for Sprint 0.4.

## Future Extensions

- Render actual module content (Dashboard, Projects, Mission Log, etc.) once those sprints land,
  without changing `Workspace`'s contract (still driven by `currentModule`).
