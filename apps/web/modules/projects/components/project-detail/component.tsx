import Image from 'next/image';
import { Divider, Stack, Typography } from '@command-center/ui';
import type { Project } from '../../../../data/projects';
import { EngineeringDecisions } from '../engineering-decisions';
import { LessonsLearned } from '../lessons-learned';
import { ProjectArchitecture } from '../project-architecture';
import { ProjectFeatures } from '../project-features';
import { ProjectHeader } from '../project-header';
import { ProjectTechnologies } from '../project-technologies';
import { RelatedProjects } from '../related-projects';

interface ProjectDetailProps {
  project: Project;
  onRelatedSelect: (id: string) => void;
}

export function ProjectDetail({ project, onRelatedSelect }: ProjectDetailProps) {
  return (
    <Stack direction="vertical" gap="lg">
      <Divider />
      <ProjectHeader project={project} />
      {project.media.length > 0 && (
        <section aria-label={`Capturas de ${project.name}`} className="grid gap-16 tablet:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]">
          {project.media.filter((media) => media.type === 'image').map((media) => (
            <figure key={media.url} className="min-w-0">
              <a href={media.url} target="_blank" rel="noreferrer" aria-label={`Ampliar ${media.alt}`}>
                <Image src={media.url} alt={media.alt} width={media.featured ? 1440 : 390} height={media.featured ? 1000 : 844} sizes={media.featured ? '(max-width: 768px) 100vw, 70vw' : '(max-width: 768px) 100vw, 25vw'} className="h-auto w-full rounded-lg border border-panel-border" />
              </a>
              <figcaption className="mt-8 text-xs text-text-secondary">{media.caption}</figcaption>
            </figure>
          ))}
        </section>
      )}
      <Typography as="p" variant="body" color="secondary">{project.description}</Typography>
      {project.engineeringDecisions.length === 0 && <Typography as="p" variant="body-small" color="muted">Decisiones y aprendizajes: sin evidencia documentada por ahora.</Typography>}
      <ProjectArchitecture project={project} />
      <ProjectTechnologies project={project} />
      <ProjectFeatures project={project} />
      <EngineeringDecisions project={project} />
      <LessonsLearned project={project} />
      <RelatedProjects project={project} onSelect={onRelatedSelect} />
    </Stack>
  );
}
