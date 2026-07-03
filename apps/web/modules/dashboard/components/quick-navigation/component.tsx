import { Button, Grid, Typography } from '@command-center/ui';
import type { NavigationTarget, QuickNavigationProps } from './types';

const NAVIGATION_TARGETS: readonly { id: NavigationTarget; label: string }[] = [
  { id: 'projects', label: 'Projects' },
  { id: 'mission', label: 'Mission Log' },
  { id: 'capabilities', label: 'Capabilities' },
  { id: 'lab', label: 'Lab' },
  { id: 'communication', label: 'Communication' },
];

export function QuickNavigation({ onNavigate }: QuickNavigationProps) {
  return (
    <div>
      <Typography as="h2" variant="heading-m" color="primary">
        Quick Navigation
      </Typography>
      <Grid columns={2} gap="sm">
        {NAVIGATION_TARGETS.map((target) => (
          <Button key={target.id} variant="secondary" onClick={() => onNavigate(target.id)}>
            {target.label}
          </Button>
        ))}
      </Grid>
    </div>
  );
}
