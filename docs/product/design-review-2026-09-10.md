# Revisión visual — Command Center

10 de septiembre de 2026. Revisión solicitada por Daniel: la página se percibe demasiado «IA». Inspección de navegador a 1440×1000 y 390×844, capturas de secciones y lectura de la implementación. Este documento propone una dirección; no aprueba ni implementa el rediseño.

## Diagnóstico

La entrega anterior resolvió acceso a los proyectos, capturas y navegación. Queda por resolver la identidad visual: demasiadas metáforas, repetición y decoración compiten con el trabajo real.

| Prioridad | Ubicación | Hallazgo | Propuesta |
| --- | --- | --- | --- |
| Alta | apps/web/modules/experience/component.tsx:91 | Ilustración compleja y ciudad 3D de materiales distintos superpuestas. Dos perspectivas y grados de detalle; los edificios parecen pegados al fondo. | Una sola ciudad con iluminación, materiales, escala y suelo coherentes. Fondo limpio y cámara deliberada. |
| Alta | apps/web/modules/experience/component.tsx:105 | Titular gigante, palabra verde, numeración, mayúsculas, estadísticas, microtexto y resplandores compiten en la misma pantalla. | Nombre e introducción breve; ciudad protagonista; un acceso principal. Reservar el acento para selección/acciones. |
| Alta | apps/web/modules/experience/component.tsx:132 | Tres accesos repetidos al catálogo: mapa, cuatro tarjetas y archipiélago. | Una experiencia de descubrimiento con lista alternativa accesible; retirar el segundo mapa ilustrado. |
| Alta | apps/web/modules/experience/component.tsx:190 | Knowledge, Mission, Analytics y Evidence ocupan secciones de aproximadamente una pantalla cada una. El visitante ve más explicaciones del portafolio que producto real. | Profundidad técnica dentro del proyecto y acceso secundario al laboratorio. Portada centrada en proyectos y autor. |
| Alta | apps/web/modules/experience/component.tsx:194 | Copy abstracto: «El conocimiento no vive en tarjetas», «Cada decisión deja una órbita», «La ciudad se observa a sí misma». | Explicar qué construyó Daniel, para quién y qué resolvió. Evitar personificar la plataforma. |
| Media | apps/web/modules/experience/component.tsx:136 | Cuatro tarjetas idénticas absorben identidades muy distintas. Las capturas mejoran credibilidad, pero el marco uniforme domina. | Al seleccionar un edificio, presentar una vista amplia del sitio, su nombre, una frase concreta y enlace. Conservar el color real del proyecto dentro de su preview. |
| Media | apps/web/modules/projects/components/project-detail/component.tsx:34 | Dossier largo, mezcla español/inglés y expone arquitectura, features, decisiones y lecciones al mismo nivel. | Resumen editorial: problema, participación, resultado observable y dos decisiones respaldadas. Detalle técnico desplegable. |
| Media | apps/web/shell/experience-gate/component.tsx:10 | Abrir un caso no cambia URL. Verificado: recargar desde Kliniu vuelve a portada. | Rutas compartibles para casos, atrás/adelante coherentes y conservación del punto de retorno. |
| Media | apps/web/modules/experience/component.tsx:315 | Monolito con líneas de falso código ocupa gran superficie sin aportar evidencia. El texto «Desde el código» se parte en tres líneas en una columna diseñada para números. | Eliminar ese adorno y reemplazar evidencia abstracta por una decisión o captura concreta en su caso. |
| Media | apps/web/modules/experience/components/city-navigator.tsx | Partículas, balizas y drones funcionan continuamente; no existe pausa explícita en modo normal. | Movimiento discreto, respuesta a selección y pausa de animación ambiental. Mantener movimiento reducido. |

## Evidencia medida

Alturas de secciones en viewport 1440×1000: portada 1000 px; proyectos 1656; distritos 1100; conocimiento 1081; misión 1056; analítica 1091; evidencia 1000; autor 820. Total de secciones: 8804 px, sin contar footer. Son aproximadamente nueve alturas de pantalla en esa configuración, no una estimación de tiempo de lectura.

Los recuentos del grafo son datos derivados, pero «196 nodos» o «892 relaciones» no explican por sí solos el valor del trabajo. Las líneas del diagrama de portada se dibujan con coordenadas fijas; no debe confundirse esa ilustración con una exploración completa del grafo.

## Dirección recomendada: ciudad de proyectos

La identidad distintiva debe venir de una maqueta interactiva de los productos de Daniel. Mantener la idea de ciudad y hacerla coherente es más específico que sustituirla por otra plantilla de tarjetas.

- Base neutral carbón y piedra, luz suave; verde reservado para selección. Colores de cada marca en su evidencia visual.
- Tipografía legible, jerarquía breve y textos alineados a la izquierda. Nombre del autor visible; sin titular publicitario a cuatro líneas.
- Una sola ciudad. Misma escala, material y luz para edificios. Reutilizar los GLB actuales; sustituir geometría solo donde impida reconocer el proyecto.
- Selección de edificio → cámara encuadra → panel con captura y contexto → ficha del proyecto. Sin partículas ni movimientos que compitan con la selección.
- En móvil, lista visual compacta con los mismos casos; no obligar a manipular un mapa pequeño.
- Perfil y contacto accesibles desde el inicio. El laboratorio técnico queda como profundidad opcional.

Recorrido propuesto:

```text
Daniel Cantor                         Proyectos / Sobre mí / Contacto

Introducción breve            Ciudad única y navegable
                              Proyecto seleccionado + captura real

Caso: problema → participación → producto → decisiones → sitio

Sobre Daniel / contacto
```

## Alternativas consideradas

1. Ciudad protagonista con preview de proyecto: recomendada; mantiene la intención original y concentra el esfuerzo visual.
2. Portafolio editorial con ciudad opcional: lectura más rápida, pero reduce el protagonismo de la ciudad que Daniel quiere desarrollar.
3. Refinar únicamente el verde, sombras y fuentes actuales: menor esfuerzo, pero conserva la duplicación y las metáforas que originan la sensación genérica.

## Fase propuesta para aprobar

Primero rediseñar portada y selección de un proyecto, conservando datos y capturas existentes. Validar escritorio/móvil y coherencia visual antes de extender el lenguaje a todos los dossiers. Los cambios de rutas compartibles y edición de contenido se detallarán en el plan de implementación.

Aceptación visual: una sola ciudad; cada elemento decorativo tiene propósito; autor y proyectos se entienden al entrar; el caso se abre con contexto; una captura del producto ocupa más atención que métricas internas; navegación y movimiento respetan accesibilidad.

Referencia complementaria para navegación, foco y animación: [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md). Las conclusiones estéticas son una evaluación de esta página, no un resultado automático de esa guía.
