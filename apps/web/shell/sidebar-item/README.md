# SidebarItem

## Purpose

Single navigation entry inside `Sidebar`.

## Responsibilities

- Render one module's label as a `Button`.
- Reflect active state visually (`primary` variant when active, `ghost` otherwise) and via
  `aria-current="page"`.
- Call `onSelect` on click. No routing, no business logic — `Sidebar` decides what `onSelect`
  does (calls `WorkspaceStore.setCurrentModule`).

## API

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Visible text. |
| `active` | `boolean` | `false` | Whether this is the currently selected module. |
| `onSelect` | `() => void` | — | Called on click. |
| `className` | `string` | — | Extra classes. |

## Accessibility

Renders as a native `<button>` (via the `Button` primitive) with `aria-current="page"` when
active, so assistive tech announces the current selection the same way it would for a current
page link.

## Usage Example

```tsx
import { SidebarItem } from '@/shell/sidebar-item';

<SidebarItem label="Dashboard" active onSelect={() => setCurrentModule('dashboard')} />
```

## Known Limitations

- Not a link (`<a>`) — appropriate here since there is no routing yet in Sprint 0.4.

## Future Extensions

- Render as a link once routing exists, keeping the same active-state contract.
