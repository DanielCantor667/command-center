import { Grid, Panel, Stack, Typography } from '@command-center/ui';

import type { EvidenceStatistics } from '../../../../domain/evidence';

interface StatisticsProps {
  stats: EvidenceStatistics;
}

function StatBox({ label, value }: { label: string; value: number }) {
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

export function Statistics({ stats }: StatisticsProps) {
  return (
    <Grid columns={3} gap="sm">
      <StatBox label="Projects" value={stats.projects} />
      <StatBox label="Featured" value={stats.featuredProjects} />
      <StatBox label="Technologies" value={stats.technologies} />
      <StatBox
        label="Architecture Patterns"
        value={stats.architecturePatterns}
      />
      <StatBox
        label="Engineering Decisions"
        value={stats.engineeringDecisions}
      />
      <StatBox label="Lessons" value={stats.lessons} />
      <StatBox label="Milestones" value={stats.milestones} />
    </Grid>
  );
}
