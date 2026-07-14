import { useMemo } from 'react';
import { Stack, Typography } from '@command-center/ui';
import { PROJECTS } from '../../../../data/projects';

interface ProjectReferenceProps {
  projectId: string;
}

export function ProjectReference({ projectId }: ProjectReferenceProps) {
  const project = useMemo(
    () => PROJECTS.find((p) => p.id === projectId) ?? null,
    [projectId],
  );

  if (!project) return null;

  return (
    <Stack direction="horizontal" gap="xs" align="center">
      <Typography as="span" variant="body-small" color="accent">
        {project.name}
      </Typography>
      <Typography as="span" variant="body-small" color="muted">
        ({project.status})
      </Typography>
    </Stack>
  );
}
