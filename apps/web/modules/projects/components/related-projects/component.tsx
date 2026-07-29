import { useMemo } from 'react';
import { Panel, Stack, Typography } from '@command-center/ui';
import { PROJECTS } from '../../../../data/projects';
import type { Project } from '../../../../data/projects';

interface RelatedProjectsProps {
  project: Project;
  onSelect: (id: string) => void;
}

export function RelatedProjects({ project, onSelect }: RelatedProjectsProps) {
  const related = useMemo(
    () =>
      PROJECTS.filter((p) => project.relationships.relatedProjects.includes(p.id)),
    [project.relationships.relatedProjects],
  );

  if (related.length === 0) return null;

  return (
    <Stack direction="vertical" gap="sm">
      <Typography as="h3" variant="heading-m" color="primary">
        Proyectos relacionados
      </Typography>
      <Stack direction="vertical" gap="md">
        {related.map((relatedProject) => (
          <Panel
            key={relatedProject.id}
            variant="subtle"
            border
            padding="md"
            asChild
          >
            <button
              type="button"
              onClick={() => onSelect(relatedProject.id)}
              className="w-full text-left cursor-pointer"
            >
              <Stack direction="vertical" gap="xs">
                <Typography as="h4" variant="title" color="primary">
                  {relatedProject.name}
                </Typography>
                <Typography as="p" variant="body-small" color="secondary">
                  {relatedProject.tagline}
                </Typography>
              </Stack>
            </button>
          </Panel>
        ))}
      </Stack>
    </Stack>
  );
}
