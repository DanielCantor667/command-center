# Taller vivo - Fase 1

Fecha: 2026-09-16. Local: http://localhost:3001

## Entrega

- Inicio inmersivo sin marco: nombre de Daniel como H1 principal, maqueta a sangre, indice de cuatro proyectos y banda inferior visible desde el primer viewport.
- Camara con encuadre independiente para escritorio, movil y pantallas bajas. Se mantiene el canvas del caso sin el encuadre especial del hero.
- Entrada Kliniu: aproximacion frontal, captura real en pantalla del showroom y View Transition hacia la imagen destacada del caso.
- Se elimino la pantalla artificial de espera de 420ms. Escape y controles permiten cancelar u omitir la aproximacion.
- El caso sigue accesible con movimiento reducido, sin WebGL, sin View Transition API o si falla la imagen de entrada. Tiempo maximo de aproximacion: 2600ms.
- El recorrido de catalogo, compra y arquitectura conserva sus controles HTML, iluminacion nocturna y capas.
- Sin nuevos paquetes, modelos inventados, metrica comercial ficticia, cambios de datos, commits ni despliegue.

## Evidencia

- 18 pruebas Vitest aprobadas: experience, technology-explorer, city-assets y experience-gate.
- TypeScript sin errores; ESLint de los siete TSX modificados sin errores; git diff --check limpio.
- Chrome real en 1440x1000, 1920x1080, 390x844, 320x740, 320x568 y 1024x600. Capturas `cinematic-*-hero.png` y `cinematic-*-poster.png`.
- Sin overflow horizontal; el inicio deja ver la banda siguiente; boton principal separado del indice inferior.
- View Transition instrumentada en 1440 y 390: captura de origen presente, promesa ready resuelta y finished resuelta. Anchos de origen aproximados: 525px y 203px.
- Cancelacion seguida de espera, segunda entrada, apertura del caso y retorno comprobados en escritorio y movil.
- Alternativas comprobadas por teclado: movimiento reducido, WebGL ausente, API de transiciones ausente, carga fallida de la captura del showroom.
- Regresion del recorrido Kliniu en 1440, 390 y 320: puntos sincronizados, imagen real, capas, dia/noche, caso completo y contacto. Pixeles del canvas nocturno con desviacion por canal entre 76 y 85; imagen no vacia y cambios de camara/iluminacion confirmados.
- Cero errores JavaScript de pagina en los escenarios comprobados. El fallo de red de la captura se provoca intencionalmente en su prueba.

Scripts: `verify-cinematic-portfolio.cjs`, `verify-kliniu-tour.cjs`. Usan Chrome instalado, Playwright y sharp existentes; variables PLAYWRIGHT_PATH, SHARP_PATH y BASE_URL. QUICK=1 limita el primer script a dos viewports, conservando los escenarios alternativos.

## Limites

No se ha hecho un nuevo pase de materiales o iluminacion horneada en Blender; esta fase reutiliza los modelos aprobados. Los interiores por marca, planos tecnicos animados, sonido y relatos completos quedan fuera de esta fase. No se ejecuto build de produccion ni auditoria Lighthouse; no se afirma una puntuacion de rendimiento ni reconocimiento de Awwwards.

Referencia de la API: https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition
