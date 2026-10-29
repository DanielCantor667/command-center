# Spec: Realismo del taller (nivel halloween.dev)

> Plan 2026-10-29, decisiones tomadas (ver abajo). Cada fase espera luz verde. Continúa `specs/workshop-lab.md`
> (fases A–E y las pantallas DOM y tiers KTX2 del 2026-10-29). No se implementa nada sin luz verde por fase.

## Objetivo

Que el taller se vea **fotográfico**, como "The Last Deploy" (halloween.dev), y no como un diorama. Eso incluye el
PC, las sillas, los escritorios y cada objeto que la cámara ve de cerca. Al mismo tiempo se suman los puntos 3–6 del
análisis: post-proceso por calidad, audio espacial, recorrido en primera persona y WebGPU.

## Qué hace que halloween.dev se vea real (y qué nos falta)

Análisis de su portada (`title/office-1600.webp`) y de su bundle de producción:

| Factor | halloween.dev | Taller hoy | Brecha |
| --- | --- | --- | --- |
| Luz | Low-key de noche: casi todo en penumbra; la luz viene de fuentes que se ven (monitor, lámpara, ciudad tras el ventanal). Contraste alto, paleta azul/naranja. | Luz horneada pareja; todo se ve, poco contraste. | **La mayor** |
| Materiales | PBR con `lightMap` + `envMap`: el lightmap da la luz y el material conserva rugosidad y reflejos que cambian con la cámara (pantallas, escritorio, ruedas de la silla). | `MeshBasicMaterial` con el bake *Combined*: luz y color pegados, sin reflejos ni brillo especular. Se ve "pintado". | Alta |
| Assets | Modelos reales a escala real: silla ergonómica, brazo de monitor, iMac, teclado, mouse, deskmat, audífonos, taza, celular, post-its. | PC de cajas, silla de Quaternius (low-poly estilizado), props mezclados de estilos distintos. | Alta |
| Densidad | Cada escritorio tiene 8–12 objetos pequeños creíbles. | Escritorio de Contacto casi vacío. | Media |
| Cámara | Altura de ojo (~1,2–1,6 m), FOV estrecho, encuadre bajo. | 1,5–1,6 m, FOV 54 con planos abiertos. | Media |
| Post | DoF (bokeh), bloom, AO, FXAA, grano, viñeta y gradación de color, según la calidad. | Solo bloom (sin bloom en móvil). | Media |
| Sonido | Web Audio sintetizado + paneo HRTF 3D. | Una pista ambiente en bucle (`hub-v1.mp3`). | Media |

Conclusión: el salto de calidad lo dan **luz + materiales + assets**, no el motor. WebGPU es lo que menos aporta.

## Fases

| Fase | Alcance | Criterio de aceptación |
| --- | --- | --- |
| **R.0** Dirección de arte | Fijar el ambiente (ver preguntas), 5 tomas de referencia (entrada, escritorio/PC, pared de proyectos, un stand, Tecnologías) y capturas "antes" en los 3 tiers. | Daniel aprueba un render de Blender de la toma del escritorio antes de pasar a R.1. |
| **R.1** Assets fotográficos | Escritorio de Contacto como *hero*: escritorio real, silla ergonómica, monitor(es) con brazo, PC (según la respuesta a la pregunta 2), teclado, mouse, deskmat, lámpara, audífonos, taza, celular, cables. Después: sillas y mesas del resto del taller con el mismo nivel. Escala real en metros, PBR (albedo/normal/ORM), ≤ 60k triángulos por objeto *hero*. | Cada objeto pasa a un render de Blender junto a la referencia sin que desentone. Licencias en `CREDITS.md`. |
| **R.2** Luz y materiales | Rehorneado con el ambiente elegido: fuentes visibles (monitores emisivos, lámparas, neón, ventanal). El bake se separa en **lightmap de irradiancia** (sin color) + materiales PBR en runtime (`MeshStandardMaterial` con `lightMap` + `envMap` PMREM de un HDR propio del cuarto). Superficies brillantes (pantallas, escritorio, piso, metales) con reflejos reales. Tone mapping AgX en three, en vez de traerlo horneado. | En la toma del escritorio se ve el reflejo del monitor sobre el escritorio y cambia al mover la cámara. Peso dentro del presupuesto (pregunta 4). |
| **R.3** Post por calidad (punto 3) | Cadena `RenderPass → bloom → BokehPass (DoF, enfocado en el objetivo del foco) → gradación (LUTPass) + viñeta + grano → OutputPass + FXAA` con passes de `three/examples` (sin dependencias nuevas). `high` todo; `medium` sin DoF; `low` solo gradación y viñeta. Se mantiene el detector de lentitud actual (`SLOW_FRAME_MS`). | ≥ 50 fps en el Mac de Daniel en `high`; ≥ 30 fps en móvil en `low` (build de producción). |
| **R.4** Audio espacial (punto 4) | Web Audio en `workshop-audio.ts`: cama ambiente + fuentes 3D con `PannerNode` HRTF (ventilador del PC en el escritorio, servos de los robots que caminan, ronroneo del gato, zumbido del neón, lluvia si el ambiente es de noche). Sigue apagado por defecto y solo arranca con gesto del usuario. | El sonido cambia de lado y de volumen al mover la cámara. Con "Sonido" apagado no se crea ningún `AudioContext`. |
| **R.5** Primera persona (punto 5) | Modo opcional "Explorar libre" junto al recorrido guiado: WASD + mouse con pointer lock en desktop, joystick táctil en móvil, ojos a 1,6 m, colisión contra una grilla 2D exportada de Blender (huellas del bake), mira central + clic/E para interactuar. El recorrido guiado y las listas HTML siguen siendo la vía accesible. | Ninguna pared ni mueble se atraviesa (test de la grilla con Vitest). Esc sale del pointer lock sin romper la navegación por teclado. |
| **R.6** WebGPU (punto 6) | **Evaluación, no migración**: prototipo detrás de `?renderer=webgpu` con `WebGPURenderer` (three 0.171 ya lo trae) y fallback a WebGL2. Exige rehacer el post de R.3 en TSL porque `EffectComposer` no funciona en WebGPU. Solo se adopta si mide mejor que WebGL2 en R.3. | Informe con fps de ambos renderers en las 5 tomas; decisión de Daniel. |
| **F** Verificación | Fase existente: Playwright sobre build de producción en los 3 tiers (fps, peso, móvil). | Igual que en `workshop-lab.md`. |

Orden: R.0 → R.1 → R.2 (el bake depende de los assets) → R.3 → R.4 → R.5 → R.6 → F. R.3 y R.4 pueden adelantarse si R.1 se atasca por los assets.

## Bases (`~/.claude/BASES.md`)

- **2 Requerimientos:** fuera de alcance: multijugador, guardado de posición en primera persona, mods. R.6 no se adopta sin medición.
- **3 Reglas:** nunca datos ni capturas inventados (regla actual); los objetos pueden ser genéricos, pero nada con marca o logo de terceros visible (Apple, Herman Miller…): se quitan del modelo o de la textura.
- **7 Frontend/UX:** el modo libre no reemplaza el recorrido; `prefers-reduced-motion` desactiva DoF animado, cabeceo de cámara y paneos automáticos.
- **10 Seguridad:** sin cambios (sitio estático). Los modelos de terceros se revisan antes de entrar al repo (licencia, sin scripts).
- **11 Testing:** Vitest para la grilla de colisión, la selección de tier/post y el ciclo de vida del audio; Playwright para tomas y fps.
- **12 Errores:** cada asset nuevo es opcional (`OptionalBoundary`), salvo la sala esencial; si falla el post o el audio, el taller sigue.
- **13 Performance:** presupuesto por tier (pregunta 4); `frameloop` bajo demanda salvo en modo libre.
- **15 Deploy:** los `.blend` y los assets fuente siguen fuera del repo; solo entran los GLB por tier.

## Fuentes de assets

1. **Poly Haven** (CC0): se revisa primero, porque no exige crédito.
2. **Sketchfab CC BY**: Daniel los descarga a mano (Chrome bloquea las descargas programáticas). Nada con cláusulas no-AI o no-reventa.
3. **Generación 3D con Magnific** (`models3d_generate`): solo como respaldo para objetos pequeños de fondo; nunca para el escritorio principal.

## Decisiones (Daniel, 2026-10-29)

1. **Ambiente:** taller de noche low-key. Penumbra; la luz viene del monitor, las lámparas, el neón y un ventanal con la ciudad de noche y lluvia.
2. **PC:** monitor ultrawide curvo con brazo, torre con vidrio templado y RGB tenue, teclado mecánico, mouse y deskmat.
3. **Primera persona:** modo opcional "Explorar libre"; el recorrido guiado sigue siendo la vía principal.
4. **Peso:** tier `high` hasta 25 MB (esencial ≤ 12 MB); `medium` y `low` ≤ 15 MB.

Estado: plan escrito; **R.0 sin luz verde**.
