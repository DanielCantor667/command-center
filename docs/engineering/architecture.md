# Arquitectura

## Visión general

Command Center utiliza Turborepo y una arquitectura modular organizada como monorepo. El objetivo es mantener un solo repositorio donde múltiples aplicaciones y paquetes compartidos conviven de forma ordenada, con límites claros entre responsabilidades.

Objetivos de la arquitectura:

- Escalabilidad: el proyecto puede crecer en funcionalidades y equipos sin degradar la estructura.
- Mantenibilidad: cualquier desarrollador puede entender y modificar una parte del sistema sin conocer todo el sistema.
- Reutilización: la lógica y los componentes compartidos viven en un solo lugar.
- Consistencia: las mismas convenciones se aplican en todas las apps y paquetes.

## Estructura del monorepo

- `apps/` — Aplicaciones desplegables. Cada app es un producto o superficie independiente que consume los paquetes compartidos.
- `packages/` — Código compartido entre apps: UI, configuración, reglas de lint, configuración de TypeScript y lógica reutilizable.
- `docs/` — Documentación para humanos: producto, diseño, ingeniería, contenido y sprints.
- `specs/` — Especificaciones funcionales, escritas antes de implementar una funcionalidad.
- `memory/` — Contexto vivo del proyecto: changelog, decisiones resumidas, deuda técnica e ideas futuras.
- `decisions/` — Architecture Decision Records (ADR), historial permanente de decisiones técnicas.
- `prompts/` — Prompts reutilizables para IA.
- `benchmarks/` — Mediciones de rendimiento (lighthouse, bundle, fps, memoria).
- `scripts/` — Scripts de automatización del repositorio.
- `tools/` — Herramientas internas de desarrollo.

## Flujo de la aplicación

El flujo general de una operación en el sistema sigue este orden:

```
UI
  ↓
Componentes
  ↓
Hooks
  ↓
Servicios
  ↓
API
  ↓
Base de datos
  ↓
Respuesta
```

La UI nunca accede directamente a la API ni a la base de datos. Toda interacción pasa por componentes, que delegan en hooks, que a su vez delegan en servicios.

## Organización del frontend

- **Componente**: crear uno nuevo cuando exista una unidad de interfaz reutilizable o cuando un componente existente crezca más allá de una sola responsabilidad. Buscar primero si ya existe uno equivalente en el design system.
- **Hook**: crear uno cuando se necesite encapsular lógica de estado o efectos secundarios reutilizable entre componentes.
- **Helper**: crear uno para lógica pura, sin estado, usada en más de un lugar.
- **Util**: crear una cuando la lógica sea genérica y no dependa del dominio de negocio (formateo, cálculo, transformación de datos).
- **Contexto**: crear uno solo cuando el estado deba compartirse entre múltiples componentes no relacionados directamente por props.
- **Página**: crear una por cada ruta de la aplicación. Las páginas orquestan componentes, no contienen lógica de negocio.

## Organización del backend

- **Servicio**: contiene la lógica de negocio. Es la única capa que puede tomar decisiones sobre reglas del dominio.
- **Controlador**: recibe la solicitud, valida su forma, delega en el servicio correspondiente y devuelve la respuesta.
- **Ruta**: define el endpoint y lo conecta con su controlador. No contiene lógica.
- **Middleware**: maneja preocupaciones transversales (autenticación, logging, manejo de errores) antes de llegar al controlador.
- **Util**: lógica compartida entre servicios, sin reglas de negocio propias.

La lógica de negocio se mantiene siempre en servicios. Controladores y rutas permanecen delgados.

## Base de datos

- No guardar datos derivados si pueden calcularse a partir de otros existentes.
- Evitar duplicidad de información entre tablas.
- Mantener integridad referencial en todo momento.
- Validar siempre los datos antes de persistirlos, en el límite del sistema.

## Estado

- **Estado local**: usarlo para datos que solo afectan a un componente o a su árbol inmediato. Es la opción por defecto.
- **Estado global**: usarlo únicamente cuando varios componentes no relacionados necesiten leer o modificar el mismo dato. Evitar centralizar estado que podría resolverse localmente.
- **Estado del servidor**: usarlo para datos que provienen de la API. Mantenerlo sincronizado mediante las herramientas dedicadas a esto, sin duplicarlo en estado local o global.

Priorizar siempre la solución más simple posible para el problema de estado en cuestión.

## Rendimiento

- Minimizar renders innecesarios en componentes.
- Evitar cálculos costosos en cada render; derivarlos o memorizarlos solo cuando el costo lo justifique.
- Cargar únicamente el código necesario para cada ruta o vista.
- Minimizar el número de consultas a la base de datos y a la API.
- Evitar dependencias pesadas cuando exista una alternativa liviana equivalente.

## Escalabilidad

- Nuevas funcionalidades se agregan como módulos independientes dentro de la app correspondiente, no como excepciones a la arquitectura existente.
- Código usado por más de una app se mueve a `packages/`.
- Antes de crear algo nuevo, buscar si ya existe una solución reutilizable.
- Las decisiones que cambian la arquitectura se documentan como un nuevo ADR en `decisions/`, sin modificar los existentes.

## Layout Tokens

Todos los tamaños globales del layout (Sidebar, TopBar, StatusBar, Workspace, padding y gaps
principales del shell) provienen exclusivamente de `packages/config/tokens/layout.css`. Ningún
componente puede usar valores hardcodeados para estas dimensiones — siempre variables CSS
(`var(--layout-*)`), nunca px/rem sueltos en el componente.

## Convenciones

- **Nombres de archivos**: kebab-case para archivos generales, PascalCase para archivos de componentes.
- **Nombres de carpetas**: kebab-case, en inglés, describiendo su responsabilidad.
- **Componentes**: PascalCase, nombre descriptivo de su función, sin abreviaturas.
- **Hooks**: prefijo `use`, camelCase.
- **Tipos**: PascalCase, sin prefijos ni sufijos artificiales (evitar `IUser`, preferir `User`).
- **Servicios**: nombre del dominio seguido de `Service` (por ejemplo, `userService`).
- **Helpers**: nombre del verbo o transformación que realizan, camelCase.
