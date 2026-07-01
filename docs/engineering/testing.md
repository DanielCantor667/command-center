# Testing

Este documento define la estrategia de pruebas de Command Center.

## Unitarias

- Prueban una función, hook o servicio de forma aislada, sin dependencias externas reales.
- Cubren lógica de negocio, cálculos, transformaciones y casos borde.
- Son la mayoría de la suite de pruebas: rápidas y baratas de mantener.

## Integración

- Prueban la interacción entre varias unidades reales (servicio con base de datos, controlador con servicio).
- Se usan para validar que las piezas conectadas funcionan como se espera, sin mockear las dependencias internas del sistema.

## End-to-end

- Prueban un flujo completo desde la perspectiva del usuario, a través de la interfaz real.
- Se reservan para los flujos críticos del producto (autenticación, operaciones core de negocio), no para cada variación de UI.

## Cobertura

- La cobertura es un indicador, no un objetivo en sí mismo: un número alto con pruebas triviales no aporta valor.
- Priorizar cobertura en lógica de negocio y en rutas críticas del producto sobre cobertura uniforme en todo el código.

## Qué probar

- Reglas de negocio y sus casos borde.
- Validaciones de datos.
- Contratos de API (entrada, salida, errores).
- Flujos críticos de usuario.

## Qué no probar

- Detalles de implementación que puedan cambiar sin alterar el comportamiento observable.
- Librerías o frameworks externos ya probados por sus mantenedores.
- Estilos visuales exactos, salvo mediante pruebas específicas de regresión visual cuando el proyecto lo requiera.

## Definition of Done

Una funcionalidad no se considera terminada si:

- No tiene pruebas para su lógica de negocio relevante.
- Rompe pruebas existentes sin justificación documentada.
- No fue validada manualmente en el flujo principal cuando afecta a UI.

## Buenas prácticas

- Las pruebas son independientes entre sí y no dependen de orden de ejecución.
- Los nombres de las pruebas describen el comportamiento esperado, no la implementación.
- Los datos de prueba se generan de forma explícita en cada prueba, evitando estado compartido implícito.
- Una prueba que falla de forma intermitente se corrige o se elimina; no se ignora.
