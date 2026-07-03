import { Panel, Stack, Typography } from '@command-center/ui';
import type { CurrentFocusProps } from './types';

export function CurrentFocus({ title, status }: CurrentFocusProps) {
  return (
    <Panel variant="subtle" border padding="md">
      <Stack direction="vertical" gap="xs">
        <Typography as="h2" variant="heading-m" color="primary">
          Current Focus
        </Typography>
        <Typography as="p" variant="body" color="secondary">
          Currently building: {title}
        </Typography>
        <Typography as="p" variant="body-small" color="muted">
          Status: {status}
        </Typography>
      </Stack>
    </Panel>
  );
}
