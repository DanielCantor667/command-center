import { Stack, Typography } from '@command-center/ui';
import type { Project } from '../../../../data/projects';

interface ProjectFeaturesProps {
  project: Project;
}

export function ProjectFeatures({ project }: ProjectFeaturesProps) {
  if (project.features.length === 0) return null;

  return (
    <Stack direction="vertical" gap="sm">
      <Typography as="h3" variant="heading-m" color="primary">
        Features
      </Typography>
      <ul className="list-disc pl-5 flex flex-col gap-2">
        {project.features.map((feature) => (
          <li key={feature.title} className="flex flex-col gap-1">
            <Typography as="span" variant="body" color="primary">
              {feature.title}
            </Typography>
            <Typography as="span" variant="body-small" color="secondary">
              {feature.description}
            </Typography>
          </li>
        ))}
      </ul>
    </Stack>
  );
}
