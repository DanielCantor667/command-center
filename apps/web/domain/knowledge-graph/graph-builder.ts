import type { ArchitecturePattern } from '../../data/projects';
import { PROJECTS } from '../../data/projects';
import { MILESTONES } from '../../data/mission-log';
import { getEvidence } from '../evidence/evidence.repository';

import type { Node, Edge, KnowledgeGraph } from './graph.types';
import { EDGE_TYPE, NODE_TYPE } from './graph.types';

const ARCHITECTURE_CAPABILITY_MAP: Record<string, string> = {
  monorepo: 'Monorepo Architecture',
  'clean-architecture': 'Clean Architecture',
  ddd: 'Domain-Driven Design',
  rest: 'REST API Design',
  cqrs: 'CQRS',
  graphql: 'GraphQL API Design',
  'module-system': 'Modular System Design',
  'design-system': 'Design Systems',
  'layered-architecture': 'Layered Architecture',
  'event-driven': 'Event-Driven Architecture',
  serverless: 'Serverless Architecture',
};

const BACKEND_KINDS = new Set(['database', 'infrastructure', 'platform']);

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function buildKnowledgeGraph(): KnowledgeGraph {
  const nodeMap = new Map<string, Node>();
  const edgeMap = new Map<string, Edge>();
  const techNodeIds = new Map<string, string>();
  const patternNodeIds = new Map<string, string>();

  for (const project of PROJECTS) {
    const projectId = `project:${project.id}`;

    nodeMap.set(projectId, {
      id: projectId,
      type: NODE_TYPE.Project,
      label: project.name,
      metadata: {
        status: project.status,
        public: project.public,
        featured: project.featured,
        tagline: project.tagline,
        summary: project.summary,
      },
    });

    for (const tech of project.technologies) {
      const techId = `technology:${tech.name}`;
      if (!nodeMap.has(techId)) {
        nodeMap.set(techId, {
          id: techId,
          type: NODE_TYPE.Technology,
          label: tech.name,
          metadata: { kind: tech.kind },
        });
      }
      techNodeIds.set(tech.name, techId);

      const edgeKey = `${projectId}--${EDGE_TYPE.UsesTechnology}--${techId}`;
      if (!edgeMap.has(edgeKey)) {
        edgeMap.set(edgeKey, {
          source: projectId,
          target: techId,
          type: EDGE_TYPE.UsesTechnology,
          weight: 1,
          metadata: { level: tech.level },
        });
      }
    }

    for (const pattern of project.architecture) {
      const patternId = `pattern:${pattern}`;
      if (!nodeMap.has(patternId)) {
        nodeMap.set(patternId, {
          id: patternId,
          type: NODE_TYPE.ArchitecturePattern,
          label: pattern,
          metadata: {},
        });
      }
      patternNodeIds.set(pattern, patternId);

      const edgeKey = `${projectId}--${EDGE_TYPE.ImplementsPattern}--${patternId}`;
      if (!edgeMap.has(edgeKey)) {
        edgeMap.set(edgeKey, {
          source: projectId,
          target: patternId,
          type: EDGE_TYPE.ImplementsPattern,
          weight: 1,
          metadata: {},
        });
      }
    }

    for (const decision of project.engineeringDecisions) {
      const decisionId = `decision:${project.id}:${slugify(decision.title)}`;

      nodeMap.set(decisionId, {
        id: decisionId,
        type: NODE_TYPE.EngineeringDecision,
        label: decision.title,
        metadata: {
          context: decision.context,
          decision: decision.decision,
          reasoning: decision.reasoning,
          impact: decision.impact,
          projectId: project.id,
        },
      });

      const edgeKey = `${projectId}--${EDGE_TYPE.SharesDecision}--${decisionId}`;
      edgeMap.set(edgeKey, {
        source: projectId,
        target: decisionId,
        type: EDGE_TYPE.SharesDecision,
        weight: decision.impact === 'high' ? 3 : decision.impact === 'medium' ? 2 : 1,
        metadata: { impact: decision.impact },
      });
    }

    for (const challenge of project.challenges) {
      const challengeId = `challenge:${project.id}:${slugify(challenge.title)}`;

      nodeMap.set(challengeId, {
        id: challengeId,
        type: NODE_TYPE.Challenge,
        label: challenge.title,
        metadata: {
          description: challenge.description,
          resolution: challenge.resolution ?? null,
          projectId: project.id,
        },
      });
    }

    for (const lesson of project.lessonsLearned) {
      const lessonId = `lesson:${project.id}:${slugify(lesson.title)}`;

      nodeMap.set(lessonId, {
        id: lessonId,
        type: NODE_TYPE.Lesson,
        label: lesson.title,
        metadata: {
          description: lesson.description,
          category: lesson.category,
          projectId: project.id,
        },
      });

      const edgeKey = `${projectId}--${EDGE_TYPE.LedToLesson}--${lessonId}`;
      edgeMap.set(edgeKey, {
        source: projectId,
        target: lessonId,
        type: EDGE_TYPE.LedToLesson,
        weight: 1,
        metadata: { category: lesson.category },
      });
    }

    for (const relatedId of project.relationships.relatedProjects) {
      const targetId = `project:${relatedId}`;
      const edgeKey = `${projectId}--${EDGE_TYPE.ReferencesProject}--${targetId}`;

      if (!edgeMap.has(edgeKey) && nodeMap.has(targetId)) {
        edgeMap.set(edgeKey, {
          source: projectId,
          target: targetId,
          type: EDGE_TYPE.ReferencesProject,
          weight: 1,
          metadata: {},
        });
      }
    }
  }

  for (const milestone of MILESTONES) {
    const milestoneId = `milestone:${milestone.id}`;

    nodeMap.set(milestoneId, {
      id: milestoneId,
      type: NODE_TYPE.Milestone,
      label: milestone.title,
      metadata: {
        date: milestone.date,
        category: milestone.category,
        summary: milestone.summary,
      },
    });

    for (const projectId of milestone.relatedProjects) {
      const sourceId = `project:${projectId}`;
      const edgeKey = `${sourceId}--${EDGE_TYPE.HasMilestone}--${milestoneId}`;

      if (!edgeMap.has(edgeKey) && nodeMap.has(sourceId)) {
        edgeMap.set(edgeKey, {
          source: sourceId,
          target: milestoneId,
          type: EDGE_TYPE.HasMilestone,
          weight: 1,
          metadata: {},
        });
      }
    }

    for (const tech of milestone.technologies) {
      const techId = `technology:${tech.name}`;
      if (!nodeMap.has(techId)) {
        nodeMap.set(techId, {
          id: techId,
          type: NODE_TYPE.Technology,
          label: tech.name,
          metadata: { kind: tech.kind },
        });
      }
      techNodeIds.set(tech.name, techId);
    }

    for (const pattern of milestone.architecture) {
      const patternId = `pattern:${pattern}`;
      if (!nodeMap.has(patternId)) {
        nodeMap.set(patternId, {
          id: patternId,
          type: NODE_TYPE.ArchitecturePattern,
          label: pattern,
          metadata: {},
        });
      }
      patternNodeIds.set(pattern, patternId);
    }

    for (const lesson of milestone.lessons) {
      const lessonId = `lesson:milestone:${milestone.id}:${slugify(lesson.title)}`;

      nodeMap.set(lessonId, {
        id: lessonId,
        type: NODE_TYPE.Lesson,
        label: lesson.title,
        metadata: {
          description: lesson.description,
          category: lesson.category,
          milestoneId: milestone.id,
        },
      });
    }

    for (const decision of milestone.technicalDecisions) {
      const decisionId = `decision:milestone:${milestone.id}:${slugify(decision.title)}`;

      nodeMap.set(decisionId, {
        id: decisionId,
        type: NODE_TYPE.EngineeringDecision,
        label: decision.title,
        metadata: {
          context: decision.context,
          decision: decision.decision,
          reasoning: decision.reasoning,
          impact: decision.impact,
          milestoneId: milestone.id,
          projectId: decision.projectId ?? null,
        },
      });
    }
  }

  const evidence = getEvidence();
  const capabilityNodeIds = new Map<string, string>();

  for (const capability of evidence.capabilities) {
    const capId = `capability:${slugify(capability.name)}`;

    nodeMap.set(capId, {
      id: capId,
      type: NODE_TYPE.Capability,
      label: capability.name,
      metadata: {
        confidence: capability.confidence,
        evidence: capability.evidence,
      },
    });
    capabilityNodeIds.set(capability.name, capId);
  }

  for (const capability of evidence.capabilities) {
    const capId = capabilityNodeIds.get(capability.name)!;
    let relevant: (typeof PROJECTS[number])[] = [];

    if (capability.name === 'Software Architecture') {
      const patternCount = new Set(PROJECTS.flatMap((p) => p.architecture)).size;
      if (patternCount >= 2) {
        relevant = [...PROJECTS];
      }
    } else if (capability.name === 'Frontend Development') {
      relevant = PROJECTS.filter((p) =>
        p.technologies.some((t) => t.kind === 'framework'),
      );
    } else if (capability.name === 'Backend Development') {
      relevant = PROJECTS.filter((p) =>
        p.technologies.some((t) => BACKEND_KINDS.has(t.kind)),
      );
    } else if (capability.name === 'Full-Stack Development') {
      relevant = PROJECTS.filter(
        (p) =>
          p.technologies.some((t) => t.kind === 'framework') &&
          p.technologies.some((t) => BACKEND_KINDS.has(t.kind)),
      );
    } else if (capability.name === 'Technical Leadership') {
      relevant = PROJECTS.filter((p) =>
        p.engineeringDecisions.some((d) => d.impact === 'high'),
      );
    } else {
      const patternEntry = Object.entries(ARCHITECTURE_CAPABILITY_MAP).find(
        ([, label]) => label === capability.name,
      );
      if (patternEntry) {
        relevant = PROJECTS.filter((p) =>
          p.architecture.includes(patternEntry[0] as ArchitecturePattern),
        );
      }
    }

    for (const project of relevant) {
      const projectId = `project:${project.id}`;
      const edgeKey = `${projectId}--${EDGE_TYPE.ProducedCapability}--${capId}`;
      if (!edgeMap.has(edgeKey)) {
        edgeMap.set(edgeKey, {
          source: projectId,
          target: capId,
          type: EDGE_TYPE.ProducedCapability,
          weight: 1,
          metadata: {},
        });
      }
    }
  }

  for (const project of PROJECTS) {
    const projectTechs = project.technologies.map((t) => t.name);
    for (let i = 0; i < projectTechs.length; i++) {
      for (let j = i + 1; j < projectTechs.length; j++) {
        const sorted = [projectTechs[i], projectTechs[j]].sort();
        const tech0 = sorted[0];
        const tech1 = sorted[1];
        if (!tech0 || !tech1) continue;
        const sourceId = techNodeIds.get(tech0);
        const targetId = techNodeIds.get(tech1);
        if (!sourceId || !targetId) continue;

        const edgeKey = `${sourceId}--${EDGE_TYPE.SharesTechnology}--${targetId}`;
        if (!edgeMap.has(edgeKey)) {
          edgeMap.set(edgeKey, {
            source: sourceId,
            target: targetId,
            type: EDGE_TYPE.SharesTechnology,
            weight: 1,
            metadata: {},
          });
        }
      }
    }
  }

  for (const project of PROJECTS) {
    for (let i = 0; i < project.architecture.length; i++) {
      for (let j = i + 1; j < project.architecture.length; j++) {
        const sorted = [project.architecture[i], project.architecture[j]].sort();
        const pat0 = sorted[0];
        const pat1 = sorted[1];
        if (!pat0 || !pat1) continue;
        const sourceId = patternNodeIds.get(pat0);
        const targetId = patternNodeIds.get(pat1);
        if (!sourceId || !targetId) continue;

        const edgeKey = `${sourceId}--${EDGE_TYPE.SharesPattern}--${targetId}`;
        if (!edgeMap.has(edgeKey)) {
          edgeMap.set(edgeKey, {
            source: sourceId,
            target: targetId,
            type: EDGE_TYPE.SharesPattern,
            weight: 1,
            metadata: {},
          });
        }
      }
    }
  }

  for (const [pattern, label] of Object.entries(ARCHITECTURE_CAPABILITY_MAP)) {
    const patternId = patternNodeIds.get(pattern);
    const capId = capabilityNodeIds.get(label);
    if (!patternId || !capId) continue;

    const edgeKey = `${patternId}--${EDGE_TYPE.SupportsCapability}--${capId}`;
    if (!edgeMap.has(edgeKey)) {
      edgeMap.set(edgeKey, {
        source: patternId,
        target: capId,
        type: EDGE_TYPE.SupportsCapability,
        weight: 1,
        metadata: {},
      });
    }
  }

  return {
    nodes: Array.from(nodeMap.values()),
    edges: Array.from(edgeMap.values()),
  };
}

export function deduplicateNodes(
  existing: readonly Node[],
  incoming: Node[],
): Node[] {
  const seen = new Set(existing.map((n) => n.id));
  const result = [...existing];
  for (const node of incoming) {
    if (!seen.has(node.id)) {
      seen.add(node.id);
      result.push(node);
    }
  }
  return result;
}
