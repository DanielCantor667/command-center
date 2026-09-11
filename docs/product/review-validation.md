# Verificación del portafolio revisable

10 de septiembre de 2026. Cambios locales; sin commit, push ni despliegue externo.

## Navegador real

Chromium mediante Playwright existente en el entorno, primero sobre desarrollo y luego sobre `next build` + `next start`, en http://localhost:3000.

- Kliniu, 4U Studio Academy, Drokex y L’Origine: apertura desde las tarjetas, encabezado correcto, dos imágenes cargadas y URL pública correspondiente.
- Recorrido: iniciar → siguiente → anterior → contactar → enlace profesional de LinkedIn. Retorno explícito a ciudad desde cada caso.
- Ciudad WebGL: selección mediante etiquetas de 4U y Drokex abre sus dossiers. Contrato probado para todos los IDs del manifiesto.
- Capturas de las fichas en escritorio 1440×1000 y móvil 390×844, inspeccionadas visualmente. Sin popup de bienvenida en capturas finales de 4U.
- Anchos 390 y 320 px: documento y encabezado sin desbordamiento ni recorte de sus controles.
- Tema claro y oscuro: texto legible sobre sus fondos; espaciado del workspace restaurado.
- Movimiento reducido: canvas no montado y recorrido semántico disponible.
- Cero errores de JavaScript en los recorridos ejecutados. No equivale a auditoría de todos los módulos ni de todos los navegadores.

## Comprobaciones técnicas

- Suite Vitest completa: 40 archivos y 271 pruebas aprobadas.
- TypeScript sin errores y ESLint sin errores en los módulos/archivos revisados.
- `next build`: compilación, tipos y generación de páginas completados.
- `git diff --check`: sin errores.
- Revisión independiente: retirados resultados numéricos antiguos sin fuente en Kliniu y L’Origine.

## Límites

- Drokex: participación y propiedad por confirmar; geometría procedural provisional. No se inventaron decisiones ni resultados.
- Los detalles editoriales heredados están clasificados como PARTIAL en la auditoría cuando no se revalidaron. La auditoría no certifica resultados de negocio ni operaciones privadas de los cuatro sitios.
- La ciudad y otros módulos mantienen su arquitectura actual. No se midieron Lighthouse, tiempos de carga en equipos físicos ni todas las funciones del editor 3D.
- Vitest conserva avisos conocidos de canvas en JSDOM y múltiples instancias de Three.js; no hubo errores de navegador en la verificación descrita.
- La publicación pública y el dominio de Command Center quedan fuera de esta entrega local.

## Fase 1 — portada y maqueta (10 de septiembre de 2026)

Esta verificación sustituye los puntos anteriores sobre la portada y movimiento reducido:
- Una única escena 3D mate; seleccionar edificio o lista actualiza preview. La ficha se abre con acción explícita y conserva selección al volver.
- Captura real de la maqueta antes de activar 3D en móvil; lista y fichas operativas si WebGL2 no está disponible (probado anulando getContext en Chromium).
- Selección de los siete edificios, giro, vista general y movimiento reducido comprobados en navegador. Con movimiento reducido la escena permanece estática y la selección es instantánea.
- Resize mantiene el ángulo elegido; comparación visual antes y después de redimensionar. No se exigió igualdad binaria por diferencias de rasterización.
- Producción local comprobada: escritorio 1440 px y móvil 390/320 px, sin desbordamiento. Selección de 4U, entrada al caso y retorno; Drokex y activación móvil. Cero pageerrors en recorrido.
- 40 archivos / 272 pruebas Vitest aprobadas; TypeScript y ESLint de archivos modificados, build de Next completados.
- Revisión independiente corrigió separación de zoom/encuadre al redimensionar y detección previa de WebGL.
- Sin commit, push o despliegue. Dossiers y rutas compartibles quedan fuera de esta fase. Drokex conserva geometría provisional y autoría por confirmar.

## Fase 2.1 — distrito Kliniu (11 de septiembre de 2026)
- Geometría conceptual propia: dispensador, catálogo cubierto y distribución. No representa una sede real.
- Entrada breve, cubierta y luz responden a selección; detalle con zoom y ángulo frontal, retorno a general; captura acompaña selección.
- Chromium: detalle/general, movimiento reducido estático, ficha/retorno, móvil 390 px sin overflow ni pageerrors.
- Suite 40 archivos / 273 pruebas; prueba de detalle repetida tras ajuste de scroll. Build con tipos y lint aprobado.
- Preview local en puerto 3001: el 3000 estaba ocupado por otro servidor.
- Solo primer distrito de la dirección aprobada; otras geometrías y dossiers pendientes de revisión de diseño. Sin publicación.

## Fase 2.2 — distrito 4U (11 de septiembre de 2026)
- Escenario conceptual con arcos acústicos, teclado, tambor y micrófono. Paneles se abren e iluminación aumenta al seleccionar; naranja basado en la captura del sitio real.
- Vista cercana disponible para 4U; se conserva al cambiar entre Kliniu y 4U. Vista general restaura zoom; otros proyectos abandonan detalle. Etiquetas vecinas se ocultan durante el acercamiento.
- Chromium escritorio y móvil 390 px: recorrido Kliniu → 4U, general, captura correcta, ficha/retorno, movimiento reducido estático y sin desbordamiento ni pageerrors.
- 40 archivos / 273 pruebas; regresión ampliada para preservar detalle entre distritos. Tipos, ESLint y build aprobados, diff sin errores de whitespace.
- Poster móvil actualizado desde el render real. Sin sonido, paquetes nuevos, publicación o cambios a otros modelos.

## Fase 2.3 — galería L'Origine (11 de septiembre de 2026)
- Pabellón conceptual con cubierta parcial, pedestales, envases ámbar estilizados y vitrinas móviles. Paleta tomada de la captura real del catálogo; no representa una sede física.
- Acercamiento frontal propio y detalle conservado entre Kliniu, 4U y L'Origine. Vista general y fichas conservadas.
- Chromium escritorio y móvil 390 px: selección, acercamiento, general, ficha/retorno, movimiento reducido estático, sin overflow ni pageerrors en recorrido.
- 40 archivos / 273 pruebas aprobadas (regresión ampliada para L'Origine), ESLint y build con tipos aprobados. Poster actualizado desde la escena real.
- Sin cambios a fichas o Drokex, sin publicación. Preview puerto 3001.

## Fase 3.1 — fichas del taller (11 de septiembre de 2026)
- Entrada desde ciudad abre PortfolioCase sin shell del laboratorio. Módulo original de proyectos preservado para workspace.
- Paleta por proyecto, capturas desktop/móvil grandes, participación y alcance; responsabilidades, funciones, decisiones y aprendizajes desplegables. Sin datos nuevos; Drokex conserva autoría pendiente y falta de evidencia.
- Navegación anterior/siguiente y retorno conservan el último proyecto; foco al título al cambiar de caso. Animación de entrada desactivada con reduced motion.
- Chromium desarrollo y producción local: cuatro casos, dos imágenes cargadas por caso, enlace público, siguiente/retorno con selección, desplegables y móvil 390/320 sin overflow ni pageerrors. Capturas revisadas visualmente.
- Suite 41 archivos / 279 pruebas; seis pruebas del nuevo componente repetidas tras ajuste de desplegables. ESLint y build con tipos aprobados; diff sin errores.
- Puerto 3001. Sin commit, push, despliegue o nuevas rutas compartibles. Notas técnicas heredadas mantienen su idioma y contenido original.

## Fase 2.4 — distrito Drokex (11 de septiembre de 2026)
- Núcleo modular inspirado en la portada pública: pantalla central, dos módulos de audiencia, nodos laterales y acentos lima/naranja. Es una interpretación conceptual y no representa una sede física.
- Cámara cercana propia, apertura de módulos e intensidad de pantalla al seleccionar; vista general, reduced motion y continuidad con los otros tres distritos conservadas.
- Chromium escritorio y móvil 390 px: selección, acercamiento, general, ficha/retorno, movimiento reducido estático, sin overflow ni pageerrors.
- 41 archivos / 279 pruebas aprobadas, TypeScript/ESLint y build completados, diff limpio. Autoría y resultados de Drokex siguen explícitamente por confirmar.
- Sin publicación, nuevas dependencias ni cambios a datos no verificados. Preview local puerto 3001.

## Fase 4.1 — transición ciudad → ficha (11 de septiembre de 2026)
- Al abrir un caso desde la ciudad aparece una transición breve con el nombre del proyecto y luego entra la ficha con su paleta y captura. La selección se conserva al volver.
- Movimiento reducido omite la espera; la ficha entra de inmediato. Navegación anterior/siguiente mantiene su cambio directo.
- Chromium desarrollo y producción local: transición visible, ficha correcta, reduced motion instantáneo y cero pageerrors. Build de Next aprobado; diff limpio.
- Sin sonido, bloqueo de navegación, publicación ni servicios externos. Preview local puerto 3001.

## Fase 4.2 — entrada de ciudad (11 de septiembre de 2026)
- Primera aparición de la maqueta con ensamblaje breve: suelo y distritos suben y toman escala con easing suave; termina en estado estático.
- Movimiento reducido muestra la escena al instante y permanece estable. Transición ciudad → ficha sigue funcionando después del reveal.
- Chromium: comparación render temprano/estable, reduced motion y ficha; sin pageerrors. TypeScript, ESLint y suite conservados.

## Fase 5 — pulido final (11 de septiembre de 2026)
- Navegación ciudad → ficha con estado intermedio, retorno y selección preservada.
- Entrada de ciudad única; cuatro distritos con identidades diferenciadas y movimiento reducido respetado.
- Auditoría UI aplicada: controles táctiles, focus-visible, skip link, aria-live para fallback/carga, dimensiones de imágenes, hover explícito, sin transition all.
- Rendimiento: escena a demanda, DPR limitado, sombras 1024², sin loops ambientales; preflight WebGL antes de montar R3F.
- Producción local Chromium: casos, Drokex, transición, móvil 390/320, overflow y pageerrors: todo aprobado. Captura visual final inspeccionada.
- 41 archivos / 279 pruebas; TypeScript, ESLint, build y diff check aprobados. Sin publicación: queda pendiente decisión de despliegue.

## Fase 6 — acabado visual general (11 de septiembre de 2026)
- Portada con jerarquía editorial: introducción más clara, encabezado ligero y maqueta/captura como una sola composición.
- Acento y wash por proyecto aplicados a selección, maqueta, captura, borde del preview y CTA: Kliniu petróleo, 4U naranja, L'Origine ámbar, Drokex lima.
- Bordes y superficies reducidos para evitar efecto de tarjetas genéricas; controles táctiles y hover con feedback explícito.
- Desktop 1440 y móvil 390/320 inspeccionados; todos los proyectos cambian acento y CTA correctamente, sin overflow ni pageerrors.
- Suite 41 archivos / 279 pruebas, TypeScript, ESLint y build final aprobados. Sin despliegue externo.
