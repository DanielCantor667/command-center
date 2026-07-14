import { Stack, Surface, Typography } from '@command-center/ui';
import type { Milestone } from '../../../../data/mission-log';
import { Decision } from '../decision';
import { Lesson } from '../lesson';
import { ProjectReference } from '../project-reference';

interface MilestoneDetailProps {
  milestone: Milestone;
}

export function MilestoneDetail({ milestone }: MilestoneDetailProps) {
  return (
    <Stack direction="vertical" gap="lg" className="pt-4">
      <Typography as="p" variant="body" color="secondary">
        {milestone.description}
      </Typography>

      {milestone.architecture.length > 0 && (
        <Stack direction="vertical" gap="sm">
          <Typography as="h3" variant="heading-m" color="primary">
            Architecture
          </Typography>
          <Stack direction="horizontal" gap="sm" wrap>
            {milestone.architecture.map((pattern) => (
              <Surface key={pattern} variant="outlined" padding="sm" radius="sm">
                <Typography as="span" variant="mono-small" color="accent">
                  {pattern}
                </Typography>
              </Surface>
            ))}
          </Stack>
        </Stack>
      )}

      {milestone.technologies.length > 0 && (
        <Stack direction="vertical" gap="sm">
          <Typography as="h3" variant="heading-m" color="primary">
            Technologies
          </Typography>
          <Stack direction="horizontal" gap="sm" wrap>
            {milestone.technologies.map((tech) => (
              <Surface key={tech.name} variant="subtle" padding="sm" radius="sm" border>
                <Typography as="span" variant="body-small" color="primary">
                  {tech.name}
                </Typography>
              </Surface>
            ))}
          </Stack>
        </Stack>
      )}

      {milestone.relatedProjects.length > 0 && (
        <Stack direction="vertical" gap="sm">
          <Typography as="h3" variant="heading-m" color="primary">
            Related Projects
          </Typography>
          <Stack direction="vertical" gap="xs">
            {milestone.relatedProjects.map((id) => (
              <ProjectReference key={id} projectId={id} />
            ))}
          </Stack>
        </Stack>
      )}

      {milestone.technicalDecisions.length > 0 && (
        <Stack direction="vertical" gap="md">
          <Typography as="h3" variant="heading-m" color="primary">
            Technical Decisions
          </Typography>
          {milestone.technicalDecisions.map((decision) => (
            <Decision key={decision.title} decision={decision} />
          ))}
        </Stack>
      )}

      {milestone.lessons.length > 0 && (
        <Stack direction="vertical" gap="md">
          <Typography as="h3" variant="heading-m" color="primary">
            Lessons
          </Typography>
          {milestone.lessons.map((lesson) => (
            <Lesson key={lesson.title} lesson={lesson} />
          ))}
        </Stack>
      )}

      <Stack direction="vertical" gap="sm">
        <Typography as="h3" variant="heading-m" color="primary">
          Outcome
        </Typography>
        <Typography as="p" variant="body" color="secondary">
          {milestone.outcome}
        </Typography>
      </Stack>
    </Stack>
  );
}
