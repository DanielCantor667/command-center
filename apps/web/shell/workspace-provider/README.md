# WorkspaceProvider

## Purpose

Marks the boundary, in the app component tree, where the Application Shell's workspace context
begins. Required by the approved component tree (`ThemeProvider > WorkspaceProvider > AppShell`).

## Responsibilities

- Render its children unchanged.
- Reserve the extension point for future workspace-level context (e.g. URL sync, persisted
  module) without every consumer having to change its import when that lands.

Does not read or write `WorkspaceStore` itself — `WorkspaceStore` is a Zustand store, global by
construction, and does not require a React context provider to function.

## API

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | — | Content to render (the `AppShell`). |

## Accessibility

No DOM output of its own — passes `children` through, so it does not affect the accessibility
tree.

## Usage Example

```tsx
import { WorkspaceProvider } from '@/shell/workspace-provider';
import { AppShell } from '@/shell/app-shell';

export default function Page() {
  return (
    <WorkspaceProvider>
      <AppShell />
    </WorkspaceProvider>
  );
}
```

## Known Limitations

- Currently a pass-through with no behavior — intentional for this sprint.

## Future Extensions

- Initialize `WorkspaceStore` from the URL once routing is introduced.
- Wrap children in an actual `React.Context` if per-tree (not global) workspace state is ever
  needed.
