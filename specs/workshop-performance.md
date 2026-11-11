# Spec: Rendimiento del taller (entrada y peso en móvil)

> Plan 2026-11-11, a partir de la medición del mismo día. Cada fase espera luz verde de Daniel.
> Continúa `specs/workshop-realism.md`; no cambia el aspecto del tier `high`.

## Objetivo

Que entrar al taller sea rápido y sin tirones, sobre todo en móvil. El taller ya corre bien una vez cargado; el
problema está en los primeros segundos.

## Medición base (2026-11-11, build de producción)

| Caso | Resultado |
| --- | --- |
| Mac M4, Brave, `high`, en reposo y en recorrido | 91–100 fps (tope de la pantalla), p95 ≈ 11 ms |
| Mac M4, primeros 6 s tras entrar | 42 fps de media, 16 frames > 50 ms, **un frame de 1,8 s** |
| iPhone 17 real (Safari) | 60 fps estables (tope de Safari); **tirones y demora al entrar** (reporte de Daniel) |
| Simulación móvil (Playwright, CPU ×4, 4G 9 Mbps, 390 px) | Entrar: **13 s** en `low`, 16 s en `high` |
| Heap JS | 275 MB en `high`, 137 MB en `low` |
| JS inicial de `/` | **624 kB** (chunk de la página 410 kB); `WorldScene` y `PcDesktop` ya son `dynamic()` |

Peso de los GLB (bytes reales dentro del archivo):

| Archivo | `high` | `low` | Detalle |
| --- | --- | --- | --- |
| `lab-baked` | 11,4 MB | 8,7 MB | **Geometría 6,2 MB en ambos** (393k triángulos, 2 mallas, 170 materiales); imágenes 4,9 → 2,1 MB |
| `lab-plants` | 2,0 MB | 2,0 MB | Idéntico en todos los tiers (imágenes 1,4 MB) |
| Total del tier | 18 MB | 13 MB | Los tiers solo reducen texturas; la geometría no cambia |

Los fps de la simulación móvil no sirven: usa la GPU del M4. En un Android de gama media los fps pueden ser
bastante menores que en el iPhone 17, que es de gama alta.

## Fases

| Fase | Alcance | Criterio de aceptación |
| --- | --- | --- |
| **P.1** Precompilar | En `SceneLifecycle` (`world-scene.tsx`), antes de `onReady`: `await gl.compileAsync(scene, camera)` para compilar todos los materiales (también los que están fuera de cámara) y `gl.initTexture()` sobre cada textura cargada, de modo que la subida a GPU ocurra con el panel "Preparando la escena" a la vista. Incluye los passes de post (R.3) del tier activo. Si `compileAsync` falla o el contexto se pierde, se sigue como hoy (sin bloquear la entrada). | Mac `high`, primeros 6 s tras `ready`: ningún frame > 100 ms y ≤ 2 frames > 50 ms. iPhone de Daniel: sin tirones visibles al entrar. Test Vitest: `onReady` se llama después de compilar y también si la compilación falla. |
| **P.2** Peso en móvil | (a) Medir si la entrada espera a plantas y actores; si sí, entrar con `lab-baked` + `lab-emissive` y cargar lo decorativo después. (b) Geometría para `low` (y `medium` si sirve): `gltf-transform simplify` en `compress_workshop_lab.sh` sobre el GLB ya horneado, sin rehornear; si deforma los UV del lightmap (manchas o costuras), alternativa: decimate por objeto en Blender solo en los props más densos. (c) Plantas por tier: texturas a 512 px en `low`. | `low`: descarga total ≤ 8 MB (hoy 13) y esencial ≤ 5 MB. Simulación 4G: entrar en ≤ 7 s (hoy 13). Capturas antes/después en las 5 tomas de `workshop-realism.md` sin diferencias visibles a 390 px. `high` sin cambios. |
| **P.3** JS inicial | Encontrar qué ocupa los 410 kB del chunk de `/` (source maps del build + `npx source-map-explorer`, sin agregar dependencias). Pasar a `dynamic()` lo que el landing no usa. | First Load JS de `/` ≤ 350 kB. Landing idéntico a la vista; tests y build verdes. |

Orden: P.1 → P.2 → P.3. P.1 es la más barata y ataca lo que Daniel notó en el iPhone.

## Cómo se mide (igual antes y después)

1. `npx next build` + `next start` (nunca `next dev`).
2. Mac: Chrome/Brave real, script de `requestAnimationFrame` (fps, p50, p95, frames > 50 ms, máximo) en hub,
   Proyectos, Contacto y Tecnologías, y en los primeros 6 s tras entrar.
3. Móvil simulado: Playwright con CDP (`setCPUThrottlingRate` 4, red 4G 9 Mbps / 150 ms), caché vacía, tiempo
   desde "Entrar al taller" hasta `data-workshop-state="exploring"`.
4. Móvil real: iPhone de Daniel en la red local con un contador temporal `?fps` que no se commitea.

## Fuera de alcance

Rehornear la sala, cambiar el aspecto de `high`, WebGPU (R.6), bajar los 170 materiales/draw calls (solo si P.1–P.3
no bastan en un Android de gama media) y tocar el audio de R.4.

## Bases (`~/.claude/BASES.md`)

- **11 Testing:** Vitest para el orden compilar → `onReady` y para el fallback; medición con el protocolo de arriba.
- **12 Errores:** la precompilación y la carga diferida nunca bloquean la entrada; lo decorativo sigue en `OptionalBoundary`.
- **13 Performance:** los presupuestos de esta spec reemplazan "`medium` y `low` ≤ 15 MB" de `workshop-realism.md` para `low`.
- **15 Deploy:** solo cambian los GLB por tier y el script de compresión; los `.blend` siguen fuera del repo.

## P.1 (hecha 2026-11-11)

`scene-warmup.ts`: `initTexture` + `compileAsync` antes de `onReady`; `composer.render()` inicial compila el desenfoque.
Medición por trabajo GPU tras mostrar el taller (Chrome con perfil limpio y sin caché de shaders; en el M4 el tiempo no
discrimina): escritorio 0 compilaciones y 0 subidas tardías antes y después; móvil simulado, subidas tardías 43 → 18,
compilaciones tardías 4 → 4 (3 de `lab-emissive` cerca de los 15 s, causa sin aislar; no es visibilidad). Costo: 75
programas compilados antes de mostrar en vez de 46. Daniel lo probó en su iPhone 17: funciona.

## P.2 (2026-11-11, sin commit)

- **Decoración diferida:** `LabScene` monta lluvia, plantas y actores en un efecto, es decir cuando la sala esencial ya
  cargó; antes los 11 GLB se pedían a la vez y se repartían el ancho de banda.
- **`lab-baked` low:** simplificación (error 0,001) y sin normales (`drop_workshop_normals.cjs`; low es
  `MeshBasicMaterial`) aplicadas **sobre el archivo instalado**: 8,66 → 6,71 MB, 393k → ~269k triángulos.
- **`lab-plants` low:** texturas a 256 px: 2,03 → 1,03 MB (se reproduce byte a byte desde el bake vigente).
- `compress_workshop_lab.sh` incorpora los dos pasos para low. Ojo: el bake vigente es
  `command-center-assets/lookdev/visual3-20261103-x_9gdnnz/build-2`, no `command-center-assets/build` (30 oct, más
  oscuro), y el `lab-baked` de cada tier instalado es una variante de calidad elegida con `install_verified.py`;
  correr el script no reproduce exactamente lo instalado.

| Medida (Chrome limpio, CPU ×4, 4G 9 Mbps, 390 px, `low`) | Antes | Después | Meta |
| --- | --- | --- | --- |
| Tiempo hasta entrar al taller | 11,1 s | **6,2 s** | ≤ 7 s ✓ |
| GLB pedidos antes de entrar | 11 | 2 | — |
| Esencial (`lab-baked` + `lab-emissive`) | 9,2 MB | 7,3 MB | ≤ 5 MB ✗ |
| Total del tier | 14,0 MB | 11,1 MB | ≤ 8 MB ✗ |
| Capturas en las 5 tomas a 390 px | — | ≤ 0,3 % de píxeles distintos, mismo brillo | sin diferencias ✓ |

Lo que falta para las metas de peso: `TEXCOORD_0` (UV del detalle) ocupa 1,85 MB en float32 porque está fuera de
[0, 1] y no se puede cuantizar sin reescalarla y compensar en el shader (`withDetail`); quitar el detalle en low
cambiaría el aspecto. Ambas quedan como decisión de Daniel.

## P.3 (2026-11-11, sin commit)

El chunk de `/` (410 kB) era todo código propio: casos (`modules/projects`, 72 kB), portafolio clásico
(`modules/experience` + `scene-viewer`, ~62 kB) y el workspace (`AppShell`), que el landing no usa. `ExperienceGate`
los carga con `next/dynamic` y los precarga con `requestIdleCallback` (fallback `setTimeout` en Safari). `enter()`
espera el módulo del caso antes de la View Transition, para que nunca capture el hueco del placeholder.

- First Load JS de `/`: **624 kB → 201 kB** (meta ≤ 350 kB ✓).
- Verificado en Chrome: abrir un caso antes de la precarga, volver al taller, portafolio clásico, `?project=` y
  `#contacto` directos; sin errores ni 404.
- Tests: 9 de `shell/experience-gate` esperan ahora con `findBy` la primera vista de cada módulo diferido.
