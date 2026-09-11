export const PROJECT_STATUS = {
  Planning: 'planning',
  Development: 'development',
  Production: 'production',
  Maintenance: 'maintenance',
  Archived: 'archived',
} as const;

export type ProjectStatus = (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS];

export const TECHNOLOGY_KIND = {
  Language: 'language',
  Framework: 'framework',
  Library: 'library',
  Database: 'database',
  Infrastructure: 'infrastructure',
  Tooling: 'tooling',
  Platform: 'platform',
} as const;

export type TechnologyKind = (typeof TECHNOLOGY_KIND)[keyof typeof TECHNOLOGY_KIND];

export const TECHNOLOGY_LEVEL = {
  Learning: 'learning',
  Working: 'working',
  Proficient: 'proficient',
  Expert: 'expert',
} as const;

export type TechnologyLevel = (typeof TECHNOLOGY_LEVEL)[keyof typeof TECHNOLOGY_LEVEL];

export const ARCHITECTURE_PATTERN = {
  Monorepo: 'monorepo',
  CleanArchitecture: 'clean-architecture',
  DomainDrivenDesign: 'ddd',
  Rest: 'rest',
  Cqrs: 'cqrs',
  GraphQl: 'graphql',
  ModuleSystem: 'module-system',
  DesignSystem: 'design-system',
  LayeredArchitecture: 'layered-architecture',
  EventDriven: 'event-driven',
  Serverless: 'serverless',
} as const;

export type ArchitecturePattern =
  (typeof ARCHITECTURE_PATTERN)[keyof typeof ARCHITECTURE_PATTERN];

export const DECISION_IMPACT = {
  Low: 'low',
  Medium: 'medium',
  High: 'high',
} as const;

export type DecisionImpact = (typeof DECISION_IMPACT)[keyof typeof DECISION_IMPACT];

export const LESSON_CATEGORY = {
  Architecture: 'architecture',
  Tooling: 'tooling',
  Process: 'process',
  Product: 'product',
} as const;

export type LessonCategory = (typeof LESSON_CATEGORY)[keyof typeof LESSON_CATEGORY];

export const MEDIA_TYPE = {
  Image: 'image',
  Video: 'video',
  Diagram: 'diagram',
} as const;

export type MediaType = (typeof MEDIA_TYPE)[keyof typeof MEDIA_TYPE];

export const OWNERSHIP_TYPE = {
  Unconfirmed: 'unconfirmed',
  Personal: 'personal',
  Client: 'client',
  Company: 'company',
  Academic: 'academic',
} as const;

export type OwnershipType = (typeof OWNERSHIP_TYPE)[keyof typeof OWNERSHIP_TYPE];
