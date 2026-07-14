import { Divider, Stack } from '@command-center/ui';
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
      <ProjectArchitecture project={project} />
      <ProjectTechnologies project={project} />
      <ProjectFeatures project={project} />
      <EngineeringDecisions project={project} />
      <LessonsLearned project={project} />
      <RelatedProjects project={project} onSelect={onRelatedSelect} />
    </Stack>
  );
}
