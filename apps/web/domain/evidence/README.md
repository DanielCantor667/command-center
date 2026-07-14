# Evidence Engine

Derived domain that transforms engineering evidence into professional capabilities.

## Philosophy

Experience should never be claimed. Experience should be demonstrated. Everything shown to the visitor must be traceable back to evidence.

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

Each project contributes: technologies, architecture patterns, engineering decisions, lessons learned.

Each milestone contributes: technologies, architecture patterns, technical decisions, lessons.

## Outputs

| Output | Description |
|---|---|
| Capability | Inferred skill with aggregated evidence and confidence |
| TechnologyExperience | Per-technology breakdown with evidence counts |
| ArchitectureProfile | Per-pattern breakdown with projects, decisions, lessons |
| EngineeringProfile | Decision totals grouped by impact |
| LearningProfile | Lesson totals grouped by category |
| Statistics | Aggregate counts across all inputs |

## Architecture

```
data/projects ──┐
                ├── evidence-engine.ts → evidence.repository.ts → consumers
data/mission ───┘
```

The engine never owns data. It consumes domains and produces derived structures.

## Usage

```typescript
import { getEvidence } from '@/domain/evidence';

const evidence = getEvidence();
// evidence.capabilities
// evidence.technologyExperiences
// evidence.architectureProfiles
// evidence.engineeringProfile
// evidence.learningProfile
// evidence.statistics
```

## Testing

```bash
npx vitest run domain/evidence/tests
```
