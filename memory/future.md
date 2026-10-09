# Ideas futuras

## Propósito

Backlog de ideas, trabajo diferido y consideraciones futuras que aún no están planificadas ni forman parte del roadmap activo.

## Alta prioridad

Ideas con impacto directo en el corto plazo, candidatas a convertirse en spec pronto.

## Media prioridad

Ideas relevantes pero sin urgencia inmediata.

### Mejoras 3D del taller con Magnific (propuesta, 2026-10-09)

Estado 2026-10-09: hecha la primera tanda en el workshop-game (7 props y 2 láminas, ver docs/product/workshop-game-props). Sigue abierto: más props por sala, fondos de ventana, vídeo de entrada y la mesa de `?view=portfolio`. Texturas PBR: probada una de concreto y descartada por no mejorar la propia.

Requisito: MCP `magnific` (scope user) cargado y autenticado. Confirmar primero si genera 3D o solo imagen/vídeo.

1. Assets que hoy se ven simples: maqueta de Kliniu en la mesa (dispensadores y foca), props del taller (estantes, cajas, lámparas, plantas, herramientas) y props propios por sala (p. ej. instrumentos para Academy).
2. Texturas PBR: madera de la mesa, suelo de concreto, paredes y metal verde.
3. Imágenes en escena: cuadros y pósters en paredes, fondos de ventana (skyline de Bogotá).
4. Vídeo corto: loop de entrada o teaser de la portada.

Reglas: pasar por el pipeline (`pnpm blender:validate`, `city:assets:validate`), `.glb` ligeros en `public/models`, capturas de proyectos reales sin inventar, sin avanzar de fase sin luz verde. Orden recomendado: maqueta de Kliniu y props de la mesa.

## Ideas

Ocurrencias sueltas que vale la pena preservar, sin compromiso de ejecutarlas.

## Investigación

Temas que requieren evaluación técnica antes de decidir si se implementan.
