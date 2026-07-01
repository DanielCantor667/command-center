# Backend

Este documento describe cómo se organiza el backend de Command Center. El flujo general (ruta → controlador → servicio → base de datos) está definido en `architecture.md`; este documento profundiza en la responsabilidad de cada capa.

## Servicios

- Única capa que contiene lógica de negocio: reglas, cálculos, decisiones del dominio.
- Un servicio se organiza por dominio (por ejemplo, `userService`, `campaignService`), no por endpoint.
- Los servicios no conocen detalles de HTTP (request, response, status codes).
- Los servicios son la unidad reutilizable: pueden invocarse desde controladores, jobs o scripts.

## Controladores

- Reciben la solicitud, validan su forma junto con el middleware correspondiente, delegan en el servicio y devuelven la respuesta.
- No contienen lógica de negocio ni acceso directo a la base de datos.
- Traducen errores del servicio a códigos de estado HTTP apropiados.

## Middleware

- Maneja preocupaciones transversales: autenticación, autorización, logging, manejo de errores, parseo de solicitud.
- No contiene lógica de negocio específica de un dominio.
- Se aplica de forma explícita a las rutas que lo requieren.

## Helpers

- Lógica compartida entre servicios que no pertenece a las reglas de un dominio específico (formateo, cálculo genérico, utilidades de fecha).
- No deben acumular lógica de negocio con el tiempo; si eso ocurre, esa lógica pertenece a un servicio.

## Validaciones

- La forma y el tipo de los datos de entrada se validan antes de llegar al servicio.
- Las reglas de negocio que dependen del estado del sistema (por ejemplo, unicidad, permisos) se validan dentro del servicio.
- Nunca confiar en la validación del cliente como única barrera.

## Errores

- Los servicios lanzan errores de dominio explícitos y tipados; los controladores los traducen a respuestas HTTP.
- No exponer detalles internos (stack traces, mensajes de base de datos) en la respuesta al cliente.
- Todo error no controlado se registra antes de responder.

## Autorización

- Se valida en el middleware o al inicio del servicio, nunca de forma implícita dentro de lógica de negocio no relacionada.
- Los permisos se verifican por recurso y acción, no de forma genérica por rol únicamente.

## Autenticación

- La verificación de identidad ocurre antes de que la solicitud llegue al controlador.
- Las sesiones y tokens se validan en cada solicitud protegida; no se asume validez persistente sin verificación.

## Separación de responsabilidades

- Ruta: define el endpoint y lo conecta a su controlador.
- Controlador: orquesta la solicitud y la respuesta.
- Servicio: decide y ejecuta la lógica de negocio.
- Acceso a datos: encapsula la interacción con la base de datos, sin lógica de negocio.

## Buenas prácticas

- Servicios y controladores pequeños, con una sola responsabilidad.
- No repetir lógica de validación o de negocio entre distintos endpoints; reutilizar el mismo servicio.
- Los efectos secundarios (envío de correos, eventos, notificaciones) se explicitan dentro del servicio que los origina, no se ocultan en middleware genérico.
