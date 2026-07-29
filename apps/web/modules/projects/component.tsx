'use client';

import { useCallback, useMemo, useState } from 'react';
import { Stack } from '@command-center/ui';
import { PROJECTS } from '../../data/projects';
import { useWorkspaceStore } from '../../shell/workspace-store';
import { EmptyState } from './components/empty-state';
import { FeaturedProject } from './components/featured-project';
import { ProjectDetail } from './components/project-detail';
import { ProjectsGrid } from './components/projects-grid';

export function ProjectsModule() {
  const pendingProjectId = useWorkspaceStore((state) => state.selectedProjectId);
  const setPendingProjectId = useWorkspaceStore((state) => state.setSelectedProjectId);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(pendingProjectId);

  const featuredProject = useMemo(
    () => PROJECTS.find((p) => p.featured) ?? null,
    [],
  );

  const selectedProject = useMemo(
    () => PROJECTS.find((p) => p.id === selectedProjectId) ?? null,
    [selectedProjectId],
  );

  const handleSelectProject = useCallback((id: string) => {
    setSelectedProjectId(id);
    setPendingProjectId(null);
  }, [setPendingProjectId]);

  return (
    <Stack direction="vertical" gap="lg">
      {featuredProject && (
        <FeaturedProject
          project={featuredProject}
          onSelect={() => handleSelectProject(featuredProject.id)}
        />
      )}
      <ProjectsGrid onSelect={handleSelectProject} />
      {selectedProject ? (
        <ProjectDetail
          project={selectedProject}
          onRelatedSelect={handleSelectProject}
        />
      ) : (
        <EmptyState />
      )}
    </Stack>
  );
}
