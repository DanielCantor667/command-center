# Sprint 1 — Product Clarity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Alinear la documentación y auditar los seis proyectos sin modificar interfaces ni dominios.

**Architecture:** La documentación define el producto; `PROJECTS` conserva los datos de proyecto. Un registro clasifica el legado CRM y una auditoría separada reporta evidencia sin alterar datos.

**Tech Stack:** Markdown, TypeScript, Vitest y scripts del monorepo.

## Global Constraints

- Definición oficial: “Command Center es un sistema de evidencia explorable de la ingeniería de Daniel.”
- `PROJECTS` es la única fuente de verdad; no se cambian schemas ni fixtures.
- No modificar React, Three.js, `CityNavigator`, Blender, GLB, renders, Evidence Engine, Knowledge Graph, Mission Log, Capabilities, APIs, backend ni servicios externos.
- Clasificar antes de actualizar; conservar documentación histórica.
- Datos, enlaces y métricas solo con evidencia directa; de lo contrario usar `MISSING` o `PARTIAL`.
- No stagear ni commitear WIP existente de ciudad/Blender ni archivos no relacionados.

## File Structure

- Modify: `README.md`, `PROJECT_CONTEXT.md`, `ROADMAP.md`, `memory/changelog.md`.
- Modify: `docs/superpowers/specs/2026-08-11-command-center-product-clarity-design.md`.
- Create: `docs/product/documentation-reference-register.md`.
- Create: `docs/product/COMMAND_CENTER_PRODUCT_MODEL.md`.
- Create: `docs/product/project-evidence-audit.md`.

### Task 1: Clasificar referencias históricas y contradictorias

**Files:** Modify `docs/superpowers/specs/2026-08-11-command-center-product-clarity-design.md`; create `docs/product/documentation-reference-register.md`.

**Produces:** Registro que preserva el legado y define qué referencias son activas o contradictorias.

- [ ] Ejecutar `rg -l -i 'CRM|campaigns|ventas|sales|inventario|inventory|ERP|operaciones|operations|clientes|contacts' --glob '*.md' --glob '!node_modules/**' . | sort`.
- [ ] Crear una tabla con `Documento | Referencia | Clasificación | Acción en Sprint 1 | Razón` y una fila por cada referencia relevante. Usar solo `vigente`, `histórica`, `contradictoria` y `necesita actualización`; CRM activo en raíz es contradictorio y changelog/ADR/sprints antiguos se preservan como históricos.
- [ ] Confirmar que la spec usa el nombre `Sprint 1 — Product Clarity y fuente de verdad`, reconoce la fase como reinicio de producto y exige registro + auditoría de campos.
- [ ] Ejecutar `rg -n 'TODO|TBD|próximamente|más de|gran rendimiento|arquitectura escalable' docs/product/documentation-reference-register.md docs/superpowers/specs/2026-08-11-command-center-product-clarity-design.md` y `git diff --check`. Esperado: sin resultados ni whitespace inválido.
- [ ] Commit: `git add docs/superpowers/specs/2026-08-11-command-center-product-clarity-design.md docs/product/documentation-reference-register.md && git commit -m "docs(command-center): classify product references"`.

### Task 2: Alinear documentos raíz y roadmap

**Files:** Modify `README.md`, `PROJECT_CONTEXT.md`, `ROADMAP.md`, `memory/changelog.md`.

**Consumes:** Registro de Task 1.

**Produces:** Una definición activa única y un roadmap comprobable.

- [ ] Reemplazar la definición activa en README y PROJECT_CONTEXT por la definición oficial. Indicar que no es CRM, campañas, ventas, inventario, ERP ni plataforma operativa de proyectos cliente; conservar reglas técnicas vigentes.
- [ ] Reescribir ROADMAP en este orden: Sprint 1 — Product Clarity; Sprint 2 — Evidencia; Sprint 3 — Recorrido; Sprint 4 — Calidad pública; Evolución continua. Cada fase contiene Objetivo, Alcance, Entregable verificable y Criterios de aceptación. Enlazar al registro histórico, sin CRM como roadmap activo.
- [ ] Añadir entrada fechada a `memory/changelog.md`: Product Clarity alineó documentación y no cambió UI, datos ni funcionalidad.
- [ ] Ejecutar `rg -n -i 'CRM|campaigns|ventas|sales|inventario|inventory|ERP|operaciones|operations' README.md PROJECT_CONTEXT.md ROADMAP.md`. Esperado: solo non-goals explícitos y enlace al registro histórico.
- [ ] Commit: `git add README.md PROJECT_CONTEXT.md ROADMAP.md memory/changelog.md && git commit -m "docs(command-center): align active product direction"`.

### Task 3: Documentar contrato de superficies

**Files:** Create `docs/product/COMMAND_CENTER_PRODUCT_MODEL.md`.

**Produces:** Contrato de Experience, Projects, Knowledge, Evidence, Mission y Profile.

- [ ] Documentar: Experience/City → discovery; Projects → dossier completo; Knowledge → conexiones; Evidence → trazabilidad; Mission → trayectoria; Profile → identidad.
- [ ] Añadir tabla `Superficie | Puede mostrar | No puede generar | Fuente`. Prohibir una versión de proyecto propia de ciudad, métricas sintéticas, hitos Mission inventados, claims Profile sin respaldo y relaciones Knowledge/Evidence sin trazabilidad.
- [ ] Añadir estándar: decisión + contexto + resultado solo con fuente; prohibir “experto”, “escalable”, “alto rendimiento” y números sin prueba.
- [ ] Ejecutar `rg -n 'TODO|TBD|próximamente|más de|gran rendimiento|arquitectura escalable' docs/product/COMMAND_CENTER_PRODUCT_MODEL.md`. Esperado: sin resultados.
- [ ] Commit: `git add docs/product/COMMAND_CENTER_PRODUCT_MODEL.md && git commit -m "docs(command-center): define surface data contract"`.

### Task 4: Auditar los seis registros de `PROJECTS`

**Files:** Create `docs/product/project-evidence-audit.md`; read `apps/web/data/projects/projects.ts`, `apps/web/data/projects/{command-center,kliniu,vevi,intranet-ess,lorigine,academy}.ts`, `apps/web/data/projects/project.schema.ts`.

**Produces:** Matriz de completitud y evaluación por campo sin cambiar datos de proyecto.

- [ ] Copiar al audit exactamente los seis IDs en el orden exportado por `PROJECTS`; no incluir proyectos externos.
- [ ] Para cada proyecto evaluar `identity`, `overview`, `status`, `visibility`, `technologies`, `architecture`, `features`, `challenges`, `engineeringDecisions`, `lessonsLearned`, `metrics`, `media`, `repository`, `live`, `documentation`, `relationships`.
- [ ] Usar únicamente `VERIFIED`, `PARTIAL` o `MISSING`. Cada VERIFIED/PARTIAL cita ruta o commit; cada MISSING dice `No se encontró evidencia en las fuentes auditadas`.
- [ ] Añadir integridad: IDs/slugs únicos, `relatedProjects` válidos, enlaces verificables, métricas reales/null, media real/ausente, status y visibilidad sustentados. No cambiar schema, Evidence, Knowledge, Mission ni UI.
- [ ] Ejecutar `rg -n 'TODO|TBD|próximamente|más de|gran rendimiento|arquitectura escalable' docs/product/project-evidence-audit.md` y `npx pnpm --filter @command-center/web test`. Esperado: sin lenguaje prohibido y tests verdes; si el WIP causa un fallo, registrar el fallo exacto sin tocarlo.
- [ ] Commit: `git add docs/product/project-evidence-audit.md && git commit -m "docs(command-center): audit project evidence"`.

### Task 5: Verificación de salida y alcance

**Files:** Read todos los archivos de Tasks 1–4.

**Produces:** Handoff verificable sin cambios funcionales.

- [ ] Ejecutar `rg -n -i 'CRM|campaigns|ventas|sales|inventario|inventory|ERP|operaciones|operations' README.md PROJECT_CONTEXT.md ROADMAP.md`.
- [ ] Ejecutar `rg -n 'TODO|TBD|próximamente|más de|gran rendimiento|arquitectura escalable' docs/product docs/superpowers/specs/2026-08-11-command-center-product-clarity-design.md` y `git diff --check`.
- [ ] Ejecutar `npx pnpm --filter @command-center/web test` y `npx pnpm --filter @command-center/web exec tsc --noEmit`. Esperado: tests y typecheck verdes; registrar cualquier fallo causado por WIP sin modificarlo.
- [ ] Inspeccionar los commits del sprint y comprobar que solo cambian documentos permitidos. Si la verificación exigió corrección documental, commit: `git commit -m "docs(command-center): verify product clarity sprint"`; si no, no crear commit vacío.

## Plan Self-Review

- Cobertura: clasificación, raíces, roadmap, contrato, seis auditorías, integridad y pruebas tienen tareas explícitas.
- Placeholders: `MISSING` y `PARTIAL` son resultados requeridos de auditoría, no trabajo diferido.
- Consistencia: cada tarea preserva `PROJECTS` como fuente y bloquea cambios de UI/dominios.
