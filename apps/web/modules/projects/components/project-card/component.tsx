import { Panel, Stack, Typography } from '@command-center/ui';
import type { Project } from '../../../../data/projects';

interface ProjectCardProps {
  project: Project;
  onSelect: (id: string) => void;
}

export function ProjectCard({ project, onSelect }: ProjectCardProps) {
  return (
    <Panel
      variant="subtle"
      border
      padding="md"
      asChild
    >
      <button
        type="button"
        onClick={() => onSelect(project.id)}
        className="w-full text-left cursor-pointer"
      >
        <Stack direction="vertical" gap="sm">
          <Stack direction="horizontal" gap="sm" align="center" wrap>
            <Typography as="h3" variant="heading-m" color="primary">
              {project.name}
            </Typography>
            <Typography as="span" variant="body-small" color="muted">
              {project.status}
            </Typography>
          </Stack>
          {project.technologies.length > 0 && (
            <Stack direction="horizontal" gap="xs" wrap>
              {project.technologies.map((tech) => (
                <Typography key={tech.name} as="span" variant="mono-small" color="accent">
                  {tech.name}
                </Typography>
              ))}
            </Stack>
          )}
          <Typography as="p" variant="body-small" color="secondary">
            {project.summary}
          </Typography>
        </Stack>
      </button>
    </Panel>
  );
}
