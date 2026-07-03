import { Stack, Typography } from '@command-center/ui';
import type { ModulePlaceholderProps } from './types';

export function ModulePlaceholder({ title, description }: ModulePlaceholderProps) {
  return (
    <Stack direction="vertical" gap="sm" align="start" justify="center" className="h-full">
      <Typography variant="display-l" color="primary">
        {title.toUpperCase()}
      </Typography>
      <Typography variant="body-small" color="muted">
        {description}
      </Typography>
    </Stack>
  );
}
