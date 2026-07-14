import { Stack, Typography } from '@command-center/ui';

export function EmptyState() {
  return (
    <Stack direction="vertical" gap="sm" align="center" justify="center" className="py-24">
      <Typography as="h2" variant="heading-m" color="primary">
        Select a project
      </Typography>
      <Typography as="p" variant="body" color="muted">
        Select a project to explore its engineering story.
      </Typography>
    </Stack>
  );
}
