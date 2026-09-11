# Ciudad de proyectos — Fase 1

**Goal:** Rehacer portada y selección como una maqueta 3D coherente del trabajo de Daniel.
**Architecture:** PROJECTS conserva contenido y capturas; CITY_ASSETS conserva modelos e IDs. Experience administra selección y preview; CityNavigator presenta la misma selección y encuadra la cámara. ExperienceGate conserva selección al volver del dossier.
**Tech Stack:** Next.js 15 instalado, React 19, R3F 9, drei 10, Three.js 0.171, CSS Modules, Vitest y Playwright existente.
**Spec:** docs/product/design-review-2026-09-10.md. Dirección aprobada por Daniel: «me parece ... agreg[a]rle algo de 3d ... empecemos».

## Restricciones

- Esta fase abarca portada y selección; no rediseña dossiers ni incorpora rutas compartibles todavía.
- Conservar datos y capturas. No publicar ni provisionar servicios.
- Sin iconos emoji ni nuevos paquetes. Controles textuales accesibles.
- Una sola ciudad real; sin imágenes de fondo de otra ciudad ni efectos ambientales continuos.
- Móvil y fallos WebGL mantienen lista, preview y acceso a casos.

## Dirección visual

Piedra #e5e7e2, papel #f4f5f1, carbón #242b29, texto secundario #626b64, selección #28664f. Usar Geist existente con jerarquía moderada; sin palabras neón ni microetiquetas decorativas. Escena con suelo/plataformas de piedra, cristal gris y edificios mate. Materiales de vista clonados; no modificar GLB originales. Animación de cámara breve solo al seleccionar o restaurar vista, instantánea con movimiento reducido.

## Tareas

- [x] Pruebas de selección: seleccionar lista/edificio actualiza preview sin salir; Ver caso abre el ID correcto; contacto y otros proyectos disponibles.
- [x] Sustituir Experience y CSS por cabecera, introducción, lista de proyectos, escena única y preview con captura real. Mantener perfil/contacto breves.
- [x] Rehacer escena con geometría existente, materiales coherentes, sombra, edificios nombrados, edificio procedural Drokex y encuadre controlado. Render a demanda.
- [x] Loader con estado de carga, alternativa sin WebGL y activación optativa en móvil; conservar selección al volver.
- [x] Verificar navegador escritorio/móvil, click en edificio, orbitar, restablecer, dossier y retorno, reducción de movimiento y error WebGL. Inspeccionar capturas.
- [x] Suite, tipos, lint y build; revisión independiente de código. Registrar límites de fase y abrir preview local.
