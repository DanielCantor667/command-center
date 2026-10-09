# Fase 3 - L'ORIGINE

Implementacion y verificacion local: 18-21 de septiembre de 2026.
Alcance: L'ORIGINE. Sin deploy, commit, push ni cambios en el repositorio de marca.

## Resultado

- Galeria conceptual refinada en Blender 5.1.2/Cycles, 96 muestras.
- Piedra con microtextura en Cycles, envases ambar con capa de brillo,
  herrajes y detalle de los dispensadores. No representa una tienda construida
  ni un modelo CAD del packaging comercial.
- Archivo editable: `blender/output/lorigine-v4/lorigine-gallery-v4.blend`.
- Generadores: `blender/refine_lorigine_v4.py` y
  `blender/compose_lorigine_heroes_v4.py` (ejecutar con el blend v4 abierto).
- GLB: 4,527,280 bytes, 102,184 triangulos y cinco capas:
  structure, roof, facade, feature, interior. Microtextura procedural de Cycles
  no horneada al GLB; el visor usa los materiales PBR exportados.
- Renders propios de galeria, detalle y portadas horizontal/vertical en WebP.
- Caso editorial con catalogo y ficha publicos capturados el 18 de septiembre.
  Fuentes: https://www.lorigine.com.co/productos y
  https://www.lorigine.com.co/productos/salt-free-shampoo.
- Decisiones contrastadas con productos/page.tsx, lib/motion.ts,
  motion/variants.ts y motion/reveal.tsx del repo de marca, solo lectura.
- Corregida la afirmacion obsoleta que negaba la existencia de carrito.
  No se ejercitaron checkout, pagos, cuentas ni paneles privados.

## Visor

Galeria / Detalle / Sitio. Detalle oculta cubierta y fachada; Sitio desmonta
el canvas. El 3D se activa bajo demanda y se desmonta fuera de vista.
Render demand, DPR maximo 1.5, cache GLTF sin mutar materiales compartidos,
poster permanente durante carga y fallback ante fallo de modelo o contexto.
Arrastre, flechas de teclado, Inicio, reset, cierre y restauracion de foco.

## Evidencia

- 26/26 pruebas Vitest: casos Kliniu/L'ORIGINE, experiencia, activos,
  tecnologias y gate. Pruebas del caso escritas antes de implementarlo.
- TypeScript y ESLint de los archivos modificados sin errores.
- `verify-lorigine-phase-3.cjs`: Chrome real, 1440x1000, 1920x1080,
  390x844 y 320x740. Pixeles no vacios, cambios de camara/capas, arrastre,
  giro por teclado, controles tactiles, dimensiones estables, foco y retorno.
- Sin WebGL, movimiento reducido, GLB abortado y perdida real de contexto:
  captura del sitio sigue disponible. El fallo inyectado de GLB produce el
  error esperado de R3F; ningun otro error de pagina en esas pruebas.
- Prueba de teclado inicialmente roja (no cambiaban los pixeles); verde
  despues de implementar rotacion accesible. Revision adicional sin hallazgos
  pendientes en esa correccion.
- 320x568: sin desbordamiento horizontal y navegacion al siguiente caso.
- Regresion Kliniu: visor movil y tres fallbacks; entrada cinematografica
  en 1440/390, movimiento reducido, sin WebGL, sin View Transitions y
  preview fallida. No se modifico su narrativa ni su visor.
- Capturas `phase3-*-case/gallery/detail/site/evidence.png` en esta carpeta.

## Limites

Verificacion local en Chrome, no Safari/Firefox ni dispositivo fisico.
No se ejecuto build de produccion ni se midieron Core Web Vitals.
La siguiente fase requiere aprobacion; 4U y Drokex quedan sin cambios.
