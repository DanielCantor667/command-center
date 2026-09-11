# Deuda técnica

## Propósito

Registro de deuda técnica conocida en el proyecto y su resolución planeada. Toda deuda detectada fuera del alcance de una tarea se documenta aquí en lugar de corregirse de forma no solicitada.

## Formato

```
## Título del problema

Problema:

Impacto:

Prioridad: Alta | Media | Baja

Solución futura:

Estado: Abierto | En progreso | Resuelto
```

## Instancias GLB compuestas en Blender

Problema: el importador aplica posición, rotación y escala únicamente al primer objeto devuelto
por Blender después de importar un GLB. Los assets generados pueden contener varias mallas
hermanas.

Impacto: al transformar una instancia, sus piezas pueden separarse o permanecer en el origen. El
PNG y GLB se producen técnicamente, pero el ensamblado visual no es confiable para escenas
complejas.

Prioridad: Alta

Solución futura: crear un root vacío por `SceneObject`, parentar todas las mallas importadas
preservando sus matrices locales y transformar el root. Cubrir con una prueba headless de
traslación, rotación y escala.

Estado: Resuelto — el importador crea un root por instancia y `pnpm blender:test` valida un asset
compuesto.

## Ruido de canvas y Three.js en tests

Problema: JSDOM informa que `HTMLCanvasElement.getContext` no está implementado durante algunas
pruebas de accesibilidad. Algunos módulos también avisan que existen múltiples instancias de
Three.js.

Impacto: las suites pasan, pero el ruido puede ocultar fallos nuevos y dificulta interpretar el
CI.

Prioridad: Media

Solución futura: proporcionar un mock de canvas específico para tests y revisar la resolución de
dependencias para garantizar una sola instancia de Three.js.

Estado: Abierto.

## Roadmap original y línea de producto 3D

Problema: `ROADMAP.md` conserva la secuencia CRM original, mientras el desarrollo activo produjo
un sistema de oficinas 3D que no figura en esas fases.

Impacto: no existe una única fuente de verdad para priorización de producto.

Prioridad: Alta

Solución futura: decidir formalmente si la línea 3D reemplaza, precede o convive con CRM y publicar
un roadmap unificado.

Estado: Resuelto documentalmente el 10 de septiembre de 2026 — definición aprobada en Product Clarity y roadmap activo alineado al portafolio.
