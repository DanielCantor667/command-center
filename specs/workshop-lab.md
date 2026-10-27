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
| Forma | Cuarto cerrado de 6 × 9 × 3,2 m (2026-10-26: antes 6 × 5 con el frente abierto; al girar se veía el vacío). La mitad del fondo es el laboratorio; la mitad frontal, con puerta de entrada, guarda los rincones de proyecto. |
| Salas de proyecto | Se eliminan las 4 salas (`room-*.glb`) y sus portales. Los proyectos viven en la sala. |
| Proyectos | Pared de pantallas sobre el escritorio (pared derecha), una por proyecto de `PROJECTS`. Captura real si existe en `public/projects/`; si no, solo el nombre (nunca una captura inventada). Clic → lector de caso existente. |
| Tecnologías | Muro de placas sobre el pegboard (pared izquierda): una placa por entrada de `PORTFOLIO_TECHNOLOGIES`, una fila por categoría de `TECHNOLOGY_CATEGORIES`. Logo local si existe, iniciales si no (regla actual del estante). |
| Conexión | Señalar un proyecto ilumina sus tecnologías (`projectIds`) y viceversa. Drones y gato reaccionan al foco. |
| Rincones de proyecto | Identidad de las antiguas salas: Academy (piano, batería, guitarra, amplificador, ukelele), Kliniu (estantería con limpiadores, aviso de piso mojado), L'Origine (silla de barbería, gabinete con set de química y frascos), Drokex (pallet de cajas de exportación, barril, globo). Cada rincón tiene letrero; su huella en el piso (`zone_<id>`) es el área de clic (abre el caso) y brilla en cian con el foco. Los proyectos sin rincón siguen solo en la pared de pantallas. |
| Trayectoria | Pizarra en la pared del fondo (entre puerta y ventana); abre la estación `trajectory` existente. |
| Contacto | Escritorio con monitor ultrawide; abre la estación `contact` existente. |
| Brazo industrial | Horneado como pieza estática (sus 57 texturas pesaban ~34 MB). Se mueven: brazo del banco, drones y gato. |
| Licencias | CC0 (Poly Haven, Quaternius) y CC BY (Sketchfab) con crédito en `CREDITS.md` y en la web. Sin cláusulas no-AI / no-reventa. |

## Requisitos no funcionales

- Peso total de la sala en la web ≤ 15 MB (GLB + texturas), meshopt + WebP; la sala esencial (la que se ve al entrar) < 8 MB y las salas de proyecto cargan bajo demanda. (2026-10-27: subido de 10 MB; sujeto a medir el primer render en móvil en la Fase F.) (2026-10-26: WebP en vez de KTX2: no requiere `toktx` ni transcodificador en runtime.)
- Luz y AO horneados; pocas luces dinámicas. `frameloop` continuo solo mientras el taller es visible.
- Móvil usable (DPR adaptativo, menos animaciones).
- Accesible: cada pantalla/placa interactiva tiene alternativa navegable por teclado (explorador HTML actual).
- Nunca datos fabricados: métricas, capturas y relaciones salen de `apps/web/data/`.

## Fases

| Fase | Alcance | Estado |
| --- | --- | --- |
| A | Arte en Blender (`blender/prototype_workshop_room_v2.py`, texturas de datos con `blender/generate_lab_textures.py`): composición, pared de proyectos, muro de tecnologías, pizarra, texturas y sombras. | Hecha |
| B | Optimización y export (`blender/bake_workshop_lab.py` + `blender/compress_workshop_lab.sh`): horneado Cycles 2 × 4k, reducción de polígonos, meshopt, WebP, `CREDITS.md`. Resultado: 6,6 MB, ~246k triángulos en `apps/web/public/models/workshop-lab/`. | Hecha |
| C | Integración web: cargar la sala en `workshop-game`, retirar salas/portales. Recorrido `entrance → hub → projects → technologies → trajectory → contact` (sin `workbench` ni salas). Clics básicos: pantalla → caso, placa → tecnología, pizarra → Trayectoria, escritorio → Contacto; panel accesible con la lista de proyectos. Sin modo día/noche (luz horneada de noche), portada nueva renderizada de la sala sin video en bucle, audio solo ambiente. Al final se borran los assets que solo usaba el taller viejo (public/ 58 → 39 MB). Drones desplazados en código (`LAB_ACTORS.offset`) para no tapar las vistas. | Hecha, pendiente de visto bueno |
| D | Interacción: foco compartido (hover en 3D y hover/foco en la lista HTML de proyectos); el foco ilumina la pantalla o placa y sus relaciones (`PORTFOLIO_TECHNOLOGIES[].projectIds`) y atenúa el resto; el dron K07 vuela frente a lo enfocado y el gato gira la cabeza hacia ahí (sin movimiento con `prefers-reduced-motion`); monitor de Contacto con disponibilidad y enlaces reales de `PUBLIC_PROFILE`; revisión de móvil (barra 3×2 con todos los destinos; etiquetas flotantes ocultas en pantallas angostas). Export de actores solo con su clip (`ACTIVE_ACTIONS`). | Hecha, pendiente de visto bueno |
| D.1 | Sala cerrada y ampliada a 9 m, rincones de proyecto (ver Decisiones), objetos apoyados con raycast (`drop_z`) para que nada flote, límites de cámara y polvo ampliados. Resultado: 7,4 MB. | Hecha, pendiente de visto bueno |
| E | Salas temáticas de proyecto (ver sección abajo). | Decisiones tomadas, sin luz verde para implementar |
| F | Verificación con Playwright sobre build de producción (fps, peso, móvil). | Pendiente |

No se avanza de fase sin luz verde explícita.

## Fase E (propuesta): salas temáticas de proyecto

Problema: los proyectos se leen como pantallas sobre el escritorio de Contacto y los rincones de la mitad
frontal son decoración pequeña. Se pierde la identidad de cada caso.

Propuesta: la mitad frontal deja de ser un pasillo con rincones y pasa a ser un anillo de cuatro salas
(Kliniu, L'ORIGINE, 4U Studio Academy, Drokex), cada una con su ambientación (clínica/almacén de limpieza,
barbería, estudio de música, bodega de exportación). Dentro de cada sala, una pantalla grande con la captura
real del proyecto; clic → lector de caso existente. Intranet ESS, Command Center y Vevi, sin ambientación
propia, quedan en una sala "Otros proyectos" o en la pared actual (decidir).

Decisiones (2026-10-27, visto bueno de Daniel):
1. Nave abierta con zonas muy marcadas, sin puertas entre salas.
2. Intranet ESS, Command Center y Vevi van a una sala "Otros proyectos"; la pared de pantallas sale del escritorio de Contacto.
3. Presupuesto: hoy 7,4 MB de 15 MB; la sala esencial debe quedar < 8 MB y cada sala de proyecto cargar bajo demanda.

Robots que se mueven (elegidos 2026-10-27, todos CC0, sin crédito obligatorio):
- Enemy_QuadShell y Enemy_Trilobite (Sci-Fi Essentials Kit de Quaternius, ya en `command-center-assets/scifi-essentials`): caminantes con clip `Walk`/`Idle`; patrullan rutas fijas en el piso.
- Animated Robot (Quaternius, itch.io): humanoide con `idle`, `run`, `wave`, `dance`, `thumbs up`; sin `walk` (se usa `run` lento). Descarga manual: la página es "paga lo que quieras" y no tiene enlace directo.
- Fases: E.1 robots caminantes en el taller actual; E.2 zonas de proyecto; E.3 robot temático por zona.
- E.2 (hecha 2026-10-27): las pantallas de Academy, Drokex, L'ORIGINE y Kliniu salen de la pared y van en su rincón, sobre el escenario (0,8 x 0,5 m, placa del nombre arriba). La pared queda con Intranet ESS, Command Center y Vevi. La estación Proyectos sigue siendo la pared; desde ahí rueda, flechas o Siguiente recorren los rincones (`corner-<id>` en `world-state.ts`): Academy, Drokex, L'ORIGINE, Kliniu. Clic en pantalla o rincón lleva a ese rincón; estando ahí abre el caso.
- Presupuesto: cada actor ~0,3 a 0,7 MB; unos 7 MB libres bajo el tope de 15 MB.

Alcance técnico estimado: nuevo `blender/prototype_workshop_rooms_v3.py`, `LAYOUT`/anclas por sala,
nuevos puntos de recorrido (`WorldPoint`) por proyecto, actualización de `world-map.tsx`, límites de cámara y
pruebas. Sin tocar Contacto, Tecnologías ni Trayectoria.

## Assets

Fuera del repo en `~/Documents/command-center-assets/` (`polyhaven/`, `sketchfab/`, `scifi-essentials/`).
Sketchfab (CC BY): Black Honey – Robotic Arm (re1monsen), Industrial robot arm (olofunot),
Mech Drone (Willy Decarpentrie), K07 Drone (KBM7), An Animated Cat (Evil_Katz), Black Piano (Shaboldik),
Acoustic Guitar (afurokn), Tama Drum Kit (robcantuart), Guitar amplifier (victorhugohc), Floor Globe (ctorre).
