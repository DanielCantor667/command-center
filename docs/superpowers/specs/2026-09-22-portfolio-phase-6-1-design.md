# Fase 6.1 - Un recorrido continuo

Estado: aprobado por Daniel: "lo apruebo", 22 septiembre 2026.

## Diagnostico del codigo actual

La entrada cinematografica esta limitada a Kliniu en ExperienceModule y
CityNavigator; completeEntrance tambien fija ese ID. ExperienceGate guarda
proyecto seleccionado y scroll, pero al desmontar ExperienceModule se pierden
camara, vista de detalle, noche, capas y activacion manual del 3D. La entrada
ya tiene cancelacion, omision, reduced motion y limite de 2600ms. Conservarlos.
Los cuatro casos propios y sus renders v4 estan terminados; no rehacerlos.

## Alternativas

1. Continuidad espacial (recomendada): extender la aproximacion a los cuatro
   pabellones y restaurar el estado al volver. Aprovecha la ciudad existente.
2. Cortinilla editorial: cambios mas baratos pero ocultan el espacio y hacen
   menos significativa la ciudad. Usar solo un fundido breve como fallback.
3. Recorrido automatico por scroll: mayor control cinematografico, a costa de
   navegacion y accesibilidad. Fuera del alcance.

## Recorrido aprobado cuando se confirme esta propuesta

### Primera visita

Nombre y navegacion disponibles desde el primer frame; poster inmediato.
Revelado tipografico de 450ms, sin pantalla de carga ni porcentaje ficticio.
Si el canvas esta activo y listo, asentamiento de camara <=800ms; no esperar
al GLB para permitir navegar. Cualquier interaccion cancela ese movimiento.
Una vez por montaje inicial del portafolio; no repetir al volver de un caso.
En movil conservar poster y 3D opt-in. Reduced motion: estado final directo.

### Elegir y entrar

Seleccionar un proyecto conserva su etiqueta y encuadra su pabellon. Entrar
aproxima camara al proyecto seleccionado, no a Kliniu fijo. Al finalizar,
fundido corto hacia la portada real del caso correspondiente. No deformar
una captura web para convertirla artificialmente en un render diferente.
Kliniu conserva su enlace visual existente cuando sea compatible.
Duracion objetivo 700-1100ms; maximo 2600ms antes de entrada directa.
Acciones existentes Omitir y Cancelar; Escape cancela y devuelve foco.
Sin canvas/WebGL o reduced motion: acceso inmediato, sin falsa aproximacion.

### Regresar

Restaurar proyecto, camara previa a entrar, target y zoom, vista general/detalle,
noche, capas y decision de activar 3D. Guardar el snapshot antes de aproximar,
no al final de la animacion. Restaurar scroll tras montar el taller y devolver
el foco al control de entrada sin alterar scroll. No reconstruir la camara con
un efecto que sobrescriba el snapshot en el primer frame.
Si la persona cambia de caso mediante Anterior/Siguiente, al regresar mostrar
el ultimo proyecto visitado con un encuadre de detalle canonico, manteniendo
noche/capas/opt-in y scroll; no restaurar una camara del proyecto anterior.
Salir a Tecnologias o Contacto prioriza esa seccion sobre la restauracion.

## Arquitectura y archivos previstos

ExperienceGate sera propietario del estado persistente durante la visita,
sin almacenamiento permanente ni nuevas dependencias. ExperienceModule
seguira gestionando la interaccion; CityNavigator capturara/restaurara camara.
Snapshot de camara solo al terminar una interaccion o al solicitar entrada,
no setState de React por frame. Token de entrada para ignorar callbacks viejos.
Una configuracion tipada por proyecto define ID del distrito, encuadre y
destino visual. El caso 4U debe mapear 4ustudio-academy a academy.

Archivos principales: shell/experience-gate/component.tsx,
modules/experience/component.tsx, components/city-navigator.tsx,
components/city-navigator-loader.tsx y cinematic.module.css.
Tipos/configuracion locales nuevos solo si reducen acoplamiento real.
Pruebas en experience/tests y shell/experience-gate/tests.
globals.css solo si hace falta para las transiciones nativas existentes.

## Plan de ejecucion tras aprobacion

1. RED: entrada parametrizada cuatro proyectos, cancelacion/omision, callbacks
   tardios y limite temporal. Implementar coordinacion sin doble navegacion.
2. RED: snapshot previo, restauracion sin salto, foco, caso siguiente y salida
   a otra seccion. Implementar persistencia en Gate y contrato de camara.
3. Implementar revelado inicial no bloqueante y aproximaciones; preservar
   posters, fallback y reduced motion. No duplicar canvas ocultos.
4. Chrome 1440/1920/390/320 y 320x568: screenshots, canvas/pixeles, teclado,
   giro manual antes de entrar, regresar y comparar camara/estado/scroll.
5. Red lenta, fallo GLB, contextlost, ausencia de View Transitions, reduced
   motion, clics repetidos, Escape y cambiar de caso durante transiciones.
6. Regresion de los cuatro casos, Vitest completo, tsc, ESLint y revision
   independiente cuando disponible. Documentar limites; mantener local.

## Criterios de cierre

Ninguna animacion impide acceder a un proyecto. Los cuatro destinos coinciden
con su seleccion. El retorno mantiene el estado definido y el foco. Sin
superposiciones, canvas vacios ni desbordes en viewports comprobados.
El inicio muestra nombre, proyecto y una parte de la siguiente seccion.
Nada de sonido automatico, cursor ornamental o scroll secuestrado.

## No implementar todavia

Fase 6.2 (cierres visuales entre proyectos), reescritura de trayectoria/contacto,
nuevos renders/modelos, nuevas funciones comerciales, backend, librerias,
servicios, analytics, commit, push o deploy. No tocar repositorios de marca.

## Aprobacion requerida

Confirmar Fase 6.1: revelado inicial breve, entrada espacial para los cuatro
proyectos y retorno con estado restaurado, bajo las reglas anteriores.
