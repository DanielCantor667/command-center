import { Stack, Typography } from '@command-center/ui';
import type { TechnicalDecision } from '../../../../data/mission-log';

interface DecisionProps {
  decision: TechnicalDecision;
}

export function Decision({ decision }: DecisionProps) {
  return (
    <Stack direction="vertical" gap="sm">
      <Stack direction="horizontal" gap="sm" align="center">
        <Typography as="h4" variant="title" color="primary">
          {decision.title}
        </Typography>
        {decision.projectId && (
          <Typography as="span" variant="body-small" color="accent">
            (from project: {decision.projectId})
          </Typography>
        )}
      </Stack>
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
      <Typography as="span" variant="body-small" color="muted">
        Impact: {decision.impact}
      </Typography>
    </Stack>
  );
}
