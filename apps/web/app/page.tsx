import { ExperienceGate } from '@/shell/experience-gate';
import { WorkspaceProvider } from '@/shell/workspace-provider';

export default function HomePage() {
  return (
    <WorkspaceProvider>
      <ExperienceGate />
    </WorkspaceProvider>
  );
}
