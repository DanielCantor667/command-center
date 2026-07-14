# Knowledge Graph Domain

Derived domain that builds a knowledge graph from existing data sources.

## Philosophy

Relationships should never be claimed. Relationships should be discovered. Every connection in the graph is derived from real data — projects, milestones, and evidence.

## Rules

- Pure TypeScript
- Read only
- Derived only
- No persistence
- No API
- No database
- No React
- Never duplicates data

## Inputs

| Source | Domain |
|---|---|
| Projects | `@/data/projects` |
| Mission Log | `@/data/mission-log` |
| Evidence Engine | `@/domain/evidence` |

## Nodes

| Node Type | Count | Deduplication |
|---|---|---|
| Project | 6 | By project ID |
| Technology | per unique name | Global |
| ArchitecturePattern | per unique pattern | Global |
| EngineeringDecision | per project/milestone | Per instance |
| Challenge | per project | Per instance |
| Lesson | per project/milestone | Per instance |
| Capability | per Evidence Engine | Global |
| Milestone | 3 | By milestone ID |

## Edges

| Edge Type | Source → Target | Purpose |
|---|---|---|
| USES_TECHNOLOGY | Project → Technology | Direct technology usage |
| IMPLEMENTS_PATTERN | Project → ArchitecturePattern | Architecture adoption |
| PRODUCED_CAPABILITY | Project → Capability | Evidence contribution |
| LED_TO_LESSON | Project → Lesson | Learning outcome |
| REFERENCES_PROJECT | Project → Project | Cross-reference |
| SHARES_DECISION | Project → EngineeringDecision | Decision ownership |
| SHARES_TECHNOLOGY | Technology ↔ Technology | Co-occurrence |
| SHARES_PATTERN | ArchitecturePattern ↔ ArchitecturePattern | Co-occurrence |
| HAS_MILESTONE | Project → Milestone | Milestone affiliation |
| SUPPORTS_CAPABILITY | ArchitecturePattern → Capability | Pattern enables capability |

## Architecture

```
data/projects ──┐
data/mission ───┤
                 ├── graph-builder.ts → graph.repository.ts → consumers
domain/evidence ─┘
```

## Usage

```typescript
import { KNOWLEDGE_GRAPH } from '@/domain/knowledge-graph';

console.log(KNOWLEDGE_GRAPH.nodes.length); // total nodes
console.log(KNOWLEDGE_GRAPH.edges.length); // total edges
```

## Testing

```bash
npx vitest run domain/knowledge-graph/tests
```
