# Base de datos

Este documento define las reglas de modelado y gestión de la base de datos de Command Center.

## Modelado

- Cada tabla representa una entidad clara del dominio, con un nombre en inglés, plural, en snake_case.
- Los campos representan datos atómicos; evitar campos que almacenen múltiples valores combinados.
- El modelo de datos se diseña antes de implementar la funcionalidad que lo consume, en `specs/` cuando el cambio es relevante.

## Relaciones

- Las relaciones se modelan mediante claves foráneas explícitas, nunca de forma implícita en la aplicación.
- Se prefiere la cardinalidad más simple que represente correctamente el dominio (evitar relaciones muchos-a-muchos si la relación real es uno-a-muchos).

## Integridad

- Toda relación debe estar protegida por restricciones de clave foránea en la base de datos, no solo validada en la aplicación.
- Los campos obligatorios se marcan como `NOT NULL` en el esquema, no solo en la capa de validación.
- Los valores únicos se protegen con restricciones `UNIQUE`, no solo con lógica de aplicación.

## Índices

- Se crean índices sobre columnas usadas frecuentemente en filtros, ordenamientos o joins.
- No se indexan columnas sin evidencia de que la consulta lo requiere.
- Los índices se revisan cuando una consulta muestra degradación de rendimiento.

## Migraciones

- Toda modificación de esquema se realiza mediante una migración versionada, nunca de forma manual sobre la base de datos.
- Las migraciones son incrementales y reversibles cuando sea posible.
- No se modifican migraciones ya aplicadas en ambientes compartidos; los cambios adicionales se hacen en una migración nueva.
- Evitar migraciones innecesarias: agrupar cambios relacionados de una misma funcionalidad.

## Convenciones

- Tablas: snake_case, plural (`users`, `campaign_events`).
- Columnas: snake_case, singular (`created_at`, `user_id`).
- Claves foráneas: `<entidad_singular>_id` (`user_id`, `campaign_id`).
- Marcas de tiempo: `created_at`, `updated_at` en toda tabla que lo requiera para auditoría.

## Campos calculados

- No se almacenan valores que puedan derivarse de otros datos existentes (totales, conteos, promedios) salvo que el costo de recalcularlos en cada consulta sea inaceptable y esté documentado.
- Cuando se decide almacenar un valor derivado por rendimiento, se documenta el mecanismo que lo mantiene sincronizado.

## Soft delete

- Los datos que requieren trazabilidad o pueden necesitar recuperación se marcan como eliminados (`deleted_at`) en lugar de borrarse físicamente.
- Los datos sin valor histórico ni de auditoría pueden eliminarse físicamente.
- Toda consulta debe excluir explícitamente los registros con soft delete cuando corresponda.

## Auditoría

- Las tablas relevantes para el negocio registran quién y cuándo creó o modificó un dato (`created_at`, `updated_at`, y `created_by` cuando aplique).
- Los cambios sensibles (permisos, datos financieros) deben quedar trazables.

## Versionado

- Los cambios de esquema quedan versionados a través del historial de migraciones, que actúa como fuente de verdad del estado de la base de datos.
- El esquema en cualquier ambiente debe poder reconstruirse aplicando el historial completo de migraciones.

## Rendimiento

- Evitar consultas N+1: cargar relaciones de forma explícita cuando se sabe que se necesitarán.
- Paginar cualquier consulta que pueda devolver un volumen de datos no acotado.
- Medir antes de optimizar: no introducir desnormalización o campos calculados sin evidencia de que el rendimiento lo requiere.
