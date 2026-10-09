# Portafolio - Fase 6.1: continuidad de la visita

Fecha: 23 septiembre 2026. Alcance aprobado: revelado inicial, entrada espacial
para cuatro proyectos y retorno al taller con estado conservado.

## Implementacion

- El nombre y la navegacion aparecen de inmediato. El revelado tipografico dura
  450 ms y el asentamiento inicial de camara tiene un limite de 750 ms. Una
  interaccion lo interrumpe. El movil conserva la activacion voluntaria del 3D.
- Kliniu, L'ORIGINE, 4U Studio Academy y Drokex usan destinos de camara propios.
  La entrada se puede omitir o cancelar y tiene un limite de 2600 ms. Solo
  Kliniu conserva la transicion visual vinculada a la captura del sitio.
- Antes de entrar se guarda proyecto, camara, target, zoom, offset, detalle,
  capas, iluminacion, opt-in, recorrido Kliniu y scroll. Al volver se recuperan
  esos valores y el foco del boton de entrada. Desde otro caso se usa el
  encuadre canonico de ese proyecto. Salir a otra seccion prioriza su destino.
- El poster permanece visible hasta que todos los modelos estan listos. Error
  de modelo, WebGL ausente o perdido mantienen accesibles las listas y casos.

## Pruebas en Chrome

- `verify-continuity-phase-6-1.cjs`: 1440x1000, 1920x1080, 390x844,
  320x740 y 320x568. Once entradas/regresos, los cuatro proyectos en 1440 y
  390. Comprueba canvas no vacio, giro manual, iluminacion, capas, scroll,
  foco y comparacion de pixeles de camara antes/despues. Diferencia maxima
  observada: 0.256/255 por canal tras reducir a 240x180; umbral: 3.
- `verify-continuity-fallbacks-phase-6-1.cjs`: sin WebGL, modelo lento o
  fallido, perdida de contexto durante carga y tras cargar, reduced motion,
  ausencia/error de View Transitions, Escape, omitir, caso siguiente y salida
  a Tecnologias. Los diez escenarios pasaron.
- `verify-camera-intent-phase-6-1.cjs`: invalidacion de camara con canvas
  cerrado, cancelacion hacia Tecnologias y retorno desde vista previa con
  scroll distinto de cero. Diferencias de camara 0.009 y 0.019; scroll
  restaurado desde 952 px.
- Los PNG `phase61-*` de esta carpeta son las capturas de escritorio, movil,
  pantallas compactas, ciudad y aproximaciones usadas para inspeccion visual.

## Regresion

Pasaron los scripts de Kliniu (390x844 y fallbacks), L'ORIGINE, 4U Studio
Academy y Drokex (1440x1000, 1920x1080, 390x844, 320x740 y fallbacks).
Tambien pasaron 352 pruebas de Vitest en 50 archivos, `tsc --noEmit`, ESLint
de los modulos afectados y `git diff --check`. No hay errores de consola
inesperados en las pruebas nuevas de Chrome.

## Revision y limites

La revision estatica detecto un salto de camara al navegar durante una entrada
y la reutilizacion de una pose obsoleta tras cambiar de vista con el canvas
cerrado. Ambos se corrigieron y tienen pruebas automatizadas y en Chrome.
Se corrigio ademas el efecto de scroll repetido por React StrictMode.

No se midieron FPS sostenidos ni dispositivos fisicos; Chrome de escritorio
simulo los tamaños moviles. Sin publicacion ni cambios en repositorios de marca.
