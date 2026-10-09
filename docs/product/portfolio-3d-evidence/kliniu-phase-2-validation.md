# Kliniu - Fase 2 / verificacion

Fecha: 2026-09-18. Entorno local Next dev en http://localhost:3001.
No habia servidor en los puertos 3000/3001 al iniciar esta sesion.

## Resultado

- Caso editorial exclusivo de Kliniu. Los otros casos conservan su componente.
- Estudio Plano / Espacio / Producto con renders Blender de respaldo, visor
  Three.js voluntario, materiales PBR, aristas, camara orbital y restablecimiento.
- Canvas bajo demanda, desmontado fuera de vista y en Producto. Escena y
  materiales clonados; disposicion de recursos propios al desmontar.
- Captura principal conserva View Transition kliniu-surface y retorno al taller.
- Contenido contrastado con lib/quotation-calculator.ts y lib/volume-discounts.ts
  del repositorio Kliniu, y capturas publicas existentes. Sin metricas inventadas.

## Blender

MCP conectado con Blender 5.1.2. Addon antiguo con fallback funcional; sin actualizar.
Archivo editable: blender/output/kliniu-showroom/kliniu-showroom-v4.blend.
Escenas: Kliniu Showroom v4 y Kliniu Plan v4. V3 se conserva intacto.
Nuevo detalle: abrazaderas y tornillos de vidrio, juntas, placas de exposicion,
acabados satinados, microtextura y luz interior. Cycles: 96 muestras para espacio,
32 para plano, 1600 x 1100. Renders exportados a WebP de unos 42 KB cada uno.
GLB: 2,107,548 bytes, 36,774 triangulos, cinco capas conservadas:
structure, interior, facade, feature, roof.
La microtextura procedural pertenece al render Cycles; el GLB conserva geometria
y propiedades PBR exportables, no una reproduccion pixel a pixel de Cycles.
El showroom es una interpretacion conceptual, no un local construido.

## Pruebas

- Vitest: 22 pruebas aprobadas en cinco archivos (caso, experiencia, gate, activos,
  explorador de tecnologias).
- TypeScript --noEmit aprobado.
- ESLint aprobado en los seis archivos TSX de implementacion/pruebas tocados.
- git diff --check aprobado.
- Chrome real: 1440x1000, 1920x1080, 390x844 y 320x740.
- Pixeles del canvas no vacios en ambos modos; cambio visual verificado al
  cambiar materiales y arrastrar. Controles de al menos 44px, sin overflow
  horizontal; cambio de modo sin salto vertical del escenario.
- Capturas reales cargadas; activacion/cierre 3D, restablecimiento, teclado,
  retorno al taller, movimiento reducido, WebGL ausente y GLB fallido.
- El fallo inyectado de GLB activa el respaldo y permite continuar a Producto.
  R3F reporta un error esperado via window.reportError incluso capturado por su
  boundary. Se comprueba especificamente ese mensaje, no se ignoran otros errores.
- Regresion cinematografica: escritorio y movil, entrada/cancelacion/retorno,
  View Transition ready/finished, API ausente y captura fallida, aprobadas.

Scripts: verify-kliniu-phase-2.cjs y verify-cinematic-portfolio.cjs (QUICK=1).
Capturas: phase2-{1440,1920,390,320}-{case,plan,space,product,decisions}.png.

Durante QA se corrigieron dos regresiones: materiales singulares convertidos a
arrays sin grupos de geometria; y suspense fuera del canvas que lo desmontaba
durante la primera carga movil. Las pruebas reales reprodujeron ambos fallos
antes de la correccion y pasaron despues.

No se ejecutaron build de produccion, Lighthouse ni deploy. No commit ni push.
