import { Grid, Panel, Stack, Typography } from '@command-center/ui';

import type { LearningProfile as LearningProf } from '../../../../domain/evidence';

interface LearningProfileProps {
  profile: LearningProf;
}

export function LearningProfile({ profile }: LearningProfileProps) {
  const categories = Object.entries(profile.byCategory);

  if (categories.length === 0) return null;

  return (
    <Grid columns={{ base: 1, tablet: 2 }} gap="sm">
      {categories.map(([category, count]) => (
        <Panel key={category} variant="subtle" border padding="md">
          <Stack direction="horizontal" gap="sm" justify="between" align="center">
            <Typography variant="heading-m" color="secondary">
              {category}
            </Typography>
            <Typography variant="display-l">{count}</Typography>
          </Stack>
        </Panel>
      ))}
      <Panel variant="subtle" border padding="md">
        <Stack direction="horizontal" gap="sm" justify="between" align="center">
          <Typography variant="heading-m">Total</Typography>
          <Typography variant="display-l">{profile.totalLessons}</Typography>
        </Stack>
      </Panel>
    </Grid>
  );
}
