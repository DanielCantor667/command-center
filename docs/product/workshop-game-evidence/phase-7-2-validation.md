# Sprint 7 — Phase 7.2: validación local

7 de octubre de 2026. Implementación y validación técnica terminadas. Disponible en http://localhost:3000 para revisión visual de Daniel. Phase 7.3 continúa pendiente de autorización; no hay commit, push, deploy ni nuevas dependencias.

## Entrega

Taller Blender editable con nave, mezzanine arquitectónico, estructura verde, ventanas, madera, lámparas, plantas, mesa y maqueta Kliniu reutilizada. Shell y puerta separados se cargan en Three.js; conservan navegación, loader real, cancelación, casos HTML y retorno con cámara/foco. Cinco texturas propias embebidas, incluidas dos normales. El poster se exportó del GLB ejecutado en Chrome, sin controles.

- [Fuente .blend](../../../blender/scenes/workshop-game-v1.blend) y [generador](../../../blender/generate_workshop_game.py).
- [Manifiesto con hashes y poses](../workshop-game-assets/manifest.json), [validación GLB](phase72-asset-validation.json).
- [Comparación concepto/navegador](phase72-concept-vs-browser.png), [interior](phase72-1440-hub.png), [Kliniu](phase72-1440-kliniu.png), [móvil](phase72-390-hub.png), [320 px](phase72-320-landing.png).

La comparación muestra la nave, altura humana, mezzanine, acero verde, madera y mesa central. Esta base tiene menos decoración, variación material y luz cálida que el concepto generado. Las cuatro salas del mockup corresponden a fases posteriores. La fidelidad visual final queda para revisión de Daniel; no se declara una coincidencia fotográfica con imagegen.

## Assets y render medidos

Shell: **4.542.140 bytes**, **62.633 triángulos**, 15 batches/materiales. Puerta: **58.072 bytes**, **980 triángulos**, tres batches/materiales. Total **4.600.212 bytes**; se comprobó el presupuesto de 5 MB de GLB incluso antes de compresión HTTP. Cuatro hashes del manifiesto coinciden con fuente/generador/exports finales.

Chrome descargó **1.550.796 bytes encoded** y **4.600.212 decoded** de los GLB, una respuesta HTTP200 por recurso y sin caché. ResourceTiming observó unos **7,56–7,57 MB encoded** de recursos hasta entrar, incluidos JS/CSS/fuentes/poster; esta suma no incluye el documento de navegación. El presupuesto de assets no es una promesa de que la página completa pese menos de 5 MB. No se midió un build de producción.

Durante los cuatro movimientos reales de cada viewport: 16 draw calls mediana, máximo 17 y máximo 62.789 triángulos de renderer en la pasada principal. Memoria estable inicial: nueve texturas, 31 geometrías desktop/30 móvil. Los contadores del renderer no representan únicamente meshes del GLB ni tiempos de ejecución GPU.

## Navegador

Chrome 154.0.8037.98, headless, macOS arm64, ANGLE Metal Apple M4, Next dev local. DeviceScaleFactor 2 en todos los tamaños; móvil emulado con touch. Los fps son muestras del recorrido en este equipo, no mediciones de un teléfono físico.

| Viewport | DPR real | Primer frame útil | Entrada al hub | FPS en movimientos | P95 intervalo | Frames en reposo ~1,1 s |
| --- | --- | --- | --- | --- | --- | --- |
| 1440 × 1000 | 1.5 | 828 ms | 2453 ms | 59.97–60.00 | 17.5 ms | 0 |
| 1920 × 1080 | 1.5 | 809 ms | 2435 ms | 59.96–60.03 | 17.6 ms | 0 |
| 390 × 844 | 1 | 792 ms | 2418 ms | 59.95–59.99 | 17.6 ms | 0 |
| 320 × 568 | 1 | 791 ms | 2426 ms | 59.96–60.02 | 17.4 ms | 0 |

[Resultados completos](phase72-results.json), [resumen de ejecución](phase72-verification-summary.log), [console](phase72-browser.log) y [script reproducible](verify-phase-7-2.cjs).

Pasaron 15 escenarios adicionales: clic real sobre mesa GLB; suelo sin acción; arrastre sin activar destino; resize con mismo renderer/cámara y sin recargar GLB; teclado, movimiento reducido, historial y caso directo; 404/reintento y pérdida de contexto con cada recurso pendiente/listo; cancelación y salida al portafolio durante carga; alternativa sin WebGL y cuatro casos clásicos. No hubo errores de página fuera de los fallos de recursos provocados. La cámara restituye posición/quaternion/fov exactos y la diferencia media de imagen tras volver de Kliniu fue cero en los cuatro tamaños.

## Correcciones verificadas

- El reintento limpia la misma clave conjunta que useGLTF carga. Ambos 404/reintentos pasan.
- El límite móvil se expresa en la prop Canvas: el ajuste interno era sobrescrito a 1.5. Drawing buffer 390×844 y 320×568 con DPR 1; escritorio DPR 1.5.
- La luz principal se recrea al cambiar de perfil: mapas reales 2048→1024→2048, con actualización de sombras bajo demanda.
- La entrada se alineó con el centro de la hoja izquierda en x=-1.8, manteniendo altura 1.65 y poses interiores. Se completó el cierre de hojas/montantes y se separó el letrero Kliniu de las muestras.
- Cambiar resolución del cubemap retenía un PMREM por resize en Three 0.171: [RED 9→19 texturas](phase72-before-environment-fix-memory.json). La reflexión conserva su resolución inicial por visita (64 móvil/128 desktop); DPR y sombras siguen adaptándose. [Diez resizes repetidos](phase72-memory-resize-probe.json) pasan con nueve texturas y 31 geometrías estables, diferencia de texturas cero tras esperar 500 ms en cada cambio.

## Checks y límites

Vitest completo: **372 pruebas / 55 archivos**, exit 0. TypeScript, ESLint de archivos modificados, validador GLB y git diff-check pasan. [Log Vitest](phase72-vitest.log). Revisión independiente detectó el cache de reintento, el target de sombras y la retención PMREM; quedaron corregidos y probados.

No se probó GPU/tacto/batería de móvil físico ni producción. El favicon 404 y advertencias de jsdom de scrollTo/getContext son anteriores y no impiden los checks. Se conservaron los cambios previos del checkout y la navegación clásica.
