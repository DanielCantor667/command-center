# Sprint 0.6: Dashboard Foundation

## Estado

Aprobado. Spec: "Dashboard Foundation — Design Spec" (`docs/superpowers/specs/2026-07-03-dashboard-foundation-design.md`),
derivada de RFC-0006, con tres ajustes aprobados en revisión (ver "Ajustes sobre la spec").
Implementado en la rama `sprint-0.4-application-shell`.

## Objetivo del sprint

Implementar el primer módulo real de Command Center: el Dashboard. Es la aplicación "Home" del
sistema operativo — resume al ingeniero y ayuda a decidir qué explorar a continuación. No es una
landing page ni reemplaza a los demás módulos.

## Arquitectura existente (no modificada)

- `AppShell`
- `Workspace`
- Mecanismo del Module Registry (`apps/web/modules/module-registry`)
- Contrato de `WorkspaceStore`
- Design System (`packages/ui`)
- Foundation Engine

Solo se reemplazó el módulo placeholder de `dashboard` (Sprint 0.5) por su implementación real.

## Alcance

Únicamente el módulo Dashboard y sus 6 widgets. No se implementa Projects, Mission Log,
Capabilities, Lab ni Communication. Sin gráficos, sin llamadas a API, sin analytics, sin
animaciones, sin lógica de negocio, sin loading states falsos, sin terminal falso.

### Árbol de carpetas

```
apps/web/modules/dashboard/
  component.tsx          # DashboardModule — container
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
    dashboard.test.tsx

apps/web/data/
  dashboard.ts
```

Ceremonia mínima por widget (mismo patrón que los placeholders de Sprint 0.5): `component.tsx` +
`types.ts` + `index.ts` + `tests/`. Sin `README.md`/`stories.md` por widget — solo
`modules/dashboard/README.md` documenta el módulo completo. Sin carpeta `hooks/` (no hay estado ni
efectos; se agrega cuando exista un hook real).

## Flujo de datos

`apps/web/data/dashboard.ts` — único archivo de datos, estático y tipado (`HeroData`,
`QuickStat[]`, `CurrentFocusData`, `ActivityItem[]` con máximo 5, `SystemStatusItem[]`).

`DashboardModule` es el **único** componente del módulo autorizado a importar
`apps/web/data/dashboard.ts`. Lee todos los slices y los distribuye a cada widget vía props. Los
widgets son componentes puros y presentacionales: nunca importan datos ni conocen su origen.
Cuando se migre a CMS/base de datos, solo cambia `apps/web/data/dashboard.ts`.

## Navegación

`QuickNavigation` no importa Zustand — recibe `onNavigate(target)` por props. `Hero` no importa
Zustand — recibe `onCtaClick` por props. `DashboardModule` es el único componente del módulo
autorizado a interactuar con `WorkspaceStore` (`useWorkspaceStore`) y es quien construye esos
callbacks (`onCtaClick={() => setCurrentModule('projects')}`, `onNavigate={setCurrentModule}`).

## Ajustes sobre la spec (aprobados en revisión)

1. **Widgets no importan datos directamente.** `DashboardModule` importa `dashboard.ts` y
   distribuye cada slice por props — decisión final, más estricta que el borrador inicial.
2. **`QuickNavigation` no depende de `WorkspaceStore`.** Recibe `onNavigate` por props;
   `DashboardModule` es el container que conecta con el store.
3. **`CurrentFocus` no crea un `Badge` nuevo.** El estado se muestra como texto (`Typography`)
   hasta que exista un primitive específico en el Design System.

## Widgets implementados

- **Hero** — nombre, rol, mission statement, status, availability, CTA (navega a Projects).
- **Quick Stats** — grid de 5 métricas estáticas.
- **Current Focus** — card única con proyecto actual y status en texto.
- **Recent Activity** — lista `<ul>` cronológica, máximo 5 items estáticos.
- **Quick Navigation** — botones (`Button` existente) a Projects, Mission Log, Capabilities, Lab,
  Communication.
- **System Status** — 6 indicadores estáticos (Theme, Version, Architecture, Tests, Build,
  Accessibility).

## Layout

Grid responsive vía `Grid`/`Stack` existentes: 2 columnas en desktop (`laptop`), 1 columna en
tablet/mobile. Sin masonry, sin CSS nuevo.

## Accesibilidad

Headings semánticos (`h1` en Hero, `h2` por widget), lista real `<ul>/<li>` en Recent Activity,
botones nativos en CTA y Quick Navigation, cero violaciones `axe` (por widget y en integración).

## Tareas

- [x] `apps/web/data/dashboard.ts` — datos tipados estáticos.
- [x] 6 widgets (`Hero`, `QuickStats`, `CurrentFocus`, `RecentActivity`, `QuickNavigation`,
      `SystemStatus`) + tests.
- [x] `DashboardModule` (container) reemplazando el placeholder de Sprint 0.5.
- [x] `README.md` del módulo (propósito, responsabilidades de widgets, flujo de datos).
- [x] Test de integración `dashboard.test.tsx` (6 widgets, navegación Hero CTA, navegación Quick
      Navigation, accesibilidad).
- [x] Actualizar `shell/workspace/tests/workspace.test.tsx` (ya no asume `dashboard` como
      placeholder — aserción movida a `profile`).
- [x] Verificar: build, TypeScript, ESLint, tests. Cero errores.

## Deliverables

- Árbol de carpetas del módulo.
- 6 widgets puros + `DashboardModule` container.
- Datos tipados estáticos (`apps/web/data/dashboard.ts`).
- Suite de tests (68/68 en la app tras este sprint).
- `README.md` del módulo.

## Criterios de aceptación

- Dashboard reemplaza el módulo placeholder.
- Los 6 widgets renderizan correctamente.
- `DashboardModule` es el único consumidor de `dashboard.ts`.
- Los widgets reciben datos solo por props.
- `QuickNavigation` es independiente de Zustand.
- Arquitectura existente sin cambios (`AppShell`, `Workspace`, Module Registry, `WorkspaceStore`,
  `packages/ui`).
- Build, TypeScript, ESLint y tests pasan.
- Tests de accesibilidad pasan.

## Review

Implementado en la rama `sprint-0.4-application-shell`. Ver spec completa en
`docs/superpowers/specs/2026-07-03-dashboard-foundation-design.md`. Pendiente de revisión técnica
vía PR antes de mergear y de continuar con el siguiente sprint.

## Retrospectiva

Pendiente (post-merge).
