# Fase: interaccion y UI del taller

Daniel aprobo aplicar las seis mejoras propuestas el 2026-09-14.

1. Reexportar pabellones desde Blender con nodos roof, facade, interior,
   structure y feature; mantener originales editables y assets anteriores.
2. Animar piezas al seleccionar: marquesina Kliniu, teclado academia,
   vitrinas L'Origine y letrero Drokex; iluminar interiores seleccionados.
3. Separar techo, fachada e interior en modo capas, con camara que encuadre
   la altura completa. El modo general cierra las capas.
4. Anadir iluminacion dia/noche y controles accesibles con nombres y tooltips.
5. Ampliar escena, compactar introduccion y usar renders como miniaturas.
   En movil, colocar escena antes del selector manteniendo orden DOM coherente.
6. Verificar seleccion, capas, dia/noche, retorno general, reduced-motion,
   render de canvas y responsive a 1440/390/320 px en navegador real.

Se mantiene fallback sin WebGL, activacion movil explicita, DPR limitado y
render bajo demanda. Sin sonido automatico, nuevas cuentas ni despliegue.
