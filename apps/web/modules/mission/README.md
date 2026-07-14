# Mission Log Module

## Purpose

Engineering evolution of the person behind Command Center.

Projects explain *what* was built. Mission Log explains *how* the engineer evolved while building them.

## Timeline philosophy

The timeline is composed of engineering milestones — not companies or job titles. Each milestone represents meaningful technical growth: first monorepo, first design system, first DDD architecture, etc.

## Data flow

`MissionModule` imports `MILESTONES` from `apps/web/data/mission-log`. Sub-components are pure presentational components that only read props.

Domain data references `PROJECTS` by ID — no duplicated data.

## Filtering

Filters are local module state (useState). No global store.

- Year: filter by `date` year
- Architecture: filter by `architecture` patterns
- Technology: filter by `technologies[].name`
- Project: filter by `relatedProjects[]` IDs

## Relationships

- `relatedProjects` — references PROJECTS by `id`
- `technicalDecisions[].projectId` — optional reference to matching project decision

## Folder organization

```
modules/mission/
  component.tsx          # MissionModule — container, local filter state
  index.ts
  README.md
  components/
    timeline/
    timeline-item/
    milestone/
    lesson/
    decision/
    project-reference/
    filters/
    empty-state/
  tests/
    mission.test.tsx
```

## Accessibility

- Semantic headings (`h1`, `h3`, `h4`, `h5`)
- Timeline items are `<button>` with `aria-expanded`
- Filter `<select>` with `<label>`
- Visible focus on interactive elements
