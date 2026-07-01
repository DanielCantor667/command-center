# Estándares de código

Este documento define cómo escribimos código en Command Center. No repite las reglas de arquitectura (ver `architecture.md`) ni los principios generales del proyecto (ver `CONSTITUTION.md`): se enfoca en el nivel de la línea, la función y el archivo.

## Filosofía de código

El código se escribe para que otra persona lo entienda sin contexto adicional. Preferir lo simple y explícito sobre lo ingenioso. Un código correcto pero difícil de leer es deuda técnica desde el día en que se escribe.

## Legibilidad

- Nombrar por intención, no por implementación (`getActiveUsers`, no `filterArr`).
- Evitar abreviaturas ambiguas.
- Un bloque de código debe leerse de arriba hacia abajo sin saltos mentales.
- Preferir varias líneas claras sobre una línea densa.

## Convenciones de nombres

- Variables y funciones: camelCase.
- Componentes, clases y tipos: PascalCase.
- Constantes globales: UPPER_SNAKE_CASE.
- Booleanos con prefijo que indique estado (`isLoading`, `hasError`, `canEdit`).
- Nombres en inglés en todo el código, comentarios y documentación técnica en español cuando corresponda a este repositorio.

## Organización de archivos

- Un archivo, una responsabilidad principal.
- Archivos relacionados (componente, estilos, tipos propios) se agrupan en la misma carpeta.
- No crear carpetas de un solo archivo salvo que se anticipe crecimiento inmediato y justificado.

## Tamaño recomendado de funciones

- Una función hace una sola cosa. Si su nombre necesita "y" para describirse, se divide.
- Referencia orientativa: si supera 30-40 líneas, revisar si debe dividirse.

## Tamaño recomendado de componentes

- Un componente representa una sola responsabilidad visual o de interacción.
- Referencia orientativa: más de 150-200 líneas es señal de que debe dividirse en subcomponentes o mover lógica a hooks.

## Cuándo crear helpers

Cuando una operación pura (sin estado, sin efectos secundarios) se repite o se usa en más de un lugar del código.

## Cuándo crear hooks

Cuando lógica de estado o efectos secundarios se repite entre componentes, o cuando un componente mezcla lógica de UI con lógica de datos y conviene separarlas.

## Cuándo crear servicios

Cuando existe lógica de negocio que decide, calcula o transforma datos del dominio, independientemente de dónde se consuma (ruta, job, script).

## Manejo de errores

- Los errores se capturan en el límite del sistema (entrada de usuario, llamada a API externa, acceso a base de datos), no en cada capa intermedia.
- Nunca silenciar un error sin registrarlo o propagarlo.
- Los mensajes de error deben ser útiles para quien depura, no genéricos.

## Logging

- Registrar eventos relevantes para el negocio y errores, no ruido de depuración en código de producción.
- No registrar información sensible (contraseñas, tokens, datos personales).
- Los logs deben tener contexto suficiente para reproducir el problema sin acceder al código.

## Comentarios

- El código se explica solo mediante nombres claros. Un comentario solo se justifica cuando explica un porqué no evidente (una restricción externa, un workaround, una decisión contraintuitiva).
- No comentar qué hace el código si su lectura ya lo dice.
- No dejar código comentado.

## TypeScript

- Tipado estricto habilitado. No usar `any` salvo justificación explícita y documentada en el propio código.
- Preferir tipos derivados e inferencia sobre duplicar definiciones manuales.
- Los tipos de dominio se definen una sola vez y se reutilizan.

## ESLint

- Las reglas configuradas en el repositorio son obligatorias, no sugerencias.
- No deshabilitar reglas de lint para evitar corregir el problema real.

## Prettier

- El formato lo define Prettier, no la preferencia individual.
- No discutir formato en revisiones de código: si Prettier lo permite, es correcto.

## Buenas prácticas

- Funciones puras siempre que sea posible.
- Evitar mutar datos recibidos como parámetro.
- Fallar rápido y de forma explícita ante datos inválidos.
- Priorizar composición sobre herencia.

## Antipatrones que deben evitarse

- Funciones o componentes con múltiples responsabilidades mezcladas.
- Lógica de negocio en la capa de presentación o en rutas/controladores.
- Duplicación de lógica en lugar de reutilización.
- Estado global usado para datos que solo necesita un componente.
- Dependencias nuevas para resolver algo que ya cubre una herramienta existente.
- Código muerto o comentado que nadie elimina.
