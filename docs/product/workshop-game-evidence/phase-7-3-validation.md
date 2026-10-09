# Sprint 7 — Phase 7.3: validación local

Completada el 8 de octubre de 2026, dentro del alcance autorizado de cuatro salas. Phase7.4 queda pendiente de autorización. Sin commit, push, deploy, instalaciones ni recursos provisionados.

## Resultado

Kliniu, L'ORIGINE, 4U Studio Academy y Drokex disponen de sala propia, captura real del repositorio, acceso al caso existente y retorno al mismo punto, orientación y foco. Cada GLB de sala se solicita al elegir su destino; el core permanece montado durante cargas opcionales. Al leer un caso, el mismo canvas queda oculto, inert y pausado. Cambiar de caso conserva la sala de origen. Los enlaces directos a casos no inicializan GPU ni solicitan GLB del taller antes de entrar.

El maestro editable v2 y sus exports son independientes de7.2. El validador comprueba hashes del generador, maestro y exports, UV, normales, gates separados, ausencia de recursos externos y presupuestos. Los hashes del generador, maestro, shell y puerta de7.2 siguen iguales. El poster v3 procede del renderer web real del shellv2; los PNG Blender sólo son referencias de la fuente.

## Prueba de navegador

Ejecución completa de `verify-phase-7-3.cjs`: **EXIT0, passed:true**. Chrome154 en macOS arm64, ANGLE AppleM4, Next dev local; cache de red deshabilitada. Instrumentación de QA exclusivamente en el navegador de prueba, sin instrumentación nueva en producción.

| Pantalla | Salas/casos/retorno | DPR | Sombra real | Pausa al leer |
| --- | --- | --- | --- | --- |
| 1440×1000 | 4/4 | 1.5 | 2048×2048 | 0 frames |
| 1920×1080 | 4/4 | 1.5 | 2048×2048 | 0 frames |
| 390×844, emulada | 4/4 | 1 | 1024×1024 | 0 frames |
| 320×568, emulada | 4/4 | 1 | 1024×1024 | 0 frames |

En las16 combinaciones se comprobaron descarga individual, primer frame antes del recorrido, draw real del GLB propio en la pose de la sala, evidencia visible, seis destinos sin solapes, apertura del ID correcto, continuidad del mismo renderer/canvas y retorno de foco al CTA original. Antes de abrir cada caso se cambia la orientación mediante drag real; la comparación numérica y de imagen comprueba esa orientación al volver. Los trayectos medidos evitan mesa y particiones. Capturas finales inspeccionadas por QA y root.

Los39 escenarios adicionales abarcan cuatro gates GLB mediante raycast, mesa, drag sobre los cuatro monitores, dos ciclos de cache caliente, pestaña oculta con resize, lectura con resize/visibilidad, snapshot→tecnologías→historial→pérdida GPU→reintento, teclado, movimiento reducido, Escape, siguiente caso/historial, cuatro enlaces directos y las cuatro variantes clásicas. Por sala se prueban404, caso HTML alternativo, reintento localizado, carga retenida/cancelación/salida al hub/sustitución y pérdida GPU seguida de respuesta válida o404 tardío. También pasan los dos404 del core con reintento y la alternativa sin WebGL. Los recorridos normales no registraron errores de página.

En320×568 la tarjeta muestra captura, título, CTA y atribución; el resumen completo está disponible en el caso HTML y «El taller» permanece en la navegación. La atribución de Drokex sigue siendo «Participación descrita en el CV de Daniel. Propiedad no confirmada.». No se añadieron métricas de negocio.

## Assets y mediciones

| Asset | Bytes sin comprimir | Triángulos | Primitives |
| --- | --- | --- | --- |
| Shellv2 | 3,620,768 | 51,553 | 19 |
| Puerta v1 preservada | 58,072 | 980 | 3 |
| Sala Kliniu | 1,001,592 | 7,304 | 10 |
| Sala L'ORIGINE | 823,904 | 7,396 | 7 |
| Sala Academy | 794,768 | 8,036 | 9 |
| Sala Drokex | 665,616 | 3,004 | 9 |

Core: **3,678,840bytes**, por debajo del límite5MB. Cada sala cumple <2MB/<25k triángulos/≤12primitives. El navegador confirma esos bytes completos y una descarga por URL en cada recorrido frío.

Movimiento observado:60.040–60.361FPS; p95 de intervalo17.1–17.8ms; p95 de envío CPU0.3–0.6ms. Primer frame útil del core789.1–838.3ms desde activación; montaje de sala338.1–345.1ms desde su selección; draw en pose final1,932.6–1,969.1ms, incluido el trayecto. Son observaciones del equipo local, no tiempos prometidos.

Reposo, lectura, pestaña oculta con resize y lectura con resize/visibilidad: **0 frames** en las muestras. Tras precargar las cuatro salas y recorrer dos ciclos adicionales: **70 geometrías, 21 texturas y9 programas**, constantes en cada muestra. Sólo la sala elegida permanece montada tras llegar; al hub no queda ninguna sala opcional activa. El reintento global tras snapshot inicia su nuevo primer frame en la entrada[-1.8,1.65,14].

Los FPS de pantallas móviles corresponden al mismo Chrome de escritorio emulando tamaños y entrada táctil. No se midieron teléfono físico, batería, calor ni red móvil. Los bytes GLB excluyen JS/CSS/poster/capturas; los contadores del renderer no representan RAM/VRAM en bytes. El tiempo de envío CPU no mide ejecución GPU. La visibilidad de pestaña se prueba mediante un fixture de propiedades y el evento real `visibilitychange`; los raycasts de gates usan cámaras de revisión explícitas, mientras los drags y la navegación HTML se ejercitan con entrada real.

## Correcciones verificadas y revisión

La revisión independiente y el navegador detectaron y comprobaron correcciones para: fallo opcional tardío que sustituía error global GPU; cámara antigua al reintentar desde snapshot; resize que reactivaba Canvas oculto; transiciones de visibilidad heredada con movimiento reducido que impedían enfocar; wrapper del monitor que bloqueaba drag; promesa `ViewTransition.ready` rechazada sin capturar al cambiar viewport; y tarjeta320 que tapaba la evidencia. Se guardan las reproducciones RED; el recorrido completo final pasa con todas las correcciones. Revisión final sin hallazgos pendientes.

Vitest completo: **392 pruebas /59 archivos, EXIT0**. TypeScript sin emitir, ESLint del alcance modificado, validador de assets, sintaxis del harness y `git diff --check`: **EXIT0**. Se conservaron los cambios previos del checkout sin crear commits.

## Evidencia reproducible

- [Resultados completos](phase73-full-results.json) y [métricas derivadas](phase73-metrics-summary.json).
- [Capturas escritorio](phase73-room-review-1440.jpg) y [capturas320](phase73-layout-review-320.jpg).
- [Harness Chrome](verify-phase-7-3.cjs), [validación GLB](phase73-assets-validation.json), [Vitest](phase73-vitest.log), [TypeScript](phase73-typescript.log) y [ESLint](phase73-eslint.log).
- [Manifest y fuente](../workshop-game-rooms/README.md), [export de poster](export-phase-7-3-poster.cjs).

```sh
node docs/product/workshop-game-evidence/verify-phase-7-3.cjs
node apps/web/scripts/validate-workshop-rooms-assets.mjs
```

Vista previa local: http://localhost:3000. El proceso Next15.5.19 de este checkout sustituyó el servidor anterior del puerto3000 antes de las pruebas. Cierre únicamente de7.3; tecnologías, archivo, contacto y mapa de7.4 siguen sin implementarse en el taller.
