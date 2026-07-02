# Sidebar — Usage

```tsx
import { Sidebar } from '@/shell/sidebar';

<Sidebar />
```

Active state is driven entirely by `WorkspaceStore.currentModule` — there is no `active` prop on
`Sidebar` itself.
