import { describe, expect, it } from 'vitest';
import { KNOWLEDGE_GRAPH } from '../../knowledge-graph';
import { computeAnalytics, getAnalytics } from '..';

describe('Analytics Engine', () => {
  it('derives a deterministic read-only analytics view from the graph', () => {
    const first = computeAnalytics(KNOWLEDGE_GRAPH);
    const second = getAnalytics();
    expect(first.projects.totalProjects).toBeGreaterThan(0);
    expect(first.global.nodes).toBe(KNOWLEDGE_GRAPH.nodes.length);
    expect(first.global.edges).toBe(KNOWLEDGE_GRAPH.edges.length);
    expect(second).toEqual(first);
  });
});
