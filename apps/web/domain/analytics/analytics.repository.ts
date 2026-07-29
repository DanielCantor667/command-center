import { KNOWLEDGE_GRAPH } from '../knowledge-graph';
import { computeAnalytics } from './analytics-engine';
import type { Analytics } from './analytics.types';

/** No cache: every read is deterministically rebuilt from the graph. */
export function getAnalytics(): Analytics {
  return computeAnalytics(KNOWLEDGE_GRAPH);
}
