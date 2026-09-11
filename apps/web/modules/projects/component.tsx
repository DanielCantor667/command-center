'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Stack } from '@command-center/ui';
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

  const detailRef = useRef<HTMLDivElement>(null);
  const publicCases = PROJECTS.filter((project) => project.public && project.links.live);
  const activeIndex = publicCases.findIndex((project) => project.id === selectedProjectId);
  useEffect(() => {
    if (selectedProjectId) detailRef.current?.focus();
  }, [selectedProjectId]);

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
      {!selectedProject && featuredProject && (
        <FeaturedProject
          project={featuredProject}
          onSelect={() => handleSelectProject(featuredProject.id)}
        />
      )}

      {selectedProject ? (
        <div ref={detailRef} tabIndex={-1} className="min-w-0 outline-none">
          <nav aria-label="Recorrido de proyectos" className="flex flex-wrap items-center gap-12">
            <Button onClick={() => setSelectedProjectId(null)}>Todos los proyectos</Button>
            {activeIndex >= 0 && <>
              <span className="text-sm text-text-secondary">Caso {activeIndex + 1} de {publicCases.length}</span>
              {activeIndex > 0 && <Button onClick={() => handleSelectProject(publicCases[activeIndex - 1]!.id)}>Anterior</Button>}
              {activeIndex < publicCases.length - 1 && <Button onClick={() => handleSelectProject(publicCases[activeIndex + 1]!.id)}>Siguiente</Button>}
            </>}
            <Button onClick={() => useWorkspaceStore.getState().setCurrentModule('communication')}>Contactar a Daniel</Button>
          </nav>
          <ProjectDetail project={selectedProject} onRelatedSelect={handleSelectProject} />
        </div>
      ) : (
        <><ProjectsGrid onSelect={handleSelectProject} /><EmptyState /></>
      )}
    </Stack>
  );
}
