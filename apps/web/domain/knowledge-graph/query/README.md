# Knowledge Graph Query Engine

Pure query layer over `KNOWLEDGE_GRAPH`.

## Rules

- Pure functions
- No cache
- No state
- No side effects
- Never modifies the graph
- Never creates nodes or edges

## API

### Nodes

| Function | Return |
|---|---|
| `findNode(graph, id)` | `Node \| undefined` |
| `findNodesByType(graph, type)` | `Node[]` |
| `findNodes(graph, predicate)` | `Node[]` |

### Projects

| Function | Return |
|---|---|
| `findProject(graph, id)` | `Node \| undefined` |
| `findRelatedProjects(graph, id)` | `Node[]` |
| `findProjectsUsingTechnology(graph, name)` | `Node[]` |
| `findProjectsUsingPattern(graph, pattern)` | `Node[]` |
| `findProjectsSupportingCapability(graph, name)` | `Node[]` |

### Technologies

| Function | Return |
|---|---|
| `findTechnology(graph, name)` | `Node \| undefined` |
| `findTechnologies(graph)` | `Node[]` |
| `findMostUsedTechnologies(graph)` | `TechnologyUsage[]` |
| `findTechnologiesByProject(graph, id)` | `Node[]` |

### Architecture

| Function | Return |
|---|---|
| `findArchitecturePatterns(graph)` | `Node[]` |
| `findPatternsByProject(graph, id)` | `Node[]` |

### Engineering Decisions

| Function | Return |
|---|---|
| `findEngineeringDecisions(graph)` | `Node[]` |
| `findDecisionsByProject(graph, id)` | `Node[]` |
| `findProjectsSharingDecision(graph, title)` | `Node[]` |

### Lessons

| Function | Return |
|---|---|
| `findLessons(graph)` | `Node[]` |
| `findLessonsByProject(graph, id)` | `Node[]` |

### Capabilities

| Function | Return |
|---|---|
| `findCapabilities(graph)` | `Node[]` |
| `findCapabilitiesByProject(graph, id)` | `Node[]` |

### Milestones

| Function | Return |
|---|---|
| `findMilestones(graph)` | `Node[]` |
| `findMilestonesByProject(graph, id)` | `Node[]` |

## Usage

```typescript
import { KNOWLEDGE_GRAPH } from '@/domain/knowledge-graph';
import { findProject, findTechnologiesByProject } from '@/domain/knowledge-graph/query';

const project = findProject(KNOWLEDGE_GRAPH, 'kliniu');
const techs = findTechnologiesByProject(KNOWLEDGE_GRAPH, 'kliniu');
```
