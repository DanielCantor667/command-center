import { Panel, Stack, Typography } from '@command-center/ui';

import type { Capability } from '../../../../domain/evidence';

interface CapabilityCardProps {
  capability: Capability;
}

function EvidenceRow({ label, value }: { label: string; value: number }) {
  return (
    <Stack direction="horizontal" gap="xs" justify="between">
      <Typography variant="mono-small" color="secondary">
        {label}
      </Typography>
      <Typography variant="mono-small">{value}</Typography>
    </Stack>
  );
}

export function CapabilityCard({ capability }: CapabilityCardProps) {
  return (
    <Panel variant="default" border padding="md">
      <Stack direction="vertical" gap="sm">
        <Stack direction="horizontal" gap="sm" align="center">
          <Typography variant="heading-m">{capability.name}</Typography>
          <Typography
            variant="body-small"
            color={
              capability.confidence === 'high'
                ? 'accent'
                : capability.confidence === 'medium'
                  ? 'secondary'
                  : 'muted'
            }
          >
            {capability.confidence.toUpperCase()}
          </Typography>
        </Stack>

        <Stack direction="vertical" gap="xs">
          <EvidenceRow label="Projects" value={capability.evidence.projects} />
          <EvidenceRow
            label="Architecture Patterns"
            value={capability.evidence.architecturePatterns}
          />
          <EvidenceRow
            label="Engineering Decisions"
            value={capability.evidence.engineeringDecisions}
          />
          <EvidenceRow
            label="Lessons Learned"
            value={capability.evidence.lessonsLearned}
          />
        </Stack>
      </Stack>
    </Panel>
  );
}
