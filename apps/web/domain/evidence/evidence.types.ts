import type { z } from 'zod';

import type {
  confidenceLevelSchema,
  capabilityEvidenceSchema,
  capabilitySchema,
  technologyExperienceSchema,
  architectureProfileSchema,
  engineeringProfileSchema,
  learningProfileSchema,
  evidenceStatisticsSchema,
  evidenceSchema,
} from './evidence.schema';

export type ConfidenceLevel = z.infer<typeof confidenceLevelSchema>;

export type CapabilityEvidence = z.infer<typeof capabilityEvidenceSchema>;

export type Capability = z.infer<typeof capabilitySchema>;

export type TechnologyExperience = z.infer<typeof technologyExperienceSchema>;

export type ArchitectureProfile = z.infer<typeof architectureProfileSchema>;

export type EngineeringProfile = z.infer<typeof engineeringProfileSchema>;

export type LearningProfile = z.infer<typeof learningProfileSchema>;

export type EvidenceStatistics = z.infer<typeof evidenceStatisticsSchema>;

export type Evidence = z.infer<typeof evidenceSchema>;
