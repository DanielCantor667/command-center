# Kliniu showroom v3 - validacion

Fecha: 2026-09-15. Referencias: tienda publica kliniucolombia.com y ficha
del dispensador de papel de acero inoxidable. Capturas locales reference-home,
reference-desktop y reference-product con prefijo kliniu.

## Entregables

- blender/generate_kliniu_showroom.py: fuente reproducible, escenas independientes.
- blender/compose_kliniu_overview.py: recomposicion del poster sin alterar la fuente anterior.
- blender/output/kliniu-showroom/kliniu-showroom-v3.blend:
  escena final Kliniu Showroom v3.002 y Kliniu Product Studies.001.
- kliniu-showroom-final-0001.png y kliniu-products-final-0001.png:
  renders Cycles 1400 x 1200, 64 muestras y denoise, inspeccionados visualmente.
- workshop-kliniu-v3-0001.png: vista general actualizada, 1600 x 1100.
- GLB kliniu-interactive-v3: cinco grupos de capas, aproximadamente 1.68 MB.
- Miniatura y poster versionados, integrados en el portafolio local.

## Verificacion

- Blender MCP conectado; escenas y viewport inspeccionados. Addon antiguo con
  protocolo de compatibilidad, sin actualizar software ni activar telemetria.
- Playwright: carga efectiva del GLB v3 sin pageerrors; seleccion de Kliniu,
  cambios de pixeles del canvas al separar capas y cambiar dia/noche.
- Capturas de escritorio 1440 y movil 390 inspeccionadas, sin overflow horizontal.
- Vitest: cinco pruebas de experience pasan.
- ESLint de component.tsx y blender-pavilion.tsx pasa; diff --check sin errores.

El showroom es una interpretacion de marca, no una sede fisica verificada.
Los productos son modelos visuales basados en fotografia, no archivos CAD
para fabricacion. El logo tipografico no reproduce el simbolo original.
Las escenas preliminares se conservan en el archivo; usar los nombres finales anteriores.
No se modifico la web de Kliniu, no se accedio a cuentas privadas ni se desplego.
