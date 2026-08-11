# Roadmap

Este roadmap define la dirección activa de Command Center como sistema de evidencia explorable de la ingeniería de Daniel. No incluye fechas: el orden expresa dependencias y prioridad. El contexto documental anterior se conserva en el [registro histórico de referencias](docs/product/documentation-reference-register.md).

## Sprint 1 — Product Clarity

### Objetivo

Establecer una definición única de producto y una fuente de verdad antes de modificar interfaz, datos o experiencia 3D.

### Alcance

- Alinear la documentación raíz con la definición activa.
- Mantener el registro de referencias del legado y clasificar sus contradicciones.
- Documentar el contrato entre Experience, Projects, Knowledge/Evidence, Mission y Profile.
- Auditar los seis registros de `PROJECTS` y señalar huecos sin fabricar información.

### Entregable verificable

Documentación raíz alineada, registro de referencias y auditoría escrita de los seis proyectos.

### Criterios de aceptación

- Ningún documento raíz presenta una dirección de producto operativa descartada.
- `PROJECTS` conserva la fuente de verdad de cada dossier.
- La relación ciudad → Projects → Knowledge/Evidence está documentada sin duplicar responsabilidades.
- No se modifica el WIP de ciudad, Blender, datos externos ni funcionalidad.

## Sprint 2 — Evidencia

### Objetivo

Volver confiable el dossier de cada proyecto mediante evidencia real y trazable.

### Alcance

- Completar y corregir los datos permitidos por proyecto: propósito, estado, stack, media, retos, decisiones y lecciones.
- Validar enlaces públicos antes de mostrarlos.
- Registrar como ausentes las métricas, resultados o recursos que no tengan fuente verificable.

### Entregable verificable

Los seis dossiers reflejan datos reales y cada enlace o recurso público tiene una verificación documentada.

### Criterios de aceptación

- Cada dato de dossier se puede rastrear a un proyecto o fuente existente.
- `links.live` solo aparece cuando existe una URL verificable.
- Las métricas inexistentes se representan como ausencia, no como valores estimados.
- Los detalles confidenciales de proyectos privados se omiten sin sustituirlos por texto ficticio.

## Sprint 3 — Recorrido

### Objetivo

Convertir la evidencia en un recorrido entendible desde el descubrimiento hasta la profundidad técnica.

### Alcance

- Usar la ciudad como puerta de descubrimiento de proyectos y módulos.
- Hacer que Projects conduzca a dossiers con evidencia relacionada.
- Conectar Knowledge/Evidence, Mission y Profile sin repetir el contenido de los dossiers.
- Mantener una alternativa accesible cuando WebGL no esté disponible.

### Entregable verificable

Un recorrido que permite descubrir un proyecto, abrir su dossier y seguir conexiones verificables hacia decisiones, tecnologías y aprendizajes.

### Criterios de aceptación

- La ciudad 3D mejora el descubrimiento, pero no bloquea el acceso al contenido.
- Cada superficie responde a su responsabilidad documentada.
- Las conexiones presentadas remiten a evidencia existente.
- No se duplica la fuente de datos entre superficies.

## Sprint 4 — Calidad pública

### Objetivo

Preparar la experiencia pública para ser útil, accesible, rápida y medible.

### Alcance

- Evaluar rendimiento, accesibilidad y SEO de las rutas públicas.
- Añadir analítica y mecanismos de feedback cuando tengan una finalidad definida.
- Corregir hallazgos priorizados sin degradar la integridad de la evidencia.

### Entregable verificable

Un informe de calidad pública con resultados medidos, hallazgos priorizados y cambios verificables en la experiencia.

### Criterios de aceptación

- Las mediciones proceden de herramientas y recorridos reales.
- Los flujos públicos clave cumplen los criterios de accesibilidad definidos.
- La experiencia mantiene una ruta de descubrimiento y consulta sin depender de WebGL.
- El feedback y la analítica no inventan ni sustituyen evidencia de proyecto.

## Evolución continua

### Objetivo

Incorporar trabajo nuevo sin romper el modelo de evidencia ni la coherencia entre superficies.

### Alcance

- Registrar cada proyecto nuevo en la fuente de verdad antes de presentarlo.
- Actualizar dossiers, conexiones y perfil a partir de evidencia comprobable.
- Revisar el contrato de datos cuando cambien las necesidades reales de presentación.

### Entregable verificable

Cada proyecto nuevo cuenta con un dossier trazable, conexiones de evidencia y representación consistente en las superficies aplicables.

### Criterios de aceptación

- No se publica información sin fuente verificable.
- Las nuevas vistas consumen la fuente de verdad, sin duplicar datos.
- Los cambios de dirección se documentan antes de convertirse en trabajo de producto.
- La experiencia sigue siendo accesible cuando una mejora visual no está disponible.
