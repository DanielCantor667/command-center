# Kliniu - recorrido guiado

Validacion local, 2026-09-15. URL: http://localhost:3001

Revalidado el 2026-09-16 tras reiniciar el servidor: 13 pruebas, TypeScript, ESLint y recorrido completo en Chrome aprobados. Apertura del caso comprobada por su H1 y el control Volver a la ciudad; teclado y alternativa sin WebGL incluidos.

## Alcance

- Tres puntos HTML sobre el showroom Blender: catalogo, compra, arquitectura.
- Seleccion sincronizada con controles externos al canvas y cambios de angulo de camara.
- Capturas reales optimizadas del sitio publico; arquitectura representada como esquema, no como pantalla administrativa.
- Acceso al caso completo, sitio publico y contacto.
- Reinicio del recorrido al regresar a la vista general o cambiar de proyecto.
- Mejor encuadre movil e iluminacion nocturna de relleno.

## Pruebas

- Vitest: 13 pruebas de experience, technology-explorer y city-assets aprobadas.
- TypeScript: `tsc --noEmit` aprobado.
- ESLint: los cuatro TSX modificados en esta fase sin errores.
- Chrome real, controlado con Playwright en contexto aislado: 1440x1000, 390x844 y 320x844.
- Clicks en puntos 3D, controles por teclado, apertura del caso y navegacion a contacto.
- Capas separadas, cambio dia/noche y movimiento reducido a 320px.
- Capturas del canvas con desviacion por canal mayor de 73 en noche: geometria no vacia; cambio de pixels entre posiciones de camara y entre iluminaciones.
- Los tres puntos miden 44px, no se superponen ni desbordan horizontalmente en los tres tamanos.
- Recorrido accesible antes de activar 3D en movil y con WebGL no disponible (simulado anulando getContext de WebGL).
- Imagen de compra cargada y comprobada mediante naturalWidth.
- Cero errores JavaScript de pagina en las tres pruebas principales.
- Inspeccion visual de capturas desktop y movil: geometria, esquema y textos legibles, sin desbordamiento horizontal.

Script reproducible: `verify-kliniu-tour.cjs`. Usa Playwright y sharp ya instalados; admite PLAYWRIGHT_PATH, SHARP_PATH y BASE_URL. No instala dependencias.

En el navegador MCP compartido se observo un retorno al poster no reproducido en las dos pasadas aisladas. No se modifico el ciclo de IntersectionObserver sin una reproduccion fiable. El puerto 3000 pertenece al proyecto Kliniu y se conservo intacto.

No se cambiaron modelos Blender, datos de Kliniu ni infraestructura. No se ejecuto despliegue ni build de produccion.
