# Mission Log — Domain

## Purpose

Engineering evolution of the person behind Command Center.

Each milestone represents meaningful technical growth. Not companies. Not job titles.

## Relationships

- `relatedProjects` — references PROJECTS by `id`
- `technicalDecisions[].projectId` — optional reference to project where a matching decision exists

## Conventions

- Newest milestone first in the repository array
- No duplicated content with PROJECTS
- Every reference must resolve to an existing project or be a TODO skeleton

## Filter options

`MILESTONE_FILTER_OPTIONS` provides pre-computed distinct values for years, architectures, technologies, and project IDs used across all milestones.
