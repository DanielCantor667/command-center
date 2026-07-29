import { Grid, Panel, Stack, Typography } from '@command-center/ui';
import { getAnalytics } from '../../domain/analytics';
import { PUBLIC_PROFILE } from '../../data/public-profile';

export function ProfileModule() {
  const analytics = getAnalytics();
  return (
    <Stack direction="vertical" gap="xl">
      <Stack direction="vertical" gap="sm">
        <Typography as="h1" variant="display-l">{PUBLIC_PROFILE.name}</Typography>
        <Typography variant="heading-m" color="accent">{PUBLIC_PROFILE.role}</Typography>
        <Typography as="p" variant="body" color="secondary">Diseño productos y sistemas de ingeniería que hacen visible cómo se tomaron las decisiones, qué evidencia las respalda y cómo evoluciona el conocimiento.</Typography>
      </Stack>
      <Grid columns={{ base: 1, tablet: 3 }} gap="md">
        <Panel><Stack direction="vertical" gap="xs"><Typography variant="body" color="muted">Base</Typography><Typography variant="heading-m">{PUBLIC_PROFILE.location}</Typography></Stack></Panel>
        <Panel><Stack direction="vertical" gap="xs"><Typography variant="body" color="muted">Foco</Typography><Typography variant="heading-m">Arquitectura & producto</Typography></Stack></Panel>
        <Panel><Stack direction="vertical" gap="xs"><Typography variant="body" color="muted">Disponibilidad</Typography><Typography variant="heading-m">Freelance</Typography></Stack></Panel>
      </Grid>
      <Stack direction="horizontal" gap="sm" wrap>
        <a className="text-accent underline underline-offset-4" href={PUBLIC_PROFILE.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a>
        <a className="text-accent underline underline-offset-4" href={PUBLIC_PROFILE.github} target="_blank" rel="noreferrer">GitHub ↗</a>
      </Stack>
      <Panel><Stack direction="vertical" gap="sm"><Typography variant="heading-m">Huella verificable</Typography><Typography variant="body" color="secondary">{analytics.projects.totalProjects} proyectos documentados, {analytics.engineering.totalEngineeringDecisions} decisiones de ingeniería, {analytics.lessons.totalLessons} lecciones y {analytics.global.edges} relaciones en el grafo.</Typography></Stack></Panel>
    </Stack>
  );
}
