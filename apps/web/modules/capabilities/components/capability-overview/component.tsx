import { Grid, Panel, Stack, Typography } from '@command-center/ui';

import type { Evidence } from '../../../../domain/evidence';

interface CapabilityOverviewProps {
  evidence: Evidence;
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <Panel variant="subtle" border padding="md">
      <Stack direction="vertical" gap="xs" align="center">
        <Typography variant="display-l">{value}</Typography>
        <Typography variant="body-small" color="muted" align="center">
          {label}
        </Typography>
      </Stack>
    </Panel>
  );
}

export function CapabilityOverview({ evidence }: CapabilityOverviewProps) {
  const highCount = evidence.capabilities.filter(
    (c) => c.confidence === 'high',
  ).length;
  const mediumCount = evidence.capabilities.filter(
    (c) => c.confidence === 'medium',
  ).length;
  const lowCount = evidence.capabilities.filter(
    (c) => c.confidence === 'low',
  ).length;

  return (
    <Grid columns={{ base: 1, tablet: 3 }} gap="sm">
      <StatBox label="Capabilities" value={evidence.capabilities.length} />
      <StatBox label="Technologies" value={evidence.statistics.technologies} />
      <StatBox
        label="Architecture Patterns"
        value={evidence.statistics.architecturePatterns}
      />
      <StatBox
        label="Engineering Decisions"
        value={evidence.statistics.engineeringDecisions}
      />
      <StatBox label="Lessons" value={evidence.statistics.lessons} />
      <StatBox
        label="Confidence"
        value={`${highCount}H / ${mediumCount}M / ${lowCount}L`}
      />
    </Grid>
  );
}
