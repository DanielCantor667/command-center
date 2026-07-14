import { Stack, Typography } from '@command-center/ui';
import type { MilestoneLesson } from '../../../../data/mission-log';

interface LessonProps {
  lesson: MilestoneLesson;
}

export function Lesson({ lesson }: LessonProps) {
  return (
    <Stack direction="vertical" gap="xs">
      <Typography as="h4" variant="title" color="primary">
        {lesson.title}
      </Typography>
      <Typography as="p" variant="body" color="secondary">
        {lesson.description}
      </Typography>
      <Typography as="span" variant="body-small" color="muted">
        {lesson.category}
      </Typography>
    </Stack>
  );
}
