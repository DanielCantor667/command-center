# Projects Module

## Purpose

Engineering archive of Command Center. Every project communicates technical decisions, architecture, product thinking, challenges, and engineering maturity. Not a gallery, not portfolio cards.

## Rendering flow

```
ProjectsModule (local state: selectedProjectId)
  ├── FeaturedProject (first project where featured === true)
  ├── ProjectsGrid
  │     └── ProjectCard (× N public projects)
  └── ProjectDetail (only when selectedProjectId is set)
        ├── ProjectHeader
        ├── ProjectArchitecture
        ├── ProjectTechnologies
        ├── ProjectFeatures
        ├── EngineeringDecisions
        ├── LessonsLearned
        └── RelatedProjects (resolved from PROJECTS)
```

## Data flow

`ProjectsModule` is the only component in this module that imports `PROJECTS` from `apps/web/data/projects`. It filters and distributes project data to each sub-component via props. Sub-components are pure, presentational: they only read their own props and never import data directly.

## State flow

- `selectedProjectId` — local `useState` in `ProjectsModule`.
- No global store involvement.
- No routing, no URL changes, no modal, no drawer.

## Navigation

Selecting a project updates the detail panel. No URL changes. No routing.

## Folder organization

```
modules/projects/
  component.tsx          # ProjectsModule — container, local state, composition
  index.ts
  README.md
  components/
    featured-project/
    projects-grid/
    project-card/
    project-detail/
    project-header/
    project-technologies/
    project-architecture/
    project-features/
    engineering-decisions/
    lessons-learned/
    related-projects/
    empty-state/
  tests/
    projects.test.tsx
```

## Accessibility

- Semantic headings (`h1`, `h2`, `h3`, `h4`).
- Lists use semantic `<ul>` / `<li>`.
- Buttons are interactive `<button>` elements.
- `aria-label` on icon-only elements.
- Visible focus on interactive elements.

## Performance

- Derived collections use `useMemo`.
- `PROJECTS` is never duplicated.
- Avoid unnecessary rerenders via local state.
