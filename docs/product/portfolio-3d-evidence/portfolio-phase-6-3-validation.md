# Portafolio 3D - Fase 6.3

Fecha: 23 de septiembre de 2026. Estado: implementada y verificada localmente.
Vista local: http://localhost:3001

## Entregado

- Kliniu: portada mas compacta con rol documentado y vista previa real del sitio, enlazada a la captura completa. La seccion de contexto aparece en el primer viewport.
- L'ORIGINE: tienda y participacion visibles sobre la apertura Blender, separadas de la evidencia del sitio publicado.
- 4U Studio Academy: funcion de la academia y rol junto al render musical, sin cubrir instrumentos ni acciones.
- Drokex: rol, fuente CV y propiedad no confirmada visibles desde la portada. El render sigue identificado como conceptual.
- Entrada editorial de 380 ms sobre texto y los tres renders de portada, sin nuevo canvas. Movimiento reducido deja el contenido estatico. El barrido caso-a-caso de 440 ms termina despues de esa entrada, evitando una segunda animacion tardia.

## Verificacion

- `verify-phase-6-3.cjs` en Chrome real: 16 aperturas y 16 cierres, cuatro casos por 1440x1000, 1920x1080, 390x844 y 320x568. Afirmo H1 enfocado, rol en viewport, media cargada/no vacia, enlace de sitio, ausencia de canvas en portada, sin solapes ni desborde horizontal, y contenido de la siguiente seccion visible. Capturas `phase63-*-opening.png` y `phase63-*-closing.png` en esta carpeta.
- Movimiento reducido: L'ORIGINE en 390x844 sin animacion de texto o render.
- Regresion 6.2: regreso de los cuatro casos en 1440 y 390, Drokex en 320, anterior/siguiente, Escape y fallbacks de API ausente, API con excepcion y movimiento reducido. Resultado: passed.
- Regresion 6.1: 11 entradas/regresos 3D en 1440x1000, 1920x1080, 390x844, 320x740 y 320x568. Camara, scroll, foco, noche, capas, cancelacion y cierre manual conservaron el estado. Diferencia maxima de camara: 0.330 sobre 255 (umbral 3).
- Vitest: 50 archivos y 358 pruebas pasaron. `npx tsc --noEmit`, ESLint del directorio de casos, `node --check` del script y `git diff --check`: sin errores.

## Limites

- Viewports moviles emulados en Chrome de escritorio; no se probaron telefonos fisicos ni FPS sostenidos.
- Se reutilizaron renders y capturas existentes. No se crearon modelos Blender, escenas WebGL, datos comerciales ni dependencias nuevas.
- El worktree ya contenia cambios no versionados de fases previas; se conservaron. Sin commit, push ni deploy.
