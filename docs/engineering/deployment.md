# Deployment

Este documento describe cómo se despliega Command Center a través de sus distintos ambientes.

## Desarrollo

- Ambiente local de cada desarrollador, usado para construir y probar antes de integrar.
- Los datos y servicios externos usados en desarrollo son aislados; nunca se apunta a datos de producción.

## Staging

- Ambiente que replica producción en configuración, usado para validar cambios antes de liberarlos.
- Toda funcionalidad relevante se valida en staging antes de promoverse a producción.

## Producción

- Ambiente que sirve a usuarios reales. Cualquier cambio hacia producción pasa por el flujo de CI/CD, nunca de forma manual.
- Los cambios en producción deben ser reversibles o tener un plan de rollback conocido antes de desplegarse.

## Variables de entorno

- La configuración sensible o dependiente del ambiente vive en variables de entorno, nunca en código.
- Cada ambiente mantiene su propio conjunto de variables; no se comparten valores de producción con otros ambientes.
- Los nombres de las variables se documentan por su propósito; nunca se exponen sus valores en documentación, logs o mensajes.

## CI/CD

- Todo cambio se valida automáticamente (build, lint, tests) antes de poder integrarse.
- El pipeline es la única vía para llevar cambios a staging y producción.
- Un pipeline en rojo bloquea el avance del cambio hasta resolverse.

## Build

- El build debe ser reproducible: el mismo código produce el mismo artefacto en cualquier ambiente.
- Los artefactos de build no contienen secretos ni configuración específica de ambiente embebida de forma fija.

## Migraciones

- Las migraciones de base de datos se aplican como parte del proceso de despliegue, antes de que el nuevo código dependiente de ellas entre en servicio.
- Las migraciones deben ser compatibles con la versión de código anterior durante el tiempo de transición del despliegue.

## Rollback

- Todo despliegue debe poder revertirse a la versión previa sin pérdida de datos.
- Si una migración no es reversible, el plan de despliegue lo documenta explícitamente antes de ejecutarse.

## Monitoreo

- Todo despliegue a producción se observa activamente durante la ventana posterior inmediata al cambio.
- Se monitorean errores, rendimiento y disponibilidad; cualquier anomalía detiene la promoción de cambios adicionales hasta resolverse.
