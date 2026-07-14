import { EDGE_TYPE, NODE_TYPE } from '../graph.types';
import type { Edge, KnowledgeGraph, Node } from '../graph.types';
import type { TechnologyUsage } from './graph-query.types';

function edgesByType(graph: KnowledgeGraph, type: string): Edge[] {
  return graph.edges.filter((e) => e.type === type);
}

function nodesByType(graph: KnowledgeGraph, type: string): Node[] {
  return graph.nodes.filter((n) => n.type === type);
}

function targetNodes(
  graph: KnowledgeGraph,
  edges: Edge[],
): Node[] {
  const ids = new Set(edges.map((e) => e.target));
  return graph.nodes.filter((n) => ids.has(n.id));
}

function sourceNodes(
  graph: KnowledgeGraph,
  edges: Edge[],
): Node[] {
  const ids = new Set(edges.map((e) => e.source));
  return graph.nodes.filter((n) => ids.has(n.id));
}

export function findNode(
  graph: KnowledgeGraph,
  id: string,
): Node | undefined {
  return graph.nodes.find((n) => n.id === id);
}

export function findNodesByType(
  graph: KnowledgeGraph,
  type: string,
): Node[] {
  return nodesByType(graph, type);
}

export function findNodes(
  graph: KnowledgeGraph,
  predicate: (node: Node, graph: KnowledgeGraph) => boolean,
): Node[] {
  return graph.nodes.filter((n) => predicate(n, graph));
}

export function findProject(
  graph: KnowledgeGraph,
  id: string,
): Node | undefined {
  return graph.nodes.find(
    (n) => n.type === NODE_TYPE.Project && n.id === `project:${id}`,
  );
}

export function findRelatedProjects(
  graph: KnowledgeGraph,
  id: string,
): Node[] {
  const projectId = `project:${id}`;
  const outgoing = edgesByType(graph, EDGE_TYPE.ReferencesProject)
    .filter((e) => e.source === projectId)
    .map((e) => e.target);
  const incoming = edgesByType(graph, EDGE_TYPE.ReferencesProject)
    .filter((e) => e.target === projectId)
    .map((e) => e.source);
  const allIds = new Set([...outgoing, ...incoming]);
  return graph.nodes.filter(
    (n) => n.type === NODE_TYPE.Project && allIds.has(n.id),
  );
}

export function findProjectsUsingTechnology(
  graph: KnowledgeGraph,
  name: string,
): Node[] {
  const techNode = graph.nodes.find(
    (n) => n.type === NODE_TYPE.Technology && n.label === name,
  );
  if (!techNode) return [];

  const edges = edgesByType(graph, EDGE_TYPE.UsesTechnology).filter(
    (e) => e.target === techNode.id,
  );
  return sourceNodes(graph, edges);
}

export function findProjectsUsingPattern(
  graph: KnowledgeGraph,
  pattern: string,
): Node[] {
  const patNode = graph.nodes.find(
    (n) => n.type === NODE_TYPE.ArchitecturePattern && n.label === pattern,
  );
  if (!patNode) return [];

  const edges = edgesByType(graph, EDGE_TYPE.ImplementsPattern).filter(
    (e) => e.target === patNode.id,
  );
  return sourceNodes(graph, edges);
}

export function findProjectsSupportingCapability(
  graph: KnowledgeGraph,
  capabilityName: string,
): Node[] {
  const capNode = graph.nodes.find(
    (n) => n.type === NODE_TYPE.Capability && n.label === capabilityName,
  );
  if (!capNode) return [];

  const edges = edgesByType(graph, EDGE_TYPE.ProducedCapability).filter(
    (e) => e.target === capNode.id,
  );
  return sourceNodes(graph, edges);
}

export function findTechnology(
  graph: KnowledgeGraph,
  name: string,
): Node | undefined {
  return graph.nodes.find(
    (n) => n.type === NODE_TYPE.Technology && n.label === name,
  );
}

export function findTechnologies(graph: KnowledgeGraph): Node[] {
  return nodesByType(graph, NODE_TYPE.Technology);
}

export function findMostUsedTechnologies(
  graph: KnowledgeGraph,
): TechnologyUsage[] {
  const techEdges = edgesByType(graph, EDGE_TYPE.UsesTechnology);
  const usageCount = new Map<string, number>();

  for (const edge of techEdges) {
    usageCount.set(edge.target, (usageCount.get(edge.target) ?? 0) + 1);
  }

  return Array.from(usageCount.entries())
    .map(([nodeId, count]) => ({
      node: graph.nodes.find((n) => n.id === nodeId)!,
      usageCount: count,
    }))
    .filter((entry): entry is TechnologyUsage => entry.node !== undefined)
    .sort((a, b) => b.usageCount - a.usageCount);
}

export function findTechnologiesByProject(
  graph: KnowledgeGraph,
  projectId: string,
): Node[] {
  const pid = `project:${projectId}`;
  const edges = edgesByType(graph, EDGE_TYPE.UsesTechnology).filter(
    (e) => e.source === pid,
  );
  return targetNodes(graph, edges);
}

export function findArchitecturePatterns(graph: KnowledgeGraph): Node[] {
  return nodesByType(graph, NODE_TYPE.ArchitecturePattern);
}

export function findPatternsByProject(
  graph: KnowledgeGraph,
  projectId: string,
): Node[] {
  const pid = `project:${projectId}`;
  const edges = edgesByType(graph, EDGE_TYPE.ImplementsPattern).filter(
    (e) => e.source === pid,
  );
  return targetNodes(graph, edges);
}

export function findEngineeringDecisions(graph: KnowledgeGraph): Node[] {
  return nodesByType(graph, NODE_TYPE.EngineeringDecision);
}

export function findDecisionsByProject(
  graph: KnowledgeGraph,
  projectId: string,
): Node[] {
  const pid = `project:${projectId}`;
  const edges = edgesByType(graph, EDGE_TYPE.SharesDecision).filter(
    (e) => e.source === pid,
  );
  return targetNodes(graph, edges);
}

export function findProjectsSharingDecision(
  graph: KnowledgeGraph,
  title: string,
): Node[] {
  const decisionNodes = graph.nodes.filter(
    (n) => n.type === NODE_TYPE.EngineeringDecision && n.label === title,
  );
  const decisionIds = new Set(decisionNodes.map((n) => n.id));
  const edges = edgesByType(graph, EDGE_TYPE.SharesDecision).filter((e) =>
    decisionIds.has(e.target),
  );
  return sourceNodes(graph, edges);
}

export function findLessons(graph: KnowledgeGraph): Node[] {
  return nodesByType(graph, NODE_TYPE.Lesson);
}

export function findLessonsByProject(
  graph: KnowledgeGraph,
  projectId: string,
): Node[] {
  const pid = `project:${projectId}`;
  const edges = edgesByType(graph, EDGE_TYPE.LedToLesson).filter(
    (e) => e.source === pid,
  );
  return targetNodes(graph, edges);
}

export function findCapabilities(graph: KnowledgeGraph): Node[] {
  return nodesByType(graph, NODE_TYPE.Capability);
}

export function findCapabilitiesByProject(
  graph: KnowledgeGraph,
  projectId: string,
): Node[] {
  const pid = `project:${projectId}`;
  const edges = edgesByType(graph, EDGE_TYPE.ProducedCapability).filter(
    (e) => e.source === pid,
  );
  return targetNodes(graph, edges);
}

export function findMilestones(graph: KnowledgeGraph): Node[] {
  return nodesByType(graph, NODE_TYPE.Milestone);
}

export function findMilestonesByProject(
  graph: KnowledgeGraph,
  projectId: string,
): Node[] {
  const pid = `project:${projectId}`;
  const edges = edgesByType(graph, EDGE_TYPE.HasMilestone).filter(
    (e) => e.source === pid,
  );
  return targetNodes(graph, edges);
}
