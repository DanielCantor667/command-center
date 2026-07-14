'use client';

import { useMemo } from 'react';
import { Divider, Stack, Typography } from '@command-center/ui';

import { getEvidence } from '../../domain/evidence';

import { CapabilityOverview } from './components/capability-overview';
import { CapabilityGroup } from './components/capability-group';
import { TechnologyProfile } from './components/technology-profile';
import { ArchitectureProfile } from './components/architecture-profile';
import { LearningProfile } from './components/learning-profile';
import { Statistics } from './components/statistics';
import { EmptyState } from './components/empty-state';

export function CapabilitiesModule() {
  const evidence = useMemo(() => getEvidence(), []);

  if (evidence.capabilities.length === 0) {
    return <EmptyState />;
  }

  return (
    <Stack direction="vertical" gap="xl">
      <Typography variant="display-l">Capabilities</Typography>

      <CapabilityOverview evidence={evidence} />
      <Divider />

      <Typography variant="heading-l">Capability Groups</Typography>
      <CapabilityGroup capabilities={evidence.capabilities} />
      <Divider />

      <Typography variant="heading-l">Technology Profile</Typography>
      <TechnologyProfile experiences={evidence.technologyExperiences} />
      <Divider />

      <Typography variant="heading-l">Architecture Experience</Typography>
      <ArchitectureProfile profiles={evidence.architectureProfiles} />
      <Divider />

      <Typography variant="heading-l">Learning Profile</Typography>
      <LearningProfile profile={evidence.learningProfile} />
      <Divider />

      <Typography variant="heading-l">Statistics</Typography>
      <Statistics stats={evidence.statistics} />
    </Stack>
  );
}
