# Sprint 7 — Phase 7.1: validación local

Fecha: 7 de octubre de 2026. Estado: prueba espacial implementada y verificada; pendiente de la revisión visual de Daniel antes de Phase 7.2.

## Resultado entregado

Entrada pública nueva con poster capturado del prototipo, activación explícita del 3D, carga real del GLB de Kliniu y primer frame, puerta corrediza, cámara a altura humana, sala central, mesa e inspección de Kliniu. Navegación por puntos, arrastre para mirar, cancelación y Escape. Abre el caso existente y restaura punto/orientación/foco al volver.

El gate mantiene la experiencia anterior en `?view=portfolio`, admite enlaces `?project=kliniu` y conserva los cuatro casos. Sin WebGL, GLB fallido o contexto perdido ofrece reintento y acceso al portafolio HTML.

- URL del taller: http://localhost:3000/
- Portafolio anterior: http://localhost:3000/?view=portfolio
- Caso directo: http://localhost:3000/?project=kliniu
- [Plan ejecutado](../../superpowers/plans/2026-10-07-portafolio-phase-7-1.md).

## Evidencia de navegador real

Chrome instalado, canal `chrome`, Playwright headless. Antes de iniciar se comprobó que el puerto 3000 estaba libre; no había un next dev viejo que detener. Se inició el servidor del checkout actual y se conserva para revisión.

[Script reproducible](verify-phase-7-1.cjs), [resultados](phase71-results.json), [log de navegador](browser-phase71.log).

Viewports: 1440×1000, 1920×1080, 390×844 y 320×568. En todos: landing sin canvas, entrada al hub, mesa, Kliniu, mirar arrastrando, abrir caso, volver, Escape, foco y ausencia de overflow horizontal. Comparación de capturas antes/después del caso tras cambiar orientación: diferencia media de píxel inferior a 2/255 en los cuatro tamaños; esa tolerancia cubre antialiasing/capas DOM sin esconder un cambio apreciable de cámara.

Escenarios adicionales: movimiento reducido, atrás/adelante del navegador, enlace directo, GLB 404 y reintento, pérdida real de contexto con escena lista y mientras el GLB sigue pendiente, cancelación de carga retenida, WebGL2 ausente y navegación a los cuatro casos clásicos. Retorno desde `?view=portfolio&project=kliniu` elimina el parámetro y recargar mantiene el listado.

Cancelación con ratón: el revisor detectó que el header interceptaba el botón en escritorio. Se quitó su captura de puntero fuera de los controles; el clic y foco de retorno se comprobaron específicamente en los cuatro viewports y se añadieron al script completo.

Capturas representativas:

- [Landing 1440](phase71-1440-landing.png).
- [Sala 1440](phase71-1440-hub.png).
- [Inspección 1440](phase71-1440-kliniu.png).
- [Regreso 1920](phase71-1920-return.png).
- [Inspección 390](phase71-390-kliniu.png).
- [Inspección 320](phase71-320-kliniu.png).
- [GLB fallido](phase71-failed-glb.png).
- [Pérdida de contexto](phase71-context-loss.png).

## Checks de código y revisión

- Vitest completo de `apps/web`: **54 archivos, 371 pruebas pasadas**, `npx vitest run --silent --reporter=dot` ([log](vitest-phase71.log)).
- TypeScript: `npx tsc --noEmit`, exit 0.
- ESLint de módulo nuevo, gate y dos archivos de caso modificados: exit 0.
- `git diff --check`: limpio.
- Revisión independiente de Phase 7.1: tres P2 confirmados (contexto perdido durante Suspense, foco al cancelar/Escape y query de caso persistente), corregidos y verificados de nuevo por el revisor. No se confundió geometría procedural simple con un defecto del alcance aprobado.

## Medidas reales y límites

El GLB transferido tiene **2.107.548 bytes** de cuerpo decodificado. Los tiempos locales hasta completar entrada y sus comparaciones visuales están en el JSON; son observaciones de Next dev en este ordenador, no benchmarks de producción.

La arquitectura y materiales actuales son geometría de prototipo. El taller definitivo Blender, las otras salas, WASD libre y la navegación de tecnologías/archivo dentro del mundo pertenecen a fases posteriores. Esta fase no pretende igualar todavía el detalle de los mockups.

Se emularon tamaños móviles en Chrome desktop; no se probó un teléfono físico, temperatura, consumo ni rendimiento de su GPU. No se ha validado aún el presupuesto total de bundle en build de producción ni una meta de fps móvil.

Sin dependencias nuevas, cambios de datos, cuentas, provisioning, commit, push o deploy. Cambios previos preparados en Git conservados. Phase 7.2 no se inició.
