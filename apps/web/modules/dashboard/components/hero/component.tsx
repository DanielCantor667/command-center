import { Button, Panel, Stack, Typography } from '@command-center/ui';
import type { HeroProps } from './types';

export function Hero({ name, role, missionStatement, status, availability, onCtaClick }: HeroProps) {
  return (
    <Panel variant="subtle" border padding="lg" elevation="medium" className="command-dashboard-hero">
    <Stack direction="vertical" gap="sm" align="start">
      <Typography as="h1" variant="display-l" color="primary">
        {name}
      </Typography>
      <Typography as="p" variant="heading-m" color="secondary">
        {role}
      </Typography>
      <Typography as="p" variant="body" color="secondary">
        {missionStatement}
      </Typography>
      <Stack direction="horizontal" gap="md" align="center">
        <Typography as="span" variant="body-small" color="muted">
          Status: {status}
        </Typography>
        <Typography as="span" variant="body-small" color="muted">
          Availability: {availability}
        </Typography>
      </Stack>
      <Button variant="primary" onClick={onCtaClick}>
        View Projects
      </Button>
    </Stack>
    </Panel>
  );
}
