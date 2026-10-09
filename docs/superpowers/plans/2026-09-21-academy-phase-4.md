# 4U Studio Academy - Fase 4 Implementation Plan

**Goal:** Convertir el estudio conceptual 4U en un caso propio con recorrido 3D.
**Architecture:** AcademyCase aislado en el router existente. AcademyStudio carga
su canvas bajo demanda; AcademyStudioScene usa el GLB v4 sin mutar el cache.
**Tech Stack:** Next 15, React 19, TypeScript, R3F/drei, Three.js, CSS Modules,
lucide-react, Vitest, Playwright, Blender/Cycles. Sin dependencias nuevas.
**Spec:** Direccion aprobada por Daniel con "apruebo": Dentro del estudio;
Estudio -> Instrumentos -> Academia; materiales realistas, grafito/blanco y
naranja puntual, camaras suaves, sin sonido automatico ni scroll forzado.

## Restricciones

Solo 4U. Kliniu, L'ORIGINE y Drokex mantienen su comportamiento. Sin deploy,
commit, push, nuevas cuentas ni cambios al repositorio de marca. No consultar
cuentas privadas ni enviar formularios. Sin metricas inventadas. La escena
es conceptual, no representa la sede real. Conservar v3 y otros cambios locales.

## Tarea 1 - Blender y evidencia

Crear blender/refine_academy_v4.py; consumir academy Brand v3 de
blender/output/brand-pavilions-v3/brand-pavilions-v3.blend. Exportar
apps/web/public/models/workshop/academy-interactive-v4.glb con las capas
structure/roof/facade/feature/interior, salvo fachada oculta en las vistas
de estudio. Conservar dimensiones y orientacion existentes para la ciudad.

- [x] Inspeccionar objetos/materiales con MCP; clonar escena y materiales.
- [x] Refinar piano, guitarra, microfono, metal y tela acustica; luz legible.
- [x] Guardar blender/output/academy-v4/academy-studio-v4.blend y renders
  Cycles de estudio, instrumentos y portadas desktop/mobile.
- [x] Inspeccionar renders, convertir a WebP y verificar GLB/capas/peso.
- [x] Capturas publicas de https://4ustudioacademy.com/ y su oferta de lecciones,
  en escritorio y movil, sin modales promocionales ni cuentas privadas.

## Tarea 2 - Caso y visor

Crear academy-case.tsx, academy-case.module.css, academy-case.test.tsx,
academy-studio.tsx, academy-studio.module.css y academy-studio-scene.tsx en
apps/web/modules/projects/components/portfolio-case. Seguir patrones existentes
sin extraer ni refactorizar los visores de las otras marcas.

- [x] Pruebas rojas para caso propio, tres vistas, fallback sin WebGL, retorno
  y navegacion al siguiente caso. Ejecutar con npx vitest run.
- [x] Hero a sangre y marca visible, composicion editorial tipografica, renders
  con encuadres completos, capturas reales y descripcion sin resultados ficticios.
- [x] Recorrido Estudio / Instrumentos / Academia con aria-pressed y escenario
  de altura estable. Instrumentos retira roof/facade y aproxima camara.
- [x] Canvas lazy opt-in, Suspense y boundary dentro/fuera del canvas, poster
  durante carga, fallback ante error/contextlost, desmontaje fuera de pantalla.
- [x] Orbit, reset, cierre con foco restaurado, flechas/Inicio accesibles,
  reduced motion, demand rendering y DPR maximo 1.5.
- [x] Router deriva 4ustudio-academy a AcademyCase; solo la version del modelo
  academy cambia en blender-pavilion.tsx. Resto de proyectos intacto.

Activos consumidos:
/experience/academy-studio-v4.webp, academy-instruments-v4.webp,
academy-hero-wide-v4.webp, academy-hero-mobile-v4.webp;
/projects/academy-home-v4.webp, academy-lessons-v4.webp,
academy-lessons-mobile-v4.webp.

## Tarea 3 - Verificacion y cierre

- [x] Vitest de casos/experiencia/gate, tsc y ESLint de cambios, diff-check.
- [x] Chrome real 1440/1920/390/320: screenshots, canvas no vacio, camara,
  drag, teclado, reset, cambio a captura, cierre/foco y navegacion entre casos.
- [x] Sin WebGL, modelo fallido, contexto perdido y reduced motion.
- [x] Regresion de L'ORIGINE y Kliniu, revision independiente de codigo.
- [x] Evidencia y limites documentados; local http://localhost:3001 si libre.
  No iniciar Fase 5 sin aprobacion.
