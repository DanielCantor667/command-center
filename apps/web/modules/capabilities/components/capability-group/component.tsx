import { Grid } from '@command-center/ui';

import type { Capability } from '../../../../domain/evidence';
import { CapabilityCard } from '../capability-card';

interface CapabilityGroupProps {
  capabilities: readonly Capability[];
}

export function CapabilityGroup({ capabilities }: CapabilityGroupProps) {
  return (
    <Grid columns={2} gap="sm">
      {capabilities.map((cap) => (
        <CapabilityCard key={cap.name} capability={cap} />
      ))}
    </Grid>
  );
}
