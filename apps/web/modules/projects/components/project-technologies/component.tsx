import { useMemo } from 'react';
import { Stack, Surface, Typography } from '@command-center/ui';
import type { Project, Technology } from '../../../../data/projects';
import { TECHNOLOGY_KIND } from '../../../../data/projects';

interface ProjectTechnologiesProps {
  project: Project;
}

const SECTION_ORDER = [
  TECHNOLOGY_KIND.Language,
  TECHNOLOGY_KIND.Framework,
  TECHNOLOGY_KIND.Database,
  TECHNOLOGY_KIND.Infrastructure,
  TECHNOLOGY_KIND.Tooling,
  TECHNOLOGY_KIND.Platform,
] as const;

function groupTechnologies(technologies: readonly Technology[]) {
  const groups = new Map<string, Technology[]>();

  for (const tech of technologies) {
    const existing = groups.get(tech.kind) ?? [];
    existing.push(tech);
    groups.set(tech.kind, existing);
  }

  return groups;
}

export function ProjectTechnologies({ project }: ProjectTechnologiesProps) {
  const groups = useMemo(() => groupTechnologies(project.technologies), [project.technologies]);

  if (project.technologies.length === 0) return null;

  return (
    <Stack direction="vertical" gap="sm">
      <Typography as="h3" variant="heading-m" color="primary">
        Tech Stack
      </Typography>
      <Stack direction="vertical" gap="md">
        {SECTION_ORDER.map((kind) => {
          const items = groups.get(kind);
          if (!items || items.length === 0) return null;

          return (
            <Stack key={kind} direction="vertical" gap="xs">
              <Typography as="h4" variant="title" color="secondary">
                {kind}
              </Typography>
              <Stack direction="horizontal" gap="sm" wrap>
                {items.map((tech) => (
                  <Surface
                    key={tech.name}
                    variant="subtle"
                    padding="sm"
                    radius="sm"
                    border
                  >
                    <Typography as="span" variant="body-small" color="primary">
                      {tech.name}
                    </Typography>
                  </Surface>
                ))}
              </Stack>
            </Stack>
          );
        })}
      </Stack>
    </Stack>
  );
}
