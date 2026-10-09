# Sprint 7 — Phase 7.2: taller base Blender

Estado: implementación local terminada y validación técnica completa; revisión visual disponible para Daniel. Autorizado por Daniel con «lo veo bien, continúa con la fase 7.2», 7 de octubre de 2026. Ejecución local; no autoriza Phase 7.3, commit, push o deploy.

**Goal:** sustituir la geometría de prototipo por un taller Blender editable y optimizado, conservar los controles y verificar el GLB ejecutado en navegador frente al concepto aprobado.

**Architecture:** fuente maestra Blender, exportación shell/puerta separados, materiales PBR compartidos, manifiesto con métricas y pivotes. R3F carga los GLB como recursos esenciales; mantiene estados/cámara/hotspots HTML y los casos existentes. El poster y previews se obtienen de la misma escena. No hay nuevas dependencias ni servicios.

**Spec:** [propuesta aprobada](2026-10-07-portafolio-taller-jugable-propuesta.md), Phase 7.2, producción Blender y performance. [Validación de base 7.1](../../product/workshop-game-evidence/phase-7-1-validation.md).

## Límites globales

- Nave central, acceso, kit, mezzanine como arquitectura, mesa/maqueta y zona existente Kliniu. Otras salas completas y tecnologías/archivo interactivos corresponden a 7.3/7.4.
- Mismos puntos/cámara/rutas que 7.1: altura 1.65 m, pasillo frente a mesa z=3 libre, front z=8, back z=-10, x±9.6.
- Mantener callbacks con token, foco, reintento, contexto perdido durante Suspense, reduced motion y fallback HTML.
- Recursos propios; sin descarga de assets externos, sin HDRI remoto, sin instalaciones.
- Presupuesto de assets esenciales: máximo 5 MB para perfil móvil y 8 MB desktop. Objetivo shell <3 MB sin contar la maqueta reutilizada, puerta <100 KB, shell <80k triángulos y batches por material. Medir coste total y render real, no declarar fps sin medir.
- DPR máximo 1 móvil / 1.5 desktop. Un canvas principal, render bajo demanda y pausa en pestaña oculta.
- Conservar cambios previos del checkout `codex/portfolio-realistic-modeling`. BLUEPRINT no se encontró; reutilizar contratos y convenciones existentes.

## Task 1 — Producción Blender (agente blender_workshop)

**Files:** create `blender/generate_workshop_game.py`, `blender/scenes/workshop-game-v1.blend`, `apps/web/public/models/workshop-game/workshop-shell-v1.glb`, `workshop-door-v1.glb`, manifiesto/previews en `docs/product/workshop-game-assets/`.

- [x] Construir un kit modular propio de suelo/paredes/pilares/ventanas/puerta/mesa/lámparas/plantas con materiales compartidos. La apariencia debe acercarse a concreto, acero verde, madera y luz del mockup, no a bloques planos.
- [x] Añadir detalle mediante geometría contenida, materiales compatibles exportados y texturas propias pequeñas cuando aporten. No usar ruido Blender no horneado como si fuese a conservarse en GLB.
- [x] Shell origen [0,0,0]; puerta local al suelo con ancho 3.6, alto4.3, pivot [0,0,0], colocada por web en [-1.8,0,8.05] y animada a x=-7.4. Blender→glTF conserva ejes mediante conversión explícita desde coordenadas Three.
- [x] La maqueta Kliniu existente puede ir en shell como objeto de mesa optimizado, sin sustituir el caso real. Nombrar batches y objetos interactivos; otras salas no se construyen.
- [x] Exportar GLB con geometría aplicada, UV/materiales texturados compatibles, agrupar batches para contener draw calls; guardar .blend editable antes de previews. Registrar bytes, triángulos, materiales, licencia propia, coordenadas y previews.
- [x] Validar que ambos GLB contienen geometría/materiales reales y no pierden textura/pivote. Renderizar previews de entrada/interior desde la misma fuente, para contrastar con web.

## Task 2 — Integración R3F (root)

**Files:** replace `apps/web/modules/workshop-game/workshop-geometry.tsx`; create `workshop-assets.ts` y helper de preparación del modelo si hace falta; modify `world-scene.tsx` y poster del componente.

- [x] Definir URLs/ids/poses de resources en módulo ligero, consumido por carga y reintento. Reintentar limpia todos los recursos esenciales del taller, no solo el GLB antiguo.
- [x] Sustituir bloques por clones de modelos GLB; conservar recursos compartidos del cache sin disponer geometría/materiales que use otra instancia. Separar puerta móvil del shell fijo.
- [x] Conservar acciones HTML y puntos de 7.1. No introducir navegación de salas nuevas ni mover rutas por inferencia.
- [x] Iluminar con ambiente/reflexión local y una sombra principal; revisar vidrio, acero, madera y emisivos sobre GLB. No depender de Environment presets remotos.
- [x] Sustituir poster por imagen de la escena maestra o frame web limpio de controles, con nombre nuevo para evitar cache de la imagen previa.
- [x] Primer frame/listener GPU conservan sus responsabilidades dentro/fuera de Suspense. El loader no termina antes del shell y puerta.

## Task 3 — QA del nuevo recurso y coste (agente qa_phase_7_2)

**Files:** create `docs/product/workshop-game-evidence/verify-phase-7-2.cjs`, resultados y capturas `phase72-*`.

- [x] Extender el recorrido real de 7.1 a shell/puerta nuevos: 404/retry de cada asset, pérdida de GPU mientras shell o puerta están pendientes, cancelación, camera restore, foco, enlaces e historial.
- [x] Chrome 1920×1080,1440×1000,390×844,320×568, reduced-motion y sin WebGL. Medir bytes transferidos de assets y tiempos de entrada; analizar rendimiento durante un recorrido real con perfil/dispositivo claramente identificado.
- [x] Inspeccionar captura de entrada/interior junto al mockup: nave en escala humana, mezzanine, materiales/sombras, detalle, rutas despejadas, puerta, contraste y encuadre móvil. Un render Blender solo no completa el gate.
- [x] Medir renderer (triangles/calls/textures/geometries) mediante captura técnica reproducible, sin contadores inventados ni telemetría visible en UI. Si se precisa una lectura de R3F, acordar helper de diagnóstico dev antes de crearlo.

## Task 4 — Validación y cierre local (root)

- [x] Antes del navegador detener el next dev viejo del puerto3000 e iniciar el checkout actualizado.
- [x] Validación meaningful del contrato de assets/animación y pruebas existentes; Vitest completo, TypeScript, ESLint modificado y diff-check.
- [x] Revisión independiente de código/recursos; corregir fallos importantes y repetir checks afectados.
- [x] Documentar métricas reales, capturas, fidelidad al mockup y límites de móvil emulado/producción. Dejar servidor local para revisión de Daniel.
- [x] Cerrar 7.2 únicamente; 7.3 queda pendiente de autorización.

## Rulings y avance

- Ruling: ejecutar el alcance ya aprobado sin pedir una segunda aprobación del mismo plan. La fase se concreta antes de tocar producto.
- Ruling: producción Blender y QA delegadas, integración root; escrituras separadas por archivos para no pisar cambios compartidos.
- Ruling: no tocar estado ni cámara salvo un defecto observado al integrar recursos; los GLB mantienen su contrato espacial.
- Corrección observada: la entrada x=0 quedaba sobre el borde de la hoja derecha fija y ocultaba media vista. Sólo la pose de entrada pasa a `[-1.8,1.65,14]`, alineada con el centro de la hoja móvil; conserva altura y las poses interiores. El poster usa una toma de fachada más amplia de la misma escena.
- Corrección observada: Canvas reconfiguraba el DPR 1.5 y sobreescribía el límite móvil aplicado dentro de R3F. El perfil DPR se expresa ahora en la prop de Canvas y se actualiza al redimensionar; la QA comprueba el drawing buffer real.
- Corrección de revisión: carga/reintento comparten la misma clave conjunta de shell/puerta; la luz principal se recrea al cambiar de perfil para asignar el tamaño real del mapa de sombras.
- Corrección probada en navegador: alternar la resolución del cubemap retenía un PMREM por resize en Three 0.171 (9→19 texturas tras diez cambios). La resolución de reflexión se elige al montar y permanece estable durante esa visita; DPR y sombras siguen adaptándose. La repetición del mismo caso mantiene nueve texturas y 31 geometrías.

Evidencia final: [validación Phase 7.2](../../product/workshop-game-evidence/phase-7-2-validation.md). Chrome pasó cuatro viewports y 15 escenarios; diez resizes mantienen la memoria estable. Phase 7.3 no se inició.
