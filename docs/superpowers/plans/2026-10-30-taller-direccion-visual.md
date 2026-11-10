# Taller — plan de dirección visual

**Estado:** propuesta pendiente de aprobación para implementación. Las reparaciones de modelos y la desactivación de IA tienen aprobación independiente.

**Objetivo:** acercar el taller existente a los tres mockups aprobados como referencia visual, con capturas reales y sin inventar contenido.

**Base:** `specs/workshop-realism.md`, el taller actual, sus modelos y los tres mockups de esta conversación. La coincidencia visual se evalúa con renders y navegador: los mockups no son modelos 3D ni garantizan reflejos o rendimiento equivalentes.

## Alcance propuesto y puntos de parada

1. **Visual 1 — composición y luz.** Conservar el cuarto, el hardware real (ultrawide, torre, teclado y silla) y los objetos reconocibles. Ajustar `blender/lookdev_night.py` para crear luz cálida localizada en mesas y galería, luz fría desde la ventana y mejor lectura de materiales sin perder zonas oscuras. Mantener la ciudad nocturna existente y ensayar lluvia visible y etiquetas oscuras discretas como en el mockup, conservando la navegación accesible. Las pantallas DOM no emiten luz: simular su aporte con fuentes de luz del bake. Entregable: renders de entrada, galería y escritorio para revisión; esperar luz verde antes de integrar.
2. **Visual 2 — galería y monitor.** Medir la pared sobre el escritorio y ubicar cuatro pantallas alineadas, en orden Kliniu, L’ORIGINE, 4U Studio Academy y Drokex. Usar las capturas reales de `apps/web/public/projects/` registradas en `apps/web/modules/workshop-game/lab.ts`. Crear anchors diferenciados y conservar las pantallas de los rincones. Las tres pantallas actuales de la pared se trasladan a una ubicación visible sin saturar la galería; todos los proyectos permanecen accesibles en la lista. Cada cuadro lleva al rincón correspondiente y desde allí se abre la ficha, como en el recorrido actual. En `ContactMonitor`, mostrar «Entrar al escritorio», Terminal, GitHub y Proyectos, con contacto visible: la superficie completa activa el PC, mientras las vistas previas son decorativas. Mantener el acceso accesible al escritorio y a contacto. Entregable: integración local revisable; esperar luz verde antes de la fase siguiente.
3. **Visual 3 — exportación y verificación.** Volver a hornear y exportar los tres tiers mediante el flujo existente y actualizar cámaras o colisiones si cambian posiciones físicas. Antes de generar archivos, preservar la escena `.blend` local y los cambios R.5 sin confirmar; trabajar sobre una copia y no sobrescribirlos a ciegas. Entregable: resultados de navegador, peso y rendimiento, con incidencias abiertas cuando no se cumpla un criterio.

## Estado de la integración local

- Visual 2 usa geometría temporal en `project-gallery.tsx` para cubrir los marcos horneados antiguos. Al exportar la nueva sala se deben retirar esa placa y los marcos provisionales, y consumir los anchors `screen_gallery_*` y `label_gallery_*` generados, sin duplicar pantallas. Los cuadros trasladados sobre la entrada deben usar también los anchors exportados.
- `blender/visual1_lighting.py` prepara los valores de iluminación aprobados, pero no se ha conectado al bake. Para Visual 3, reemplazar la llamada a `night_look` por `visual1_lighting.apply` una sola vez y conservar el tratamiento actual de niebla. La lluvia del render sigue pendiente de integración y evaluación.
- El generador de la escena guarda en una ruta aislada de Visual 2 y rechaza sobrescribir una escena existente; la escena original y la grilla de R.5 siguen intactas.

## Verificación de aceptación

- Comparar las tomas de entrada, pared de proyectos, un rincón y escritorio con los mockups y las capturas originales. Las cuatro imágenes deben corresponder a sus sitios reales.
- Comprobar en navegador que los cuatro proyectos se pueden abrir, que los otros proyectos siguen disponibles y que el PC abre y cierra con foco correcto.
- Probar recorrido guiado y modo libre en escritorio y móvil, incluidos Escape, interacción y colisiones en zonas modificadas; comprobar la alternativa sin WebGL y movimiento reducido.
- Medir build de producción en high, medium y low. Mantener los presupuestos existentes: high ≤ 25 MB, esencial ≤ 12 MB, medium y low ≤ 15 MB; objetivos de ≥ 50 FPS en el Mac y ≥ 30 FPS en móvil. Informar cualquier límite que no pueda comprobarse.
- La línea base ya excede el esencial high: los GLB `lab-baked` y `lab-emissive` suman aproximadamente 14,59 MB decimales. Reducir y medir antes de dar por cumplido el presupuesto; no presentar el límite como logrado si no se alcanza.
- No avanzar a R.6 ni a otra fase existente sin autorización explícita. No desplegar ni publicar como parte de este plan.
