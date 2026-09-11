'use client';

import { Button, Divider, Grid, Panel, Stack, Typography } from '@command-center/ui';
import { useMemo, useState } from 'react';
import { getAnalytics } from '../../domain/analytics';
import { KNOWLEDGE_GRAPH } from '../../domain/knowledge-graph';
import { findNodes } from '../../domain/knowledge-graph/query';

function Metric({ label, value }: { label: string; value: string | number }) {
  return <Panel><Stack direction="vertical" gap="xs"><Typography variant="body" color="muted">{label}</Typography><Typography variant="heading-l">{value}</Typography></Stack></Panel>;
}

export function AnalyticsModule() {
  const analytics = useMemo(() => getAnalytics(), []);
  const [query, setQuery] = useState('');
  const searchResults = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return [];
    return findNodes(KNOWLEDGE_GRAPH, (node) =>
      node.label.toLocaleLowerCase().includes(normalized) || node.type.toLocaleLowerCase().includes(normalized),
    ).slice(0, 12);
  }, [query]);
  const exportSnapshot = () => {
    const blob = new Blob([JSON.stringify(analytics, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'command-center-analytics.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };
  return (
    <Stack direction="vertical" gap="xl">
      <Stack direction="vertical" gap="sm">
        <Typography as="h1" variant="display-l">Análisis del portafolio</Typography>
        <Typography as="p" variant="body" color="secondary">Proyectos, tecnologías y decisiones a partir de la documentación disponible.</Typography>
        <Stack direction="horizontal" gap="sm">
          <Button variant="secondary" size="sm" onClick={exportSnapshot}>Exportar JSON</Button>
        </Stack>
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
        <Panel><Stack direction="vertical" gap="md"><Typography variant="heading-m">Lecturas de los datos</Typography>{analytics.insights.map((item) => <Stack key={item.id} direction="vertical" gap="xs"><Typography variant="body" color="accent">{item.title}</Typography><Typography variant="body" color="muted">{item.description}</Typography></Stack>)}</Stack></Panel>
        <Panel><Stack direction="vertical" gap="md"><Typography variant="heading-m">Siguientes mejoras de evidencia</Typography>{analytics.recommendations.length ? analytics.recommendations.map((item) => <Stack key={item.id} direction="vertical" gap="xs"><Typography variant="body" color="accent">{item.title}</Typography><Typography variant="body" color="muted">{item.description}</Typography></Stack>) : <Typography variant="body" color="muted">No hay vacíos críticos detectados.</Typography>}</Stack></Panel>
      </Grid>
      <Divider />
      <Panel>
        <Stack direction="vertical" gap="md">
          <Typography variant="heading-m">Buscar en la documentación</Typography>
          <label className="sr-only" htmlFor="knowledge-search">Buscar tecnologías, proyectos o decisiones</label>
          <input id="knowledge-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ej.: Next.js, arquitectura, Kliniu" className="w-full rounded-md border border-panel-border bg-background-primary px-4 py-3 text-text-primary outline-none focus:border-accent" />
          {query.trim() && <Stack direction="vertical" gap="xs">{searchResults.length ? searchResults.map((node) => <Stack key={node.id} direction="horizontal" justify="between"><Typography variant="body">{node.label}</Typography><Typography variant="body" color="muted">{node.type}</Typography></Stack>) : <Typography variant="body" color="muted">No hay nodos que coincidan con la búsqueda.</Typography>}</Stack>}
        </Stack>
      </Panel>
    </Stack>
  );
}
