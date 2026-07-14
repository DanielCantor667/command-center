import type { Node, KnowledgeGraph } from '../graph.types';

export interface TechnologyUsage {
  node: Node;
  usageCount: number;
}

export interface NodeQuery {
  id?: string;
  type?: string;
  label?: string;
  predicate?: (node: Node, graph: KnowledgeGraph) => boolean;
}
