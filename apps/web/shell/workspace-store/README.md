# WorkspaceStore

## Purpose

Global navigation state for the Application Shell: which module is currently active.

## Responsibilities

- Hold `currentModule` (or `null` when no module has been selected yet).
- Expose `setCurrentModule` to change the active module.
- Expose `resetWorkspace` to clear the active module back to `null`.
- Own the static list of available modules (`WORKSPACE_MODULES`) consumed by `Sidebar`, `TopBar`
  and `Workspace`.

Does not perform routing, URL synchronization, data fetching or any business logic.

## API

| Export | Type | Description |
|---|---|---|
| `useWorkspaceStore` | Zustand hook | `() => WorkspaceState` when called with no selector, or `(state) => T` with a selector. |
| `WorkspaceState.currentModule` | `WorkspaceModule \| null` | Active module, `null` initially. |
| `WorkspaceState.setCurrentModule` | `(module: WorkspaceModule) => void` | Sets the active module. |
| `WorkspaceState.resetWorkspace` | `() => void` | Clears the active module. |
| `WORKSPACE_MODULES` | `readonly WorkspaceModuleDefinition[]` | `{ id, label }` for each navigable module. |
| `WorkspaceModule` | type | `'dashboard' \| 'profile' \| 'projects' \| 'mission' \| 'capabilities' \| 'lab' \| 'communication'`. |

## Usage Example

```tsx
import { useWorkspaceStore, WORKSPACE_MODULES } from '@/shell/workspace-store';

function ModuleList() {
  const currentModule = useWorkspaceStore((state) => state.currentModule);
  const setCurrentModule = useWorkspaceStore((state) => state.setCurrentModule);

  return (
    <ul>
      {WORKSPACE_MODULES.map((module) => (
        <li key={module.id} aria-current={module.id === currentModule ? 'true' : undefined}>
          <button type="button" onClick={() => setCurrentModule(module.id)}>
            {module.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
```

## Known Limitations

- No URL synchronization — reloading the page loses the selected module.
- No persistence across sessions.

## Future Extensions

- Sync `currentModule` with the URL once routing is introduced.
- Persist last active module (e.g. `localStorage`), following the same pattern as
  `packages/ui/theme`.
