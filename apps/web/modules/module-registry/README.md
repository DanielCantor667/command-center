# ModuleRegistry

## Purpose

Static map from `WorkspaceModule` id to the React component that renders that module's content
in the Workspace.

## Responsibilities

- Own `MODULE_REGISTRY`, a `Record<WorkspaceModule, ModuleComponent>` covering every id declared
  in `WorkspaceModule` (`apps/web/shell/workspace-store`).
- Guarantee, at compile time, that every module id has a registered component — the `Record` type
  (not `Partial`) makes the build fail if a new `WorkspaceModule` id is added without a matching
  entry here.

Does not perform routing, lazy-loading, or data fetching. All modules are eagerly imported.

## API

| Export | Type | Description |
|---|---|---|
| `MODULE_REGISTRY` | `Readonly<Record<WorkspaceModule, ModuleComponent>>` | Component to render for each module id. |
| `ModuleComponent` | type | `ComponentType` — a module component takes no props. |
| `ModuleRegistry` | type | Shape of `MODULE_REGISTRY`. |

## Usage Example

```tsx
import { useWorkspaceStore } from '../workspace-store';
import { MODULE_REGISTRY } from '../../modules/module-registry';

const currentModule = useWorkspaceStore((state) => state.currentModule);
const ActiveModule = currentModule ? MODULE_REGISTRY[currentModule] : null;

return ActiveModule ? <ActiveModule /> : null;
```

## Known Limitations

- No lazy-loading — every module is bundled eagerly regardless of which one is active.

## Future Extensions

- Switch to dynamic `import()` per module if bundle size becomes a concern.
