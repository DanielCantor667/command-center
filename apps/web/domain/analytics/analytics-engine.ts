import {
  findArchitecturePatterns,
  findCapabilities,
  findCapabilitiesByProject,
  findEngineeringDecisions,
  findLessons,
  findLessonsByProject,
  findMilestones,
  findMilestonesByProject,
  findMostUsedTechnologies,
  findNodeConnections,
  findNodesByType,
  findPatternsByProject,
  findProjectsSharingDecision,
  findTechnologies,
} from '../knowledge-graph/query';
import { NODE_TYPE } from '../knowledge-graph';
import type { KnowledgeGraph, Node } from '../knowledge-graph';
import { analyticsSchema } from './analytics.schema';
import type { Analytics, Insight, Ranking, Recommendation } from './analytics.types';

const metadataBoolean = (node: Node, key: string) => node.metadata[key] === true;
const metadataText = (node: Node, key: string) => typeof node.metadata[key] === 'string' ? node.metadata[key] : '';
const average = (total: number, count: number) => count === 0 ? 0 : Number((total / count).toFixed(1));
const rank = (nodes: Node[], valueFor: (node: Node) => number, detail?: (node: Node, value: number) => string): Ranking[] => nodes
  .map((node) => ({ id: node.id, label: node.label, value: valueFor(node), ...(detail ? { detail: detail(node, valueFor(node)) } : {}) }))
  .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));

export function computeAnalytics(graph: KnowledgeGraph): Analytics {
  const projects = findNodesByType(graph, NODE_TYPE.Project);
  const technologies = findTechnologies(graph);
  const patterns = findArchitecturePatterns(graph);
  const decisions = findEngineeringDecisions(graph);
  const lessons = findLessons(graph);
  const challenges = findNodesByType(graph, NODE_TYPE.Challenge);
  const capabilities = findCapabilities(graph);
  const milestones = findMilestones(graph);
  const projectsByStatus = projects.reduce<Record<string, number>>((result, project) => {
    const status = metadataText(project, 'status') || 'unknown';
    result[status] = (result[status] ?? 0) + 1;
    return result;
  }, {});
  const projectRankings = rank(projects, (project) => findNodeConnections(graph, project.id).length, (_, value) => `${value} conexiones`);
  const technologyUsage = findMostUsedTechnologies(graph).map(({ node, usageCount }) => ({ id: node.id, label: node.label, value: usageCount, detail: `${usageCount} proyectos` }));
  const patternUsage = rank(patterns, (pattern) => projects.filter((project) => findPatternsByProject(graph, project.id.replace('project:', '')).some((item) => item.id === pattern.id)).length, (_, value) => `${value} proyectos`);
  const capabilityRankings = rank(capabilities, (capability) => ({ low: 1, medium: 2, high: 3 }[metadataText(capability, 'confidence')] ?? 0), (capability) => metadataText(capability, 'confidence'));
  const sharedDecisions = rank(decisions, (decision) => findProjectsSharingDecision(graph, decision.label).length, (_, value) => `${value} proyectos`)
    .filter((decision) => decision.value > 1);
  const lessonCategories = lessons.reduce<Record<string, number>>((result, lesson) => {
    const category = metadataText(lesson, 'category') || 'uncategorized';
    result[category] = (result[category] ?? 0) + 1;
    return result;
  }, {});
  const insights: Insight[] = technologyUsage.slice(0, 3).map((technology) => ({
    id: `technology-adoption:${technology.id}`,
    category: 'technology', severity: 'info', title: `${technology.label} conecta ${technology.value} de ${projects.length} proyectos`,
    description: `${technology.label} aparece en ${Math.round((technology.value / Math.max(projects.length, 1)) * 100)}% del portfolio documentado.`, relatedNodeIds: [technology.id],
  }));
  if (projectRankings[0]) insights.push({ id: `connected-project:${projectRankings[0].id}`, category: 'graph', severity: 'info', title: `${projectRankings[0].label} es el nodo de proyecto más conectado`, description: `Concentra ${projectRankings[0].value} relaciones verificables entre tecnologías, decisiones, lecciones, capacidades e hitos.`, relatedNodeIds: [projectRankings[0].id] });
  const recommendations: Recommendation[] = capabilities.filter((capability) => metadataText(capability, 'confidence') === 'low').map((capability) => ({ id: `capability-evidence:${capability.id}`, priority: 'medium', title: `Fortalecer evidencia de ${capability.label}`, description: 'La capacidad tiene confianza baja en el grafo. Añade proyectos, decisiones o lecciones que la respalden.', relatedNodeIds: [capability.id] }));
  for (const project of projects) {
    const id = project.id.replace('project:', '');
    if (findLessonsByProject(graph, id).length === 0) recommendations.push({ id: `lessons:${project.id}`, priority: 'low', title: `Documentar lecciones de ${project.label}`, description: 'El proyecto aún no tiene lecciones vinculadas; registrar decisiones y aprendizajes mejora la trazabilidad.', relatedNodeIds: [project.id] });
  }
  return analyticsSchema.parse({
    generatedAt: 'derived-at-runtime',
    projects: { totalProjects: projects.length, publicProjects: projects.filter((project) => metadataBoolean(project, 'public')).length, featuredProjects: projects.filter((project) => metadataBoolean(project, 'featured')).length, projectsByStatus, rankings: projectRankings },
    technologies: { totalTechnologies: technologies.length, technologiesPerProject: average(technologyUsage.reduce((sum, item) => sum + item.value, 0), projects.length), mostUsedTechnologies: technologyUsage.slice(0, 10), leastUsedTechnologies: [...technologyUsage].reverse().slice(0, 10) },
    architecture: { totalPatterns: patterns.length, patternsPerProject: average(patternUsage.reduce((sum, item) => sum + item.value, 0), projects.length), architectureUsage: patternUsage, mostCommonPattern: patternUsage[0] ?? null },
    engineering: { totalEngineeringDecisions: decisions.length, decisionsPerProject: average(decisions.length, projects.length), sharedDecisions },
    lessons: { totalLessons: lessons.length, lessonsPerProject: average(lessons.length, projects.length), lessonCategories },
    challenges: { totalChallenges: challenges.length, challengesPerProject: average(challenges.length, projects.length) },
    capabilities: { totalCapabilities: capabilities.length, strongestCapabilities: capabilityRankings.filter((item) => item.value === 3), weakestCapabilities: capabilityRankings.filter((item) => item.value === 1), capabilitiesPerProject: average(projects.reduce((sum, project) => sum + findCapabilitiesByProject(graph, project.id.replace('project:', '')).length, 0), projects.length) },
    mission: { totalMilestones: milestones.length, milestonesPerProject: average(projects.reduce((sum, project) => sum + findMilestonesByProject(graph, project.id.replace('project:', '')).length, 0), projects.length) },
    global: { nodes: graph.nodes.length, edges: graph.edges.length, mostConnectedProjects: projectRankings.slice(0, 10), mostConnectedTechnologies: rank(technologies, (technology) => findNodeConnections(graph, technology.id).length, (_, value) => `${value} conexiones`).slice(0, 10) },
    insights, recommendations,
  });
}
