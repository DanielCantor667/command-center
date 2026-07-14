import { Panel, Stack, Typography } from '@command-center/ui';
import type { Project } from '../../../../data/projects';

interface LessonsLearnedProps {
  project: Project;
}

export function LessonsLearned({ project }: LessonsLearnedProps) {
  if (project.lessonsLearned.length === 0) return null;

  return (
    <Stack direction="vertical" gap="sm">
      <Typography as="h3" variant="heading-m" color="primary">
        Lessons Learned
      </Typography>
      <Stack direction="vertical" gap="md">
        {project.lessonsLearned.map((lesson) => (
          <Panel key={lesson.title} variant="subtle" border padding="md">
            <Stack direction="vertical" gap="xs">
              <Typography as="h4" variant="title" color="primary">
                {lesson.title}
              </Typography>
              <Typography as="p" variant="body" color="secondary">
                {lesson.description}
              </Typography>
              <Typography as="span" variant="body-small" color="muted">
                Category: {lesson.category}
              </Typography>
            </Stack>
          </Panel>
        ))}
      </Stack>
    </Stack>
  );
}
