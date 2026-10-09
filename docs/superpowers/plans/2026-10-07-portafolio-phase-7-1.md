# Sprint 7 — Phase 7.1: prueba espacial local

> Ejecución: nativa mediante `superpowers:executing-plans`. Daniel aprobó la propuesta y pidió empezar el 7 de octubre de 2026. Esta fase se ejecuta dentro de esa autorización; no se añade una nueva aprobación del mismo alcance.

**Goal:** entrar a un taller a escala humana, acercarse a Kliniu, abrir el caso existente y volver a la cámara guardada.

**Architecture:** experiencia pública nueva junto al módulo actual. Una escena R3F perspectiva con geometría procedural de prototipo y la maqueta GLB existente de Kliniu. Estado explícito de carga/navegación, callbacks con token y snapshots independientes de la cámara ortográfica anterior. El gate conecta ambos modos con los casos ya existentes.

**Tech Stack:** versiones instaladas de Next.js 15, React 19, TypeScript, R3F 9, Drei 10, Three.js 0.171, CSS Modules, lucide-react, Vitest y Playwright/Chrome.

**Spec:** [propuesta aprobada](2026-10-07-portafolio-taller-jugable-propuesta.md), especialmente Phase 7.1 y controles/carga/fallback.

## Global Constraints

- Sin dependencias nuevas, provisioning, cuentas, cambios de datos, commit, push o deploy.
- Phase 7.2 y siguientes excluidas; esta escena procedural demuestra espacio y controles, no los assets Blender definitivos.
- Contenido real en datos existentes; todos los casos siguen accesibles mediante Ver portafolio.
- Un canvas del taller; carga explícita en móvil, texto HTML y controles con teclado.
- Sin WASD libre, física general, pointer lock, avatar, sonido ni otras salas completas.
- Trabajar en la rama actual `codex/portfolio-realistic-modeling` conservando los cambios previos preparados. Un worktree nuevo desde HEAD omitiría la experiencia previa que esta fase necesita.

## Review Focus

1. Callback tardío tras cancelar: no entra al taller ni cambia la cámara de una solicitud más reciente.
2. GLB fallido o pérdida de WebGL: muestra reintento/portafolio; el loader no simula éxito.
3. Retorno del caso: conserva punto y orientación, y devuelve foco a Abrir caso de Kliniu.
4. Arrastrar cámara: no activa un hotspot como si fuera clic; móvil y teclado tienen botones equivalentes.
5. Modo HTML y casos previos: conserva navegación/atribución, sin contaminar snapshots ortográficos.

### Task 1: estado de navegación y cancelación

**Files:** create `apps/web/modules/workshop-game/world-state.ts`; test `apps/web/modules/workshop-game/tests/world-state.test.ts`.
**Interfaces:** `WorldPoint = 'entrance' | 'hub' | 'workbench' | 'kliniu'`; `WorldCameraSnapshot` con position/target; `GameSnapshot` con point/camera. Reducer `worldReducer` recibe eventos `start`, `ready`, `failed`, `go`, `arrived`, `cancel` y devuelve estado con `status`, `point`, `destination`, `token`.

- [x] RED: probar cancelación de carga, rechazo de ready viejo, cambio de destino mientras se mueve y llegada antigua después del cambio.
- [x] Ejecutar `cd apps/web && npx vitest run modules/workshop-game/tests/world-state.test.ts` y confirmar fallo por implementación ausente.
- [x] Implementar reducer y destinos constantes con altura humana 1.65 m. Guardar último destino estable para cancelar. `ready` y `arrived` solo actúan con token/estado vigente.
- [x] GREEN: mismo comando; probar restauración de un snapshot de Kliniu sin repetir entrada.

### Task 2: escena perspectiva y recursos reales

**Files:** create `apps/web/modules/workshop-game/world-scene.tsx`, `workshop-geometry.tsx`, `camera-controller.tsx`.
**Interfaces:** escena consume destino/token/snapshot/reduced-motion; informa `onReady(token)`, `onArrived(token)`, `onError(token)` y expone capture de cámara. Carga `/models/workshop/kliniu-interactive-v4.glb` mediante loader existente.

- [x] Implementar suelo, fachada/puerta corrediza, nave, mesa, ventanas, estructura y zona Kliniu con geometría simple. Evitar texturas/HDRI remotos y la producción de salas definitivas.
- [x] Añadir cámara perspectiva con trayectos despejados y arrastre limitado para mirar. Animar bajo demanda y pausar pestaña oculta. Con movimiento reducido, posición final directa.
- [x] Disparar ready después de carga del GLB y primer frame utilizable, sin porcentajes ficticios; manejar webglcontextlost y errores mediante boundary.
- [x] La evidencia de RED/GREEN visual corresponde a Task 4: probar recurso fallido y cancelación real; geometría declarativa no recibe tests que solo dupliquen coordenadas.

### Task 3: entrada pública y continuidad con casos

**Files:** create `apps/web/modules/workshop-game/component.tsx`, `workshop-game.module.css`; modify `apps/web/shell/experience-gate/component.tsx`, gate tests; create `apps/web/modules/workshop-game/tests/workshop-game.test.tsx`.
**Interfaces:** `WorkshopGame({initialSnapshot,onSave,onOpenCase,onPortfolio})`; `onSave(GameSnapshot)` precede `onOpenCase('kliniu')`. Modo portfolio clásico conserva callbacks actuales. URL `?view=portfolio` permite revisar la experiencia anterior.

- [x] RED: probar landing sin activar canvas, salida al portafolio durante carga y gate conservando snapshot del juego al regresar del caso.
- [x] Implementar landing, loader indeterminado por fases reales, navegación a hub/mesa/Kliniu, inspección HTML, Escape, cancelación y retorno de foco. Guardar orientación exacta antes de abrir caso.
- [x] Integrar entrada predeterminada en gate; Ver portafolio y navegación a tecnologías/contacto desde casos pasan al módulo existente. No cambiar casos ni dashboard.
- [x] GREEN: pruebas nuevas y gate existente en modo clásico; evitar mocks de estado real/reducer.

### Task 4: Chrome, responsive y cierre de Phase 7.1

**Files:** create `docs/product/workshop-game-evidence/verify-phase-7-1.cjs`, `phase-7-1-validation.md` y capturas de QA; create poster local del prototipo desde frame real.

- [x] Antes del navegador, detener next dev viejo en puerto 3000 si existe. Iniciar el servidor local del workspace.
- [x] Chrome real a 1440×1000, 1920×1080, 390×844, 320×568: entrar, ir a Kliniu, abrir caso y volver, Escape/cancelación, mirar arrastrando y comprobar posición restaurada/ausencia de overflow/errores.
- [x] Verificar GLB 404, WebGL ausente, contexto perdido, movimiento reducido y modo clásico. Guardar capturas reales; no usar screenshot MCP que se cuelga.
- [x] `cd apps/web && npx vitest run --silent --reporter=dot`, `npx tsc --noEmit`, ESLint de archivos modificados y `git diff --check`. Informar cualquier fallo del suite completo aunque sea previo.
- [x] Revisión independiente del cambio de Phase 7.1 conforme a executing-plans; corregir fallos importantes y repetir checks afectados.
- [x] Guardar evidencia, URL y límites (sin móvil físico disponible). Cerrar esta fase local; no iniciar 7.2 sin revisión de Daniel.

## Ledger de decisiones y avance

- Ruling: ejecución nativa en el checkout existente, sin commits — la fase depende de numerosos cambios previos todavía preparados; aislar desde HEAD perdería esa base.
- Ruling: geometría procedural y maqueta Blender existente — permite verificar navegación sin empezar producción de Phase 7.2.
- Pre-flight: Task 2 consume los puntos/snapshot de Task 1; Task 3 guarda el snapshot antes del callback al gate; Task 4 recorre el mismo estado desde DOM/Chrome. No hay interfaz compartida con CameraSnapshot ortográfico.

- Task 1: complete — reducer RED (3 fallos funcionales), GREEN 4/4; callbacks obsoletos rechazados.
- Task 2: complete — escena/cámara/modelo existente; ruta rodea mesa con RED→GREEN geométrico 2/2; primer frame usa after-render; monitor GPU fuera de Suspense.
- Task 3: complete — entrada/gate/continuidad, RED→GREEN de integración, foco y limpieza de URL.
- Task 4: complete — Chrome cuatro viewports, escenarios de falla, suite 371/371, TypeScript y ESLint; evidencia en docs/product/workshop-game-evidence.
- Ruling: mantener rama/checkout y trabajo sin commit/push — plan aprobado pide cierre local y la integración todavía no está autorizada.
- Ruling: soporte de WebGL2 probado antes de montar R3F — Canvas puede fallar antes de que monte el boundary interno; fallback inmediato verificable en Chrome.
- Revisión independiente: 3 P2 reproducidos (GPU pendiente, foco y query persistente), corregidos y reprobados por el revisor. Intercepción del botón Cancelar por header corregida y verificada en Chrome en 1440/1920/390/320.
