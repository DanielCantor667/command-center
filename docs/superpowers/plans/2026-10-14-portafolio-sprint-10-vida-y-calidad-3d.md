# Sprint 10 — Vida y calidad 3D del taller

Estado (2026-10-14): **10.1 y 10.2 hechas y verificadas; 10.4 en curso con los objetos personales (tocadiscos, vinilos, guitarra eléctrica, amplificador, portátil, placas Claude/Codex/VS Code); guante blanco omitido**. El resto sigue sin aprobar. Ninguna fase arranca sin luz verde explícita.
Alcance: `workshop-game`. Antecedente: Sprint 9 (luz, props, vida ambiental, sonido, móvil).

## Diagnóstico (capturas del 2026-10-14)

Ordenado por cuánto resta calidad. Todo está visto en el navegador, no supuesto.

1. **Superficies planas y estériles.** Suelo, yeso, madera y acero son colores casi lisos con texturas de 256–512 px y sin desgaste ni variación. El taller se lee limpio pero "de maqueta".
2. **Arquitectura de primitivas.** Las salas son cajas y cilindros; Kliniu y Drokex siguen con estantes y módulos de bloque. Los props generados se ven mejor que su entorno.
3. **Nadie lo habita.** Solo hay polvo, hojas y una foca que respira. Sin personas ni señales de uso.
4. **Estaciones genéricas.** Trayectoria es un estante de cajas blancas idénticas con placa dorada; Contacto, un monitor oscuro con la palabra. Tecnologías no muestra tecnologías.
5. **Composición con fallos concretos.** En L'ORIGINE una columna verde tapa un tercio del encuadre, y los frascos del plinto tienen una etiqueta que se ve como un cuadrado negro.
6. **Poco movimiento con intención.** Lo que se mueve es ambiente; nada responde a la visita (puertas, lámparas, pantallas).

## Qué puede y qué no puede hacer Magnific aquí

Magnific es **generativo**: produce imágenes, objetos 3D sueltos, texturas, audio y vídeo. No ve ni edita la escena three.js, así que no mejora por sí solo la arquitectura, la composición ni la iluminación; eso es trabajo nuestro (Blender/three). Donde sí rinde:

| Palanca | Herramienta | Costo medido | Para qué |
| --- | --- | --- | --- |
| Texturas PBR de superficies | `images_generate` (sin costuras) + `images_pbr_maps` | imagen ~75 + mapas ~80 por juego | Sustituir los materiales planos por madera, concreto, yeso y acero con relieve |
| Figuras 3D | `models3d_text_generate` (Meshy 700, Tripo 580) | exacto | Personas estilizadas y piezas de mobiliario |
| Rig y movimiento de figuras | `models3d_rig` (Meshy) | **120** | Esqueleto para animar |
| Clip de movimiento a medida | `models3d_motion_generate` | **420** | Gestos concretos (mirar una pantalla, cambiar el peso) |
| Animación de catálogo | `models3d_animate` con `actionId` | sin medir (requiere un modelo rigueado) | Alternativa más barata al clip a medida |
| Arte de pared y señalética | `images_generate` | ~75 | Cuadros y láminas sin marcas |

Lo que **no** repetiría: vídeo generativo para el bucle de portada. En 9.6 el modelo devolvió casi la imagen fija con 1.175 créditos.

## Técnicas que desbloquean el resto (sin créditos)

- **Sustitución de materiales en runtime.** Los GLB conservan materiales con nombre (`WG_oak`, `WG_concrete`, `WG_plaster`…) y UV. Se pueden intercambiar mapas PBR sin tocar ni regenerar ningún GLB ni sus hashes.
- **Dividir una región en un nodo propio.** Extender `blender/patch_room_glb.py` para que, en vez de borrar los triángulos de una región, los mueva a un nodo nuevo. Así las lámparas colgantes, una puerta o un cartel, hoy fusionados con el acero del shell, se pueden animar con su propio pivote.

## Fases

| Fase | Qué se hace | Con qué | Créditos aprox. |
| --- | --- | --- | --- |
| **10.1 Arreglos de composición** | Reencuadrar L'ORIGINE para esquivar la columna; retirar la etiqueta negra de los frascos (parche de región, `room-lorigine-v2`); revisar el resto de salas | Código + parche | 0 |
| **10.2 Tecnologías en el estante** | Sustituir las cajas del estante de Tecnologías por un objeto por tecnología con su logo; cada uno abre el explorador filtrado. Solo tecnologías reales de `portfolio-technologies.ts` | Código (datos e iconos ya existentes) | 0 |
| **10.3 Materiales con relieve** | 5–6 juegos PBR (roble, concreto, yeso, acero, tela/alfombra) aplicados por nombre de material; mapas de 1k | Magnific imagen + PBR | ~900–1.100 |
| **10.4 Huellas de uso** | Taza, papeles, abrigo, cables, cuadros adicionales, alfombra; objetos pequeños por sala | Magnific 3D (Tripo) + código | ~2.300–3.500 (4–6 piezas) |
| **10.5 Personas (piloto)** | 1 figura sin rostro, rig y un clip; se evalúa en sala antes de seguir. Si funciona, 3 figuras más en poses rotadas | Magnific Meshy | ~1.300–1.700 el piloto; ~4.000–5.000 el conjunto |
| **10.6 Movimiento con intención** | Lámparas colgantes (vía nodo dividido), puerta de entrada, desplazamiento lento de las capturas en pantallas, brillo de pantallas sobre el escritorio | Código | 0 |
| **10.7 Atmósfera** | Haces de luz en la claraboya, reflejos del panorama con intensidad medida, gradación de color | Código | 0 |
| **10.8 Rendimiento y peso** | Medir de nuevo; compresión meshopt si el peso lo pide; salvaguarda de calidad ya existente | Código | 0 |

Total estimado: **~4.500–6.500** sin el conjunto completo de personas, y **~8.000–11.000** con él. Saldo actual: 23.115. Solo están medidos los costos de prop (580/700), rig (120), clip (420), imagen (~75) y mapas (~80); el resto se confirma con `simulate_cost` antes de gastar.

## Orden recomendado

**10.1 → 10.2 → 10.6 → 10.3 → 10.4 → 10.5 → 10.7 → 10.8**

- 10.1 y 10.2 son gratis y resuelven lo que más se nota y lo que pediste.
- 10.6 va antes que los créditos: es movimiento sin gasto y prueba la técnica de nodo dividido.
- 10.3 antes que 10.4/10.5: los objetos nuevos se ven mejor sobre buenas superficies.
- 10.5 es un piloto a propósito: si la figura no encaja, se corta sin haber pagado el conjunto.

## Reglas que se mantienen

- Capa aditiva: `room-*-v1.glb` y el shell no se modifican; los cambios van como `v2` con hash propio y registro en el manifest.
- Cada asset entra a `docs/product/workshop-game-props/manifest.json` con procedencia, y se verifica en navegador (1440, 1920, 390, 320).
- Sin marcas, texto ni datos inventados. Las pantallas siguen mostrando solo capturas reales; el desplazamiento de 10.6 recorre esa misma captura.
- Magnific: proyecto temporal `tmp`, descargar y `folders_delete` en el mismo turno; `simulate_cost` antes de cada gasto.
- Presupuesto de peso: topes actuales (prop ≤300 KB, sala ≤1,6 MB, total ≤4,2 MB) se revisan en 10.8, no se suben por defecto.

## Riesgos

- **Estilo mixto.** Los props generados son más realistas que la arquitectura; las texturas PBR (10.3) lo reducen, pero no lo eliminan.
- **Figuras en el valle inquietante.** Por eso el piloto, y por eso sin rostro y con volúmenes simples.
- **Animación Meshy sin medir.** `models3d_animate` no se pudo simular sin un modelo rigueado; el costo del piloto puede variar.
- **Licencia 3D de Magnific** sin confirmar para uso comercial. Sigue siendo el bloqueante para publicar.
- **Peso.** Más texturas y objetos suben la carga por sala; 10.3 usa 1k y 10.8 mide.

## Huellas personales (datos aportados por Daniel, 2026-10-14)

Material real para 10.4: gustos musicales (pop, rock y rock en español; Michael Jackson como referencia) y herramientas de trabajo (Claude, Codex, un PC o Mac normal, VS Code).

Reglas: sin marcas ni nombres de terceros dentro de la escena y sin inventar nada; solo objetos genéricos que evocan lo que dijo.

| Dato real | Objeto en la escena | Dónde |
| --- | --- | --- |
| Música pop / rock | Tocadiscos y caja de vinilos con carátulas abstractas | Hub o mesa de trabajo |
| Rock (en español) | Guitarra eléctrica apoyada junto a un amplificador | Academy |
| Pop | Detalle sutil de la época (un guante blanco sobre el piano), opcional y a validar contigo | Academy |
| Mac / PC normal | Portátil genérico sin logo sobre la mesa de trabajo | Mesa de trabajo |
| VS Code | Pantalla del portátil con líneas de código abstractas, sin texto real | Mesa de trabajo |
| Claude, Codex, VS Code | Tres placas más en la fila Herramientas de la estación de Tecnologías (iniciales tipográficas, sin logos propios) | Tecnologías |

Costo estimado: ~2.300–2.900 (4–5 props a 580), más 0 para las placas.

## Decisiones que necesito

1. ¿"El estante" es el de la pared izquierda (Tecnologías / Trayectoria)? Asumo que sí.
2. ¿Personas: figuras abstractas sin rostro (recomendado) o apariencia más realista?
3. ¿Arranco con 10.1 y 10.2, que no cuestan créditos?
4. Licencia 3D de Magnific: ¿la confirmas tú antes de publicar?
