'use client';

import { useCallback, useMemo, useState } from 'react';
import { Stack } from '@command-center/ui';
import { PROJECTS } from '../../data/projects';
import { EmptyState } from './components/empty-state';
import { FeaturedProject } from './components/featured-project';
import { ProjectDetail } from './components/project-detail';
import { ProjectsGrid } from './components/projects-grid';

export function ProjectsModule() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

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
  }, []);

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
