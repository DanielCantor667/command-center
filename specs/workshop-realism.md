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

## R.0 (hecha 2026-10-29, espera el visto bueno de Daniel)

- Tomas de referencia: 1 entrada (`cam_main` / vista `hub`), 2 escritorio y PC (`cam_desk` / `contact`), 3 pared de proyectos (`projects`), 4 un stand (`corner-lorigine`), 5 Tecnologías (`technologies`).
- Capturas "antes" de la web en los 3 tiers: `command-center-assets/lookdev/before/` (15 PNG, 1600 × 900).
- Look-dev de noche: `blender/lookdev_night.py` (no guarda la escena). Renders en `command-center-assets/lookdev/night-v1/` (`night-main`, `night-desk`, `night-back`), Cycles a 128 muestras, unos 3 min por toma.
  - Fuera los rellenos y el lavado del techo; las lámparas colgantes quedan al 30 %; el monitor, el neón y la lámpara del banco siguen igual.
  - Ventanal: HDRI `shanghai_bund` (Poly Haven, CC0) en lugar del skyline de cajas, inclinado 12° para que no aparezca la gente a nivel de calle; la niebla queda confinada al cuarto (la niebla del mundo tapaba la ciudad).
  - Lo que se ve falso en el render es justo el alcance de R.1: PC de cajas, silla sci-fi, monitor sin brazo, escritorio vacío.


## R.0 aprobada (Daniel, 2026-10-29): "me gusta lo que veo"; pide mejorar el monitor y el PC, y cambiar la silla.

## R.1 (cerrada 2026-10-30)

- Kit del escritorio: `blender/prepare_desk_kit.py` parte "Gaming Desktop PC" (Yolala3D) y "Ultrawide Monitor with Desk Mount" (samhatesham), ambos CC BY y en `CREDITS.md`, en `command-center-assets/kits/desk/{tower,keyboard,mouse,speaker,ultrawide}.glb`: escala en metros, el lado del usuario hacia −X y el origen en la base. Fuera el monitor plano del kit, su tablón, los cables y todos los logos: las mallas de logo se borran; en las texturas, los logos quedan en negro, los centros de los ventiladores se oscurecen y las etiquetas de GPU, fuente y placa se desenfocan; el mouse queda negro mate, sin el patrón de marca.
- Prototipo: cubierta de roble (`oak_veneer_01`, Poly Haven), ultrawide con brazo de pinza, torre con vidrio hacia la sala, teclado mecánico, mouse con pad y dos parlantes. La pantalla muestra en el render el mismo HTML de Contacto (`generated/contact-monitor.png`, captura de Playwright); en la web la cubre la pantalla DOM.
- Renders: `command-center-assets/lookdev/night-v2/` (`night-deskclose`, `night-desk`); `lookdev_night.py` agrega la cámara `deskclose`.
- Silla: "Gaming chair" de Man1ac (CC BY, en `CREDITS.md`), `kits/desk/chair.glb`: pose del rig aplicada, 1,28 m, 54k triángulos, acentos rosados pasados a negro; sin logos en textura. Reemplaza a la "Office Chair" de j.a.m. Render: `command-center-assets/lookdev/night-v3/`.
- Cerrada por Daniel el 2026-10-30 para el escritorio de Contacto. Queda sin hacer lo que R.1 dejaba para después: sillas y mesas del resto del taller al mismo nivel. La integración en la web (horneado, el anchor del monitor DOM cambia de 1,1 × 0,46 m a 0,75 × 0,32 m) pasa a R.2.

## R.1b PC interactiva (propuesta 2026-10-30, Daniel pidió PC con GitHub y terminal)

Referencia: halloween.dev. Probado en vivo hasta el escritorio (el juego apaga el pointer lock en navegadores automatizados, así que el SO no se pudo operar) y leído en sus bundles públicos. Se copia la técnica, no el código.

- **Cómo lo hacen:** el SO es un árbol DOM de tamaño viewport. Mientras se juega va con `os-embedded`: `matrix3d` sobre la pantalla, `inert`, `aria-hidden` y `pointer-events: none`. Al sentarse pasa a `os-full`: el mismo árbol a pantalla completa, sin transformación. Nunca se interactúa con HTML en perspectiva. Las apps cargan bajo demanda (`Terminal`, `Finder`, `Mail`, `Notes`…).
- **Su terminal:** sistema de archivos virtual en un `Map`, tabla `comando -> función`, parser con `|`, `&&` y `||`, historial con flechas y `zsh: command not found`.

Alcance:

1. **Entrada:** clic en el monitor de Contacto (o Enter desde la lista HTML) -> la cámara se acerca -> el SO pasa a pantalla completa (`os-full`). `Esc` o cerrar lo devuelve a la pantalla 3D. Dentro de la escena sigue el `DomScreen` de hoy como vista previa inerte.
2. **SO:** barra superior, dock y ventanas (una a la vez en móvil), iconos `lucide-react`, carga diferida.
3. **Terminal:** `help`, `whoami`, `ls`, `cd`, `cat`, `projects`, `open <proyecto>`, `git log`, `contact`, `clear`, historial con flechas y Tab para completar. Archivos virtuales generados desde `PUBLIC_PROFILE`, `PORTFOLIO_CAREER` y los proyectos: nada escrito a mano que pueda desincronizarse. Se usa como foco real un `<input>` visible, para móvil y lectores de pantalla.
4. **GitHub:** repos públicos, lenguajes y última actividad reales, desde una foto generada en build (JSON). Si falta: "sin datos". Sin gráfica de contribuciones (exige token).
5. **Proyectos y Contacto:** reutilizan los casos y datos existentes.
6. **Accesibilidad:** `inert` y `aria-hidden` solo mientras está embebido; foco atrapado y devuelto al salir; el panel de Contacto sigue siendo la vía simple. `prefers-reduced-motion`: sin zoom de cámara.
7. **Tests:** Vitest para el parser y los comandos de la terminal; Playwright para abrir, escribir y salir, en escritorio y móvil.

Fuera de alcance: login o contraseña, modo Claude simulado, cámaras, correo, sistema de archivos editable, multiventana en móvil.

Dependencia: el monitor de la web sigue siendo el de 1,1 × 0,46 m hasta rehornear con el kit nuevo, así que el anchor `MONITOR` se mueve en R.2, no en R.1b. El SO a pantalla completa no depende de ese anchor.
