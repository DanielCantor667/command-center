import { Grid, Panel, Stack, Typography } from '@command-center/ui';

import type { TechnologyExperience } from '../../../../domain/evidence';

interface TechnologyProfileProps {
  experiences: readonly TechnologyExperience[];
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

export function TechnologyProfile({ experiences }: TechnologyProfileProps) {
  if (experiences.length === 0) return null;

  return (
    <Grid columns={{ base: 1, tablet: 2 }} gap="sm">
      {experiences.map((exp) => (
        <Panel key={exp.technology} variant="default" border padding="md">
          <Stack direction="vertical" gap="sm">
            <Stack direction="horizontal" gap="sm" align="center" wrap>
              <Typography variant="heading-m">{exp.technology}</Typography>
              <Typography variant="body-small" color="muted">
                {exp.kind}
              </Typography>
              <Typography
                variant="body-small"
                color={
                  exp.confidence === 'high'
                    ? 'accent'
                    : exp.confidence === 'medium'
                      ? 'secondary'
                      : 'muted'
                }
              >
                {exp.confidence.toUpperCase()}
              </Typography>
            </Stack>

            <Stack direction="vertical" gap="xs">
              <EvidenceRow label="Projects" value={exp.projects} />
              <EvidenceRow
                label="Engineering Decisions"
                value={exp.engineeringDecisions}
              />
              <EvidenceRow
                label="Mission Log References"
                value={exp.missionLogReferences}
              />
              <EvidenceRow
                label="Learning Milestones"
                value={exp.learningMilestones}
              />
            </Stack>

            {exp.architecturePatterns.length > 0 && (
              <Stack direction="horizontal" gap="xs" wrap>
                <Typography variant="body-small" color="muted">
                  Architecture:
                </Typography>
                {exp.architecturePatterns.map((p) => (
                  <Typography key={p} variant="body-small" color="secondary">
                    {p}
                  </Typography>
                ))}
              </Stack>
            )}
          </Stack>
        </Panel>
      ))}
    </Grid>
  );
}
