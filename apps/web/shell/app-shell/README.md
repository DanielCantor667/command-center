# AppShell

## Purpose

The permanent operating system of Command Center. Composes `TopBar`, `Sidebar`, `Workspace` and
`StatusBar` inside `AppContainer`. Mounted once, for the entire application lifetime — only
`Workspace`'s content changes as navigation happens.

## Responsibilities

- Compose the four shell regions in the fixed layout defined by the RFC:

  ```
  ┌────────────────────────────┐
  │ TopBar                     │
  ├──────────┬──────────────────┤
  │ Sidebar  │ Workspace        │
  ├──────────┴──────────────────┤
  │ StatusBar                   │
  └────────────────────────────┘
  ```

No business logic, no routing, no props — it is entirely self-contained and reads navigation
state from `WorkspaceStore` indirectly through `Sidebar`/`TopBar`/`Workspace`.

## API

No props. `AppShell` takes no configuration — its structure is permanent per the RFC ("No module
may replace AppShell").

## Accessibility

Composes four landmarks: `<header>` (`TopBar`), `<aside>` (`Sidebar`), `<main>` (`Workspace`),
`<footer>` (`StatusBar`). See each component's own README for details.

## Usage Example

```tsx
import { AppShell } from '@/shell/app-shell';
import { WorkspaceProvider } from '@/shell/workspace-provider';

export default function Page() {
  return (
    <WorkspaceProvider>
      <AppShell />
    </WorkspaceProvider>
  );
}
```

## Known Limitations

- See `Sidebar`'s README for the mobile-drawer limitation (out of scope this sprint).

## Future Extensions

- None planned at the `AppShell` level — per the RFC, this composition is permanent. All future
  features render inside `Workspace`.
