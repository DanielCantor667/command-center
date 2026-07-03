# Dashboard Module

## Purpose

Home application of Command Center. Summarizes the engineer and helps decide what to explore
next. Not a landing page, not a replacement for the other modules.

## Folder organization

```
dashboard/
  component.tsx        # DashboardModule — container, composes widgets
  index.ts
  README.md
  components/
    hero/
    quick-stats/
    current-focus/
    recent-activity/
    quick-navigation/
    system-status/
  tests/
    dashboard.test.tsx
```

## Widget responsibilities

- **Hero** — name, role, mission statement, status, availability, CTA (navigates to Projects).
- **Quick Stats** — display-only grid of static metrics.
- **Current Focus** — single card with the project currently being built and its status.
- **Recent Activity** — chronological list, max 5 static items.
- **Quick Navigation** — shortcut buttons to Projects, Mission Log, Capabilities, Lab,
  Communication.
- **System Status** — static indicators (Theme, Version, Architecture, Tests, Build,
  Accessibility).

Every widget is a pure, presentational component: it only reads its own props and never imports
data or state directly.

## Data flow

`DashboardModule` is the only file in this module allowed to import `apps/web/data/dashboard.ts`.
It reads the static, typed data and distributes each slice to the corresponding widget via props.
When a CMS or database replaces the static data source, only `apps/web/data/dashboard.ts` changes
— widgets and `DashboardModule`'s composition stay the same.

## Navigation

`DashboardModule` is the only component in this module authorized to touch `WorkspaceStore`. It
reads `setCurrentModule` and passes it down as plain callbacks (`onCtaClick`, `onNavigate`) to
`Hero` and `QuickNavigation`. Neither widget imports Zustand or knows how navigation is
implemented.

## Known Limitations

- All data is static placeholder data (`apps/web/data/dashboard.ts`).
- No loading or error states — not applicable until a real data source exists.

## Future Extensions

- Replace `apps/web/data/dashboard.ts` with a CMS/database-backed source.
- Add remaining modules (Projects, Mission Log, Capabilities, Lab, Communication) following the
  same container + pure-widget pattern.
