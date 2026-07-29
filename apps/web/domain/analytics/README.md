# Analytics Engine

Analytics is a pure, read-only interpretation layer over the Knowledge Graph. It does not persist, mutate, cache, or import Projects, Mission Log, or Evidence directly.

`analytics-engine.ts` derives deterministic metrics, rankings, insights and recommendations through the graph query engine. `analytics.repository.ts` offers the runtime entry point without memoization. `analytics.schema.ts` is the runtime contract and `analytics.types.ts` derives its TypeScript API.

The public API is `getAnalytics()` and `computeAnalytics(graph)`. Future dashboard, search, reports, exports and AI surfaces consume this API instead of reconstructing metrics from source domains.

## Invariants

- Graph input is never modified.
- Results are rebuildable and deterministic for a graph snapshot.
- All traversals go through Knowledge Graph queries.
- Recommendations flag missing evidence; they do not fabricate it.
