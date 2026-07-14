import { z } from 'zod';

export const confidenceLevelSchema = z.enum(['low', 'medium', 'high']);

export const capabilityEvidenceSchema = z
  .object({
    projects: z.number().nonnegative(),
    architecturePatterns: z.number().nonnegative(),
    engineeringDecisions: z.number().nonnegative(),
    lessonsLearned: z.number().nonnegative(),
  })
  .readonly();

export const capabilitySchema = z
  .object({
    name: z.string().min(1),
    evidence: capabilityEvidenceSchema,
    confidence: confidenceLevelSchema,
  })
  .readonly();

export const technologyExperienceSchema = z
  .object({
    technology: z.string().min(1),
    kind: z.string().min(1),
    projects: z.number().nonnegative(),
    architecturePatterns: z.array(z.string()).readonly(),
    engineeringDecisions: z.number().nonnegative(),
    missionLogReferences: z.number().nonnegative(),
    learningMilestones: z.number().nonnegative(),
    confidence: confidenceLevelSchema,
  })
  .readonly();

export const architectureProfileSchema = z
  .object({
    pattern: z.string().min(1),
    projects: z.number().nonnegative(),
    decisions: z.number().nonnegative(),
    lessons: z.number().nonnegative(),
    milestones: z.number().nonnegative(),
  })
  .readonly();

export const impactCountSchema = z
  .object({
    low: z.number().nonnegative(),
    medium: z.number().nonnegative(),
    high: z.number().nonnegative(),
  })
  .readonly();

export const engineeringProfileSchema = z
  .object({
    totalDecisions: z.number().nonnegative(),
    byImpact: impactCountSchema,
  })
  .readonly();

export const learningProfileSchema = z
  .object({
    totalLessons: z.number().nonnegative(),
    byCategory: z.record(z.string(), z.number().nonnegative()),
  })
  .readonly();

export const evidenceStatisticsSchema = z
  .object({
    projects: z.number().nonnegative(),
    featuredProjects: z.number().nonnegative(),
    technologies: z.number().nonnegative(),
    architecturePatterns: z.number().nonnegative(),
    engineeringDecisions: z.number().nonnegative(),
    lessons: z.number().nonnegative(),
    milestones: z.number().nonnegative(),
  })
  .readonly();

export const evidenceSchema = z
  .object({
    capabilities: z.array(capabilitySchema).readonly(),
    technologyExperiences: z.array(technologyExperienceSchema).readonly(),
    architectureProfiles: z.array(architectureProfileSchema).readonly(),
    engineeringProfile: engineeringProfileSchema,
    learningProfile: learningProfileSchema,
    statistics: evidenceStatisticsSchema,
  })
  .readonly();
