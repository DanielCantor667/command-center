# AppShell — Usage

```tsx
import { AppShell } from '@/shell/app-shell';
import { WorkspaceProvider } from '@/shell/workspace-provider';

<WorkspaceProvider>
  <AppShell />
</WorkspaceProvider>
```

`AppShell` takes no props — it is the same everywhere it is mounted (once, at the app root).
