import { Panel, Typography } from '@command-center/ui';
import type { RecentActivityProps } from './types';

export function RecentActivity({ items }: RecentActivityProps) {
  return (
    <Panel variant="subtle" border padding="md" className="command-dashboard-card">
      <Typography as="h2" variant="heading-m" color="primary">
        Recent Activity
      </Typography>
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {items.map((item) => (
          <Typography key={item.id} as="li" variant="body-small" color="secondary">
            {item.label}
          </Typography>
        ))}
      </ul>
    </Panel>
  );
}
