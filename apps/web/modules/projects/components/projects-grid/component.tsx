import { useMemo } from 'react';
import { Divider, Grid, Typography } from '@command-center/ui';
import { PROJECTS } from '../../../../data/projects';
import { ProjectCard } from '../project-card';

interface ProjectsGridProps {
  onSelect: (id: string) => void;
}

export function ProjectsGrid({ onSelect }: ProjectsGridProps) {
  const sortedProjects = useMemo(
    () =>
      [...PROJECTS]
        .filter((p) => p.public)
        .sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return b.lastUpdated.localeCompare(a.lastUpdated);
        }),
    [],
  );

  if (sortedProjects.length === 0) return null;

  return (
    <>
      <Divider />
      <Typography as="h2" variant="heading-l" color="primary">
        Projects
      </Typography>
      <Grid columns={{ base: 1, tablet: 2, laptop: 3 }} gap="md">
        {sortedProjects.map((project) => (
          <ProjectCard key={project.id} project={project} onSelect={onSelect} />
        ))}
      </Grid>
    </>
  );
}
