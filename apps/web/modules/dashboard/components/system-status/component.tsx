import { Stack, Typography } from '@command-center/ui';
import type { SystemStatusProps } from './types';

export function SystemStatus({ items }: SystemStatusProps) {
  return (
    <div>
      <Typography as="h2" variant="heading-m" color="primary">
        System Status
      </Typography>
      <Stack direction="horizontal" gap="md" align="center" wrap>
        {items.map((item) => (
          <Typography key={item.label} as="span" variant="caption" color="muted">
            {item.label}: {item.value}
          </Typography>
        ))}
      </Stack>
    </div>
  );
}
