# L'ORIGINE - Fase 3 Implementation Plan

**Goal:** Refinar la galeria Blender y crear un caso editorial propio con recorrido 3D.
**Architecture:** PortfolioCase deriva lorigine a LorigineCase. Un visor aislado y
cargado bajo demanda muestra el GLB v4 en Galeria/Detalle; Sitio usa captura real.
No se modifica el visor ni la entrada cinematografica de Kliniu.
**Tech Stack:** Next 15, React 19, R3F/drei, Three.js, CSS Modules, lucide-react,
Vitest, Playwright y Blender 5.1.2.
**Spec:** Alcance propuesto y aprobado con "dale": L'ORIGINE exclusivamente,
materiales/envases/iluminacion, recorrido propio, caso real y verificacion movil.

## Restricciones

No nuevas dependencias, servicios, sonido, commit, push ni deploy. No tocar 4U o
Drokex. Conservar originales Blender v3 y cambios previos. Repositorio de marca
solo lectura. Sin claims capilares, metricas ni interiores privados inventados.
La galeria es conceptual, no representa una tienda construida.

## Direccion

Base mineral fria #edf0ee, papel #fafbfa, tinta #222b28, verde #466355 y linea
#c7d0c9. Ambar y laton solo en objetos. Texto sans existente y marca de exhibicion
serif. Hero a sangre con render completo y nombre de marca; secciones sin tarjetas.
Galeria completa, encuadre de detalle y captura real son estaciones navegables,
sin scroll secuestrado ni animacion continua. Tamano fijo por breakpoint.

## Tarea 1 - Activos

Crear blender/refine_lorigine_v4.py. Consumir solo lorigine Brand v3 desde
brand-pavilions-v3.blend. Exportar lorigine-interactive-v4.glb con cinco capas y
lorigine-gallery-v4.webp / lorigine-detail-v4.webp desde Cycles.

- [x] Clonar escena y materiales, mejorar acabado de piedra, envases y herrajes.
- [x] Guardar .blend independiente; inspeccionar renders y GLB con nombres de capas.
- [x] Capturar catalogo y ficha publicos actuales en escritorio y movil.

## Tarea 2 - Caso y recorrido

Crear lorigine-case.tsx/.module.css y lorigine-gallery.tsx/.module.css/scene.tsx
en modules/projects/components/portfolio-case. Modificar solo el router de casos
y la version de L'ORIGINE en blender-pavilion.tsx.

- [x] Pruebas rojas: caso propio, retorno, siguiente caso, estaciones sin WebGL,
  fallo de contexto y acceso a la captura real.
- [x] Hero de marca, galeria con render completo, evidencia y decisiones
  verificadas (filtros en URL, tokens y movimiento reducido). Mantener tecnologias
  y navegacion entre proyectos. Corregir la afirmacion obsoleta "sin carrito".
- [x] Visor opt-in, Suspense y error boundary dentro del canvas, deteccion de
  visibilidad, DPR 1-1.5, frameloop demand, movimiento reducido, orbit/reset y
  cierre con restauracion de foco. Detalle usa el mismo GLB sin fachada/techo.
- [x] Estados tienen dimensiones estables, controles 44px, aristas/recursos propios
  liberados, poster permanente hasta completar carga y fallback ante error.

## Tarea 3 - Verificacion

- [x] Vitest de casos/experiencia/gate, tsc, ESLint y diff-check.
- [x] Chrome 1440/1920/390/320: capturas, pixeles no vacios, cambio de camara,
  arrastre, reset, teclado, retorno, siguiente caso y ausencia de desbordamiento.
- [x] WebGL ausente, movimiento reducido, GLB abortado y perdida de contexto.
- [x] Repetir flujo Kliniu para comprobar que no se altera.
- [x] Documentar evidencia y dejar URL local. Sin avanzar a otra marca.

## Cierre - 21 de septiembre de 2026

Evidencia y limites: docs/product/portfolio-3d-evidence/lorigine-phase-3.md.
26 pruebas unitarias, Chrome real y regresion de Kliniu. Revision de teclado
corregida con prueba roja/verde. Renders adicionales de portada adaptados al
encuadre horizontal y vertical. Disponible en http://localhost:3001.
