# Engineering City Render Pipeline

## Propósito

Este documento gobierna la salida cinematográfica de Engineering City: hero, imágenes de distrito,
tarjetas de proyecto y marketing. No gobierna la exportación GLB web; esa salida se optimiza y se
valida por separado.

Las reglas creativas obligatorias están en
[Engineering City — plan de producción visual](./engineering-city-visual-production-plan.md):
World Bible, Design Language Bible, Camera Bible y Motion Bible.

## Flujo de producción

```text
Brief → AI concept sheet → aprobación de silueta → Blender blockout
→ modelado / kitbashing privado → materiales master → layout y set dressing
→ preset de luz + cámara → render EXR → composición/color → PNG/WebP final → web
```

No se salta una etapa. Un concepto de IA no pasa directamente a web, y un render de viewport no
es un render final.

## Contrato de entradas

Antes de abrir Blender, cada toma tiene un brief de una página con:

- `districtId`, finalidad, tamaño final y si habrá copy superpuesto.
- preset de cámara y composición aprobada.
- landmark y versión de sus assets.
- fuentes de asset y licencia; los comerciales se quedan en el proyecto privado.
- paleta, referencia de escala y qué debe reconocer una persona en miniatura.

## Blender: escena maestra

Cada landmark conserva su `.blend` editable y se genera de forma aislada; el overview reproducible
los importa como GLB de producción en `engineering-city-overview-v1.blend`. La escena de overview
contiene colecciones separadas de `LANDMARKS`, `INFRASTRUCTURE`, `SET_DRESSING`, `ATMOSPHERE` y
`CAMERAS`, materiales master (dark steel, black titanium, smoke glass, wet asphalt y emisión
esmeralda), luces, niebla y el compositor de la toma aérea. No se edita un landmark únicamente
dentro de una toma.

## Render y postproducción

1. Renderizar un EXR lineal de 16 bits desde Blender/Cycles, con pases `Combined`, `Z`, `Mist`,
   `Emission`, `Cryptomatte` y `Denoising Data`.
2. Resolver denoise y composición en Blender; conservar la emisión separada para controlar bloom
   sin lavar los negros.
3. En DaVinci Resolve, aplicar únicamente ajustes de acabado: balance de exposición, contraste,
   curva de verde, vignette muy sutil y nitidez limitada. No rediseñar la escena en post.
4. Exportar master PNG 16 bits y derivados WebP/AVIF; el hero conserva una versión de ancho 2560 px
   y las tarjetas una de 1200 px. Nombrar `district-camera-version-size.ext`.
5. Revisar el derivado web contra el master: negros no aplastados, emisión sin clipping, copy
   legible y archivo dentro del presupuesto de la página.

## Presets de salida

| Salida | Cámara | Resolución master | Formato web | Límite objetivo |
| --- | --- | --- | --- | --- |
| Hero | `hero-aerial-v1` | 5120 × 2880 | AVIF + WebP fallback | <= 900 KB AVIF |
| District hero | `district-portrait-v1` | 3200 × 1800 | AVIF + WebP fallback | <= 500 KB AVIF |
| Project card | `district-portrait-v1` | 1600 × 900 | AVIF | <= 180 KB |
| Architecture sheet | `architecture-sheet-v1` | 2400 × 1800 | PNG | no se publica salvo que sea necesario |

## Gate de calidad

Un render se aprueba solo si:

- sigue Design Language Bible y el preset de cámara sin excepciones no documentadas;
- el landmark es reconocible a 300 px de ancho;
- no incorpora logos, personajes o edificios ajenos que cambien la identidad de la ciudad;
- la licencia de cada fuente está registrada;
- la exportación web conserva detalle en sombras y no afecta LCP de forma injustificada;
- existe un fallback estático y alt text descriptivo para navegación sin WebGL.

## Estructura de archivos propuesta

```text
blender/
  source/                       # privado, no publicar
    landmarks/<district>/
    renders/<district>/exr/
  scenes/engineering-city-v1.blend            # Command Center
  scenes/engineering-city-<district>-v1.blend # otros landmarks
  scenes/engineering-city-overview-v1.blend
  output/engineering-city/
apps/web/public/experience/city/
  command-center-hero.avif
  command-center-hero.webp
  command-center-card.avif
```

`blender/source/` debe estar ignorado por Git o gestionado en almacenamiento privado; contiene
material fuente que puede no ser redistribuible. Los derivados finales sí se versionan/publican
cuando corresponde.
