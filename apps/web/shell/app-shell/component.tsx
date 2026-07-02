import { Stack } from '@command-center/ui';
import { AppContainer } from '../app-container';
import { Sidebar } from '../sidebar';
import { StatusBar } from '../status-bar';
import { TopBar } from '../top-bar';
import { Workspace } from '../workspace';

export function AppShell() {
  return (
    <AppContainer>
      <TopBar />
      <Stack direction="horizontal" gap="none" align="stretch" className="flex-1 overflow-hidden">
        <Sidebar />
        <Workspace />
      </Stack>
      <StatusBar />
    </AppContainer>
  );
}
