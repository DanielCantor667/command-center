import type { z } from 'zod';
import type { analyticsSchema, insightSchema, rankingSchema, recommendationSchema } from './analytics.schema';

export type Ranking = z.infer<typeof rankingSchema>;
export type Insight = z.infer<typeof insightSchema>;
export type Recommendation = z.infer<typeof recommendationSchema>;
export type Analytics = z.infer<typeof analyticsSchema>;
export type ProjectAnalytics = Analytics['projects'];
export type TechnologyAnalytics = Analytics['technologies'];
export type ArchitectureAnalytics = Analytics['architecture'];
export type CapabilityAnalytics = Analytics['capabilities'];
export type DecisionAnalytics = Analytics['engineering'];
export type LessonAnalytics = Analytics['lessons'];
export type MissionAnalytics = Analytics['mission'];
export type GlobalAnalytics = Analytics['global'];
