# Primera pasada de modelado realista

Fecha: 2026-09-14.

Daniel autorizo empezar el modelado y generar una referencia 3D. Esta entrega
desarrolla el acabado de la escena inicial; no completa las fases posteriores
de detalle de proyectos, biblioteca o trayectoria del plan general.

## Cambios

- Entorno de estudio generado localmente con Lightformer, sin HDR remoto.
- Luz ambiental reducida y sombras de 2048 px.
- Base metalica, superficie neutra y tornilleria perimetral.
- Vidrio y montantes en Kliniu.
- Escena inicial mas alta y sin marco redondeado en escritorio.
- En movil solo se muestra la etiqueta del distrito seleccionado para evitar solapamientos.

## Referencia

`modeling-reference.png` es un mockup aspiracional generado con IA, no una
captura del sitio ni una representacion de oficinas reales. Sus edificios y
rotulos son conceptuales; no son datos verificados de los proyectos.
La geometria interactiva actual sigue siendo mas sencilla que esa referencia.

## Verificacion

- Vitest: 4 pruebas de experience aprobadas.
- TypeScript: `tsc --noEmit` aprobado.
- Playwright: escena visible a 1440, 390 y 320 px; sin overflow horizontal.
- Seleccion de Drokex desde escena en escritorio y desde indice en movil.
- Biblioteca tecnica accesible desde el boton de tecnologias.
- Activacion manual 3D verificada en movil.
- Capturas revisadas visualmente. Seleccion cambia el bitmap del canvas.
- Consola: 404 de favicon en la primera carga; sin errores de la escena observados.

No se realizo build de produccion, commit, push ni despliegue.
