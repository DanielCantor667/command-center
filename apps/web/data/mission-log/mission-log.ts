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
    date: '2026-07-29',
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
    id: 'knowledge-graph-and-evidence',
    title: 'Evidence Engine & Knowledge Graph',
    date: '2026-07-28',
    category: MILESTONE_CATEGORY.ArchitectureShift,
    summary: 'Converted portfolio content into a queryable graph of engineering evidence.',
    description: 'Projects and Mission Log stopped being isolated content collections. The Evidence Engine derives capability and experience signals, then the Knowledge Graph makes technologies, architecture patterns, decisions, lessons and milestones navigable through a single read-only model.',
    technologies: [
      { name: 'TypeScript', kind: TECHNOLOGY_KIND.Language, level: TECHNOLOGY_LEVEL.Proficient },
      { name: 'Zod', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Working },
      { name: 'Vitest', kind: TECHNOLOGY_KIND.Tooling, level: TECHNOLOGY_LEVEL.Working },
    ],
    architecture: [
      ARCHITECTURE_PATTERN.CleanArchitecture,
      ARCHITECTURE_PATTERN.DomainDrivenDesign,
      ARCHITECTURE_PATTERN.LayeredArchitecture,
    ],
    relatedProjects: ['command-center', 'kliniu', 'vevi', 'intranet-ess'],
    lessons: [
      { title: 'Derived views must not become sources of truth', description: 'Evidence and graph data are regenerated from domain repositories, which prevents portfolio metrics from drifting away from the documented work.', category: LESSON_CATEGORY.Architecture },
      { title: 'Queries are a product boundary', description: 'A focused query API keeps future modules from depending on graph internals and makes the knowledge model safe to evolve.', category: LESSON_CATEGORY.Process },
    ],
    technicalDecisions: [
      { title: 'Graph query engine over direct graph traversal', context: 'Future UI, Analytics and search need relations but should not understand graph storage details.', decision: 'Expose named, read-only query functions as the only traversal boundary.', reasoning: 'It keeps callers declarative and allows graph representations to evolve without rewriting every consumer.', impact: DECISION_IMPACT.High, projectId: 'command-center' },
    ],
    outcome: 'A deterministic knowledge layer that powers evidence, capability views and now analytics without adding a second database.',
  },
  {
    id: 'immersive-command-city',
    title: 'Immersive Command City',
    date: '2026-07-24',
    category: MILESTONE_CATEGORY.MajorProject,
    summary: 'Shipped the portfolio landing experience as a navigable city instead of a conventional dashboard.',
    description: 'The Command Center now begins with a cinematic city that maps project districts, knowledge relationships, mission trajectory, analytics, evidence and profile into one continuous experience. It retains the application shell as an accessible operational workspace.',
    technologies: [
      { name: 'Next.js', kind: TECHNOLOGY_KIND.Framework, level: TECHNOLOGY_LEVEL.Proficient },
      { name: 'React', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Proficient },
      { name: 'TypeScript', kind: TECHNOLOGY_KIND.Language, level: TECHNOLOGY_LEVEL.Proficient },
    ],
    architecture: [
      ARCHITECTURE_PATTERN.ModuleSystem,
      ARCHITECTURE_PATTERN.DesignSystem,
    ],
    relatedProjects: ['command-center'],
    lessons: [
      { title: 'Immersion needs an operational fallback', description: 'The city creates the first impression, while the persistent workspace remains the reliable route for dense content, keyboard navigation and reduced-motion users.', category: LESSON_CATEGORY.Product },
    ],
    technicalDecisions: [
      { title: 'Progressive enhancement for the 3D experience', context: 'WebGL and rich media should enrich the city without becoming a requirement to access the portfolio.', decision: 'Keep semantic sections and application modules as the baseline, then add the interactive map as an optional visual layer.', reasoning: 'The result is usable on low-power devices and remains robust when graphics capabilities are unavailable.', impact: DECISION_IMPACT.High, projectId: 'command-center' },
    ],
    outcome: 'A distinctive public-facing journey with a clear handoff into the working Command Center.',
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
