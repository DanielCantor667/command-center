# Sidebar

## Purpose

Primary navigation for the Application Shell. Remains mounted for the entire app lifetime.

## Responsibilities

- Render `Brand` and one `SidebarItem` per entry in `WORKSPACE_MODULES`.
- Read `currentModule` from `WorkspaceStore` to mark the active item.
- Call `setCurrentModule` when an item is selected.

No routing, no data fetching, no business logic.

## API

| Prop | Type | Default | Description |
|---|---|---|---|
| `className` | `string` | — | Extra classes. |
| ...rest | `ComponentPropsWithoutRef<'aside'>` (minus `children`) | — | Forwarded to the root `<aside>`. |

## Accessibility

- Root landmark: `<aside aria-label="Primary navigation">`.
- Navigation list: `<nav aria-label="Application modules">` wrapping the items.
- Active item exposes `aria-current="page"` (via `SidebarItem`).
- Keyboard: every item is a native `<button>`, reachable via Tab, activated with Enter/Space.

## Usage Example

```tsx
import { Sidebar } from '@/shell/sidebar';

<Sidebar />
```

## Responsive

CSS-only, no JavaScript, no new interactive components:

- **Base (below `tablet`, < 768px)**: hidden (`hidden`). Mobile does not yet have a drawer — see
  Known Limitations.
- **`tablet` (≥ 768px)**: visible, collapsed to `--layout-sidebar-collapsed-width` (72px). Item
  labels truncate (`SidebarItem` wraps its label in a `truncate` span) instead of hiding, since no
  icon set exists yet to go icon-only.
- **`laptop` (≥ 1024px)**: full width, `--layout-sidebar-width` (280px).

## Known Limitations

- Mobile (`< tablet`) hides the Sidebar entirely; no drawer/trigger yet. Building a real drawer
  needs a trigger control not in Sprint 0.4's authorized component list, and a sliding-in drawer
  conflicts with the RFC's Motion rule ("forbidden: large slides"). Left out of scope, documented
  here rather than implemented — flagged during the sprint as an architectural conflict.
- Tablet "collapse" truncates labels rather than switching to icon-only, since no icon primitive
  exists yet in the Design System.

## Future Extensions

- Mobile drawer: needs a trigger component (not yet authorized) and a motion pattern compatible
  with the "no large slides" rule (e.g. fade/opacity, small scale).
- Icon-only tablet rail once an icon primitive exists in the Design System.
- Keyboard arrow-key roving focus across items (currently plain Tab order).
