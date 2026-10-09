# Sprint 7 — Phase 7.4: taller completo

> Ejecución local autorizada por Daniel: «listo, empieza por el 7.4». Root integra navegación y URLs; tareas independientes de assets, lectores y QA se delegan. Registrar progreso aquí, sin commits ni cambio de fase.

**Goal:** explorar tecnologías, trayectoria y contacto dentro del taller, con un mapa accesible de los nueve destinos físicos y lectura HTML equivalente sin GPU.

**Architecture:** conservar shellv2, puerta y cuatro salas7.3; añadir kit de tres estaciones al core bajo5MB. Mantener un canvas, pausa durante lectura y un lector HTML portalizado. ExperienceGate controla lectura/URL/historial y conserva origen al abrir casos relacionados. El mapa navega por los puntos existentes/estaciones, sin circulación libre.

**Tech Stack:** versiones locales: Next15, React19, Three0.171, R3F9, Drei10, TypeScript, CSS Modules, lucide-react, Vitest, Chrome/Playwright. Sin nuevas dependencias.

**Spec:** [propuesta aprobada completa](2026-10-07-portafolio-taller-jugable-propuesta.md), apartados5D,6–11 y Phase7.4. Base: [validación7.3](../../product/workshop-game-evidence/phase-7-3-validation.md).

## Global Constraints

- Únicamente tecnologías, trayectoria, contacto, mapa y adaptación móvil/lectura de7.4. Phase7.5, commit, push y deploy requieren otra autorización. Sin WASD, físicas, avatar, audio, backend o provisionado.
- Datos canónicos `PORTFOLIO_TECHNOLOGIES`, `PORTFOLIO_CAREER`, `PUBLIC_PROFILE`. Mantener siete proyectos asociados sin inventar salas para los tres adicionales. Contacto sólo GitHub/LinkedIn; sin correo, teléfono o CV descargable nuevos.
- BLUEPRINT/PERFIL siguen ausentes en `~/.Codex`; se reutilizan contratos del repo. Checkout actual `codex/portfolio-realistic-modeling` con muchos cambios previos; no aislar perdiendo los assets/versiones sin commit.
- Modelos/generadores/maestros7.2/7.3 preservados por hashes. Nuevo generator/master/stationsGLB/manifest. Core shell+door+stations <=5,000,000bytes; kit <=1,200,000bytes/<12k triángulos/<=13primitives.
- DPR1 móvil/1.5 desktop, sombras1024/2048, reflexión fija por instancia. Un canvas; lectores de tecnología sin su renderer Icon3D adicional. Pausa al leer/ocultar; CSS de movimiento reducido no debe impedir el foco.
- Modales portalizados, Escape/Tab/foco de vuelta, iconos lucide-react; sin emojis UI, alert o select nativo. Contenido disponible desde mapa/HTML sin iniciar WebGL.

## Contratos de implementación

`StationId = 'technologies' | 'trajectory' | 'contact'`; añadirlos a WorldPoint. `STATIONS` en `stations.ts` con nombre, inspección, punto/hotspot y pose. Nueve puntos navegables: hub, workbench, cuatro RoomId y tres StationId. Entrada es estado inicial, no una sala adicional.

| Estación | Cámara | Objetivo | Hit estable |
| --- | --- | --- | --- |
| technologies | [-6.8,1.65,1.55] | [-9.14,1.6,1.55] | stationhit__technologies |
| trajectory | [-7.7,1.65,.8] | [-8.1,1.55,-2.65] | stationhit__trajectory |
| contact | [6.7,1.65,2.7] | [6.7,1.3,1.45] | stationhit__contact |

Archivo al nivel del suelo bajo el mezzanine; no subir por la escalera. Contacto debe conservar z<2.8 para que `cameraPath` atraviese el corredor, no la partición frontal. La revisión matemática de72 rutas fue positiva; aceptación visual queda al navegador.

Kit `/models/workshop-game/workshop-stations-v1.glb`; decoración por material, tres hits opacos separados; origen global[0,0,0]. `WORKSHOP_RESOURCE_URLS` añade ese tercer core a la misma clave conjunta de useGLTF/reset. El primer frame incluye los tres assets; no se activa ningún GLB de sala al entrar.

`WorkshopReading = {kind:'technologies';technologyId:string} | {kind:'trajectory'|'contact'|'map'}`. Helpers `readWorkshopReading(url:URL):WorkshopReading|null` y `writeWorkshopReading(url:URL,reading:WorkshopReading|null):URL` en `reading.ts`. Query pública `?workshop=technologies&technology=nextjs`, `?workshop=trajectory`, `?workshop=contact`, `?workshop=map`; mantener hashes y `view=portfolio` clásicos. Normalizar ID contra los datos; desconocidos no abren contenido inexistente.

WorkshopGame recibe `reading?`, `onRead?`, `technologyFilters?`, `onTechnologyFiltersChange?`; valores por defecto compatibles con tests/llamadores7.3. Leer no mueve la cámara y pausa WorldScene. Main del juego inert/aria-hidden durante lector activo; portal fuera de main. Casos ocultan lector sin borrar su estado. Desde un caso, tecnología/sección abre lector del juego sin forzar portfolio; cerrar vuelve al punto/cámara conservados. Volver de caso relacionado retorna al lector, selección y filtros de origen. Etiqueta contextual «Volver a tecnologías/mapa/...», con default7.3 «Volver al taller» y clásico «Volver a la ciudad».

Props `WorkshopReader`: reading, currentPoint, worldAvailable, technologyFilters, onTechnologyFiltersChange, onRead, onGo(point:Exclude<WorldPoint,'entrance'>), onOpenCase(id:string), onClose. Maneja modal/body scroll/Tab/Escape/opener. Mapa muestra esquema SVG del taller y botones HTML equivalentes para los nueve puntos. Sin mundo activo: salas abren casos HTML, estaciones abren lectores, hub/mesa requieren entrada explícita. «Mapa» disponible en landing/error, sin activar GPU.

TechnologyExplorer añade `presentation?:'scene'|'html'` con default scene. Html usa el SVG existente y CSS adaptable al lector, mantiene búsqueda/categorías/filtro/relaciones/vacío. Sin Icon3D/Canvas. Selección actualiza URL; filtros viven en Gate y vuelven tras caso. Trayectoria/contacto usan exclusivamente datos existentes.

Desktop conserva nueve destinos y mapa. En móvil, barra visible de hub/mesa/mapa; mapa expone todos los destinos. Inspecciones se ajustan a esa barra sin solapes320px. Los nueve destinos no dependen de objetos ocultos/hover.

## Task 1 — Fuente y kit de estaciones (asset agent)

**Files:** crear `blender/generate_workshop_stations.py`, `blender/scenes/workshop-game-v3.blend`, nuevo GLB y `docs/product/workshop-game-stations/{manifest.json,README.md,previews}`. No modificar fuente/exports anteriores.

- [x] Leer v2 y reutilizar materiales WG_* empaquetados; añadir pared técnica, archivo y escritorio dentro de cajas acordadas.
- [x] Guardar maestro editable antes de agrupar copias de export. Conservar stationhit__* y UV/normales; export sólo del kit. Comprobar bytes/tris/primitives/bounds/hashes y presupuestos.
- [x] Inspeccionar fuente/previews y enviar primer export a root; aceptación del renderer en Task4.

## Task 2 — Lectores y mapa (UI agent)

**Files:** crear `workshop-reader.tsx`, `workshop-reader.module.css`, `world-map.tsx`, tests de lector/mapa; modificar TechnologyExplorer+CSS y su prueba de modo HTML. Consumir types de reading/stations/world-state de root; no editar estos archivos ni Gate/Game.

- [x] RED: tecnología filtrada/vacío/relación sin segundo Canvas, trayectoria y links de PUBLIC_PROFILE, mapa nueve destinos, modal portal/Tab/Escape/opener.
- [x] Implementar contrato de props anterior, fallback HTML sin GPU y contenido real, conservando el modo clásico de TechnologyExplorer.
- [x] GREEN enfocado y lint. Read-only review de cobertura accesible; integración/visual320 en Task4.

## Task 3 — Mundo, estado y continuidad (root)

**Files:** stations.ts, reading.ts, station-inspection.tsx, station-geometry.tsx y tests; modificar world-state, assets, blender-workshop, world-scene, component/CSS y Gate/tests. Nuevo validatorstations.

- [x] RED observado en destinos ausentes y tres flujos de Gate; aceptación de72 rutas con nuevas cajas, cancelación de sala, URL normal/ID inválido/clásico, selección/filtros y mapa sin GPU. Dos regresiones de foco reproducidas RED→GREEN.
- [x] Implementar registro/poses/core/hits y acciones compartidas HTML; integrar Reader controlado por Gate/historial. Pausar y restaurar foco sin mezclar snapshots de ciudad.
- [x] Mantener estados7.3/error/reintento, limpiar toda clave conjunta del core y conservar first frame. Validar hashes/assets.
- [x] GREEN enfocado, TypeScript/ESLint, sin modificaciones ajenas.

## Task 4 — QA y cierre únicamente7.4 (QA agent + root)

**Files:** nuevo `docs/product/workshop-game-evidence/verify-phase-7-4.cjs`, phase74-* y phase-7-4-validation.md. No sobrescribir evidencia7.3.

- [x] Preflight3000 sin listener/servidor viejo; iniciado checkout Next15. Otro chat lo reemplazó por Kliniu Next16 durante QA. Reiniciado taller en puerto dedicado3001; aceptación final contra ese servidor.
- [x] Chrome1440/1920/390/320: tres estaciones/lectores, 34 tecnologías/búsqueda/vacío/asociaciones, trayectoria/canales exactos, mapa nueve destinos y4 salas/casos de regresión.
- [x] Caso↔lector, ID seleccionado/filtros, historial/directlinks, Escape/Tab/foco, no Canvas extra y0frames al leer/ocultar/resize. Sin WebGL/GPU loss conserva mapa/lectura/contacto y reintento3D.
- [x] Core real <=5MB, nuevas poses/GLB draws/hits y trayectos sin atravesar equipo, bytes/carga/renderer/memoria de ciclos; indicar dev/móvil emulado como límites.
- [x] Revisión independiente final, corregir fallos importantes con pruebas, Vitest completo/tsc/lint/diffcheck. Inspeccionar capturas, guardar evidencia y dejar preview local. No7.5/commit/push/deploy.

## Review Focus

- Lector HTML de tecnología no puede abrir otro canvas ni resetear selección/filtros al regresar de un caso.
- Enlace de tecnología/sección desde caso en modo game no debe mandar al portfolio clásico ni hacer perder posición.
- Mapa en landing/error debe permitir contenido completo sin activar GPU; hub/mesa no pueden mover una cámara inexistente.
- Escape/Tab no pueden actuar sobre navegación inert del mundo; reanudar no debe recibir eventos/foco tardíos del lector.
- Viajes a contacto/archivo desde salas delanteras no deben cruzar tabiques/escalera/gabinete; errores de core no deben ser sustituidos por callbacks opcionales.

## Pre-flight / rulings

- Task1→3: URL, origen, hits/poses y presupuesto fijados arriba. Task3→2: tipos/props de lector fijados. Task2→3: TechnologyExplorer presentation html, callbacks de contenido sin mutar mundo. Task3→4: mismos dataattrs mundo7.3, más lector [role=dialog]/data-workshop-reading.
- Ruling: la autorización expresa de7.4 ejecuta el alcance escrito aprobado; este plan detalla implementación, no añade otra ronda de aprobación del mismo alcance.
- Ruling: kit esencial bajo1.2MB, en vez de introducir carga opcional/estado nuevo para tres piezas pequeñas — ofrece objetos físicos al entrar y conserva core<=5MB; si el export excede el presupuesto se simplifica antes de integrar.
- Ruling: reusar checkout y escritura por archivos propietarios, con review final independiente — preserva trabajo previo no committed; no crear worktree que lo pierda.
- Ruling: puerto final3001 tras takeover3000 de otro proyecto activo; no detener el nuevo servidor ajeno. `BASE_URL=http://127.0.0.1:3001` para QA y preview final.

## Execution record

- Fuente nueva v3 con89 piezas editables, cuatro cámaras de referencia y materiales existentes; export kit786,652bytes/7,860triángulos/9primitives. Core4,465,492bytes;11 hashes anteriores comprobados por validator nuevo.
- Lectores portalizados, TechnologyExplorer HTML sin Icon3D, catálogo34 herramientas y relaciones a siete proyectos; trayectoria/contacto canónicos. Mapa nueve destinos y fallback HTML desde landing/error.
- Gate conserva juego/lector/filtros entre casos, URLs públicas e historial. Game invalida carga pendiente al abrir lector, pausa canvas y conserva cámara. Barra móvil hub/mesa/mapa.
- Review independiente detectó foco sin opener desde caso/directlink/GPU loss; pruebas fallaron antes del parche y pasan con fallback tras cleanup del portal. Review posterior cerró el hallazgo.
- Chrome probe real mostró señal de L'ORIGINE a través del monitor de contacto: Html `occlude` corrigió el cruce; captura posterior inspeccionada. Se alinearon anchors de señales con manifest.
- Suite completa410 pruebas/64 archivos pasa; tsc/ESLint/diffcheck y validator de fuentes/GLBs pasan. Registro `phase74-vitest.log`.
- Aceptación final3001: nueve secciones Chrome pasan, cuatro viewports y30 escenarios adicionales. Transferencia core1,654,823bytes/decodificados4,465,492; memoria estable79geometrías/23texturas/9programas,0frames en muestras lectura/oculto/resize. Resumen `phase74-acceptance-summary.json` y validación `phase-7-4-validation.md`. Preview IAB del taller marcado entregable. Phase7.5 pendiente de autorización.
