# Portfolio Fase 6.1 Implementation Plan

**Goal:** Entradas a los cuatro casos y retorno con estado/camara preservados.
**Architecture:** Gate conserva WorkshopSnapshot durante la visita; Experience
coordina entradas tokenizadas y captura sincrona; CameraRig restaura antes de
dibujar. Loader conserva decision opt-in y reporta disponibilidad real.
**Tech Stack:** React 19, Next 15, TypeScript, R3F/drei, CSS Modules, Vitest, Chrome.
**Spec:** docs/superpowers/specs/2026-09-22-portfolio-phase-6-1-design.md aprobada.

## Restricciones

Sin fase6.2, nuevosassets, dependencias, backend, deploy, commit o push.
Preservar dirtywork y cuatro casos. No setState React por frame. Snapshot
previo a aproximar, max2600ms, cancelacion y omision, reduced motion directo.

## Contrato compartido

Crear modules/experience/workshop-state.ts:
CameraSnapshot {position:[number,number,number];target:[number,number,number];
factor:number;offset:[number,number];width:number;height:number}.
CityCameraHandle {capture():CameraSnapshot;restore(snapshot:CameraSnapshot):void}.
WorkshopSnapshot {projectId:string;detail:boolean;exploded:boolean;night:boolean;
sceneEnabled:boolean|null;tourStop:KliniuTourStop;camera:CameraSnapshot|null;
scrollY:number}.

CityNavigatorProps nuevas: cameraHandle?:MutableRefObject<CityCameraHandle|null>,
initialCamera?:CameraSnapshot|null, initialEnabled?:boolean|null,
onEnabledChange?:(enabled:boolean)=>void, entranceToken?:number,
onEntranceReady?:(token?:number)=>void, reveal?:boolean, onSceneError?:()=>void.
Experience props: initialWorkshop?:WorkshopSnapshot, onWorkshopSave?:(value)=>void,
restoring?:boolean, reveal?:boolean. Gate inicial reveal=true; posterioresfalse.

## Tarea 1 - Coordinacion y persistencia

Archivos: experience/component.tsx, cinematic.module.css,
shell/experience-gate/component.tsx y sus tests existentes.
- [x] RED entradas cuatroproyectos; callback antiguo tras cancelar+nuevaentrada,
  omitir/dobleclic/timeout; retorno flags/scroll/foco/caso siguiente.
- [x] Snapshot sincrono antes de mutar detail/exploded/scroll. Guardar tambien
  al entrar por preview/tour/tecnologias. Restaurar cancelacion con cameraHandle.
- [x] Gate guarda snapshot, retorno mismo caso exacto; cambio de caso canonical
  detail=true,camera=null conservando noche/capas/opt-in y scroll.
- [x] Salida a seccion prioriza su scroll. Caso remonta por key para enfocar H1.
- [x] Revelado450ms una sola visita, nombre/navegacion siempre disponibles.
- [x] GREEN tests; no reformateo ajeno a cambios.

## Tarea 2 - Camara y carga

Archivos: workshop-state.ts, components/city-navigator.tsx,
components/city-navigator-loader.tsx, tests/workshop-state.test.ts,
tests/city-navigator-loader.test.tsx.
- [x] RED funciones de configuracion cuatroproyectos y escala del snapshot.
- [x] Configuracion tipada por proyecto; solo Kliniu usa screen; otros acercan
  a su pabellon. Snapshot incluye offset normalizado y factor zoom responsive.
- [x] Captura sincrona API ref, restauracion inicial/cancelacion sin rebote;
  callback tokenizado 700-1100ms y asentamiento inicial <=800ms interrumpible.
- [x] Loader restaura opt-in/cierre incluso desktop; poster visible mientras
  carga; boundary interno R3F y contextlost fuera de Suspense; entrada directa
  ante fallo. Ningun canvas oculto extra.
- [x] GREEN tests, tsc, ESLint.

## Tarea 3 - Verificacion

- [x] Chrome1440/1920/390/320/320x568 screenshots y canvaspixel no vacio.
- [x] Giro manual, entrada cuatro casos, retorno flags/scroll/camara/foco;
  siguienteproyecto usa canonical. Reveal no repetido.
- [x] Cancelar Escape, omitir, repetidos, fallosGLB/contexto, lentaGLB,
  sinWebGL, sin ViewTransition y reducedmotion. Navegar secciones.
- [x] Cuatro scripts de regresion, Vitest completo, tsc, ESLint, diffcheck.
- [x] Revision independiente si disponible, evidencia y limites documentados.

## Registro

Workspace actual conserva fases anteriores sin commits. Fase 6.1 verificada en
Chrome, 352 tests, TypeScript, ESLint y `git diff --check`. Registro detallado:
`docs/product/portfolio-3d-evidence/portfolio-phase-6-1-validation.md`.
