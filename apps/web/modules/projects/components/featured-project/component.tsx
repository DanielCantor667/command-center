import { Button, Stack, Typography } from '@command-center/ui';
import type { Project } from '../../../../data/projects';

interface FeaturedProjectProps {
  project: Project;
  onSelect: () => void;
}

export function FeaturedProject({ project, onSelect }: FeaturedProjectProps) {
  const featuredMedia = project.media.find((m) => m.featured);

  return (
    <Stack direction="vertical" gap="md">
      {featuredMedia && (
        <img
          src={featuredMedia.url}
          alt={featuredMedia.alt}
          className="w-full rounded-lg object-cover"
          style={{ maxHeight: '320px' }}
        />
      )}
      <Stack direction="vertical" gap="xs">
        <Typography as="h1" variant="display-l" color="primary">
          {project.name}
        </Typography>
        <Typography as="p" variant="heading-m" color="secondary">
          {project.tagline}
        </Typography>
        <Typography as="span" variant="body-small" color="muted">
          Status: {project.status}
        </Typography>
      </Stack>
      <Button variant="primary" onClick={onSelect}>
        Open Project
      </Button>
    </Stack>
  );
}
