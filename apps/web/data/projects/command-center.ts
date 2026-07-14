import {
  ARCHITECTURE_PATTERN,
  DECISION_IMPACT,
  LESSON_CATEGORY,
  OWNERSHIP_TYPE,
  PROJECT_STATUS,
  TECHNOLOGY_KIND,
  TECHNOLOGY_LEVEL,
} from './project.enums';
import type { Project } from './project.types';

export const commandCenter: Project = {
  id: 'command-center',
  slug: 'command-center',
  name: 'Command Center',
  tagline: 'The Operating System of a Software Engineer',
  summary:
    'A living, explorable platform that presents an engineering career as a software product: projects as applications, experience as a mission log, skills as capabilities.',
  description:
    'Command Center is a portfolio built as a professional software product, organized like a modern engineering organization. It is a Turborepo monorepo with a Next.js application, a shared design system (9 primitives: Surface, Panel, Window, Typography, Divider, Stack, Grid, Button, IconButton), a typed module registry (7 modules: dashboard, profile, projects, mission, capabilities, lab, communication), an evidence engine that computes capabilities from domain data, and a documentation-first workflow (specs before code, ADRs for decisions). The platform foundation covers repository governance, design tokens and theming, application shell with persistent workspace, module system with placeholder pattern, and dashboard foundation. Domains are pure TypeScript with Zod validation, independent of React and UI packages.',
  status: PROJECT_STATUS.Development,
  featured: true,
  public: true,
  startedAt: '2026-07-01',
  completedAt: null,
  lastUpdated: '2026-07-09',
  technologies: [
    { name: 'TypeScript', kind: TECHNOLOGY_KIND.Language, level: TECHNOLOGY_LEVEL.Proficient },
    { name: 'Next.js', kind: TECHNOLOGY_KIND.Framework, level: TECHNOLOGY_LEVEL.Proficient },
    { name: 'React', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Proficient },
    { name: 'Tailwind CSS', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Proficient },
    { name: 'Zustand', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Working },
    { name: 'Zod', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Working },
    { name: 'Prisma', kind: TECHNOLOGY_KIND.Library, level: TECHNOLOGY_LEVEL.Learning },
    { name: 'Supabase', kind: TECHNOLOGY_KIND.Platform, level: TECHNOLOGY_LEVEL.Learning },
    { name: 'Turborepo', kind: TECHNOLOGY_KIND.Tooling, level: TECHNOLOGY_LEVEL.Working },
    { name: 'Vitest', kind: TECHNOLOGY_KIND.Tooling, level: TECHNOLOGY_LEVEL.Working },
    { name: 'pnpm', kind: TECHNOLOGY_KIND.Tooling, level: TECHNOLOGY_LEVEL.Working },
  ],
  architecture: [
    ARCHITECTURE_PATTERN.Monorepo,
    ARCHITECTURE_PATTERN.ModuleSystem,
    ARCHITECTURE_PATTERN.DesignSystem,
    ARCHITECTURE_PATTERN.LayeredArchitecture,
  ],
  features: [
    {
      title: 'Application Shell',
      description:
        'Persistent shell with sidebar navigation, top bar, status bar, brand, logo, and a workspace that renders the active module. State managed via Zustand WorkspaceStore.',
    },
    {
      title: 'Module System',
      description:
        'Typed module registry (apps/web/modules/module-registry/) that maps 7 workspace modules to React components, with a placeholder pattern for unbuilt modules. Decouples shell from module implementation.',
    },
    {
      title: 'Design System Core',
      description:
        'Shared UI package (packages/ui/) with 9 visual primitives (Surface, Panel, Window, Typography, Divider, Stack, Grid, Button, IconButton), theme engine (light/dark), and Tailwind v4 integration across the monorepo.',
    },
    {
      title: 'Dashboard Foundation',
      description:
        'Dashboard module with 6 widgets: hero, quick stats, current focus, recent activity, quick navigation, and system status. Reads static typed data from data/dashboard.ts.',
    },
    {
      title: 'Documentation-first workflow',
      description:
        'Specs before code in specs/, immutable ADRs in decisions/, engineering docs in docs/, and living context in memory/. Every important decision is traceable and reviewable.',
    },
    {
      title: 'Evidence Engine',
      description:
        'Pure TypeScript derivation engine (domain/evidence/) that reads from Projects and Mission Log domains to compute capabilities, technology experiences, architecture profiles, engineering profiles, and learning profiles. Read-only, no persistence, no API, no React.',
    },
    {
      title: 'Theme Engine',
      description:
        'Light/dark theme system with CSS custom properties from packages/config/tokens/, ThemeProvider React context, and inline theme script for flash prevention. All resolves to design tokens.',
    },
    {
      title: 'Projects Domain',
      description:
        'Typed domain model for engineering projects with Zod schema validation, immutable readonly repository pattern, and comprehensive sections (architecture, decisions, lessons, metrics). Pure TypeScript, no React, no UI.',
    },
    {
      title: 'Mission Log Domain',
      description:
        'Typed domain model for professional milestones with Zod schema validation and immutable repository. Each milestone includes architecture patterns, technologies, lessons, and technical decisions with project references.',
    },
  ],
  challenges: [
    {
      title: 'Tailwind v4 in a monorepo',
      description:
        'Integrating Tailwind CSS v4 across shared packages and the Next.js app required a dedicated technical task (TECH-001). Auto-detection does not cross pnpm symlink boundaries.',
      resolution: 'Added explicit @source directive in packages/config/tailwind.css pointing to packages/ui. Documented and accepted as ADR-005.',
    },
    {
      title: 'Design System architecture',
      description:
        'Defining the component hierarchy (Surface -> Panel -> Window), ensuring all styles resolve to tokens, setting accessibility as acceptance criteria, and maintaining zero hardcoded values.',
      resolution: 'ADR-004 established the architecture: tokens-only styling, uniform folder pattern per component, clsx + tailwind-merge cn() utility, Vitest + Testing Library + vitest-axe for testing.',
    },
    {
      title: 'Domain/UI separation',
      description:
        'Keeping domain models (Projects, Mission Log, Evidence) pure from React, Zustand, and UI concerns while making them consumable by presentation modules.',
      resolution: 'Domains live in data/ and domain/ directories with no React dependencies. Zod schemas are the single source of truth. The evidence engine is pure TypeScript derivation.',
    },
    {
      title: 'Evidence Engine design',
      description:
        'Building a read-only derivation engine that computes capabilities, technology experiences, and architecture profiles from static domain data without persistence, API, or database.',
      resolution: 'Implemented as pure functions in domain/evidence/ that take projects and milestones as inputs and return computed evidence. No side effects, no state, no persistence. Confidence levels derived from evidence counts.',
    },
  ],
  engineeringDecisions: [
    {
      title: 'Why Turborepo (Monorepo)',
      context:
        'The platform ships one web app today but is designed as a product with shared design system, configs, and future apps.',
      decision: 'Use a Turborepo monorepo with apps/ and packages/ workspaces.',
      reasoning:
        'Shared code (UI, tsconfig, eslint-config) lives in packages/ without duplication, and the task pipeline scales as apps are added.',
      impact: DECISION_IMPACT.High,
    },
    {
      title: 'Why a Module System over routes',
      context:
        'The product vision presents the portfolio as an operating system with modules, not as a set of static pages.',
      decision:
        'Build a typed module registry that maps workspace modules to components inside a persistent application shell.',
      reasoning:
        'Modules can be added or swapped without touching the shell, and unbuilt domains render a consistent placeholder.',
      impact: DECISION_IMPACT.High,
    },
    {
      title: 'Why documentation before implementation',
      context:
        'The repository is organized like an engineering organization, not a personal scratchpad.',
      decision:
        'Write specs before code, record decisions as immutable ADRs, and keep living context in memory/.',
      reasoning:
        'Every important decision is traceable, reviewable, and survives context loss between working sessions.',
      impact: DECISION_IMPACT.Medium,
    },
    {
      title: 'Design System hierarchy (Surface -> Panel -> Window)',
      context:
        'Sprint 0.2 delivered design tokens and theming but no reusable visual primitives. Sprint 0.4 and future UI development needed consistent components without style duplication.',
      decision:
        'Implement Surface -> Panel -> Window composition hierarchy, Typography with semantic variants, Button -> IconButton, and layout primitives (Stack, Grid, Divider). Every style resolves to a CSS token. ADR-004 accepted.',
      reasoning:
        'A clear composition hierarchy prevents ad-hoc styling. Tokens-only styling ensures changes propagate consistently. Accessibility is a requirement, not optional.',
      impact: DECISION_IMPACT.High,
    },
    {
      title: 'Tailwind v4 monorepo integration',
      context:
        'After Sprint 0.6, the Dashboard rendered without Tailwind utilities used by packages/ui. Tokens and Theme Engine worked correctly; the issue was isolated to Tailwind utility generation.',
      decision:
        'Add explicit @source directive in packages/config/tailwind.css pointing to packages/ui, keeping CSS-first architecture of Tailwind v4. ADR-005 accepted.',
      reasoning:
        '@source is aditive, recommended by Tailwind docs for monorepos, and does not replace automatic detection. Alternatives (disabling auto-detection, moving tailwind.css, reverting to config file) were evaluated and rejected.',
      impact: DECISION_IMPACT.High,
    },
    {
      title: 'Zod schema as single source of truth',
      context:
        'Domain models needed runtime validation and TypeScript types. Duplicating types manually would create drift between the schema and the type definitions.',
      decision:
        'Use Zod as the validation library and derive TypeScript types with z.infer. Schema is the single source of truth; no manual type interfaces.',
      reasoning:
        'Zod is the ecosystem standard for runtime validation, allows type derivation from schema (one definition), and has no transitive dependencies.',
      impact: DECISION_IMPACT.Medium,
    },
  ],
  lessonsLearned: [
    {
      title: 'Sprint-sized foundations compound',
      description:
        'Splitting the platform foundation into small sprints (repository, bootstrap, design system, shell, modules, dashboard) kept every change reviewable and the architecture consistent.',
      category: LESSON_CATEGORY.Process,
    },
    {
      title: 'A typed registry keeps modules decoupled',
      description:
        'Mapping workspace modules to components through a single typed registry avoided coupling the shell to any specific module implementation.',
      category: LESSON_CATEGORY.Architecture,
    },
    {
      title: 'Tokens-first design prevents style drift',
      description:
        'Defining all design tokens centrally in packages/config/tokens/ before building primitives ensured consistent theming. A change to a token propagates to all 9 primitives without touching component code.',
      category: LESSON_CATEGORY.Architecture,
    },
    {
      title: 'Explicit dependency boundaries in monorepos',
      description:
        'Tailwind v4 auto-detection does not cross pnpm symlink boundaries. The @source directive makes cross-package dependencies explicit rather than implicit, improving build configuration maintainability.',
      category: LESSON_CATEGORY.Tooling,
    },
    {
      title: 'Evidence engine as derivation layer',
      description:
        'Building a pure derivation engine that reads from domain repositories rather than duplicating data kept the architecture clean. The engine computes capabilities, technology profiles, and architecture profiles without introducing a new data source.',
      category: LESSON_CATEGORY.Architecture,
    },
  ],
  metrics: {
    commits: 27,
    contributors: 1,
    durationWeeks: null,
    modules: 7,
    tests: 228,
    coverage: null,
  },
  media: [],
  links: {
    repository: 'https://github.com/DanielCantor667/command-center',
  },
  role: {
    title: 'Software Engineer & Product Owner',
    responsibilities: [
      'Architecture and monorepo setup',
      'Design system and application shell',
      'Module system and dashboard foundation',
      'Evidence engine and domain models',
      'Documentation, specs, and ADRs',
      'Tailwind v4 monorepo integration',
      'Testing infrastructure and accessibility',
    ],
  },
  tags: [
    'portfolio',
    'monorepo',
    'design-system',
    'nextjs',
    'typescript',
    'tailwind-v4',
    'evidence-driven',
    'documentation-first',
  ],
  relationships: {
    relatedProjects: [],
    relatedArticles: [],
    relatedSkills: [],
  },
  metadata: { version: 1 },
  ownership: {
    type: OWNERSHIP_TYPE.Personal,
    confidential: false,
  },
};
