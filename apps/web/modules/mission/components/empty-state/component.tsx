import { Stack, Typography } from '@command-center/ui';

export function EmptyState() {
  return (
    <Stack direction="vertical" gap="sm" align="center" justify="center" className="py-24">
      <Typography as="h2" variant="heading-m" color="primary">
        No engineering milestones found
      </Typography>
      <Typography as="p" variant="body" color="muted">
        Try adjusting the filters to explore more milestones.
      </Typography>
    </Stack>
  );
}
