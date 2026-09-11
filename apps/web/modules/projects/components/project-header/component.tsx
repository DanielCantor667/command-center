import { Stack, Typography } from '@command-center/ui';
import type { Project } from '../../../../data/projects';

interface ProjectHeaderProps {
  project: Project;
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  return (
    <Stack direction="vertical" gap="xs">
      <Typography as="h2" variant="display-l" color="primary">
        {project.name}
      </Typography>
      <Typography as="p" variant="heading-m" color="secondary">
        {project.tagline}
      </Typography>
      <Typography as="p" variant="body" color="secondary">{project.summary}</Typography>
      <Stack direction="horizontal" gap="md" wrap>
        <Typography as="span" variant="body-small" color="muted">
          Estado: {project.status}
        </Typography>
        <Typography as="span" variant="body-small" color="muted">
          Rol: {project.role.title}
        </Typography>
        <Typography as="span" variant="body-small" color="muted">
          Inicio: {project.startedAt}
        </Typography>
        {project.completedAt && (
          <Typography as="span" variant="body-small" color="muted">
            Completado: {project.completedAt}
          </Typography>
        )}
        <Typography as="span" variant="body-small" color="muted">
          Propiedad: {project.ownership.type === 'unconfirmed' ? 'Por confirmar' : project.ownership.type}
        </Typography>
      </Stack>
      {(project.links.repository || project.links.live || project.links.documentation) && (
        <Stack direction="horizontal" gap="sm" wrap>
          {project.links.repository && <a className="text-sm font-medium text-accent underline underline-offset-4" href={project.links.repository} target="_blank" rel="noreferrer">Repositorio ↗</a>}
          {project.links.live && <a className="text-sm font-medium text-accent underline underline-offset-4" href={project.links.live} target="_blank" rel="noreferrer">Visitar sitio ↗</a>}
          {project.links.documentation && <a className="text-sm font-medium text-accent underline underline-offset-4" href={project.links.documentation} target="_blank" rel="noreferrer">Documentación ↗</a>}
        </Stack>
      )}
      {!project.links.repository && !project.links.live && !project.links.documentation && (
        <Typography as="p" variant="body-small" color="muted">
          Caso de estudio documentado. Los enlaces públicos se comparten cuando el proyecto y sus permisos lo permiten.
        </Typography>
      )}
    </Stack>
  );
}
