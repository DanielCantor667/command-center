import { Panel, Stack, Typography } from '@command-center/ui';
import type { Project } from '../../../../data/projects';

interface EngineeringDecisionsProps {
  project: Project;
}

export function EngineeringDecisions({ project }: EngineeringDecisionsProps) {
  if (project.engineeringDecisions.length === 0) return null;

  return (
    <Stack direction="vertical" gap="md">
      <Typography as="h3" variant="heading-m" color="primary">
        Engineering Decisions
      </Typography>
      <Stack direction="vertical" gap="md">
        {project.engineeringDecisions.map((decision) => (
          <Panel key={decision.title} variant="subtle" border padding="md">
            <Stack direction="vertical" gap="sm">
              <Typography as="h4" variant="title" color="primary">
                {decision.title}
              </Typography>
              <Stack direction="vertical" gap="xs">
                <Typography as="span" variant="body-small" color="muted">
                  Context
                </Typography>
                <Typography as="p" variant="body" color="secondary">
                  {decision.context}
                </Typography>
              </Stack>
              <Stack direction="vertical" gap="xs">
                <Typography as="span" variant="body-small" color="muted">
                  Decision
                </Typography>
                <Typography as="p" variant="body" color="primary">
                  {decision.decision}
                </Typography>
              </Stack>
              <Stack direction="vertical" gap="xs">
                <Typography as="span" variant="body-small" color="muted">
                  Reasoning
                </Typography>
                <Typography as="p" variant="body" color="secondary">
                  {decision.reasoning}
                </Typography>
              </Stack>
              <Stack direction="horizontal" gap="sm" align="center">
                <Typography as="span" variant="body-small" color="muted">
                  Impact:
                </Typography>
                <Typography as="span" variant="body-small" color="accent">
                  {decision.impact}
                </Typography>
              </Stack>
            </Stack>
          </Panel>
        ))}
      </Stack>
    </Stack>
  );
}
