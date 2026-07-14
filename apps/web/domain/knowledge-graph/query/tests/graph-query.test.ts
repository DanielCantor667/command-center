import { describe, expect, it } from 'vitest';

import { KNOWLEDGE_GRAPH } from '../../graph.repository';
import { NODE_TYPE } from '../../graph.types';

import {
  findNode,
  findNodesByType,
  findNodes,
  findProject,
  findRelatedProjects,
  findProjectsUsingTechnology,
  findProjectsUsingPattern,
  findProjectsSupportingCapability,
  findTechnology,
  findTechnologies,
  findMostUsedTechnologies,
  findTechnologiesByProject,
  findArchitecturePatterns,
  findPatternsByProject,
  findEngineeringDecisions,
  findDecisionsByProject,
  findProjectsSharingDecision,
  findLessons,
  findLessonsByProject,
  findCapabilities,
  findCapabilitiesByProject,
  findMilestones,
  findMilestonesByProject,
} from '../graph-query';

describe('findNode', () => {
  it('finds a node by id', () => {
    const node = findNode(KNOWLEDGE_GRAPH, 'project:kliniu');
    expect(node).toBeDefined();
    expect(node!.type).toBe(NODE_TYPE.Project);
    expect(node!.label).toBe('Kliniu');
  });

  it('returns undefined for nonexistent id', () => {
    const node = findNode(KNOWLEDGE_GRAPH, 'nonexistent');
    expect(node).toBeUndefined();
  });
});

describe('findNodesByType', () => {
  it('finds all project nodes', () => {
    const nodes = findNodesByType(KNOWLEDGE_GRAPH, NODE_TYPE.Project);
    expect(nodes).toHaveLength(6);
  });

  it('finds all milestone nodes', () => {
    const nodes = findNodesByType(KNOWLEDGE_GRAPH, NODE_TYPE.Milestone);
    expect(nodes).toHaveLength(3);
  });

  it('returns empty array for unused type', () => {
    const nodes = findNodesByType(KNOWLEDGE_GRAPH, 'UnusedType');
    expect(nodes).toHaveLength(0);
  });
});

describe('findNodes', () => {
  it('filters by custom predicate', () => {
    const featured = findNodes(
      KNOWLEDGE_GRAPH,
      (n) =>
        n.type === NODE_TYPE.Project &&
        (n.metadata as Record<string, unknown>).featured === true,
    );
    expect(featured).toHaveLength(1);
    expect(featured[0]!.label).toBe('Command Center');
  });

  it('returns empty when no nodes match', () => {
    const result = findNodes(KNOWLEDGE_GRAPH, () => false);
    expect(result).toHaveLength(0);
  });
});

describe('findProject', () => {
  it('finds project by id', () => {
    const project = findProject(KNOWLEDGE_GRAPH, 'command-center');
    expect(project).toBeDefined();
    expect(project!.label).toBe('Command Center');
  });

  it('returns undefined for nonexistent project id', () => {
    const project = findProject(KNOWLEDGE_GRAPH, 'nonexistent');
    expect(project).toBeUndefined();
  });

  it('rejects invalid project id gracefully', () => {
    const project = findProject(KNOWLEDGE_GRAPH, '');
    expect(project).toBeUndefined();
  });
});

describe('findRelatedProjects', () => {
  it('finds projects that reference command-center', () => {
    const related = findRelatedProjects(KNOWLEDGE_GRAPH, 'command-center');
    const labels = related.map((n) => n.label).sort();
    expect(labels).toEqual([
      '4U Studio Academy',
      'Intranet ESS',
      'Kliniu',
      "L'ORIGINE",
      'Vevi',
    ]);
  });

  it('each non-command-center project is related to command-center', () => {
    const projectIds = KNOWLEDGE_GRAPH.nodes
      .filter((n) => n.type === NODE_TYPE.Project)
      .map((n) => n.id.replace('project:', ''));
    for (const id of projectIds) {
      if (id !== 'command-center') {
        const related = findRelatedProjects(KNOWLEDGE_GRAPH, id);
        expect(related).toHaveLength(1);
        expect(related[0]!.label).toBe('Command Center');
      }
    }
  });
});

describe('findProjectsUsingTechnology', () => {
  it('finds all projects using TypeScript', () => {
    const projects = findProjectsUsingTechnology(
      KNOWLEDGE_GRAPH,
      'TypeScript',
    );
    expect(projects).toHaveLength(6);
  });

  it('finds projects using Prisma', () => {
    const projects = findProjectsUsingTechnology(KNOWLEDGE_GRAPH, 'Prisma');
    const labels = projects.map((n) => n.label).sort();
    expect(labels).toEqual([
      'Command Center',
      'Intranet ESS',
      'Kliniu',
      'Vevi',
    ]);
  });

  it('returns empty for unused technology', () => {
    const projects = findProjectsUsingTechnology(
      KNOWLEDGE_GRAPH,
      'NonexistentTech',
    );
    expect(projects).toHaveLength(0);
  });
});

describe('findProjectsUsingPattern', () => {
  it('finds all projects using monorepo pattern', () => {
    const projects = findProjectsUsingPattern(KNOWLEDGE_GRAPH, 'monorepo');
    const labels = projects.map((n) => n.label).sort();
    expect(labels).toEqual([
      'Command Center',
      'Intranet ESS',
      'Kliniu',
      'Vevi',
    ]);
  });

  it('returns empty for unused pattern', () => {
    const projects = findProjectsUsingPattern(
      KNOWLEDGE_GRAPH,
      'graphql',
    );
    expect(projects).toHaveLength(0);
  });
});

describe('findProjectsSupportingCapability', () => {
  it('finds projects supporting Monorepo Architecture', () => {
    const projects = findProjectsSupportingCapability(
      KNOWLEDGE_GRAPH,
      'Monorepo Architecture',
    );
    const labels = projects.map((n) => n.label).sort();
    expect(labels).toEqual([
      'Command Center',
      'Intranet ESS',
      'Kliniu',
      'Vevi',
    ]);
  });

  it('returns empty for nonexistent capability', () => {
    const projects = findProjectsSupportingCapability(
      KNOWLEDGE_GRAPH,
      'Nonexistent Capability',
    );
    expect(projects).toHaveLength(0);
  });
});

describe('findTechnology', () => {
  it('finds a technology by name', () => {
    const tech = findTechnology(KNOWLEDGE_GRAPH, 'TypeScript');
    expect(tech).toBeDefined();
    expect(tech!.type).toBe(NODE_TYPE.Technology);
  });

  it('returns undefined for nonexistent technology', () => {
    const tech = findTechnology(KNOWLEDGE_GRAPH, 'Nonexistent');
    expect(tech).toBeUndefined();
  });
});

describe('findTechnologies', () => {
  it('returns all technology nodes', () => {
    const techs = findTechnologies(KNOWLEDGE_GRAPH);
    expect(techs.length).toBeGreaterThan(30);
    expect(
      techs.every((t) => t.type === NODE_TYPE.Technology),
    ).toBe(true);
  });
});

describe('findMostUsedTechnologies', () => {
  it('returns technologies sorted by usage descending', () => {
    const result = findMostUsedTechnologies(KNOWLEDGE_GRAPH);
    expect(result.length).toBeGreaterThan(0);
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1]!.usageCount).toBeGreaterThanOrEqual(
        result[i]!.usageCount,
      );
    }
  });

  it('TypeScript and React are top used', () => {
    const result = findMostUsedTechnologies(KNOWLEDGE_GRAPH);
    const topLabels = result.slice(0, 3).map((r) => r.node.label);
    expect(topLabels).toContain('TypeScript');
    expect(topLabels).toContain('React');
  });

  it('returns TechnologyUsage items with node and count', () => {
    const result = findMostUsedTechnologies(KNOWLEDGE_GRAPH);
    expect(result[0]).toHaveProperty('node');
    expect(result[0]).toHaveProperty('usageCount');
    expect(result[0]!.usageCount).toBeGreaterThan(0);
  });
});

describe('findTechnologiesByProject', () => {
  it('finds technologies used in a project', () => {
    const techs = findTechnologiesByProject(
      KNOWLEDGE_GRAPH,
      'command-center',
    );
    const labels = techs.map((t) => t.label).sort();
    expect(labels).toContain('TypeScript');
    expect(labels).toContain('Next.js');
    expect(labels).toContain('Tailwind CSS');
  });

  it('returns empty for nonexistent project', () => {
    const techs = findTechnologiesByProject(
      KNOWLEDGE_GRAPH,
      'nonexistent',
    );
    expect(techs).toHaveLength(0);
  });
});

describe('findArchitecturePatterns', () => {
  it('returns all unique architecture patterns', () => {
    const patterns = findArchitecturePatterns(KNOWLEDGE_GRAPH);
    const labels = patterns.map((p) => p.label).sort();
    expect(labels.length).toBeGreaterThanOrEqual(8);
    expect(labels).toContain('monorepo');
    expect(labels).toContain('ddd');
  });
});

describe('findPatternsByProject', () => {
  it('finds patterns used in a project', () => {
    const patterns = findPatternsByProject(
      KNOWLEDGE_GRAPH,
      'command-center',
    );
    const labels = patterns.map((p) => p.label).sort();
    expect(labels).toEqual([
      'design-system',
      'layered-architecture',
      'module-system',
      'monorepo',
    ]);
  });

  it('returns empty for nonexistent project', () => {
    const patterns = findPatternsByProject(
      KNOWLEDGE_GRAPH,
      'nonexistent',
    );
    expect(patterns).toHaveLength(0);
  });
});

describe('findEngineeringDecisions', () => {
  it('returns all engineering decision nodes', () => {
    const decisions = findEngineeringDecisions(KNOWLEDGE_GRAPH);
    expect(decisions.length).toBeGreaterThanOrEqual(30);
    expect(
      decisions.every((d) => d.type === NODE_TYPE.EngineeringDecision),
    ).toBe(true);
  });
});

describe('findDecisionsByProject', () => {
  it('finds decisions for a project', () => {
    const decisions = findDecisionsByProject(
      KNOWLEDGE_GRAPH,
      'kliniu',
    );
    expect(decisions.length).toBe(6);
  });

  it('returns empty for nonexistent project', () => {
    const decisions = findDecisionsByProject(
      KNOWLEDGE_GRAPH,
      'nonexistent',
    );
    expect(decisions).toHaveLength(0);
  });
});

describe('findProjectsSharingDecision', () => {
  it('finds projects with same decision title across projects', () => {
    const projects = findProjectsSharingDecision(
      KNOWLEDGE_GRAPH,
      'Supabase as sole backend over custom API',
    );
    expect(projects.length).toBeGreaterThanOrEqual(1);
  });

  it('returns empty for nonexistent decision title', () => {
    const projects = findProjectsSharingDecision(
      KNOWLEDGE_GRAPH,
      'Nonexistent Decision',
    );
    expect(projects).toHaveLength(0);
  });
});

describe('findLessons', () => {
  it('returns all lesson nodes', () => {
    const lessons = findLessons(KNOWLEDGE_GRAPH);
    expect(lessons.length).toBeGreaterThanOrEqual(25);
    expect(
      lessons.every((l) => l.type === NODE_TYPE.Lesson),
    ).toBe(true);
  });
});

describe('findLessonsByProject', () => {
  it('finds lessons for a project', () => {
    const lessons = findLessonsByProject(
      KNOWLEDGE_GRAPH,
      'command-center',
    );
    expect(lessons.length).toBe(5);
  });

  it('returns empty for nonexistent project', () => {
    const lessons = findLessonsByProject(
      KNOWLEDGE_GRAPH,
      'nonexistent',
    );
    expect(lessons).toHaveLength(0);
  });
});

describe('findCapabilities', () => {
  it('returns all capability nodes', () => {
    const caps = findCapabilities(KNOWLEDGE_GRAPH);
    expect(caps.length).toBeGreaterThanOrEqual(9);
    expect(
      caps.every((c) => c.type === NODE_TYPE.Capability),
    ).toBe(true);
  });
});

describe('findCapabilitiesByProject', () => {
  it('finds capabilities for a project', () => {
    const caps = findCapabilitiesByProject(
      KNOWLEDGE_GRAPH,
      'command-center',
    );
    expect(caps.length).toBeGreaterThanOrEqual(5);
    const labels = caps.map((c) => c.label);
    expect(labels).toContain('Monorepo Architecture');
    expect(labels).toContain('Design Systems');
  });

  it('returns empty for nonexistent project', () => {
    const caps = findCapabilitiesByProject(
      KNOWLEDGE_GRAPH,
      'nonexistent',
    );
    expect(caps).toHaveLength(0);
  });
});

describe('findMilestones', () => {
  it('returns all milestone nodes', () => {
    const milestones = findMilestones(KNOWLEDGE_GRAPH);
    expect(milestones).toHaveLength(3);
    expect(
      milestones.every((m) => m.type === NODE_TYPE.Milestone),
    ).toBe(true);
  });
});

describe('findMilestonesByProject', () => {
  it('finds milestones for command-center', () => {
    const milestones = findMilestonesByProject(
      KNOWLEDGE_GRAPH,
      'command-center',
    );
    expect(milestones.length).toBeGreaterThanOrEqual(1);
    const labels = milestones.map((m) => m.label);
    expect(labels).toContain(
      'Command Center — Platform Architecture',
    );
  });

  it('returns empty for nonexistent project', () => {
    const milestones = findMilestonesByProject(
      KNOWLEDGE_GRAPH,
      'nonexistent',
    );
    expect(milestones).toHaveLength(0);
  });
});
