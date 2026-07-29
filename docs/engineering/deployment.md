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
## Release readiness

## Current release contract

The public entry point is the Next.js application in `apps/web`. The city experience is progressively enhanced: semantic content and the workspace remain available when WebGL is unavailable or disabled.

## Environment

Set server-only Supabase variables in the deployment provider's secret store. Never expose a database URL or service-role key through `NEXT_PUBLIC_*`; browser code may only use the public Supabase URL and anon key where required.

## Verification before release

1. `pnpm lint`
2. `pnpm test`
3. `pnpm build`
4. Run `pnpm --filter @command-center/web render:worker` only with production-safe database credentials and a bounded job queue.
5. Check the city at desktop and mobile widths, with reduced motion enabled and with WebGL disabled.

## Hosting

Vercel is the lowest-friction host for the current Next.js app. Configure the monorepo root, install with pnpm, build with `pnpm --filter @command-center/web build`, and start/render worker separately if render jobs are enabled. A production deployment is intentionally not created automatically: it requires the owner to select the hosting account, domain and production secrets.

## Custom domain handoff

The current public alias is `https://command-center-web-woad.vercel.app`. To move to a custom domain, add the domain to the Vercel project, apply the exact DNS record Vercel returns at the registrar, and set `NEXT_PUBLIC_SITE_URL` in Production and Preview to the canonical `https://` URL. A new deployment updates the canonical URL, sitemap, robots file and Open Graph metadata automatically.
