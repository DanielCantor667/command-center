# RFC-0014 — Analytics Engine

**Status:** implemented after design approval  
**Decision:** Analytics is a pure derived domain over the Knowledge Graph query API.

## Purpose

Analytics turns the graph into metrics, rankings, insights and evidence-gap recommendations. It is never a database, cache or second source of truth. It does not import Projects, Mission Log or Evidence Engine.

## Boundary

`computeAnalytics(graph)` is deterministic and read-only. `getAnalytics()` passes the current `KNOWLEDGE_GRAPH` into that function. All traversal is performed through the Knowledge Graph Query Engine; callers never need the source repositories to obtain an analytics view.

## Model

`Analytics` contains `projects`, `technologies`, `architecture`, `engineering`, `lessons`, `challenges`, `capabilities`, `mission`, `global`, `insights` and `recommendations`. Rankings have node identity, label, numerical value and optional explanation. Insights and recommendations always carry related node IDs for traceability.

## Metrics and rankings

- Projects: total, public, featured, status distribution and graph connectivity.
- Technologies: totals, average per project, most/least used and connected nodes.
- Architecture: usage, most common pattern and average patterns per project.
- Engineering: total decisions, decisions per project and decisions shared by more than one project.
- Learning: lesson total, categories and average per project.
- Challenges, capabilities and mission: totals and averages per project; capability rankings use graph confidence metadata.
- Global: graph nodes, edges and connected project/technology rankings.

Insights are generated from adoption and connectivity. Recommendations only identify gaps already visible in the graph (for example a low-confidence capability or project without lessons); they never synthesize evidence.

## Invariants

1. Analytics does not mutate graph nodes or edges.
2. It creates no graph nodes, relations or persisted records.
3. The same graph yields the same result.
4. Every emitted claim can be traced to a node or relationship.
5. The engine remains valid at larger scale because callers use query functions rather than graph representation details.

## Public API

- `computeAnalytics(graph)` for tests, reports and future graph snapshots.
- `getAnalytics()` for live Command Center modules.

Future consumers include Dashboard, Search, AI assistance, reports/export and the Knowledge Explorer. New metrics are additive fields and query functions; they do not require another data store.
