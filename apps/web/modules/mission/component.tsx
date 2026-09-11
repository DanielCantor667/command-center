'use client';

import { useMemo, useState } from 'react';
import { Divider, Stack, Typography } from '@command-center/ui';
import { MILESTONES } from '../../data/mission-log';
import { EmptyState } from './components/empty-state';
import { Filters } from './components/filters';
import type { MissionFiltersState } from './components/filters';
import { Timeline } from './components/timeline';

const DEFAULT_FILTERS: MissionFiltersState = {
  architecture: '',
  technology: '',
  year: '',
  project: '',
};

export function MissionModule() {
  const [filters, setFilters] = useState<MissionFiltersState>(DEFAULT_FILTERS);

  const filteredMilestones = useMemo(() => {
    return MILESTONES.filter((m) => {
      if (filters.year && m.date.slice(0, 4) !== filters.year) return false;
      if (
        filters.architecture &&
        !m.architecture.includes(filters.architecture as never)
      )
        return false;
      if (
        filters.technology &&
        !m.technologies.some((t) => t.name === filters.technology)
      )
        return false;
      if (filters.project && !m.relatedProjects.includes(filters.project))
        return false;
      return true;
    });
  }, [filters]);

  return (
    <Stack direction="vertical" gap="lg">
      <Stack direction="vertical" gap="sm">
        <Typography as="h1" variant="display-l" color="primary">
          Bitácora
        </Typography>
        <Typography as="p" variant="body" color="secondary">
          Engineering milestones that shaped how I build software.
        </Typography>
      </Stack>

      <Divider />

      <Filters filters={filters} onChange={setFilters} />

      {filteredMilestones.length > 0 ? (
        <Timeline milestones={filteredMilestones} />
      ) : (
        <EmptyState />
      )}
    </Stack>
  );
}
