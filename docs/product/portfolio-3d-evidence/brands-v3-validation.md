# Pabellones de marca v3

Fase autorizada: continuar con L'ORIGINE, 4U Studio Academy y Drokex.
Kliniu v3 se conserva. Referencias consultadas en los sitios publicos el 15 de
septiembre de 2026; sin reproducir metricas comerciales ni acceder a cuentas.

## Entrega

- blender/refine_remaining_pavilions.py: copias independientes, materiales,
  producto capilar, instrumentos, globo y catalogos, exportacion por capas.
- blender/output/brand-pavilions-v3/brand-pavilions-v3.blend: escenas
  lorigine Brand v3, academy Brand v3, drokex Brand v3 y All Brands v3.
- Escenas adicionales academy Interior v3 y drokex Interior v3.
- Renders finales: lorigine-final-0001.png, academy-framed-0001.png,
  drokex-corrected-0001.png, all-brands-final-0001.png,
  academy-interior-final-0001.png y drokex-interior-0001.png.
- GLB v3 de los tres proyectos, cinco grupos compatibles con las capas web.
- Miniaturas versionadas y poster general actualizados.

## Comprobaciones

- Renders Cycles terminados e inspeccionados; encuadre de 4U ampliado para
  incluir la vegetacion. Macetas de techo agrupadas completas para la animacion.
- Playwright: los cuatro GLB v3 cargan. Las tres selecciones y sus capas
  cambian los pixeles del canvas; ninguna excepcion pageerror en el recorrido.
- Las cuatro miniaturas y el poster de respaldo cargan con dimensiones reales.
- Escritorio 1440 y movil 390 inspeccionados; sin overflow horizontal.
- Modo nocturno, retorno a vista general y cierre del 3D comprobados.
- Vitest: cinco pruebas pasan. ESLint de componentes tocados, TypeScript y
  git diff --check sin errores.

La identidad visual es interpretativa: edificios conceptuales, no sedes reales;
frascos e instrumentos son modelos de presentacion, no CAD de fabricacion.
Los renders de interior son vistas seccionadas. No se publico ni se hizo push.
