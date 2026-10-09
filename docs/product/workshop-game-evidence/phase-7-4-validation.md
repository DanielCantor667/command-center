# Sprint 7 — Phase 7.4: tecnologías, trayectoria, contacto y mapa

Fecha: 9 de octubre de 2026. **Phase7.4 terminada y verificada localmente.** Cuatro viewports y30 escenarios adicionales pasan en nueve secciones de Chrome. [Resumen de aceptación](phase74-acceptance-summary.json).

## Resultado implementado

- Tres estaciones físicas originales de Blender: pared técnica, archivo al nivel del suelo y escritorio de contacto. Maestro editable `blender/scenes/workshop-game-v3.blend` con89 piezas nuevas; v1/v2 y sus exports conservados.
- Tecnologías:34 herramientas canónicas, búsqueda/categorías/filtros y relaciones reales con siete proyectos. Lector HTML sin el Canvas de Icon3D. Se conserva selección/filtros al abrir y volver de un caso relacionado.
- Trayectoria: experiencia, formación e idiomas de `PORTFOLIO_CAREER`. Contacto: datos de `PUBLIC_PROFILE`, LinkedIn y GitHub existentes.
- Mapa: esquema y nueve destinos HTML. Navega por el mundo activo; desde entrada/fallo permite casos y lectores sin activar WebGL. Hub/mesa requieren entrada explícita.
- Barra móvil hub/mesa/mapa, lectura de pantalla completa y señales 3D ocultadas por el entorno. Casos y lectores pausan el renderer; cámara/punto persistentes.
- URLs `?workshop=technologies&technology=nextjs`, `?workshop=trajectory`, `?workshop=contact`, `?workshop=map`; coexistencia con casos y vista clásica, validación de ids e historial.

## Entorno y presupuestos comprobados

Servidor final: `http://127.0.0.1:3001`, Next15.5.19. Chrome155.0.8059.39, macOS arm64, headless para el harness. Además se comprobó contacto directo→cierre/foco→entrada3D→pared técnica en el navegador integrado de Codex.

| Asset esencial | Bytes GLB |
| --- | ---: |
| shellv2 | 3,620,768 |
| puerta v1 | 58,072 |
| estaciones v1 | 786,652 |
| Total | **4,465,492** |

Kit:7,860 triángulos,9primitives,6materiales opacos,2 imágenes embebidas, UV/normales9/9, un material con normal map; sin recursos externos. Debajo de los límites1.2MB/<12ktris/13primitives y core5MB. Validator compara11 hashes anteriores y hashes del nuevo generador/master/GLB. [Manifest y anchors](../workshop-game-stations/manifest.json).

Transferencia observada del core en las cuatro vistas:1,654,823bytes, frente a4,465,492bytes decodificados. Cache deshabilitada; observación de este servidor local.

## Verificación

| Comprobación | Evidencia | Estado |
| --- | --- | --- |
| Tres estaciones renderizadas, inspecciones/lectores/foco | phase74-probe-results.json | Pasa |
| 1440×1000,1920×1080,390×844,320×568: mapa, estaciones y cuatro salas/casos | phase74-viewports-results.json | Pasa |
| 34 herramientas y asociaciones, siete casos HTML, selección/filtros | phase74-readers-results.json | Pasa |
| Historial, enlaces directos, classic precedence, caso→lector y teclado320 | phase74-navigation-results.json | Pasa:12 escenarios |
| Recursos fallidos, sin WebGL, GPU loss durante lectura y reintento | phase74-resilience-results.json | Pasa:13 escenarios |
| Raycasts de los tres hits reales | phase74-rays-results.json | Pasa |
| 13 recorridos reales, altura de cámara y obstáculos | phase74-paths-results.json | Pasa |
| Ciclos con cache caliente y recursos del renderer | phase74-memory-results.json | Pasa |
| Lectura/oculto/resize sin frames y retorno exacto | phase74-visibility-results.json | Pasa |
| Vitest completo | phase74-vitest.log | Pasa:410 pruebas/64 archivos |
| TypeScript, ESLint de archivos afectados, diffcheck | Comandos locales con exit0 | Pasa |
| Fuentes/GLB/presupuestos/hashes | validate-workshop-stations-assets.mjs y validate-workshop-rooms-assets.mjs | Pasa |

Los cuatro viewports confirman tres assets core y carga opcional de las salas; ningún Canvas adicional al leer tecnologías, pausa0frames, Tab/Escape y cámara/píxeles exactos al volver de los casos. Los readers verifican descripciones/asociaciones contra los archivos canónicos, sin métricas fabricadas.

Dos ciclos completos con cache caliente conservan79geometrías y23texturas en los ocho snapshots de estaciones/hub;9programas en hub sin crecimiento. Las seis lecturas muestreadas no renderizan frames. Idle853.2ms:0frames. Cada una de las siete URLs GLB se solicita una vez en ese ensayo. Son contadores de `renderer.info`, no bytes de RAM/VRAM.

Visibilidad: hidden resize538.1ms, lectura853.9ms, cambio de visibilidad304ms y tres redimensionados:0frames en cada muestra. Una orientación obtenida por arrastre real en archivo se conserva exactamente al ocultar, redimensionar, leer y volver; foco vuelve al CTA.

Review independiente detectó dos cierres de lector sin opener utilizable (enlace directo y pérdida de GPU). Pruebas RED→GREEN cubren el fallback de foco a entrada/reintento/CTA y conservan un opener válido. Review posterior cerró el hallazgo. La captura inicial de contacto también expuso una señal de sala atravesando el monitor; `Html occlude` lo corrigió y la captura posterior fue inspeccionada.

La prueba matemática recorre72 pares ordenados de destinos contra banco, tabiques, gabinete y cajas de estaciones; review adicional usó sourceBounds reales, sin intersecciones.

## Límites e incidencias del entorno

- Medición en servidor de desarrollo. Bytes GLB incluyen texturas; no incluyen JS/CSS/poster/evidencia. No se declara un benchmark de producción ni fps garantizados.
- Móvil emulado en Chrome de escritorio; hardware móvil, temperatura, batería y ergonomía táctil física quedan sin medir. Pestaña oculta se ejercita con fixture de visibilidad y eventos; no mide el scheduling de una pestaña físicamente en background.
- En preflight el puerto3000 no tenía un Next viejo. El servidor local iniciado fue reemplazado por otro chat ejecutando Kliniu; el taller se trasladó al3001, conservando el servidor ajeno. Una pasada posterior sufrió cierre de Chrome sin error de la app; se registró y repitió con logging. `phase74-port3000-takeover-*` y `phase74-chrome-disconnect-*` son incidencias históricas, no la aceptación final.
- El badge de Next aparece en capturas de desarrollo. Algunas capturas de lectores/mapa muestran scroll posterior a la prueba real de Tab; cierre/cabecera siguen accesibles.

No se avanza a Phase7.5. No hay commit, push, despliegue, provisionado o cambios de backend privado en esta fase.
