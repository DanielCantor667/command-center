# Spec: Taller de robótica (rediseño del workshop 3D)

> Aprobado por Daniel el 2026-10-26. Sustituye el hub actual y las 4 salas de proyecto del módulo
> `apps/web/modules/workshop-game` por una sola sala: un taller de robótica realista donde viven
> todos los proyectos y tecnologías.

## Objetivo

Que el taller se vea como un espacio real (texturas PBR, luz cálida + acentos cian, robots y un gato
animados) y que todo el portafolio esté dentro de él de forma interactiva y conectada.

## Decisiones

| Tema | Decisión |
| --- | --- |
| Forma | Cuarto cerrado de 6 × 5 × 3,2 m; la pared frontal no se dibuja (entra la cámara). |
| Salas de proyecto | Se eliminan las 4 salas (`room-*.glb`) y sus portales. Los proyectos viven en la sala. |
| Proyectos | Pared de pantallas sobre el escritorio (pared derecha), una por proyecto de `PROJECTS`. Captura real si existe en `public/projects/`; si no, solo el nombre (nunca una captura inventada). Clic → lector de caso existente. |
| Tecnologías | Muro de placas sobre el pegboard (pared izquierda): una placa por entrada de `PORTFOLIO_TECHNOLOGIES`, una fila por categoría de `TECHNOLOGY_CATEGORIES`. Logo local si existe, iniciales si no (regla actual del estante). |
| Conexión | Señalar un proyecto ilumina sus tecnologías (`projectIds`) y viceversa. Drones y gato reaccionan al foco. |
| Trayectoria | Pizarra con ruedas en la sala; abre la estación `trajectory` existente. |
| Contacto | Escritorio con monitor ultrawide; abre la estación `contact` existente. |
| Licencias | CC0 (Poly Haven, Quaternius) y CC BY (Sketchfab) con crédito en `CREDITS.md` y en la web. Sin cláusulas no-AI / no-reventa. |

## Requisitos no funcionales

- Peso total de la sala en la web ≤ 10 MB (GLB + texturas), meshopt + KTX2.
- Luz y AO horneados; pocas luces dinámicas. `frameloop` continuo solo mientras el taller es visible.
- Móvil usable (DPR adaptativo, menos animaciones).
- Accesible: cada pantalla/placa interactiva tiene alternativa navegable por teclado (explorador HTML actual).
- Nunca datos fabricados: métricas, capturas y relaciones salen de `apps/web/data/`.

## Fases

| Fase | Alcance | Estado |
| --- | --- | --- |
| A | Arte en Blender (`blender/prototype_workshop_room_v2.py`, texturas de datos con `blender/generate_lab_textures.py`): composición, pared de proyectos, muro de tecnologías, pizarra, texturas y sombras. | Hecha, pendiente de visto bueno |
| B | Optimización y export: reducir polígonos, KTX2, meshopt, horneado, `CREDITS.md`. | Pendiente |
| C | Integración web: cargar la sala en `workshop-game`, retirar salas/portales. | Pendiente |
| D | Interacción: hover/clic, iluminación cruzada, reacciones, móvil. | Pendiente |
| E | Verificación con Playwright sobre build de producción (fps, peso, móvil). | Pendiente |

No se avanza de fase sin luz verde explícita.

## Assets

Fuera del repo en `~/Documents/command-center-assets/` (`polyhaven/`, `sketchfab/`, `scifi-essentials/`).
Sketchfab (CC BY): Black Honey – Robotic Arm (re1monsen), Industrial robot arm (olofunot),
Mech Drone (Willy Decarpentrie), K07 Drone (KBM7), An Animated Cat (Evil_Katz).
