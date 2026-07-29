import { Panel, Stack, Typography } from '@command-center/ui';
import { PUBLIC_PROFILE } from '../../data/public-profile';

export function CommunicationModule() {
  return (
    <Stack direction="vertical" gap="xl" className="max-w-4xl">
      <Stack direction="vertical" gap="sm">
        <Typography as="h1" variant="display-l">Hablemos</Typography>
        <Typography as="p" variant="heading-m" color="accent">Disponible para proyectos freelance</Typography>
        <Typography as="p" variant="body" color="secondary">{PUBLIC_PROFILE.availability}</Typography>
      </Stack>
      <Panel variant="subtle" border padding="lg" elevation="medium">
        <Stack direction="vertical" gap="md">
          <Typography as="h2" variant="heading-m">Canales profesionales</Typography>
          <Typography as="p" variant="body" color="secondary">Mientras se habilita el correo corporativo, la forma más directa de iniciar una conversación es por LinkedIn. También puedes revisar el código y proyectos públicos en GitHub.</Typography>
          <Stack direction="horizontal" gap="sm" wrap>
            <a className="inline-flex h-40 items-center rounded-md bg-accent px-16 text-sm font-medium text-background-primary transition hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-focus-ring focus-visible:outline-offset-2" href={PUBLIC_PROFILE.linkedin} target="_blank" rel="noreferrer">Escribir por LinkedIn <span aria-hidden="true">↗</span></a>
            <a className="inline-flex h-40 items-center rounded-md border border-panel-border bg-surface-secondary px-16 text-sm font-medium text-text-primary transition hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-focus-ring focus-visible:outline-offset-2" href={PUBLIC_PROFILE.github} target="_blank" rel="noreferrer">Ver GitHub <span aria-hidden="true">↗</span></a>
          </Stack>
        </Stack>
      </Panel>
      <Typography variant="body-small" color="muted">{PUBLIC_PROFILE.location} · Respondo por LinkedIn mientras se habilita el correo corporativo.</Typography>
    </Stack>
  );
}
