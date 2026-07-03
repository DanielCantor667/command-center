# Dashboard Foundation — Design Spec

Status: Approved
Sprint: 0.6
Related: RFC-0006

## Objective

Implement the first real module of Command Center: the Dashboard. It summarizes the engineer and answers "what should I explore next?" — an overview, not a landing page, not a replacement for the other modules.

## Scope

Build only the Dashboard module and its 6 widgets (Hero, Quick Stats, Current Focus, Recent Activity, Quick Navigation, System Status). No Projects, Mission Log, Capabilities, Lab, or Communication content. No charts, graphs, API calls, analytics, animations, business logic, fake loading states, or fake terminal. No changes to `AppShell`, `WorkspaceStore` contract, Module Registry mechanism, or Design System primitives.

## Architecture

```
apps/web/modules/dashboard/
  component.tsx          # composes the 6 widgets, owns data import + prop distribution
  index.ts
  README.md
  components/
    hero/{component.tsx,types.ts,index.ts,tests/}
    quick-stats/{component.tsx,types.ts,index.ts,tests/}
    current-focus/{component.tsx,types.ts,index.ts,tests/}
    recent-activity/{component.tsx,types.ts,index.ts,tests/}
    quick-navigation/{component.tsx,types.ts,index.ts,tests/}
    system-status/{component.tsx,types.ts,index.ts,tests/}
  tests/
    dashboard.test.tsx    # full composition + a11y + responsive grid classes

apps/web/data/
  dashboard.ts            # single static, typed data file for this sprint
```

`MODULE_REGISTRY.dashboard` (in `apps/web/modules/module-registry/module-registry.ts`) switches from the Sprint 0.5 `DashboardModule` placeholder to this real component — the only change outside `modules/dashboard/`.

## Data flow (adjustment 1)

`apps/web/data/dashboard.ts` exports typed static constants: `HeroData`, `QuickStat[]`, `CurrentFocusData`, `ActivityItem[]` (max 5), `SystemStatusItem[]`.

`Dashboard` (`modules/dashboard/component.tsx`) is the **only** file that imports from `apps/web/data/dashboard.ts`. It reads all slices and passes each one down as props to its widget. Widgets are pure, presentational components — they receive data via props and have zero knowledge of where it comes from (no direct data imports, no coupling to a future CMS/API swap).

## Quick Navigation (adjustment 2)

`QuickNavigation` does not import `useWorkspaceStore` or know about Zustand. It receives a single prop `onNavigate: (module: WorkspaceModule) => void` from `Dashboard`. `Dashboard` is the only place that touches `WorkspaceStore`:

```tsx
// modules/dashboard/component.tsx
const setCurrentModule = useWorkspaceStore((state) => state.setCurrentModule);
// ...
<QuickNavigation onNavigate={setCurrentModule} />
```

`QuickNavigation`'s prop type only needs the 4 destination ids (`projects | mission | capabilities | lab | communication` minus dashboard/profile since RFC's mockup lists Projects/Mission/Lab/Capabilities — Communication button included per RFC's "Quick Navigation" shortcut list). Buttons use the existing `Button` primitive; each `onClick` calls `onNavigate(targetId)`.

## Current Focus (adjustment 3)

No new `Badge` primitive. Status ("In Development") renders as `Typography` (e.g. `variant="caption"` or `body-small`, following the same color-token conventions already used elsewhere — `color="secondary"` or similar), not a pill/badge component.

## Widgets — file ceremony

Minimal pattern (same as the 7 Sprint 0.5 placeholder modules): `component.tsx` + `types.ts` (props shape) + `index.ts` + `tests/`. No per-widget `README.md`/`stories.md` — only `modules/dashboard/README.md` documents the module as a whole. No `hooks/` folder (no state, no side effects — added later only if a real hook becomes necessary).

## Widgets — content

- **Hero**: name, role, mission statement, status, availability, CTA button. No biography, no timeline.
- **Quick Stats**: display-only grid — Projects, Years of experience, Technologies, Repositories, Articles.
- **Current Focus**: single card — "Currently building: Command Center OS", status "In Development" (as `Typography`, see adjustment 3).
- **Recent Activity**: chronological `<ul>`, max 5 static items.
- **Quick Navigation**: shortcut `Button`s for Projects, Mission Log, Capabilities, Lab, Communication; calls `onNavigate(id)` prop (see adjustment 2).
- **System Status**: static indicators — Theme, Version, Architecture, Tests, Build, Accessibility.

All widgets reuse existing `@command-center/ui` primitives (`Stack`, `Typography`, `Panel`/`Surface`, `Button`). No new reusable primitives created inside `modules/dashboard/`.

## Layout

Responsive 2-column grid on desktop, single column on tablet/mobile, via existing `Grid`/`Stack` + Tailwind responsive classes already used in the design system. No masonry, no new CSS.

## Testing

- One test per widget: renders its own content correctly given props (each test supplies fixture props, not real data from `apps/web/data/dashboard.ts`).
- `dashboard.test.tsx`: renders full `Dashboard`, asserts all 6 widgets appear, asserts Quick Navigation buttons call the injected `onNavigate` (or, if wired against the real store in this integration test, asserts `setCurrentModule` is invoked with the right id), verifies semantic headings/landmarks, runs `axe`.
- Responsive: assert the grid's responsive Tailwind classes are present (jsdom has no real viewport — class-based assertion only, not visual).

## Acceptance Criteria

- Dashboard renders with all 6 widgets, each independent (no widget imports another, no widget imports data directly).
- Static typed data lives only in `apps/web/data/dashboard.ts`.
- `MODULE_REGISTRY.dashboard` renders the real component; other 6 module ids untouched.
- Build, typecheck, lint, tests pass.
- No changes to `AppShell`, `WorkspaceStore` contract, Module Registry type, or `packages/ui`.
