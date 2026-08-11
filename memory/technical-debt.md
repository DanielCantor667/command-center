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

## Historial resuelto: roadmap original y línea de producto 3D

Problema histórico: `ROADMAP.md` conservaba una secuencia CRM original, mientras el desarrollo
activo produjo un sistema de oficinas 3D que no figuraba en esas fases.

Impacto histórico: no existía una única fuente de verdad para priorización de producto.

Prioridad: Alta

Resolución: Product Clarity eliminó la ambigüedad. Command Center es un sistema de evidencia
explorable de la ingeniería de Daniel; la ciudad 3D es una puerta de descubrimiento y el workspace
aporta profundidad sobre la misma evidencia. CRM dejó de ser un roadmap activo. El contexto previo
se conserva como historial en el registro de referencias documentales.

Estado: Resuelto — la dirección activa y el roadmap unificado están documentados en Product Clarity.
