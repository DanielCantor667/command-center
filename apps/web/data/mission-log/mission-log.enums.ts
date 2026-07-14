export const MILESTONE_CATEGORY = {
  FirstExperience: 'first-experience',
  ArchitectureShift: 'architecture-shift',
  MajorProject: 'major-project',
  LearningMilestone: 'learning-milestone',
  ProcessChange: 'process-change',
  ToolingAdoption: 'tooling-adoption',
} as const;

export type MilestoneCategory =
  (typeof MILESTONE_CATEGORY)[keyof typeof MILESTONE_CATEGORY];
