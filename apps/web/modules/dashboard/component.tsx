'use client';

import { Grid, Stack } from '@command-center/ui';
import { useMemo } from 'react';
import { HERO_DATA, CURRENT_FOCUS, RECENT_ACTIVITY, SYSTEM_STATUS } from '../../data/dashboard';
import { getAnalytics } from '../../domain/analytics';
import { useWorkspaceStore } from '../../shell/workspace-store';
import { CurrentFocus } from './components/current-focus';
import { Hero } from './components/hero';
import { QuickNavigation } from './components/quick-navigation';
import { QuickStats } from './components/quick-stats';
import { RecentActivity } from './components/recent-activity';
import { SystemStatus } from './components/system-status';

export function DashboardModule() {
  const setCurrentModule = useWorkspaceStore((state) => state.setCurrentModule);
  const analytics = useMemo(() => getAnalytics(), []);
  const quickStats = [
    { label: 'Proyectos públicos', value: String(analytics.projects.publicProjects) },
    { label: 'Decisiones', value: String(analytics.engineering.totalEngineeringDecisions) },
    { label: 'Tecnologías', value: String(analytics.technologies.totalTechnologies) },
    { label: 'Lecciones', value: String(analytics.lessons.totalLessons) },
    { label: 'Relaciones', value: String(analytics.global.edges) },
  ];

  return (
    <Stack direction="vertical" gap="lg" className="command-dashboard">
      <Hero
        name={HERO_DATA.name}
        role={HERO_DATA.role}
        missionStatement={HERO_DATA.missionStatement}
        status={HERO_DATA.status}
        availability={HERO_DATA.availability}
        onCtaClick={() => setCurrentModule('projects')}
      />
      <Grid columns={{ base: 1, laptop: 2 }} gap="lg">
        <QuickStats stats={quickStats} />
        <CurrentFocus title={CURRENT_FOCUS.title} status={CURRENT_FOCUS.status} />
        <RecentActivity items={RECENT_ACTIVITY} />
        <QuickNavigation onNavigate={setCurrentModule} />
      </Grid>
      <SystemStatus items={SYSTEM_STATUS} />
    </Stack>
  );
}
