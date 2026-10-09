# Drokex Fase 5 Implementation Plan

**Goal:** Caso propio Drokex y escena conceptual Red / Detalle / Plataforma.
**Architecture:** DrokexCase aislado; DrokexNetwork gestiona vistas y carga;
DrokexNetworkScene renderiza GLB v4 sin mutar el cache compartido.
**Tech Stack:** Next 15, React 19, CSS Modules, R3F/drei, Three.js, Blender,
Vitest, Playwright y lucide-react existentes.
**Spec:** docs/superpowers/specs/2026-09-22-drokex-phase-5-design.md, aprobada.

## Restricciones

Solo Drokex. Sin dependencias, cambios al repo de marca, servicios, commit,
push o deploy. Preservar originales y cambios previos. Sin Fase 6.
Sin metricas inventadas; participacion segun CV, no autoria exclusiva.

## Tarea 1 - Evidencia y Blender (agente principal)

- [x] Capturar /productos y /directorio publico desktop/movil, sin cuentas ni
  enviar formularios. Assets /projects/drokex-products-v4.webp,
  drokex-directory-v4.webp y drokex-directory-mobile-v4.webp.
- [x] Inspeccionar Blender por MCP; clonar drokex Brand v3 y materiales.
- [x] Crear blender/refine_drokex_v4.py con globo mecanico, juntas, soportes,
  kioscos y muestras; exportar cinco capas y conservar dimensiones de ciudad.
- [x] Guardar blender/output/drokex-v4/drokex-network-v4.blend.
- [x] Renders /experience/drokex-network-v4.webp, drokex-detail-v4.webp,
  drokex-hero-wide-v4.webp y drokex-hero-mobile-v4.webp. Inspeccion visual.
- [x] /models/workshop/drokex-interactive-v4.glb <=3MB y <=80k triangulos.

## Tarea 2 - Caso y visor (implementador)

Crear drokex-case.tsx, drokex-case.module.css, drokex-case.test.tsx,
drokex-network.tsx, drokex-network.module.css, drokex-network-scene.tsx en
apps/web/modules/projects/components/portfolio-case.
Usar PortfolioCaseProps existente; exportar DrokexCase y DrokexNetwork.
Vistas 'network' | 'detail' | 'platform', region 'Comercio conectado.',
id del escenario drokex-study; botones Red, Detalle, Plataforma,
Explorar red en 3D, Restablecer red, Cerrar red 3D.

- [x] Escribir pruebas RED para caso propio/foco, tres vistas sin canvas,
  fallback sin WebGL, anterior 4U y retorno; npx vitest run.
- [x] Implementar hero a sangre, atribucion CV y capturas reales; conectar
  router component.tsx y solo version drokex en blender-pavilion.tsx.
- [x] Scene con fachada oculta; detalle retira cubierta, camara interpolada;
  movimiento reducido instantaneo, DPR <=1.5 y demand rendering.
- [x] Activacion opt-in con foco en cierre, flechas/Home, reset/cierre,
  poster, error boundary y Suspense dentro/fuera del canvas, contextlost,
  desmontaje fuera de pantalla y cambio a captura.
- [x] Pruebas GREEN y TypeScript/ESLint. No refactorizar otros casos.

## Tarea 3 - Verificacion y cierre

- [x] Crear verify-drokex-phase-5.cjs siguiendo QA 4U con nombres anteriores;
  Chrome 1440/1920/390/320, canvas/pixeles, giro, teclado, reset, foco, retorno,
  sin overflow y targets >=44px. Capturas phase5-*.png.
- [x] Sin WebGL, GLB fallido, contextlost y reduced motion.
- [x] Navegar 4U -> Drokex -> 4U, volver a ciudad; regresion otros tres casos.
- [x] Suite completa npx vitest run --silent, npx tsc --noEmit, ESLint de
  archivos editados, git diff --check y revision independiente.
- [x] Documentar evidencia/limites, mantener servidor local en puerto libre.

## Registro

Ejecucion en workspace actual para preservar cambios acumulados aprobados.
Sin commits de tarea: restriccion explicita del alcance aprobado.

Cierre: docs/product/portfolio-3d-evidence/drokex-phase-5.md.
Revision inicial realizada; hallazgo corregido con prueba RED/GREEN. Segunda
revision independiente no disponible por limite de uso, documentado en evidencia.
