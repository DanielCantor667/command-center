import { Stack } from '@command-center/ui';
import type { Milestone } from '../../../../data/mission-log';
import { TimelineItem } from '../timeline-item';

interface TimelineProps {
  milestones: readonly Milestone[];
}

export function Timeline({ milestones }: TimelineProps) {
  return (
    <Stack direction="vertical" gap="md">
      {milestones.map((milestone) => (
        <TimelineItem key={milestone.id} milestone={milestone} />
      ))}
    </Stack>
  );
}
