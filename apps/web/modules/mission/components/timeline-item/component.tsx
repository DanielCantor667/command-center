import { useState } from 'react';
import { Panel, Stack, Typography } from '@command-center/ui';
import type { Milestone } from '../../../../data/mission-log';
import { MilestoneDetail } from '../milestone';
import { ProjectReference } from '../project-reference';

interface TimelineItemProps {
  milestone: Milestone;
}

export function TimelineItem({ milestone }: TimelineItemProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Panel variant="subtle" border padding="md">
      <Stack direction="vertical" gap="md">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          className="w-full text-left cursor-pointer"
        >
          <Stack direction="vertical" gap="xs">
            <Stack direction="horizontal" gap="sm" align="center" wrap>
              <Typography as="span" variant="body-small" color="muted">
                {milestone.date}
              </Typography>
              <Typography as="h2" variant="heading-m" color="primary">
                {milestone.title}
              </Typography>
              <Typography as="span" variant="caption" color="accent">
                {milestone.category}
              </Typography>
            </Stack>
            <Typography as="p" variant="body" color="secondary">
              {milestone.summary}
            </Typography>
            {milestone.relatedProjects.length > 0 && (
              <Stack direction="horizontal" gap="md" wrap>
                {milestone.relatedProjects.map((id) => (
                  <ProjectReference key={id} projectId={id} />
                ))}
              </Stack>
            )}
          </Stack>
        </button>

        {expanded && <MilestoneDetail milestone={milestone} />}
      </Stack>
    </Panel>
  );
}
