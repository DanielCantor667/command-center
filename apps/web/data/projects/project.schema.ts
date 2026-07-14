import { z } from 'zod';

import {
  ARCHITECTURE_PATTERN,
  DECISION_IMPACT,
  LESSON_CATEGORY,
  MEDIA_TYPE,
  OWNERSHIP_TYPE,
  PROJECT_STATUS,
  TECHNOLOGY_KIND,
  TECHNOLOGY_LEVEL,
} from './project.enums';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const nonEmptyString = z.string().min(1);
const isoDate = z.string().regex(ISO_DATE_PATTERN, 'Expected ISO date (YYYY-MM-DD)');

export const projectStatusSchema = z.enum(PROJECT_STATUS);

export const technologySchema = z
  .object({
    name: nonEmptyString,
    kind: z.enum(TECHNOLOGY_KIND),
    level: z.enum(TECHNOLOGY_LEVEL),
  })
  .readonly();

export const architecturePatternSchema = z.enum(ARCHITECTURE_PATTERN);

export const featureSchema = z
  .object({
    title: nonEmptyString,
    description: nonEmptyString,
  })
  .readonly();

export const challengeSchema = z
  .object({
    title: nonEmptyString,
    description: nonEmptyString,
    resolution: nonEmptyString.optional(),
  })
  .readonly();

export const engineeringDecisionSchema = z
  .object({
    title: nonEmptyString,
    context: nonEmptyString,
    decision: nonEmptyString,
    reasoning: nonEmptyString,
    impact: z.enum(DECISION_IMPACT),
  })
  .readonly();

export const lessonLearnedSchema = z
  .object({
    title: nonEmptyString,
    description: nonEmptyString,
    category: z.enum(LESSON_CATEGORY),
  })
  .readonly();

export const projectMetricsSchema = z
  .object({
    commits: z.number().int().nonnegative().nullable(),
    contributors: z.number().int().positive().nullable(),
    durationWeeks: z.number().positive().nullable(),
    modules: z.number().int().nonnegative().nullable(),
    tests: z.number().int().nonnegative().nullable(),
    coverage: z.number().min(0).max(100).nullable(),
  })
  .readonly();

export const projectMediaSchema = z
  .object({
    type: z.enum(MEDIA_TYPE),
    url: z.url(),
    alt: nonEmptyString,
    caption: nonEmptyString.optional(),
    featured: z.boolean(),
  })
  .readonly();

export const projectLinksSchema = z
  .object({
    repository: z.url().optional(),
    live: z.url().optional(),
    documentation: z.url().optional(),
    article: z.url().optional(),
    figma: z.url().optional(),
  })
  .readonly();

export const projectRoleSchema = z
  .object({
    title: nonEmptyString,
    responsibilities: z.array(nonEmptyString).readonly(),
  })
  .readonly();

export const projectRelationshipsSchema = z
  .object({
    relatedProjects: z.array(nonEmptyString).readonly(),
    relatedArticles: z.array(nonEmptyString).readonly(),
    relatedSkills: z.array(nonEmptyString).readonly(),
  })
  .readonly();

export const projectMetadataSchema = z
  .object({
    version: z.literal(1),
  })
  .readonly();

export const projectOwnershipSchema = z
  .object({
    type: z.enum(OWNERSHIP_TYPE),
    confidential: z.boolean(),
  })
  .readonly();

export const projectSchema = z
  .object({
    id: nonEmptyString,
    slug: nonEmptyString.regex(SLUG_PATTERN, 'Expected kebab-case slug'),
    name: nonEmptyString,
    tagline: nonEmptyString,
    summary: nonEmptyString,
    description: nonEmptyString,
    status: projectStatusSchema,
    featured: z.boolean(),
    public: z.boolean(),
    startedAt: isoDate,
    completedAt: isoDate.nullable(),
    lastUpdated: isoDate,
    technologies: z.array(technologySchema).readonly(),
    architecture: z.array(architecturePatternSchema).readonly(),
    features: z.array(featureSchema).readonly(),
    challenges: z.array(challengeSchema).readonly(),
    engineeringDecisions: z.array(engineeringDecisionSchema).readonly(),
    lessonsLearned: z.array(lessonLearnedSchema).readonly(),
    metrics: projectMetricsSchema,
    media: z.array(projectMediaSchema).readonly(),
    links: projectLinksSchema,
    role: projectRoleSchema,
    tags: z.array(nonEmptyString).readonly(),
    relationships: projectRelationshipsSchema,
    metadata: projectMetadataSchema,
    ownership: projectOwnershipSchema,
  })
  .readonly();
