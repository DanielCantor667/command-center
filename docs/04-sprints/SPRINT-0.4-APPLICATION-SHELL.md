# Sprint 0.4: Application Shell

## Estado

Aprobado. Spec: "Application Shell" v1.0 (Owner: Command Center Architecture) — reemplaza la
lectura previa basada en RFC-0004; los detalles de layout tokens, motion y extension rules de la
v1.0 tienen precedencia sobre este documento cuando difieran.

Implementación bloqueada hasta que se resuelva el bloqueo restante (ver abajo).

## Bloqueos

### 1. Sprint 0.3 (Design System Core) sin mergear — ABIERTO

`Sidebar`/`TopBar` dependen del primitive `Button` (y potencialmente `Stack`, `Typography`,
`Divider`, `Panel`). Sprint 0.3 está implementado, verificado (tests/lint/typecheck en verde) y en
PR abierto: https://github.com/DanielCantor667/command-center/pull/1 (rama
`sprint-0.3-design-system`), aún no mergeado a `main`. No se implementa Sprint 0.4 hasta que este
PR mergee.

### 2. Conflicto de layout tokens — RESUELTO

`packages/config/tokens/layout.css` actualizado con los valores de la spec v1.0:

| Token | Valor final |
|---|---|
| `--layout-sidebar-width` | 280px |
| `--layout-sidebar-collapsed-width` | 72px |
| `--layout-topbar-height` | 72px |
| `--layout-statusbar-height` | 32px |
| `--layout-workspace-padding` | 32px |

Sin token para Workspace max-width (intencional, crece naturalmente). Regla permanente agregada
en `docs/engineering/architecture.md` → "Layout Tokens".

### 3. Zustand no disponible — ABIERTO

`WorkspaceStore` requiere Zustand. No está instalado en ningún `package.json` del monorepo (raíz,
`apps/web`, `packages/*`). No se instala sin autorización explícita.

## Objetivo del sprint

Construir el layout permanente de la aplicación — el "sistema operativo" de Command Center. Nunca
se destruye ni se recrea; toda feature/módulo se renderiza dentro de `Workspace`. El shell da
estabilidad y orientación; el Workspace da contenido. No se crea contenido de portafolio
(Dashboard, Project Cards, Mission Log, Timeline, Profile, Windows, Modales, Notificaciones,
Background Engine, Terminal, Activity Feed, Command Palette funcional).

## Principios (spec v1.0)

- **Persistencia**: `Sidebar`, `TopBar`, `StatusBar` permanecen montados durante toda la vida de
  la app. Solo cambia `Workspace`.
- **Predictibilidad**: todo módulo se comporta igual; el usuario nunca duda dónde está.
- **Estabilidad**: cambiar de módulo no recrea la aplicación, solo el contenido de `Workspace`.
- **Jerarquía de información**: el shell orienta, el Workspace contiene.

## Alcance

### Árbol de aplicación

```
<App>
  <ThemeProvider>
    <WorkspaceProvider>
      <AppShell>
        <TopBar />
        <Sidebar />
        <Workspace />
        <StatusBar />
      </AppShell>
    </WorkspaceProvider>
  </ThemeProvider>
</App>
```

Esta jerarquía es permanente. `ThemeProvider` ya existe (Sprint 0.2, `packages/ui/theme/`).
`WorkspaceProvider` es nuevo en este sprint (envuelve el `WorkspaceStore`).

### Layout global

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ TopBar                                                                       │
├──────────────┬───────────────────────────────────────────────────────────────┤
│ Sidebar      │                        Workspace                              │
├──────────────┴───────────────────────────────────────────────────────────────┤
│ StatusBar                                                                    │
└──────────────────────────────────────────────────────────────────────────────┘
```

Esta estructura nunca cambia.

### Componentes a implementar (únicamente estos)

- `AppShell` — layout, responsive, safe areas, container sizing. Sin lógica de negocio.
- `Sidebar` — navegación primaria, selección de módulo, estado activo, brand. Sin routing ni
  lógica de negocio. Cada item usa el primitive `Button` existente.
- `SidebarItem`
- `TopBar` — Logo, nombre de la app, módulo actual, botón de Command (solo render), Theme Toggle
  (placeholder), reloj, estado del sistema. Siempre visible, nunca hace scroll, nunca desaparece.
- `StatusBar` — versión, theme, conexión, branch (placeholder), build status, FPS (placeholder).
  Todo informativo, todo visual.
- `Workspace` — renderiza el módulo actual. Inicialmente solo texto: "COMMAND CENTER / System
  Ready / Waiting for Modules...". Sin fake widgets, sin placeholder cards, sin UI de negocio.
- `Logo`
- `Brand`
- `AppContainer`

Nada fuera de esta lista. Ningún componente "específico" (ej. `DashboardCard`, `ProjectPanel`,
`TimelineItem`) pertenece a este sprint.

### Navegación (estado, no routing)

Sin routing de Next.js, sin sincronización de URL todavía. Estado vía `WorkspaceStore` (Zustand):

- State: `currentModule`
- Methods: `setCurrentModule()`, `resetWorkspace()`
- Módulos: `dashboard`, `profile`, `projects`, `mission`, `capabilities`, `lab`, `communication`

Seleccionar un item de `Sidebar` actualiza: contenido de `Workspace`, título en `TopBar`, item
activo en `Sidebar`. Nada más. Sin reload, sin transición de página, sin route refresh.

### Responsive

- **Desktop**: sidebar fija, workspace flexible.
- **Tablet**: sidebar colapsa (72px), workspace se expande.
- **Mobile**: sidebar se convierte en drawer; TopBar y StatusBar permanecen; Workspace ocupa el
  espacio restante.

### Motion

El shell en sí nunca anima. Solo animan los cambios de estado.

- Permitido: fade, opacity, color transition, scale pequeño.
- Prohibido: page transitions, slides grandes, transforms 3D, parallax, física.

### Accesibilidad

- Navegación por teclado.
- Landmarks ARIA: `<header>`, `<aside>`, `<main>`, `<footer>`.
- Focus visible.
- Soporte `prefers-reduced-motion`.
- HTML semántico.
- Compatibilidad con lectores de pantalla.

### Performance

- El shell monta una sola vez; solo `Workspace` se actualiza.
- Sin rerenders innecesarios.
- Memoización de componentes estáticos.
- Callbacks estables.
- Sin hydration mismatch.

## Restricciones explícitas (no hacer)

Dashboard, Project Cards, Mission Log, Timeline, Profile, Windows, Modales, Notificaciones,
Background Engine, Terminal, Activity Feed, Command Palette funcional, Window Manager,
componentes de negocio.

## Extension Rules (para sprints futuros, no implementar aquí)

- Módulos futuros solo renderizan dentro de `Workspace`.
- Ningún módulo puede modificar `Sidebar`, `TopBar` o `StatusBar`.
- Ningún módulo puede reemplazar `AppShell`.
- Fuera de alcance de este RFC (pertenecen a RFCs futuros): Window Manager, Notifications,
  Background Engine, Command Palette Behaviour, Terminal, Activity Feed.

## Documentación por componente

Cada componente incluye `README.md` y `stories.md`: Usage, Accessibility Notes, API.

## Tareas

- [ ] Resolver bloqueo: merge de PR #1 (Sprint 0.3 / Design System Core).
- [x] Resolver bloqueo: layout tokens actualizados en `packages/config/tokens/layout.css`.
- [x] Resolver bloqueo: Zustand instalado y autorizado (`apps/web`, `^5.0.14`).
- [x] Resolver bloqueo: PR #1 (Sprint 0.3) mergeado a `main`.
- [x] `WorkspaceStore` (Zustand) + `WorkspaceProvider` + tests.
- [x] `AppShell` + tests.
- [x] `Sidebar` + `SidebarItem` + tests.
- [x] `TopBar` + tests.
- [x] `StatusBar` + tests.
- [x] `Workspace` + tests.
- [x] `Logo`, `Brand`, `AppContainer`.
- [x] Tests de navegación por teclado (cubiertos por `SidebarItem`/`Sidebar`: `Button` nativo, foco/activación estándar).
- [x] Verificar: build, TypeScript, ESLint, tests, cero warnings.

## Deliverables

- Jerarquía de componentes.
- Árbol de carpetas.
- Arquitectura del `WorkspaceStore`.
- Reporte de accesibilidad.
- Consideraciones de performance.
- Puntos de extensión futuros (solo documentados, no implementados).

## Criterios de aceptación

- `Sidebar`, `TopBar`, `StatusBar` permanecen montados.
- `Workspace` se actualiza sin reload.
- Layouts responsive funcionan.
- Accesibilidad pasa.
- Objetivos de performance respetados.
- Build, TypeScript, ESLint y tests pasan. Cero warnings.

## Review

Implementado en la rama `sprint-0.4-application-shell`. Ver reporte final entregado al usuario en
la sesión de implementación para el árbol de archivos completo, resultados de test/lint/typecheck/
build y mejoras detectadas no implementadas. Pendiente de aprobación/merge.

## Retrospectiva

Pendiente (post-merge).
