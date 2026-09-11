import { Grid, Panel, Stack, Typography } from '@command-center/ui';

import type { ArchitectureProfile as ArchProfile } from '../../../../domain/evidence';

interface ArchitectureProfileProps {
  profiles: readonly ArchProfile[];
}

function EvidenceRow({ label, value }: { label: string; value: number }) {
  return (
    <Stack direction="horizontal" gap="xs" justify="between">
      <Typography variant="mono-small" color="secondary">
        {label}
      </Typography>
      <Typography variant="mono-small">{value}</Typography>
    </Stack>
  );
}

export function ArchitectureProfile({ profiles }: ArchitectureProfileProps) {
  if (profiles.length === 0) return null;

  return (
    <Grid columns={{ base: 1, tablet: 2 }} gap="sm">
      {profiles.map((p) => (
        <Panel key={p.pattern} variant="default" border padding="md">
          <Stack direction="vertical" gap="sm">
            <Typography variant="heading-m">{p.pattern}</Typography>
            <Stack direction="vertical" gap="xs">
              <EvidenceRow label="Projects" value={p.projects} />
              <EvidenceRow label="Engineering Decisions" value={p.decisions} />
              <EvidenceRow label="Lessons" value={p.lessons} />
              <EvidenceRow label="Milestones" value={p.milestones} />
            </Stack>
          </Stack>
        </Panel>
      ))}
    </Grid>
  );
}
