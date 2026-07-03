import { Grid, Typography } from '@command-center/ui';
import type { QuickStatsProps } from './types';

export function QuickStats({ stats }: QuickStatsProps) {
  return (
    <div>
      <Typography as="h2" variant="heading-m" color="primary">
        Quick Stats
      </Typography>
      <Grid columns={2} gap="sm">
        {stats.map((stat) => (
          <div key={stat.label}>
            <Typography as="p" variant="body-small" color="muted">
              {stat.label}
            </Typography>
            <Typography as="p" variant="title" color="primary">
              {stat.value}
            </Typography>
          </div>
        ))}
      </Grid>
    </div>
  );
}
