# Fase 4 - 4U Studio Academy

Fecha: 2026-09-21. Direccion aprobada: Dentro del estudio.

## Entrega

- Caso propio, portada desktop/mobile a sangre y recorrido Estudio / Instrumentos / Academia.
- Piano, guitarra, microfono y percusion refinados en Blender 5.1.2 mediante MCP.
- Materiales de madera, laca, metal y tela; cuatro renders Cycles con 96 muestras y denoise.
- Editable: blender/output/academy-v4/academy-studio-v4.blend.
- Generador: blender/refine_academy_v4.py; fuente v3 conservada.
- GLB academy-interactive-v4.glb: 2,215,908 bytes, 50,140 triangulos.
- Capas structure, roof, facade, interior y feature. La ciudad conserva la arquitectura;
  el visor retira fachada y, en Instrumentos, cubierta.
- Capturas publicas de https://4ustudioacademy.com/ y /lecciones en escritorio/movil.
  No se accedio a cuentas ni se enviaron formularios. No se modifico el repo de 4U.

## Verificacion

- Pruebas de caso: RED antes de implementar, GREEN despues.
- Prueba de foco al activar: RED confirmado; GREEN tras enfocar el control de cierre.
- Chrome real: 1440x1000, 1920x1080, 390x844 y 320x740.
- Canvas no vacio comprobado por pixeles; cambios de camara, arrastre, flechas, Inicio,
  reset, tres vistas, cierre, foco restaurado, objetivos tactiles >=44px y sin overflow.
- Sin WebGL, reduced motion, error de GLB y perdida de contexto: fallback operativo.
- Extra 320x568: sin overflow, desmontaje del canvas fuera de pantalla y navegacion
  4U -> L'ORIGINE -> 4U -> Drokex.
- Regresion L'ORIGINE en cuatro viewports y cuatro modos de fallo/movimiento.
- Regresion Kliniu movil, sin WebGL, reduced motion y error de modelo.
- Suite completa: 47 archivos, 305 pruebas aprobadas. Se actualizaron expectativas
  obsoletas de la prueba generica para los casos editoriales actuales.
- TypeScript sin errores; ESLint de los archivos modificados sin errores; diff-check limpio.
- Revision independiente: hallazgo de foco corregido; sin bloqueos restantes de codigo.
- Evidencia visual: phase4-*.png. Script reproducible: verify-academy-phase-4.cjs.

## Limites

La escena es una interpretacion conceptual, no una replica de la sede fisica. Los
renders usan detalles procedurales que no estan horneados en el GLB. No se afirma
fotorealismo de producto ni se inventan resultados comerciales. QA en Chrome,
no en Safari ni dispositivos fisicos. No se ejecuto build de produccion ni deploy.
Sin commit/push, servicios nuevos o dependencias nuevas. Fase 5 no iniciada.

Servidor local: http://localhost:3001.
