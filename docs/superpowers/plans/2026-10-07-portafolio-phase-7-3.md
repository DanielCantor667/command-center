# Sprint 7 — Phase 7.3: salas de proyectos

Estado: completado localmente el 8 de octubre de 2026, autorizado por Daniel con «sí porfa, sigue con la 7.3». Implementación local sobre `codex/portfolio-realistic-modeling`. Phase 7.4, commit, push y deploy requieren otra autorización.

**Goal:** recorrer cuatro salas propias, inspeccionar su evidencia real, abrir los casos existentes y regresar al mismo punto con cámara/foco conservados.

**Architecture:** shell v2 con cuatro portales/hojas de cierre; GLB diferido por sala. Registro tipado de destinos vinculado a `PROJECTS`. Un canvas del taller persiste y pausa al leer casos. Estado de carga de sala aislado del core y callbacks con token. Una sala activa en reposo; al cambiar pueden convivir origen y destino hasta completar el trayecto.

**Tech Stack:** versiones locales del repo: Next 15, React19, R3F9, Drei10, Three0.171, TypeScript, CSS Modules, lucide-react, Vitest y Playwright/Chrome. Sin nuevas dependencias.

**Spec:** [propuesta completa aprobada](2026-10-07-portafolio-taller-jugable-propuesta.md). Base comprobada: [7.2](../../product/workshop-game-evidence/phase-7-2-validation.md).

## Límites y decisiones

- Sólo salas Kliniu, L'ORIGINE, 4U Studio Academy y Drokex. Sin tecnologías/archivo/contacto/mapa nuevos, WASD, física, avatar o audio.
- Leer datos y capturas reales del repo; métricas siguen vacías. Drokex conserva «Participación descrita en el CV de Daniel. Propiedad no confirmada.».
- Maestro/source v2 separados para conservar fuente, exports y hashes de 7.2. Assets antiguos sin sobrescribir; nuevo shell `workshop-shell-v2.glb`, puerta común `workshop-door-v1.glb`.
- Core <=5 MB sin comprimir; cada sala <2 MB y <25k triángulos, <=12 primitives cuando sea viable. Medir bytes y render real, sin inferir fps de móvil físico.
- Perfil DPR1 móvil /1.5 desktop, sombras1024/2048, reflexión fijada por instancia para evitar la retención PMREM comprobada en7.2. Render bajo demanda, pausa al ocultarse/leer.
- Trabajar en checkout actual: cambios previos/7.2 sin commit. BLUEPRINT/PERFIL siguen ausentes en las rutas indicadas; reutilizar contratos existentes.
- La aprobación explícita de7.3 cubre este desarrollo del alcance ya descrito. Se documenta antes de código y se ejecuta sin otra ronda de aprobación del mismo alcance.

## Contrato espacial y de carga

| RoomId / projectId | Portal (centro suelo) | Cámara / objetivo | GLB |
| --- | --- | --- | --- |
| kliniu / kliniu | [-5.1,0,-3] frente+Z | [-5.1,1.65,-4] / [-5.1,1.5,-8.7] | room-kliniu-v1.glb |
| lorigine / lorigine | [4.8,0,-3] frente+Z | [4.8,1.65,-4.1] / [4.8,1.45,-8.5] | room-lorigine-v1.glb |
| academy / 4ustudio-academy | [-4,0,5.7] frente+X | [-6.4,1.65,5.7] / [-8.6,1.4,5.7] | room-academy-v1.glb |
| drokex / drokex | [4,0,5.7] frente-X | [6.4,1.65,5.7] / [8.6,1.4,5.7] | room-drokex-v1.glb |

Todos bajo `/models/workshop-game/`. Shell conserva nodos separados `roomgate__<RoomId>`. Portales2.2×2.5m, separadores2.75m. Eje central libre y corredor z=3. Desde las salas delanteras salir primero a[0,1.65,5.7]; traseras salir primero al corredor z=3 manteniendo x de su puerta. Banco conserva caja x±2.5,z[-2,.4]. No atravesar paredes, mesa ni escalera.

`RoomId = 'kliniu' | 'lorigine' | 'academy' | 'drokex'`; `WorldPoint` añade esos destinos a entrance/hub/workbench. Registro `WORKSHOP_ROOMS` define projectId, url, portal, pose y captura. `roomForPoint(point)` identifica sala sin confundir alias Academy con ID público.

`WorldState` añade `activeRoom` y `pendingRoom`, y estados `room-loading`/`room-error`. `go(room)` conserva sala origen mientras solicita destino; `room-ready(id,token)` permite mover sólo si coincide la solicitud actual; `arrived(token)` retira origen y conserva destino. Cancelar/sustituir invalida token y devuelve al punto estable. Error de sala mantiene core y acceso al caso HTML. Reintento limpia sólo la clave GLTF de esa sala y remonta su boundary. Error GPU sigue siendo global.

UI/dataattrs: `main[data-workshop-state][data-world-point][data-world-destination]`. Navegación HTML «Ir a Kliniu», «Ir a L'ORIGINE», «Ir a 4U Studio Academy», «Ir a Drokex»; inspección «Abrir caso de <nombre>»; «Volver al taller» en casos. Carga «Cargando sala de <nombre>», «Cancelar carga de sala», error «Reintentar sala» y «Abrir caso sin 3D». Core visible mientras carga sala; el caso directo no activa GPU.

## Task 1 — Blender y exports (phase73_assets)

**Files:** crear `blender/generate_workshop_rooms.py`, `blender/scenes/workshop-game-v2.blend`, shellv2 y cuatro room GLB; manifest/previews/README propios en `docs/product/workshop-game-rooms/`. No modificar generator/assetsv1.

- [x] Reutilizar helpers/kit v1 para producir arquitectura base, mover decorado de Kliniu/estantes traseros al GLB correspondiente, añadir particiones/portales/hojas estables.
- [x] Modelar Kliniu como showroom+banco operativo; L'ORIGINE galería clara con pedestales/productos; Academy piano, instrumentos y paneles acústicos; Drokex nodos/módulos/conexiones. Dejar caminos/poses despejados.
- [x] Guardar maestro editable antes de agrupar copias de export por material. Capturas reales se añaden en HTML, no en texturas generativas.
- [x] Exportar y comprobar geometry/UV/materiales/bounds/nombres/budgets, hashes/licencia propia; previews desde poses de web. Avisar al primer export para calibración en navegador.

Resultado Task1 — 8 de octubre: maestro v2 editable guardado antes de exportar; cinco GLB y cinco previews Blender inspeccionados. Shell3,620,768bytes/51,553triángulos más puerta58,072bytes = core3,678,840bytes. Kliniu1,001,592bytes/7,304triángulos/10primitives; L'ORIGINE823,904/7,396/7; Academy794,768/8,036/9; Drokex665,616/3,004/9. Todos los batches tienen UV; PBR y normales embebidos, gates exactos y opacos, sin recursos externos. Fuente/exports7.2 conservan hashes exactos antes/después. Manifest: `docs/product/workshop-game-rooms/manifest.json`. Aceptación del renderer web queda en Task4; los renders fuente no prueban navegador ni FPS.

## Task 2 — Registro, navegación y carga (root)

**Files:** crear `rooms.ts`, `room-content.tsx`, `room-inspection.tsx`; modificar `world-state.ts`, `world-path.ts`, `world-scene.tsx`, `blender-workshop.tsx`, `component.tsx`, CSS, assets/hit/validador; tests acotados en módulo.

- [x] RED: reducer request A→B→late-ready A, cancel→late-ready, room-error/retry, gohub durante carga y llegada retira origen. Tests de trayectos entre todas las salas contra mesa/particiones y callbacks conservando tokens.
- [x] Implementar registro/estados/path. Mantener core estable; room boundary/Suspense propios no desmontan canvas. Puertas abiertas sólo para salas listas/activas.
- [x] Cargar únicamente URLs solicitadas; mostrar preparación/carga real y recuperación localizada. Clicar portal/objeto y acción HTML comparten destino; descartar drag como click.
- [x] Inspección usa datos `PROJECTS`, evidencia real y atribución; navegación seis destinos responsive3×2 en móvil, sin solapes320px; acciones completas accesibles por teclado.
- [x] GREEN: tests de estado/path/carga/interfaz, TypeScript y lint. Core/GLB primeros frames y GPU loss conservan invariantes7.2.

## Task 3 — Lectura de casos y continuidad (root + phase73_content)

**Files content agent:** `portfolio-case/component.tsx`, `lorigine-case.tsx`, `academy-case.tsx`, `drokex-case.tsx` y tests correspondientes. **Files root:** `shell/experience-gate/component.tsx` y tests, prop `suspended` de WorkshopGame/WorldScene/CameraController.

- [x] Content agent: propagar returnLabel y valor por defecto clásico en todas las variantes; prueba de retorno personalizado y regresión etiqueta clásica.
- [x] Root: game queda montado bajo caso, oculto/inert, renderer pausado y eventos/foco suspendidos. Al cerrar, cámara exacta permanece y foco vuelve al CTA de la sala de origen.
- [x] Conservar origen al cambiar caso A→B; historial y enlaces directos funcionan. Caso directo no carga world ni GLB hasta activar entrada. No mezclar snapshotgame con ciudadortográfica.
- [x] Probar cuatro IDs correctos, retorno/nextcase/popstate y pausa. Casos clásicos mantienen sus controles/visores opt-in.

## Task 4 — QA y cierre local (phase73_qa + root)

**Files:** `docs/product/workshop-game-evidence/verify-phase-7-3.cjs`, `phase73-*`, `phase-7-3-validation.md`; extender validador con nuevo manifest.

- [x] Reiniciar Next viejo del puerto3000 antes del navegador y confirmar título del checkout.
- [x] Chrome1440×1000,1920×1080,390×844,320×568: cuatro destinos, GLB sólo al seleccionar, core una vez/canvas estable, evidencia visible/case/retorno con pose numérica+foco, viajes sin colisiones.
- [x] Por sala:404/retry, carga retenida/cancel/sustitución, pérdida GPU pendiente, alternativa HTML; no callbacks tardíos. Teclado/reduced motion/directlinks/history. AtribuciónDrokex conservada.
- [x] Medir bytes, renderer/memoria tras dos ciclos con cache caliente, frames en movimiento y reposo; revisar capturas y fuente/GLB, con límite explícito de emulación móvil y devserver.
- [x] Revisión independiente final, correcciones importantes con regresión; Vitest completo, tsc, lint y diffcheck. Documentar resultados y dejar preview local. Finalizar únicamente7.3.

## Review Focus

- Sustitución/cancelación durante una sala suspensa no puede mover a destino anterior ni esconder el core.
- Al volver de un caso diferente al abierto, cámara/foco pertenecen al origen de la lectura, sin cámara ortográfica.
- Al entrar/salir de cada partición el corredor real debe estar libre incluso entre salas delanteras y traseras.
- Un fallo opcional nunca impide leer el caso real, abrir otro destino o salir al portafolio.
- Dos vueltas por las cuatro salas no deben acumular recursos sin límite; pausa de lectura no puede reactivarse al cambiar visibilidad.

## Avance / rulings

- Preflight: assets→root comparte cuatro URLs/nodos/poses; fijados arriba. Root→QA comparte estado/labels; fijados arriba. Case props→gate mantiene returnLabel compatible. Escrituras separadas por dueño.
- Ruling: adaptación local del plan aprobado, sin repetir aprobación. No commits de trabajo previo ni instalaciones.

## Cierre local — 8 de octubre

Phase7.3 completada: 16 combinaciones sala/pantalla y39 escenarios adicionales Chrome aprobados, incluidos retornos con orientación modificada por drag, errores y pérdida GPU. Vitest392/59, TypeScript, ESLint y validador GLB pasan; revisión independiente sin hallazgos pendientes. Memoria estable tras dos ciclos calientes;0frames al leer/ocultar. Capturas finales desktop/móvil inspeccionadas. Detalles y límites de emulación/dev: `docs/product/workshop-game-evidence/phase-7-3-validation.md`. Next local queda disponible en el puerto3000. No se avanzó7.4 ni se hicieron commits, push o deploy.
