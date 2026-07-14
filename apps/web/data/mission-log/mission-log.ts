import {
  ARCHITECTURE_PATTERN,
  DECISION_IMPACT,
  LESSON_CATEGORY,
  TECHNOLOGY_KIND,
  TECHNOLOGY_LEVEL,
} from '../projects/project.enums';
import { MILESTONE_CATEGORY } from './mission-log.enums';
import type { Milestone } from './mission-log.types';

export const MILESTONES: readonly Milestone[] = [
  {
    id: 'command-center-architecture',
    title: 'Command Center — Platform Architecture',
    date: '2026-07-01',
    category: MILESTONE_CATEGORY.ArchitectureShift,
    summary:
      'Designed and built Command Center as a modular platform with a typed module registry, shared design system, and documentation-first workflow.',
    description:
      'This milestone represents the transition from building single-page portfolios to designing a complete platform architecture. Command Center is organized as a Turborepo monorepo with apps/, packages/, docs/, specs/, decisions/, and memory/ directories — each with a clear purpose. The application shell decouples navigation from module implementation through a typed registry, and the design system package enforces visual consistency across the entire product. Every important decision is recorded as an ADR, and specs precede implementation.',
    technologies: [
      { name: 'TypeScript', kind: TECHNOLOGY_KIND.Language, level: TECHNOLOGY_LEVEL.Proficient },
      { name: 'Next.js', kind: TECHNOLOGY_KIND.Framework, level: TECHNOLOGY_LEVEL.Proficient },
      { name: 'React', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Proficient },
      { name: 'Tailwind CSS', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Proficient },
      { name: 'Turborepo', kind: TECHNOLOGY_KIND.Tooling, level: TECHNOLOGY_LEVEL.Working },
      { name: 'Vitest', kind: TECHNOLOGY_KIND.Tooling, level: TECHNOLOGY_LEVEL.Working },
      { name: 'Zustand', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Working },
    ],
    architecture: [
      ARCHITECTURE_PATTERN.Monorepo,
      ARCHITECTURE_PATTERN.ModuleSystem,
      ARCHITECTURE_PATTERN.DesignSystem,
      ARCHITECTURE_PATTERN.LayeredArchitecture,
    ],
    relatedProjects: ['command-center'],
    lessons: [
      {
        title: 'Monorepos require explicit governance',
        description:
          'A monorepo without package boundaries and dependency rules becomes a big ball of mud. Defining apps/, packages/, and their inter-dependencies at the start prevents coupling issues later.',
        category: LESSON_CATEGORY.Architecture,
      },
      {
        title: 'Documentation-first reduces rework',
        description:
          'Writing RFCs before code forced me to think through decisions before committing to implementation. This saved multiple refactors during the platform foundation sprint.',
        category: LESSON_CATEGORY.Process,
      },
    ],
    technicalDecisions: [
      {
        title: 'Why Turborepo over Nx or standalone Next.js',
        context:
          'The platform has one web app today but requires shared packages for UI, configuration, and tooling. A monorepo was necessary, but the choice of orchestrator mattered for developer experience.',
        decision:
          'Use Turborepo for task orchestration with pnpm workspaces for package management.',
        reasoning:
          'Turborepo is simpler to configure than Nx for a single-app monorepo, and pnpm workspaces provide strict dependency isolation out of the box. The combination keeps the toolchain lean.',
        impact: DECISION_IMPACT.High,
        projectId: 'command-center',
      },
      {
        title: 'Module registry over file-system routing',
        context:
          'The product vision presents the portfolio as an operating system with discrete modules, not a content website with pages.',
        decision:
          'Implement a typed module registry that maps workspace module IDs to React components, rendered by a persistent application shell.',
        reasoning:
          'Modules can be added, replaced, or removed without touching the shell. Unbuilt modules render a consistent placeholder. The registry is type-safe and self-documenting.',
        impact: DECISION_IMPACT.High,
        projectId: 'command-center',
      },
    ],
    outcome:
      'A platform foundation that separates concerns (domain data, design system, application shell, module system) and establishes conventions for all future modules. The architecture supports adding new modules without structural changes.',
  },
  {
    id: 'todo-milestone-1',
    title: 'TODO: real milestone — e.g., First Monorepo',
    date: '2026-07-01',
    category: MILESTONE_CATEGORY.MajorProject,
    summary: 'TODO: real summary — first monorepo milestone',
    description: 'TODO: real description of the milestone, context, and what was achieved',
    technologies: [],
    architecture: [],
    relatedProjects: [],
    lessons: [],
    technicalDecisions: [],
    outcome: 'TODO: real outcome and impact of this milestone',
  },
  {
    id: 'todo-milestone-2',
    title: 'TODO: real milestone — e.g., First Design System',
    date: '2026-07-01',
    category: MILESTONE_CATEGORY.MajorProject,
    summary: 'TODO: real summary — first design system milestone',
    description: 'TODO: real description of the milestone, context, and what was achieved',
    technologies: [],
    architecture: [],
    relatedProjects: [],
    lessons: [],
    technicalDecisions: [],
    outcome: 'TODO: real outcome and impact of this milestone',
  },
];

export const MILESTONE_FILTER_OPTIONS = {
  years: [...new Set(MILESTONES.map((m) => m.date.slice(0, 4)))].sort().reverse(),
  architectures: [
    ...new Set(MILESTONES.flatMap((m) => m.architecture)),
  ].sort(),
  technologies: [
    ...new Set(MILESTONES.flatMap((m) => m.technologies.map((t) => t.name))),
  ].sort(),
  projects: [
    ...new Set(MILESTONES.flatMap((m) => m.relatedProjects)),
  ].sort(),
} as const;
