# Pulido del taller — validación local

Fecha: 15 de octubre de 2026. Alcance autorizado por Daniel: acceso directo a proyectos, composición móvil, retorno desde portafolio, recursos de día/noche y recorrido con rueda.

## Cambios

- Los cuatro proyectos se abren desde la portada sin entrar al taller. El monitor abre directamente la ficha del proyecto visible; las salas siguen accesibles desde el recorrido.
- En teléfono, la cámara centra el monitor y acerca el escritorio. Trayectoria, contacto y música tienen controles separados bajo la escena; se ocultan sus etiquetas flotantes en móvil.
- El portafolio incluye «Volver al taller». La navegación añade entradas al historial, limpia los parámetros de vista al regresar y conserva punto, posición y orientación de la cámara. Entrar al portafolio desde la portada permite volver a la portada.
- El entorno de reflejos conserva su captura y cambia la intensidad entre día y noche sin recrear el recurso.
- La rueda normaliza píxeles, líneas y páginas, acumula movimientos pequeños y respeta el zoom mediante Ctrl+rueda.

## Navegador real

Chromium contra Next dev local, después de detener y reiniciar el servidor del puerto 3000. Los tamaños móviles son emulados; no se midió un teléfono físico ni rendimiento de producción.

| Comprobación | Resultado observado |
| --- | --- |
| Portada → Kliniu, L’ORIGINE, Academy y Drokex → portada | Los cuatro IDs correctos; ningún canvas al abrir cada ficha desde la portada |
| Monitor → Academy → taller | Abre `?project=4ustudio-academy` directamente y conserva `workbench` al regresar |
| Escritorio a 320×568, 390×844, 1440×900 y 1920×1080 | Sin desbordamiento horizontal, botones recortados ni botones superpuestos |
| Portafolio a 320 px | «Volver al taller» visible, dentro del viewport y con altura de 44 px |
| Salir desde Kliniu tras girar la cámara → volver | Misma posición `[-5.1, 1.65, -4]` y mismo cuaternión antes/después |
| Atrás y Adelante | Alternan portafolio/taller conservando la parada; al regresar desde portada, foco en «Entrar al taller» |
| Día/noche, 10 cambios | Texturas: `48, 48, 49, 49, 49, 49, 49, 49, 49, 49`; estabilizadas tras la carga diferida. Intensidad alterna `1` / `0.3` |
| Rueda en líneas (`deltaMode=1`, `deltaY=3`) | Mesa → taller |
| Trackpad, tres movimientos de 9 px | Mesa → taller |
| Rueda en páginas (`deltaMode=2`, `deltaY=-1`) | Taller → mesa |
| Ctrl+rueda | Permanece en exploración, sin iniciar desplazamiento |

Las texturas son recursos vivos de `renderer.info.memory.textures`, no bytes de VRAM. El contador previo aumentaba durante los cambios repetidos de día/noche.

Capturas locales (ignoradas por Git): [320 px](polish-2026-10-15-desk-320.png), [390 px](polish-2026-10-15-desk-390.png), [1440 px](polish-2026-10-15-desk-1440.png), [1920 px](polish-2026-10-15-desk-1920.png).

## Verificación de código

- 113/113 pruebas focalizadas: taller, gate y ExperienceModule; 18 archivos. Las regresiones de acceso, rueda, retorno y restauración de cámara se comprobaron fallando antes de sus cambios.
- Suite web ejecutada durante la integración: 439/439 pruebas, 67 archivos.
- TypeScript sin errores y ESLint focalizado sin errores. `git diff --check` limpio.
- Revisión independiente del diff: sin hallazgos accionables.

## Avisos existentes observados

- JSDOM avisa que `window.scrollTo` no está implementado en algunas pruebas anteriores del gate; esas pruebas pasan.
- Next avisa de contenedores con posición estática para las imágenes hero de L’ORIGINE, Academy y Drokex en sus fichas. Esas fichas no se modificaron en este pulido.
- No se ejecutó build de producción ni se publicó el proyecto.

## Corrección posterior — capturas de salas y audio

Daniel señaló solapes durante los desplazamientos y una tarjeta de Academy demasiado alta. La verificación inicial del escritorio no cubría estos estados. Antes de corregir se reprodujeron las intersecciones de «Cancelar recorrido» con Sonido y Ver portafolio a 320 px. Abrir Mapa mantenía los elementos nativos de audio de hub y Academy con `paused=false` y volumen distinto de cero.

Correcciones:

- Cabecera móvil con botones de icono, nombres accesibles y objetivos de 40×44 px. Estado del recorrido y cancelar comparten una fila propia debajo.
- Tarjeta plegada de Academy de 108 px, CTA «Abrir caso» sin repetir el nombre y acceso a los detalles en la misma fila. Resumen, captura, atribución y retorno siguen accesibles al desplegar; el contenido largo tiene scroll interior.
- Tarjeta, navegación e instrucciones comparten un contenedor inferior con separación de 10 px. En móvil, cuatro proyectos y Mapa ocupan una fila; mesa, hub y estaciones siguen disponibles en Mapa. El foco vuelve al control visible de Mapa al llegar a mesa/hub.
- Las pistas inactivas pasan inmediatamente a volumen cero y pausa. El caller pausa también durante carga/desplazamiento, lectura, ficha o pestaña oculta; la nueva sala empieza a sonar al llegar. El ambiente y la sala actual conservan su bucle mientras están activos.

Verificación de esta corrección:

| Prueba | Resultado |
| --- | --- |
| Academy plegada/desplegada a 280×531, 320×568 y 390×844 | Sin intersecciones entre zonas visibles de interfaz, recortes ni desbordamiento de página |
| Academy plegada/desplegada a 568×320 y 844×390 | Mismos criterios; detalles con scroll interior |
| Ventanas anchas y bajas: 1024×400 y 1280×420 | Layout compacto por altura; detalles y retorno visibles, sin desbordamiento |
| Salas en escritorio a 1440×900 y 1920×1080 | Sin recortes ni intersecciones de controles visibles |
| Recorrido Academy → Drokex a 320×568 | Cancelar separado de cabecera y estado |
| Expandir detalles a 280 px → Volver al taller → Mapa → Mesa | Acciones accesibles y destinos correctos |
| Audio nativo: Mapa, carga/viaje, ficha y portafolio | Todos los reproductores inactivos con `paused=true`, `volume=0` |
| Cambio Academy → Drokex | Academy pausada y silenciada; solo hub y Drokex activos tras llegar |
| Apagar sonido | Silencio y pausa inmediatos |
| Evento de visibilidad simulado en Chromium | Pausa inmediata; al restaurar solo hub y la sala actual reanudan |
| Escape desde una sala en móvil | Foco visible en Mapa |
| Portada a 280×531 y 568×320 | Dentro del viewport, sin intersección de cabecera ni desbordamiento de página |

No se pudo generar `document.hidden=true` simplemente abriendo otra pestaña del Chromium sin ventana; la comprobación de visibilidad usó un evento y valor simulados con reproducción nativa real. No equivale a probar segundo plano en un teléfono físico.

Gate final: 98/98 pruebas dirigidas de taller y ExperienceGate, 20 archivos; incluye 8 pruebas del hook de audio, 3 integradas de su ciclo de vida, 2 de tarjetas y 2 nuevas de foco móvil. TypeScript, ESLint enfocado y `git diff --check` sin errores. Persisten los avisos anteriores de JSDOM sobre `window.scrollTo`.

La revisión independiente señaló el borde de ventanas anchas y bajas; se amplió el breakpoint por altura y se verificó el retorno en ambos tamaños de la tabla. Sin otros hallazgos de esa revisión.

Capturas locales: [320 px](responsive-audio-2026-10-15-final-320.png), [280 px](responsive-audio-2026-10-15-final-280.png), [recorrido](responsive-audio-2026-10-15-final-moving.png), [horizontal con detalles](responsive-audio-2026-10-15-expanded-568.png).
