import { Stack, Surface, Typography } from '@command-center/ui';
import type { Project } from '../../../../data/projects';

interface ProjectArchitectureProps {
  project: Project;
}

export function ProjectArchitecture({ project }: ProjectArchitectureProps) {
  if (project.architecture.length === 0) return null;

  return (
    <Stack direction="vertical" gap="sm">
      <Typography as="h3" variant="heading-m" color="primary">
        Architecture
      </Typography>
      <Stack direction="horizontal" gap="sm" wrap>
        {project.architecture.map((pattern) => (
          <Surface key={pattern} variant="outlined" padding="sm" radius="sm">
            <Typography as="span" variant="mono-small" color="accent">
              {pattern}
            </Typography>
          </Surface>
        ))}
      </Stack>
    </Stack>
  );
}
