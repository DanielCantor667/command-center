export const NODE_TYPE = {
  Project: 'Project',
  Technology: 'Technology',
  ArchitecturePattern: 'ArchitecturePattern',
  EngineeringDecision: 'EngineeringDecision',
  Challenge: 'Challenge',
  Lesson: 'Lesson',
  Capability: 'Capability',
  Milestone: 'Milestone',
} as const;

export type NodeType = (typeof NODE_TYPE)[keyof typeof NODE_TYPE];

export const EDGE_TYPE = {
  UsesTechnology: 'USES_TECHNOLOGY',
  ImplementsPattern: 'IMPLEMENTS_PATTERN',
  ProducedCapability: 'PRODUCED_CAPABILITY',
  LedToLesson: 'LED_TO_LESSON',
  ReferencesProject: 'REFERENCES_PROJECT',
  SharesDecision: 'SHARES_DECISION',
  SharesTechnology: 'SHARES_TECHNOLOGY',
  SharesPattern: 'SHARES_PATTERN',
  HasMilestone: 'HAS_MILESTONE',
  SupportsCapability: 'SUPPORTS_CAPABILITY',
} as const;

export type EdgeType = (typeof EDGE_TYPE)[keyof typeof EDGE_TYPE];

export interface Node {
  id: string;
  type: NodeType;
  label: string;
  metadata: Record<string, unknown>;
}

export interface Edge {
  source: string;
  target: string;
  type: EdgeType;
  weight: number;
  metadata: Record<string, unknown>;
}

export interface KnowledgeGraph {
  nodes: Node[];
  edges: Edge[];
}
