# Portafolio - Fase 6.2: cierres visuales

Estado: alcance aprobado por Daniel con "dale" el 23 de septiembre de 2026.
Base: fase 6.1 terminada y verificada. Esta fase modifica las salidas de los
casos; la entrada 3D de la ciudad conserva Omitir, Cancelar y su timeout.

## Resultado esperado

- Volver de cualquiera de los cuatro casos revela el taller desde la posicion
  de su proyecto en el indice. El proyecto seleccionado y su estado previo
  aparecen sin salto de scroll, camara o foco.
- Anterior/Siguiente cambia de caso con un barrido editorial breve; el sentido
  del barrido sigue la direccion de navegacion. El nuevo caso comienza arriba
  con su H1 enfocado, como en la fase 6.1.
- Duracion de 440 ms entre casos y 560 ms al volver. Escape puede omitir una transicion en curso.
  Movimiento reducido o API no disponible: cambio inmediato. Un error o una
  promesa rechazada de View Transitions tampoco bloquea la navegacion.
- Sin canvas duplicados, nuevas imagenes, dependencias, sonido ni animaciones
  que impidan acceder a los botones. No deformar capturas de sitios en renders.

## Solucion acotada

`ExperienceGate` coordina las dos salidas mediante `document.startViewTransition`
con token para ignorar callbacks viejos. El estado y el scroll se actualizan en
la callback de la transicion. La transicion no posee el estado del taller: solo
presenta el cambio; `ExperienceModule` sigue restaurandolo.

`globals.css` define los barridos sobre las instantaneas nativas `root`:
revelado circular desde el indice seleccionado para volver y barrido lateral
para pasar entre casos. Variables por ID posicionan el origen del revelado en
desktop y movil. La API ya se usa para la entrada de Kliniu y su fallback.

## Verificacion

1. Vitest: cuatro retornos, Anterior/Siguiente, sentido, scroll, foco, estado,
   reduccion de movimiento, API ausente/lanzamiento/rechazo, Escape, clics
   repetidos y callbacks tardios.
2. Chrome: capturas durante y despues del cambio, 1440x1000, 390x844 y
   320x568; casos con 3D activo y poster opt-in, sin canvas vacio ni texto
   superpuesto. Verificar scroll/foco y comparacion de estado tras retorno.
3. Regresiones de los cuatro casos, suite completa, TypeScript, ESLint y
   `git diff --check`. Guardar evidencia y limites, mantener en local.

## No incluido

Redisenar casos, rehacer renders Blender, cambiar narrativa de contacto o
trayectoria, funcionalidades comerciales, backend, dependencias, deploy,
commit o push. No tocar repositorios de marca.
