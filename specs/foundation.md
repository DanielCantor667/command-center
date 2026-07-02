# Spec: Sprint 0.1 — Foundation (Bootstrap técnico)

Estado: Propuesto
Fase asociada: `ROADMAP.md` → Phase 0 — Foundation

---

## Objetivos

- Dejar el monorepo funcional de extremo a extremo: instalar, compilar, lintear y correr en local sin pasos manuales.
- Convertir `apps/web` en una aplicación Next.js real (hoy solo contiene `.gitkeep`).
- Convertir `packages/ui`, `packages/config`, `packages/tsconfig` y `packages/eslint-config` en paquetes compartidos reales, consumibles por `apps/web`.
- Establecer las convenciones base (TypeScript, ESLint, Prettier, Tailwind) de forma centralizada en `packages/`, no duplicada en cada app.
- Dejar una base sobre la cual Phase 1 (Authentication) pueda construirse sin retrabajo estructural.

No es objetivo de este sprint: implementar autenticación, UI de producto, conexión a Supabase/Prisma, ni funcionalidades de negocio.

---

## Alcance

### Incluye

- Scaffolding de `apps/web` con Next.js + TypeScript + Tailwind CSS, consumiendo `packages/*`.
- `packages/tsconfig`: configuración base de TypeScript compartida.
- `packages/eslint-config`: configuración base de ESLint compartida.
- `packages/config`: configuración compartida no relacionada a lint/TS (ej. constantes de entorno, configuración de Tailwind base).
- `packages/ui`: paquete de design system con al menos un componente placeholder que demuestre el patrón de exportación/consumo.
- Verificación de que `turbo.json` (build, dev, lint, test) funciona correctamente contra los paquetes reales.
- Verificación de que `pnpm-workspace.yaml` resuelve las dependencias entre `apps/*` y `packages/*`.

### Excluye

- Cualquier pantalla o flujo de producto (login, dashboard, CRM, etc.).
- Conexión real a base de datos (Prisma, PostgreSQL, Supabase).
- CI/CD más allá de lo ya existente en `.github/workflows`.
- Deuda técnica no relacionada a este bootstrap (se reporta en `memory/technical-debt.md` si se detecta).

---

## Entregables

1. `apps/web` — app Next.js inicializada (App Router, TypeScript, Tailwind), con una página raíz mínima que confirme que consume `packages/ui`.
2. `packages/tsconfig` — `base.json` (y variantes necesarias, ej. `nextjs.json`) consumido por `apps/web`.
3. `packages/eslint-config` — configuración base consumida por `apps/web`, alineada con `docs/engineering/coding-standards.md`.
4. `packages/config` — configuración compartida mínima (ej. Tailwind preset base).
5. `packages/ui` — paquete inicial con un componente de ejemplo, exportado y tipado.
6. Scripts raíz (`package.json`) para `dev`, `build`, `lint`, `test` delegando en Turborepo.
7. Actualización de `PROJECT_CONTEXT.md` (estado de Foundation) y `ROADMAP.md` (Phase 0) si el estado real cambia al cerrar el sprint.
8. Entrada en `memory/changelog.md` describiendo el bootstrap.

---

## Arquitectura

Sigue `docs/engineering/architecture.md` sin introducir alternativas:

- `apps/web` es la única app desplegable en este sprint. No accede directamente a paquetes externos: consume `packages/ui`, `packages/config`, `packages/tsconfig`, `packages/eslint-config` vía workspace (`workspace:*`).
- `packages/ui` expone componentes de presentación puros, sin lógica de negocio ni acceso a datos.
- `packages/tsconfig` y `packages/eslint-config` son configuración pura, sin código de aplicación.
- `packages/config` contiene configuración compartida no ligada a un dominio de negocio (según definición de "util" en `architecture.md`: genérica, sin dependencia del dominio).
- No se crean nuevas apps ni paquetes fuera de los ya definidos en la estructura actual.
- Convenciones de nombres (`architecture.md` §Convenciones) aplican desde este sprint: kebab-case para archivos, PascalCase para componentes, prefijo `use` para hooks.

---

## Dependencias

- Node.js y pnpm instalados en el entorno (versión a fijar en `package.json engines` y `.tool-versions`/`.nvmrc` si no existen ya).
- Next.js, React, TypeScript (versiones definidas en `PROJECT_CONTEXT.md` §3, sin añadir stack no listado).
- Tailwind CSS.
- Turborepo (ya configurado en `turbo.json`).
- No se agregan Prisma, PostgreSQL ni Supabase en este sprint: son dependencias de fases futuras, no de Foundation.
- Cualquier dependencia nueva no listada en `PROJECT_CONTEXT.md` requiere justificación técnica explícita (`CONSTITUTION.md` §5) antes de agregarse.

---

## Riesgos

- **Inconsistencia de estado**: `PROJECT_CONTEXT.md` marca Foundation como "Completado" mientras `ROADMAP.md` la marca "En progreso" y el código real (`apps/web`, `packages/*`) está vacío. Riesgo de confusión sobre qué falta. Mitigación: este sprint corrige el estado real antes de actualizar cualquiera de los dos documentos.
- **Acoplamiento prematuro**: crear abstracciones en `packages/ui` o `packages/config` antes de tener un segundo consumidor real. Mitigación: mantener el placeholder mínimo, sin anticipar necesidades de fases futuras.
- **Configuración divergente**: que `apps/web` termine con configuración de TypeScript/ESLint propia en lugar de heredar de `packages/tsconfig` y `packages/eslint-config`. Mitigación: validar que `apps/web` extiende, no duplica.
- **Alcance creciente**: la tentación de adelantar autenticación o UI de producto durante el bootstrap. Mitigación: este documento fija el alcance explícitamente; cualquier desvío requiere una nueva spec.

---

## Criterios de aceptación

- `pnpm install` funciona desde la raíz sin errores.
- `pnpm turbo build` compila `apps/web` y todos los `packages/*` sin errores.
- `pnpm turbo lint` pasa sin errores en `apps/web` y `packages/*`.
- `pnpm turbo dev` levanta `apps/web` en local y la página raíz renderiza el componente proveniente de `packages/ui`.
- `apps/web` no contiene configuración de TypeScript o ESLint duplicada: extiende de `packages/tsconfig` y `packages/eslint-config`.
- No existen archivos `.gitkeep` remanentes en las carpetas que este sprint puebla (`apps/web`, `packages/ui`, `packages/config`, `packages/tsconfig`, `packages/eslint-config`).
- La estructura de carpetas y nombres respeta `docs/engineering/architecture.md` §Convenciones.

---

## Definition of Done

Según `CONSTITUTION.md` §13, aplicado a este sprint:

- Compila correctamente (`build` y `dev` sin errores).
- Cumple todos los criterios de aceptación de esta spec.
- Mantiene la arquitectura descrita en `docs/engineering/architecture.md`, sin desviaciones no documentadas.
- No rompe nada existente (no aplica funcionalidad previa, pero no debe romper `turbo.json`, `pnpm-workspace.yaml`, ni scripts de `.github/workflows`).
- Pasa lint y validación de tipos sin errores.
- No introduce deuda técnica no reportada.
- `PROJECT_CONTEXT.md`, `ROADMAP.md` y `memory/changelog.md` reflejan el estado real al cierre del sprint.

---

## Checklist técnico

- [ ] Inicializar `apps/web` (Next.js + TypeScript + App Router + Tailwind CSS).
- [ ] Crear `packages/tsconfig` con configuración base y consumirla desde `apps/web`.
- [ ] Crear `packages/eslint-config` con configuración base y consumirla desde `apps/web`.
- [ ] Crear `packages/config` con configuración compartida mínima (ej. preset de Tailwind).
- [ ] Crear `packages/ui` con un componente de ejemplo exportado y tipado.
- [ ] Conectar `apps/web` a `packages/ui`, `packages/config`, `packages/tsconfig`, `packages/eslint-config` vía `workspace:*`.
- [ ] Configurar/verificar scripts raíz (`dev`, `build`, `lint`, `test`) delegando en Turborepo.
- [ ] Verificar `pnpm install`, `pnpm turbo build`, `pnpm turbo lint`, `pnpm turbo dev` sin errores.
- [ ] Eliminar `.gitkeep` de las carpetas pobladas.
- [ ] Resolver la inconsistencia de estado entre `PROJECT_CONTEXT.md` y `ROADMAP.md` para Foundation.
- [ ] Actualizar `memory/changelog.md` con el resumen del bootstrap.
- [ ] Esperar aprobación antes de iniciar implementación (este sprint no incluye código hasta aprobación explícita).
