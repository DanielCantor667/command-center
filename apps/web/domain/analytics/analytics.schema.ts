import { z } from 'zod';

export const rankingSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  value: z.number().nonnegative(),
  detail: z.string().optional(),
}).readonly();

export const insightSchema = z.object({
  id: z.string().min(1),
  category: z.string().min(1),
  severity: z.enum(['info', 'opportunity']),
  title: z.string().min(1),
  description: z.string().min(1),
  relatedNodeIds: z.array(z.string()).readonly(),
}).readonly();

export const recommendationSchema = z.object({
  id: z.string().min(1),
  priority: z.enum(['low', 'medium', 'high']),
  title: z.string().min(1),
  description: z.string().min(1),
  relatedNodeIds: z.array(z.string()).readonly(),
}).readonly();

export const analyticsSchema = z.object({
  generatedAt: z.string(),
  projects: z.object({ totalProjects: z.number(), publicProjects: z.number(), featuredProjects: z.number(), projectsByStatus: z.record(z.string(), z.number()), rankings: z.array(rankingSchema).readonly() }).readonly(),
  technologies: z.object({ totalTechnologies: z.number(), technologiesPerProject: z.number(), mostUsedTechnologies: z.array(rankingSchema).readonly(), leastUsedTechnologies: z.array(rankingSchema).readonly() }).readonly(),
  architecture: z.object({ totalPatterns: z.number(), patternsPerProject: z.number(), architectureUsage: z.array(rankingSchema).readonly(), mostCommonPattern: rankingSchema.nullable() }).readonly(),
  engineering: z.object({ totalEngineeringDecisions: z.number(), decisionsPerProject: z.number(), sharedDecisions: z.array(rankingSchema).readonly() }).readonly(),
  lessons: z.object({ totalLessons: z.number(), lessonsPerProject: z.number(), lessonCategories: z.record(z.string(), z.number()) }).readonly(),
  challenges: z.object({ totalChallenges: z.number(), challengesPerProject: z.number() }).readonly(),
  capabilities: z.object({ totalCapabilities: z.number(), strongestCapabilities: z.array(rankingSchema).readonly(), weakestCapabilities: z.array(rankingSchema).readonly(), capabilitiesPerProject: z.number() }).readonly(),
  mission: z.object({ totalMilestones: z.number(), milestonesPerProject: z.number() }).readonly(),
  global: z.object({ nodes: z.number(), edges: z.number(), mostConnectedProjects: z.array(rankingSchema).readonly(), mostConnectedTechnologies: z.array(rankingSchema).readonly() }).readonly(),
  insights: z.array(insightSchema).readonly(),
  recommendations: z.array(recommendationSchema).readonly(),
}).readonly();
