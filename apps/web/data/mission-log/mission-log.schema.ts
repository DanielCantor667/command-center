import { z } from 'zod';

import {
  ARCHITECTURE_PATTERN,
  DECISION_IMPACT,
  LESSON_CATEGORY,
  TECHNOLOGY_KIND,
  TECHNOLOGY_LEVEL,
} from '../projects/project.enums';
import { MILESTONE_CATEGORY } from './mission-log.enums';

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const nonEmptyString = z.string().min(1);
const isoDate = z.string().regex(ISO_DATE_PATTERN, 'Expected ISO date (YYYY-MM-DD)');

export const technologySchema = z
  .object({
    name: nonEmptyString,
    kind: z.enum(TECHNOLOGY_KIND),
    level: z.enum(TECHNOLOGY_LEVEL),
  })
  .readonly();

export const lessonSchema = z
  .object({
    title: nonEmptyString,
    description: nonEmptyString,
    category: z.enum(LESSON_CATEGORY),
  })
  .readonly();

export const technicalDecisionSchema = z
  .object({
    title: nonEmptyString,
    context: nonEmptyString,
    decision: nonEmptyString,
    reasoning: nonEmptyString,
    impact: z.enum(DECISION_IMPACT),
    projectId: nonEmptyString.optional(),
  })
  .readonly();

export const milestoneSchema = z
  .object({
    id: nonEmptyString,
    title: nonEmptyString,
    date: isoDate,
    category: z.enum(MILESTONE_CATEGORY),
    summary: nonEmptyString,
    description: nonEmptyString,
    technologies: z.array(technologySchema).readonly(),
    architecture: z.array(z.enum(ARCHITECTURE_PATTERN)).readonly(),
    relatedProjects: z.array(nonEmptyString).readonly(),
    lessons: z.array(lessonSchema).readonly(),
    technicalDecisions: z.array(technicalDecisionSchema).readonly(),
    outcome: nonEmptyString,
  })
  .readonly();
