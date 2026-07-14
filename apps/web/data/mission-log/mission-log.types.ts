import type { z } from 'zod';

import type {
  milestoneSchema,
  technicalDecisionSchema,
  lessonSchema,
} from './mission-log.schema';

export type Milestone = z.infer<typeof milestoneSchema>;
export type TechnicalDecision = z.infer<typeof technicalDecisionSchema>;
export type MilestoneLesson = z.infer<typeof lessonSchema>;
