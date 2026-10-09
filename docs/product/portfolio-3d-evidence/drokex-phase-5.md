# Fase 5 - Drokex: comercio conectado

Entrega local: 22 septiembre 2026. Diseno aprobado por Daniel: "apruebo, dale".

## Entregado

- Caso propio con hero desktop/movil, recorrido Red / Detalle / Plataforma,
  catalogo y directorio publicos y atribucion de participacion segun CV.
- Blender 5.1.2 mediante MCP: copia independiente de drokex Brand v3;
  globo con soporte mecanico, meridianos, aluminio, kioscos y muestras.
- Editable: blender/output/drokex-v4/drokex-network-v4.blend.
- Generador: blender/refine_drokex_v4.py, con proteccion contra doble refinamiento.
- Cuatro renders Cycles, 96 muestras con denoise; PNG originales en output y
  WebP en apps/web/public/experience/drokex-*-v4.webp.
- GLB: 1,659,384 bytes, 36,808 triangulos, capas structure/roof/facade/interior/feature.
  Modelo de ciudad versionado sin cambiar los otros tres proyectos.
- Capturas publicas del 22 septiembre: /productos y /directorio de drokex.com,
  1440x1000 y directorio movil 390x844. Solo cookies necesarias; sin cuentas,
  operaciones privadas ni envio de formularios.

## Verificacion

- Implementador: RED previo y GREEN de cinco pruebas propias y seis genericas.
- Suite completa tras correccion final: 48 archivos, 310 tests aprobados.
- TypeScript, ESLint de archivos editados y git diff --check limpios.
- Chrome real 1440x1000, 1920x1080, 390x844 y 320x740: capturas revisadas,
  pixeles del canvas no vacios, camara, drag, teclado, reset, vistas, foco,
  cierre, targets >=44px, retorno y sin desborde horizontal.
- Sin WebGL, reduced motion, error de GLB y perdida de contexto tras carga.
- Prueba adicional retiene la respuesta del GLB y pierde contexto durante carga:
  RED confirmado; ContextGuard fuera de Suspense; GREEN confirmado.
- Extra 320x568: encuadre, indicio visible de siguiente seccion, sin overflow,
  desmontaje fuera de pantalla y navegacion Drokex -> 4U -> Drokex.
- Regresiones: 4U y L'ORIGINE en cuatro viewports y cuatro modos; Kliniu movil,
  sin WebGL, movimiento reducido y modelo fallido. Todas aprobadas.
- Revision independiente encontro el caso contextlost durante carga. Corregido
  y probado por el agente principal. La segunda revision independiente no pudo
  completarse por limite de uso; no se afirma una segunda aprobacion externa.

Scripts: verify-drokex-phase-5.cjs y verify-drokex-loading-loss.cjs.
Evidencia visual: phase5-*.png y drokex-*-v4.png en esta carpeta.

## Limites

Interpretacion conceptual, no replica de instalaciones, mapa de operaciones ni
CAD de productos. Detalles procedurales de material del render no horneados en GLB.
Las cifras visibles dentro de las capturas pertenecen a la interfaz publica;
no se presentan como resultados verificados de Daniel ni autoria exclusiva.
QA en Chrome de escritorio con viewports moviles; no Safari ni dispositivos fisicos.
No se ejecuto build de produccion, deploy, commit ni push. Sin dependencias nuevas,
servicios o cambios al repositorio Drokex. Fase 6 no iniciada.

Local: http://localhost:3001. El puerto 3000 pertenece al proyecto Kliniu y se preservo.
