import { AppShell } from '@/shell/app-shell';
import { WorkspaceProvider } from '@/shell/workspace-provider';

export default function HomePage() {
  return (
    <WorkspaceProvider>
      <AppShell />
    </WorkspaceProvider>
  );
}
