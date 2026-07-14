import { Stack, Typography } from '@command-center/ui';

export function EmptyState() {
  return (
    <Stack direction="vertical" gap="md" align="center" className="py-24">
      <Typography variant="heading-l" color="muted">
        No capabilities available.
      </Typography>
      <Typography variant="body" color="muted" align="center">
        Capabilities are inferred from engineering evidence.
      </Typography>
    </Stack>
  );
}
