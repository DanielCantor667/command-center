'use client';

import { Divider, Grid, Panel, Stack, Typography } from '@command-center/ui';
import { useMemo } from 'react';
import { getAnalytics } from '../../domain/analytics';

function Metric({ label, value }: { label: string; value: string | number }) {
  return <Panel><Stack direction="vertical" gap="xs"><Typography variant="body" color="muted">{label}</Typography><Typography variant="heading-l">{value}</Typography></Stack></Panel>;
}

export function AnalyticsModule() {
  const analytics = useMemo(() => getAnalytics(), []);
  return (
    <Stack direction="vertical" gap="xl">
      <Stack direction="vertical" gap="sm">
        <Typography as="h1" variant="display-l">Analytics Command</Typography>
        <Typography as="p" variant="body" color="secondary">Lectura regenerable del Knowledge Graph. No guarda ni inventa datos.</Typography>
      </Stack>
      <Grid columns={{ base: 1, tablet: 2, laptop: 4 }} gap="md">
        <Metric label="Proyectos" value={analytics.projects.totalProjects} />
        <Metric label="Tecnologías" value={analytics.technologies.totalTechnologies} />
        <Metric label="Decisiones" value={analytics.engineering.totalEngineeringDecisions} />
        <Metric label="Relaciones" value={analytics.global.edges} />
      </Grid>
      <Divider />
      <Grid columns={{ base: 1, laptop: 2 }} gap="lg">
        <Panel><Stack direction="vertical" gap="md"><Typography variant="heading-m">Tecnologías con mayor adopción</Typography>{analytics.technologies.mostUsedTechnologies.slice(0, 6).map((item) => <Stack key={item.id} direction="horizontal" justify="between"><Typography variant="body">{item.label}</Typography><Typography variant="body" color="accent">{item.value} proyectos</Typography></Stack>)}</Stack></Panel>
        <Panel><Stack direction="vertical" gap="md"><Typography variant="heading-m">Proyectos más conectados</Typography>{analytics.global.mostConnectedProjects.slice(0, 6).map((item) => <Stack key={item.id} direction="horizontal" justify="between"><Typography variant="body">{item.label}</Typography><Typography variant="body" color="accent">{item.value} conexiones</Typography></Stack>)}</Stack></Panel>
      </Grid>
      <Grid columns={{ base: 1, laptop: 2 }} gap="lg">
        <Panel><Stack direction="vertical" gap="md"><Typography variant="heading-m">Insights derivados</Typography>{analytics.insights.map((item) => <Stack key={item.id} direction="vertical" gap="xs"><Typography variant="body" color="accent">{item.title}</Typography><Typography variant="body" color="muted">{item.description}</Typography></Stack>)}</Stack></Panel>
        <Panel><Stack direction="vertical" gap="md"><Typography variant="heading-m">Siguientes mejoras de evidencia</Typography>{analytics.recommendations.length ? analytics.recommendations.map((item) => <Stack key={item.id} direction="vertical" gap="xs"><Typography variant="body" color="accent">{item.title}</Typography><Typography variant="body" color="muted">{item.description}</Typography></Stack>) : <Typography variant="body" color="muted">No hay vacíos críticos detectados.</Typography>}</Stack></Panel>
      </Grid>
    </Stack>
  );
}
