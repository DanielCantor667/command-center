import type { z } from 'zod';

import type {
  challengeSchema,
  engineeringDecisionSchema,
  featureSchema,
  lessonLearnedSchema,
  projectLinksSchema,
  projectMediaSchema,
  projectMetadataSchema,
  projectMetricsSchema,
  projectOwnershipSchema,
  projectRelationshipsSchema,
  projectRoleSchema,
  projectSchema,
  technologySchema,
} from './project.schema';

export type Technology = z.infer<typeof technologySchema>;
export type Feature = z.infer<typeof featureSchema>;
export type Challenge = z.infer<typeof challengeSchema>;
export type EngineeringDecision = z.infer<typeof engineeringDecisionSchema>;
export type LessonLearned = z.infer<typeof lessonLearnedSchema>;
export type ProjectMetrics = z.infer<typeof projectMetricsSchema>;
export type ProjectMedia = z.infer<typeof projectMediaSchema>;
export type ProjectLinks = z.infer<typeof projectLinksSchema>;
export type ProjectRole = z.infer<typeof projectRoleSchema>;
export type ProjectRelationships = z.infer<typeof projectRelationshipsSchema>;
export type ProjectMetadata = z.infer<typeof projectMetadataSchema>;
export type ProjectOwnership = z.infer<typeof projectOwnershipSchema>;
export type Project = z.infer<typeof projectSchema>;
