import { describe, expect, it } from 'vitest';

import { EDGE_TYPE } from '../graph.types';
import { knowledgeGraphSchema } from '../graph.schema';
import { KNOWLEDGE_GRAPH } from '../graph.repository';
import { buildKnowledgeGraph } from '../graph-builder';

describe('KnowledgeGraph schema', () => {
  it('validates a correct knowledge graph', () => {
    const result = knowledgeGraphSchema.safeParse(KNOWLEDGE_GRAPH);
    expect(result.success).toBe(true);
  });

  it('rejects an edge with empty source', () => {
    const result = knowledgeGraphSchema.safeParse({
      nodes: [
        {
          id: 'project:a',
          type: 'Project',
          label: 'A',
          metadata: {},
        },
      ],
      edges: [
        {
          source: '',
          target: 'project:a',
          type: 'REFERENCES_PROJECT',
          weight: 1,
          metadata: {},
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('rejects an edge with invalid type', () => {
    const result = knowledgeGraphSchema.safeParse({
      nodes: [
        {
          id: 'project:a',
          type: 'Project',
          label: 'A',
          metadata: {},
        },
      ],
      edges: [
        {
          source: 'project:a',
          target: 'project:a',
          type: 'INVALID_TYPE',
          weight: 1,
          metadata: {},
        },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('rejects a node with empty id', () => {
    const result = knowledgeGraphSchema.safeParse({
      nodes: [
        {
          id: '',
          type: 'Project',
          label: 'A',
          metadata: {},
        },
      ],
      edges: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects a node with invalid type', () => {
    const result = knowledgeGraphSchema.safeParse({
      nodes: [
        {
          id: 'project:a',
          type: 'InvalidType',
          label: 'A',
          metadata: {},
        },
      ],
      edges: [],
    });
    expect(result.success).toBe(false);
  });
});

describe('KnowledgeGraph integrity', () => {
  it('has unique node ids', () => {
    const ids = KNOWLEDGE_GRAPH.nodes.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has no duplicate edges (same source + type + target)', () => {
    const edgeKeys = KNOWLEDGE_GRAPH.edges.map(
      (e) => `${e.source}--${e.type}--${e.target}`,
    );
    expect(new Set(edgeKeys).size).toBe(edgeKeys.length);
  });

  it('has no self-loop edges', () => {
    const selfLoops = KNOWLEDGE_GRAPH.edges.filter(
      (e) => e.source === e.target,
    );
    expect(selfLoops).toHaveLength(0);
  });

  it('every edge source references an existing node', () => {
    const nodeIds = new Set(KNOWLEDGE_GRAPH.nodes.map((n) => n.id));
    for (const edge of KNOWLEDGE_GRAPH.edges) {
      expect(
        nodeIds.has(edge.source),
        `Edge source "${edge.source}" not found in nodes`,
      ).toBe(true);
    }
  });

  it('every edge target references an existing node', () => {
    const nodeIds = new Set(KNOWLEDGE_GRAPH.nodes.map((n) => n.id));
    for (const edge of KNOWLEDGE_GRAPH.edges) {
      expect(
        nodeIds.has(edge.target),
        `Edge target "${edge.target}" not found in nodes`,
      ).toBe(true);
    }
  });

  it('has at least 30 nodes', () => {
    expect(KNOWLEDGE_GRAPH.nodes.length).toBeGreaterThanOrEqual(30);
  });

  it('has at least 50 edges', () => {
    expect(KNOWLEDGE_GRAPH.edges.length).toBeGreaterThanOrEqual(50);
  });
});

describe('KnowledgeGraph data quality', () => {
  it('deduplicates technologies — TypeScript appears once', () => {
    const tsNodes = KNOWLEDGE_GRAPH.nodes.filter(
      (n) => n.type === 'Technology' && n.label === 'TypeScript',
    );
    expect(tsNodes).toHaveLength(1);
  });

  it('deduplicates architecture patterns — monorepo appears once', () => {
    const monoNodes = KNOWLEDGE_GRAPH.nodes.filter(
      (n) => n.type === 'ArchitecturePattern' && n.label === 'monorepo',
    );
    expect(monoNodes).toHaveLength(1);
  });

  it('has all 6 project nodes', () => {
    const projectNodes = KNOWLEDGE_GRAPH.nodes.filter(
      (n) => n.type === 'Project',
    );
    expect(projectNodes).toHaveLength(6);
  });

  it('has correct project ids', () => {
    const projectIds = KNOWLEDGE_GRAPH.nodes
      .filter((n) => n.type === 'Project')
      .map((n) => n.id)
      .sort();
    expect(projectIds).toEqual([
      'project:4ustudio-academy',
      'project:command-center',
      'project:intranet-ess',
      'project:kliniu',
      'project:lorigine',
      'project:vevi',
    ]);
  });

  it('connects projects with USES_TECHNOLOGY edges', () => {
    const usesTechEdges = KNOWLEDGE_GRAPH.edges.filter(
      (e) => e.type === 'USES_TECHNOLOGY',
    );
    expect(usesTechEdges.length).toBeGreaterThanOrEqual(40);
  });

  it('connects projects with IMPLEMENTS_PATTERN edges', () => {
    const patternEdges = KNOWLEDGE_GRAPH.edges.filter(
      (e) => e.type === 'IMPLEMENTS_PATTERN',
    );
    expect(patternEdges.length).toBeGreaterThanOrEqual(10);
  });

  it('connects projects with PRODUCED_CAPABILITY edges', () => {
    const capEdges = KNOWLEDGE_GRAPH.edges.filter(
      (e) => e.type === 'PRODUCED_CAPABILITY',
    );
    expect(capEdges.length).toBeGreaterThanOrEqual(10);
  });

  it('connects projects with LED_TO_LESSON edges', () => {
    const lessonEdges = KNOWLEDGE_GRAPH.edges.filter(
      (e) => e.type === 'LED_TO_LESSON',
    );
    expect(lessonEdges.length).toBeGreaterThanOrEqual(20);
  });

  it('connects projects with REFERENCES_PROJECT edges', () => {
    const refEdges = KNOWLEDGE_GRAPH.edges.filter(
      (e) => e.type === 'REFERENCES_PROJECT',
    );
    expect(refEdges.length).toBeGreaterThanOrEqual(5);
    expect(refEdges.length).toBeLessThanOrEqual(15);
  });

  it('connects projects with HAS_MILESTONE edges', () => {
    const milestoneEdges = KNOWLEDGE_GRAPH.edges.filter(
      (e) => e.type === 'HAS_MILESTONE',
    );
    expect(milestoneEdges.length).toBeGreaterThanOrEqual(1);
  });

  it('has SHARES_TECHNOLOGY edges for technology co-occurrence', () => {
    const sharesTechEdges = KNOWLEDGE_GRAPH.edges.filter(
      (e) => e.type === 'SHARES_TECHNOLOGY',
    );
    expect(sharesTechEdges.length).toBeGreaterThan(0);
  });

  it('has SHARES_PATTERN edges for pattern co-occurrence', () => {
    const sharesPatternEdges = KNOWLEDGE_GRAPH.edges.filter(
      (e) => e.type === 'SHARES_PATTERN',
    );
    expect(sharesPatternEdges.length).toBeGreaterThan(0);
  });

  it('has SUPPORTS_CAPABILITY edges from patterns to capabilities', () => {
    const supportsEdges = KNOWLEDGE_GRAPH.edges.filter(
      (e) => e.type === 'SUPPORTS_CAPABILITY',
    );
    expect(supportsEdges.length).toBeGreaterThanOrEqual(5);
  });

  it('has SHARES_DECISION edges from projects to decisions', () => {
    const decisionEdges = KNOWLEDGE_GRAPH.edges.filter(
      (e) => e.type === 'SHARES_DECISION',
    );
    expect(decisionEdges.length).toBeGreaterThanOrEqual(20);
  });

  it('only references existing projectIds in REFERENCES_PROJECT edges', () => {
    const projectIds = new Set(
      KNOWLEDGE_GRAPH.nodes
        .filter((n) => n.type === 'Project')
        .map((n) => n.id),
    );
    for (const edge of KNOWLEDGE_GRAPH.edges) {
      if (edge.type === 'REFERENCES_PROJECT') {
        expect(
          projectIds.has(edge.source),
          `REFERENCES_PROJECT source "${edge.source}" is not a project`,
        ).toBe(true);
        expect(
          projectIds.has(edge.target),
          `REFERENCES_PROJECT target "${edge.target}" is not a project`,
        ).toBe(true);
      }
    }
  });

  it('every edge weight is a positive number', () => {
    for (const edge of KNOWLEDGE_GRAPH.edges) {
      expect(edge.weight).toBeGreaterThan(0);
    }
  });
});

describe('KnowledgeGraph edge type coverage', () => {
  it('uses all defined edge types', () => {
    const usedTypes = new Set(KNOWLEDGE_GRAPH.edges.map((e) => e.type));
    const expectedTypes = [
      EDGE_TYPE.UsesTechnology,
      EDGE_TYPE.ImplementsPattern,
      EDGE_TYPE.ProducedCapability,
      EDGE_TYPE.LedToLesson,
      EDGE_TYPE.ReferencesProject,
      EDGE_TYPE.SharesDecision,
      EDGE_TYPE.SharesTechnology,
      EDGE_TYPE.SharesPattern,
      EDGE_TYPE.HasMilestone,
      EDGE_TYPE.SupportsCapability,
    ];
    for (const type of expectedTypes) {
      expect(
        usedTypes.has(type),
        `Edge type "${type}" not found in graph`,
      ).toBe(true);
    }
  });
});

describe('buildKnowledgeGraph idempotency', () => {
  it('produces the same result on multiple calls', () => {
    const first = buildKnowledgeGraph();
    const second = buildKnowledgeGraph();
    expect(first.nodes.length).toBe(second.nodes.length);
    expect(first.edges.length).toBe(second.edges.length);

    const firstNodeIds = first.nodes.map((n) => n.id).sort();
    const secondNodeIds = second.nodes.map((n) => n.id).sort();
    expect(firstNodeIds).toEqual(secondNodeIds);
  });
});
