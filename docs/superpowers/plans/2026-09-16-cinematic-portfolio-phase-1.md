# Taller vivo - Fase 1 Implementation Plan

**Goal:** Inicio inmersivo de Daniel Cantor y entrada cinematografica al caso Kliniu, aprobados en la conversacion del 2026-09-16.
**Architecture:** Conservar ExperienceModule, CityNavigator y PortfolioCase. El hero comparte el canvas existente; un estado de entrada dirige la camara y una pantalla HTML transformada conecta con la imagen del caso mediante View Transitions. Sin nueva libreria de animacion.
**Tech Stack:** Next 15, React 19, R3F/drei, Three.js, CSS Modules, lucide-react, Vitest, Playwright.
**Spec:** Direccion aprobada: taller cinematografico realista, primera fase limitada a inicio inmersivo y transicion hacia Kliniu.

## Restricciones

- Conservar modelos Blender y capturas reales, datos y cambios previos.
- No extender la fase a otras escenas interiores, sonido, scroll secuestrado o nueva infraestructura.
- Sin WebGL o con movimiento reducido: acceso directo al caso. Escape cancela; accion directa permite omitir.
- No dependencias nuevas, no commit, no push, no deploy.
- Tipografia de tamanos fijos por breakpoint, espaciado de letras cero, controles tactiles de 44px, sin tarjetas decorativas en el hero.
- Base gris blanco #eef0ef, tinta #18282a, acento turquesa #007b83, linea #cbd3d1; marcas mantienen su identidad.

## Tarea 1 - Inicio a sangre

Archivos: experience/component.tsx, experience/cinematic.module.css, experience.module.css, city-navigator.tsx y city-navigator-loader.tsx.

- [x] Prueba de H1 Daniel Cantor y seleccion de los cuatro proyectos.
- [x] Sustituir la composicion de dos columnas por canvas de fondo, titulo superpuesto en zona reservada y selector inferior.
- [x] Mantener recorrido Kliniu, tecnologias y controles de escena en una banda posterior visible al terminar el hero.
- [x] Ajustar camara por tamano y modo inmersivo sin afectar el canvas del caso existente.
- [x] Poster movil usando render existente; 3D opt-in, mismo acceso a proyectos.

## Tarea 2 - Entrada Kliniu

Archivos: experience/component.tsx, city-navigator.tsx, shell/experience-gate/component.tsx, portfolio-case/component.tsx, app/globals.css.

- [x] Pruebas: entrada no navega antes de terminar camara; completar llama onEnter una vez; cancelar ignora callbacks tardios; movimiento reducido entra directamente.
- [x] Propiedades entering y onEntranceReady en CityNavigatorProps; posicion final frontal al showroom y pantalla con captura real.
- [x] Estado de entrada cancellable, limpieza de temporizadores y limite temporal para no bloquear la navegacion si falla el render.
- [x] Entrada real al caso sin pantalla de carga artificial. View Transition entre la pantalla del showroom y la captura principal del caso; alternativa directa si la API no existe.

## Tarea 3 - Verificacion

- [x] Vitest de experience y experience-gate; TypeScript; ESLint de archivos tocados; git diff --check.
- [x] Chrome real: 1440x1000, 1920x1080, 390x844, 320x740 y viewport bajo. Imagen de canvas no vacia, encuadre sin superponer textos y edificios, seleccion, noche, capas, entrada/cancelacion/retorno.
- [x] Verificar movimiento reducido, teclado, ausencia de WebGL, API de transiciones ausente y retorno desde caso.
- [x] Guardar capturas e informe. Dejar servidor local accesible.

Fuente API: https://developer.mozilla.org/en-US/docs/Web/API/Document/startViewTransition
