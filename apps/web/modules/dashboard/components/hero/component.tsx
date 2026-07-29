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
          Estado: {status}
        </Typography>
        <Typography as="span" variant="body-small" color="muted">
          Disponibilidad: {availability}
        </Typography>
      </Stack>
      <Button variant="primary" onClick={onCtaClick}>
        Ver proyectos
      </Button>
    </Stack>
    </Panel>
  );
}
