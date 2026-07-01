# API

Este documento define los estándares para el diseño de APIs en Command Center.

## REST

- Los recursos se modelan como sustantivos plurales (`/users`, `/campaigns`), nunca como verbos.
- Las acciones se expresan mediante el método HTTP (`GET`, `POST`, `PATCH`, `DELETE`), no en la URL.
- Los recursos anidados reflejan la relación real del dominio (`/campaigns/:id/events`).

## Versionado

- Toda API se expone bajo un prefijo de versión (`/v1/...`).
- Un cambio incompatible con el contrato existente requiere una nueva versión; no se modifica el contrato de una versión ya publicada.

## Status HTTP

- `200` — solicitud exitosa con contenido.
- `201` — recurso creado exitosamente.
- `204` — solicitud exitosa sin contenido de respuesta.
- `400` — solicitud inválida (error del cliente en la forma de los datos).
- `401` — no autenticado.
- `403` — autenticado pero sin permiso.
- `404` — recurso no encontrado.
- `409` — conflicto con el estado actual del recurso.
- `422` — datos válidos en forma pero inválidos en regla de negocio.
- `500` — error no controlado del servidor.

## Errores

- Toda respuesta de error sigue una forma consistente: código, mensaje y, cuando aplique, detalle de los campos afectados.
- Los mensajes de error son claros y accionables para quien consume la API, sin exponer detalles internos del sistema.

## Validaciones

- La forma de los datos de entrada se valida antes de ejecutar cualquier lógica de negocio.
- Los errores de validación devuelven detalle por campo, no un mensaje genérico único.

## Paginación

- Toda colección que pueda crecer sin límite se pagina por defecto.
- Se usa un mecanismo consistente en toda la API (por ejemplo, `page` y `pageSize`, o cursor), sin mezclar estrategias entre endpoints.
- La respuesta paginada incluye metadatos suficientes para que el cliente sepa si existen más resultados.

## Filtros

- Los filtros se expresan como query params con nombres claros y consistentes con el nombre del campo filtrado.
- Un endpoint documenta explícitamente qué filtros soporta; no se asume soporte implícito.

## Ordenamiento

- El ordenamiento se controla mediante un parámetro explícito (por ejemplo, `sort=createdAt` o `sort=-createdAt` para descendente).
- Se define un orden por defecto para cada colección cuando no se especifica ordenamiento.

## Formato de respuesta

- Toda respuesta exitosa envuelve el recurso o colección de forma consistente en toda la API.
- Las colecciones paginadas incluyen los datos y los metadatos de paginación en una estructura predecible.

## Convenciones JSON

- Claves en camelCase.
- Fechas en formato ISO 8601.
- No enviar campos internos o sensibles que el cliente no necesita.
- Los valores nulos se representan explícitamente como `null`, no se omiten de forma inconsistente entre respuestas del mismo recurso.
