import { Button, Grid, Panel, Typography } from '@command-center/ui';
import type { NavigationTarget, QuickNavigationProps } from './types';

const NAVIGATION_TARGETS: readonly { id: NavigationTarget; label: string }[] = [
  { id: 'projects', label: 'Proyectos' },
  { id: 'mission', label: 'Mission Log' },
  { id: 'capabilities', label: 'Capacidades' },
  { id: 'lab', label: 'Lab 3D' },
  { id: 'communication', label: 'Contacto' },
];

export function QuickNavigation({ onNavigate }: QuickNavigationProps) {
  return (
    <Panel variant="subtle" border padding="md" className="command-dashboard-card">
      <Typography as="h2" variant="heading-m" color="primary">
        Navegación rápida
      </Typography>
      <Grid columns={2} gap="sm">
        {NAVIGATION_TARGETS.map((target) => (
          <Button key={target.id} variant="secondary" onClick={() => onNavigate(target.id)}>
            {target.label}
          </Button>
        ))}
      </Grid>
    </Panel>
  );
}
