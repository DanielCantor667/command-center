import { Stack, Typography } from '@command-center/ui';
import type { Project } from '../../../../data/projects';

interface ProjectHeaderProps {
  project: Project;
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  return (
    <Stack direction="vertical" gap="xs">
      <Typography as="h2" variant="display-l" color="primary">
        {project.name}
      </Typography>
      <Typography as="p" variant="heading-m" color="secondary">
        {project.tagline}
      </Typography>
      <Stack direction="horizontal" gap="md" wrap>
        <Typography as="span" variant="body-small" color="muted">
          Status: {project.status}
        </Typography>
        <Typography as="span" variant="body-small" color="muted">
          Role: {project.role.title}
        </Typography>
        <Typography as="span" variant="body-small" color="muted">
          Started: {project.startedAt}
        </Typography>
        {project.completedAt && (
          <Typography as="span" variant="body-small" color="muted">
            Completed: {project.completedAt}
          </Typography>
        )}
        <Typography as="span" variant="body-small" color="muted">
          Ownership: {project.ownership.type}
        </Typography>
      </Stack>
    </Stack>
  );
}
