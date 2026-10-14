# Sprint 9 — De "taller correcto" a experiencia 3D cuidada

Estado (2026-10-14): **aprobado**. Hechas 9.1, 9.2, 9.3, 9.4, 9.6, 9.7 y 9.8; **pendiente 9.5 Sonido**. Ninguna fase arranca sin luz verde explícita.

Desviaciones respecto a lo planeado:
- **9.2:** el panorama no alimenta los reflejos del entorno (cambiaba demasiado la luz de 9.1).
- **9.3:** se parcheó `room-academy-v1.glb` → `v2` con `blender/patch_room_glb.py` en vez de regenerar salas. Kliniu y Drokex conservan su arquitectura y reciben props añadidos. 2 props descartados (bandeja y módulo).
- **9.4:** lámparas colgantes sin balanceo (fusionadas con el acero del shell). Foca animada por código, sin rig.
- **9.6:** el bucle de portada es un zoom con ffmpeg; el vídeo de Magnific salió estático y se descartó (1.175 créditos).
- **9.7:** se añadió una fila de salas en la navegación móvil.
Alcance: `workshop-game`. La mesa de `?view=portfolio` queda fuera (sprint aparte).
Antecedente: Sprint 8 (capa de props generados, `decisions/ADR-006-generated-3d-assets.md`).

## Diagnóstico (capturas del 2026-10-09)

Ordenado por cuánto afea la experiencia:

1. **La luz es plana.** Sin oclusión ambiental ni postprocesado; sombras duras.
2. **Las ventanas no dan a ningún lado.** Se ve un degradado gris.
3. **Varias piezas siguen siendo bloques.** Estanterías de cajas en Kliniu, módulos en Drokex, y guitarra, batería y piano hechos con primitivas en Academy.
4. **Nada se mueve ni suena.**
5. **En móvil el panel del proyecto tapa casi toda la sala.**
6. **La entrada es una imagen fija** y los rótulos "Entrar a…" salen diminutos.

## Fases

| Fase | Qué se hace | Con qué | Créditos aprox. |
| --- | --- | --- | --- |
| **9.1 Luz y atmósfera** | Oclusión ambiental, sombras suaves, tono de color y un bloom leve en lámparas y pantallas. Luz propia por sala. | Código (three.js); sin assets | 0 |
| **9.2 Exterior** | Panorámica de Bogotá tras las ventanas y como entorno de reflejos. | Imagen 2:1 de Magnific + upscale | ~200–400 |
| **9.3 Piezas protagonistas** | Sustituir los bloques más visibles: guitarra, batería, estantería de producto, módulos de Drokex. 2–3 props más por sala. | Text-to-3D (Tripo) | 10–12 props ≈ 6.000–7.000 |
| **9.4 Vida** | Polvo en la luz, plantas que se mecen, lámparas que oscilan, foca que saluda al entrar. Respeta `prefers-reduced-motion`. | Código; opcional rig/animación de Magnific para la foca | 0–1.500 |
| **9.5 Sonido** | Ambiente de taller y un sonido por sala (piano suave en Academy). Apagado por defecto, con botón. | Audio de Magnific (SFX y música) | ~300–800 |
| **9.6 Entrada y rótulos** | Loop de vídeo corto en la portada con póster de respaldo, y rótulos de sala legibles. | Vídeo de Magnific | ~1.000–3.000 |
| **9.7 Móvil** | Panel de proyecto plegable para que la sala se vea; encuadres de cámara propios para vertical. | Código | 0 |
| **9.8 Rendimiento** | Compresión de mallas y texturas si el peso sube; medir FPS en móvil real. | Código | 0 |

Total estimado: **8.000–13.000 créditos** de un saldo de 43.480 (2026-10-09). Solo el costo de prop (580) e imagen (~75) está medido; audio y vídeo son estimaciones a confirmar con `simulate_cost`.

## Orden recomendado

**9.1 → 9.2 → 9.7 → 9.3 → 9.4 → 9.6 → 9.5 → 9.8**

- La 9.1 es gratis y es el mayor salto visual; los props nuevos se ven mejor con buena luz.
- La 9.7 va pronto porque en móvil hoy el 3D casi no se aprecia.
- El sonido va tarde: es lo más prescindible y lo que más molesta si sale mal.

## Reglas que se mantienen

- Capa aditiva: shell, salas y estaciones no se regeneran; sus hashes siguen intactos. Sustituir un bloque que vive dentro de un GLB con hash (9.3) exige decidir antes entre taparlo, ocultar el nodo por nombre o regenerar la sala.
- Cada asset entra a `docs/product/workshop-game-props/manifest.json` con procedencia, pasa `validate-workshop-props-assets.mjs` y se verifica en navegador (1440, 1920, 390, 320).
- Presupuestos actuales: prop ≤300 KB, ≤9.000 tris, ≤2 primitives; total de props ≤1,8 MB (hoy 1,52 MB, así que la 9.3 obliga a subir el tope o comprimir: ver 9.8).
- Sin marcas, texto ni datos inventados; las pantallas siguen mostrando solo capturas reales.
- Magnific: proyecto temporal `tmp`, descargar y `folders_delete` en el mismo turno; `simulate_cost` antes de cada gasto.
- Dependencias nuevas (p. ej. postprocesado) solo con justificación; primero lo que ya traen three/drei.

## Riesgos

- **Postprocesado en móvil:** puede bajar los FPS. Solo en escritorio o con calidad reducida.
- **Mezcla de estilos:** los props generados son más realistas que la arquitectura estilizada. Si choca, la 9.3 se limita a piezas pequeñas.
- **Licencia 3D de Magnific:** sin confirmar para uso comercial.
- **Presupuesto de peso:** 10–12 props más no caben en el tope actual de 1,8 MB.

## Pendientes heredados

- Vaciar a mano la papelera de Magnific y borrar el upload `foca-kliniu`.
- `city:assets:validate` falla por `academy: projectId must match id` (ajeno al Sprint 8).
- Dos imágenes sin trackear: `workshop-entrance-v2.webp`, `workshop-prototype-entrance-v1.webp`.
