# Engineering City — plan de producción visual

## Decisión

No generar imágenes finales independientes ni intentar llenar el mapa con modelos de stock
heterogéneos. La ciudad se producirá como un sistema con dos salidas deliberadamente distintas:

1. **Renders cinematográficos 2D** para el hero, tarjetas y páginas de proyecto. Son la capa de
   máxima calidad visual y no necesitan ser navegables.
2. **Landmarks 3D ligeros y consistentes** para el navegador de la ciudad. Son interactivos,
   cargan rápido y comparten exactamente las mismas formas, materiales y paleta que los renders.

La IA se utiliza para exploración y hojas de concepto; no como fuente de arte final. Blender es
la fuente de verdad de las formas, materiales, cámaras y renders.

## Diagnóstico del estado actual

El hero (`public/experience/command-city-hero.png`) ya establece una dirección útil: megaciudad
nocturna, acero oscuro y energía esmeralda. La primera versión de la ciudad ya resuelve su
coherencia de base: los seis distritos se producen como escenas Blender propias, se exportan a
GLB LOD0/LOD1 y se publican desde un manifiesto validado. Aun así, se mantiene una separación
estricta entre el render cinematográfico y el modelo interactivo:

- `CityNavigator` carga los seis landmarks procedimentales y conserva una corona de fallback si un
  GLB no está disponible.
- Cada landmark tiene una fuente `.blend` editable; la librería de oficina no se reutiliza como
  sustituto de arquitectura urbana.
- Los GLB se sirven directamente desde `public/models`; por tanto un asset con licencia que prohíba
  redistribuir el archivo fuente sigue sin poder publicarse allí.

La prioridad no es crear 100 edificios ni una bible de 200 páginas. Es crear un kit pequeño,
versionado y suficiente para que los primeros seis distritos parezcan parte del mismo mundo.

## Regla legal antes de comprar o descargar

Hay dos destinos de assets y no se deben mezclar:

| Destino | Puede contener | No puede contener |
| --- | --- | --- |
| `blender/source/` privado, usado solo para renders | Kits comerciales adquiridos, con su licencia registrada | Assets sin licencia o cuya licencia no cubra el proyecto |
| `apps/web/public/models/` descargable por cualquier visitante | Assets propios, CC0 o una licencia que permita explícitamente redistribuir el GLB | KitBash3D, BlenderKit RF y cualquier asset que prohíba redistribuir la fuente |

Poly Haven es una fuente segura para HDRIs, texturas y modelos CC0: permite uso comercial y
redistribución. KitBash3D es una buena fuente de *kitbashing* para renders privados, pero su
licencia exige que el asset se integre en una obra mayor y prohíbe redistribuir el asset crudo.
BlenderKit RF permite uso comercial, pero exige que el proyecto impida separar/revertir el asset;
un GLB servido públicamente no cumple ese supuesto. Registrar URL, autor, licencia, fecha y hash
de cada descarga en el manifiesto de activos.

Fuentes a consultar antes de incorporar cada asset:

- [Poly Haven — licencia CC0](https://polyhaven.com/license)
- [KitBash3D — derechos de uso](https://help.kitbash3d.com/en/articles/6449682-how-do-i-know-which-license-and-usage-rights-i-need)
- [BlenderKit — condiciones de licencia](https://www.blenderkit.com/terms-and-conditions-2026/)

## World Bible v1 (una página, bloqueante)

| Regla | Especificación v1 |
| --- | --- |
| Mundo | Engineering Megacity, año 2085; una ciudad que convierte conocimiento en infraestructura |
| Paleta | Obsidiana `#050807`, grafito `#101614`, acero `#29312F`, verde energía `#00D26A`, verde halo `#5CFF9D` |
| Materiales | 70% metal oscuro mate, 20% vidrio ahumado, 8% paneles técnicos, 2% emisión; sin hormigón claro ni colores saturados ajenos a la paleta |
| Luz | Noche húmeda, niebla volumétrica ligera, key esmeralda inferior, rim frío lateral, bloom discreto; nunca atardecer o luz solar directa |
| Escala | 1 unidad Blender = 1 m; personas 1.70 m, puertas 2.4 m, carriles 3.5 m, edificios landmark 28–72 m |
| Geometría | Volúmenes escalonados, chaflanes a 30°/60°, bases hexagonales y núcleos verticales; siluetas legibles desde arriba |
| Cámara | 35 mm para distrito, 50 mm para edificio, altura 24–38 m, inclinación 55–65°, tres cuartos; no usar perspectivas extremas |

## Design Language Bible v1 (no negociable)

Estas reglas se aplican tanto al modelo web como al render final. Si un asset las incumple, se
corrige o se descarta aunque sea visualmente atractivo por sí solo.

| Elemento | Regla |
| --- | --- |
| Planta y geometría | Predominan hexágonos, módulos trapezoidales y retículas técnicas; no hay bloques cuadrados aislados como lenguaje principal |
| Ángulos | Solo 30°, 60°, 90° y curvas circulares/hexagonales funcionales; nunca diagonales arbitrarias de 45° |
| Bordes | Chaflán/bisel visible en toda pieza arquitectónica; ninguna arista de edificio queda perfectamente cortante |
| Masa | Bases pesadas y oscuras, cuerpos escalonados, coronas reconocibles; cada landmark se entiende como silueta monocroma |
| Ventanas | Paños altos y verticales agrupados en bandas; no usar ventanas residenciales horizontales repetidas |
| Cristal | Vidrio ahumado negro-verdoso, reflectancia fría; no vidrio transparente azul brillante |
| Materiales prohibidos | Plástico visible, ladrillo, mármol, hormigón blanco limpio, cromado espejo y madera dominante |
| Emisión | Solo verde `#00D26A` y verde halo `#5CFF9D` como señal del sistema. Ningún otro color emite |
| Vegetación | Escasa, modular y contenida en jardineras técnicas; sirve para escala y contraste, nunca como parque natural |
| Señalética | Monoespaciada, mayúscula, mínima, retroiluminada; etiquetas cortas, sin carteles publicitarios |

## Camera Bible v1

Las cámaras son presets versionados de la escena maestra. No se ajustan “a ojo” por render;
solo se cambia un valor con una razón registrada.

| Preset | Uso | Lente | Altura / pitch | Niebla | Bloom | Exposure |
| --- | --- | --- | --- | --- | --- | --- |
| `hero-aerial-v1` | hero y ciudad completa | 35 mm | 32 m / 58° | 0.18 | 0.14 | 1.20 |
| `district-portrait-v1` | tarjeta de distrito | 50 mm | 24 m / 61° | 0.14 | 0.10 | 1.10 |
| `architecture-sheet-v1` | referencia/modelado | 70 mm | ortográfica / 0° | 0.00 | 0.00 | 1.00 |
| `detail-material-v1` | materiales y detalles | 85 mm | 2.2 m / 8° | 0.06 | 0.06 | 1.00 |

El encuadre de hero mantiene el landmark principal en el tercio derecho o en el eje central,
deja negativo visual suficiente para texto y nunca compromete legibilidad por efecto atmosférico.

## Motion Bible v1

La animación comunica un sistema vivo y deliberado, no decoración. Respeta
`prefers-reduced-motion`: en ese modo se congelan loops no esenciales y se conserva la navegación.

| Sistema | Movimiento | Ritmo / límites |
| --- | --- | --- |
| Command Center | núcleo y anillos emiten una respiración de luz | ciclo seno de 8 s, intensidad 0.70–1.00, sin cambio de posición |
| Knowledge Graph | nodos y aristas pulsan al señalar información | 2 s, opacidad 0.45–0.95; nunca parpadeo abrupto |
| Drones | rutas elevadas entre landmarks | 1.4 m/s, interpolación suave, máximo 3 visibles, sin colisiones aparentes |
| Vehículos | circuito vial de servicio | 2.8 m/s, sentido horario, velocidad constante salvo entrada/salida |
| Niebla | deriva lenta por capas | desplazamiento procedural continuo, amplitud menor a 0.15 m/s |
| Partículas | polvo/energía ambiental, no respuesta literal al cursor | máximo 40 en pantalla, velocidad <= 0.18, sin interacción que distraiga |
| Cámara | foco de distrito al seleccionar | 650 ms `cubic-bezier(0.22, 1, 0.36, 1)`; se permite cancelar con interacción del usuario |

## Architecture Bible v1: seis landmarks

Estos no son seis imágenes: son seis familias paramétricas, cada una con `base`, `body`, `crown`,
`emissive` y `signage` separables.

| Distrito | Forma y función | Firma visual | Escala |
| --- | --- | --- | --- |
| Command Center | torre hexagonal de conocimiento con atrio | núcleo esmeralda vertical y anillos de datos | 72 m |
| Kliniu | hub logístico bajo, industrial y modular | muelles, contenedores oscuros y líneas verdes de carga | 40 m |
| Vevi | media hub con dos torres y fachada de vidrio | pantallas LED abstractas en marcos verticales, señal esmeralda controlada | 56 m |
| Intranet ESS | campus administrativo apilado | patios internos, puentes y bandas de ventanas regulares | 42 m |
| L'Origine | pabellón de marca y experiencia | vidrio oscuro, arco de acceso y señal esmeralda contenida | 30 m |
| Academy | observatorio de aprendizaje | terraza escalonada, faro de señal y módulos de aula | 38 m |

**Regla de reutilización:** las seis piezas usan la misma base vial, kit de ventanas, paneles,
barandillas, tuberías, árboles y luminarias. Solo cambian la composición y una firma.

## Asset Library v1: 32 assets, no 300

| Grupo | Assets | Estado inicial |
| --- | --- | --- |
| Arquitectura modular | base hexagonal, torre baja/media/alta, cubierta, ventana, pilar, puente, muelle | modelar propio en Blender |
| Infraestructura | carretera, carril luminoso, acera, barandilla, poste, señal, túnel | modelar propio, low-poly limpio |
| Set dressing | 3 contenedores, rack, árbol, jardinera, banco, antena, holograma | propio + CC0 donde aplique |
| Movimiento | drone, vehículo de servicio, partículas de niebla | propio/procedural |
| Materiales | acero oscuro, titanio negro, vidrio ahumado, pantalla LED, emisión verde, asfalto húmedo | propios; HDRI/texturas CC0 de Poly Haven |

Cada asset debe tener: archivo `.blend` editable, GLB optimizado cuando sea publicable, dimensiones
en metros, pivote al suelo, LOD, presupuesto de polígonos, preview y entrada en
`assets-manifest.json`. Nada entra al proyecto sin esos campos.

### Presupuesto web

- Landmark: <= 18k triángulos en LOD0 y <= 5k en LOD1.
- Prop: <= 1.5k triángulos; instanciar árboles, luces, contenedores y drones.
- Texturas: 1K para web; atlas compartido; KTX2/Basis antes de publicar.
- Primera carga de ciudad: <= 8 MB comprimidos y <= 45 draw calls visibles.
- El canvas sigue siendo mejora progresiva; imagen estática y navegación textual deben funcionar sin WebGL.

## Producción: cuatro semanas enfocadas

### Semana 1 — fundación y prueba de estilo

Entregables:

1. Aprobar World, Design Language, Camera y Motion Bible, además de las seis fichas de landmark,
   en Figma/Markdown.
2. Crear una escena maestra `blender/scenes/engineering-city-v1.blend`: unidades métricas,
   colección de materiales, niebla, compositor, tres cámaras y luces.
3. Generar 12–20 conceptos, siempre como hoja de contacto: misma cámara, paleta y un landmark
   por variación. Elegir uno por distrito con una matriz de evaluación (silueta, escala,
   reutilización, legibilidad).
4. Construir un primer `Command Center` low-poly y renderizarlo desde las tres cámaras.

**Gate:** ninguna descarga masiva ni más renders hasta que Command Center sea reconocible en las
tres vistas y su GLB cumpla el presupuesto.

### Semana 2 — Command Center al 100%

Entregables:

1. Modelar los módulos de arquitectura e infraestructura necesarios para Command Center; aplicar
   materiales master, no materiales únicos por objeto.
2. Terminar Command Center, sus LODs, tres renders de cámara y la tarjeta/render hero.
3. Añadir manifiesto de activos y un validador que rechace GLB sin licencia, preview, dimensiones,
   LOD o presupuesto declarado.
4. Reemplazar el cristal central del mapa por Command Center. Los otros distritos conservan
   placeholders explícitos hasta pasar su propia revisión.

**Gate:** Command Center es la referencia de calidad. No se inicia el segundo landmark hasta que
la silueta, render, GLB, presupuesto y navegación superen la revisión visual.

### Semana 3 — Kliniu y Vevi

Entregables:

1. Construir Kliniu y Vevi mediante el kit aprobado; solo se permiten nuevos módulos si se añaden
   al manifiesto y siguen Design Language Bible.
2. Ensamblar una ciudad de prueba con los tres landmarks, viales, iluminación, niebla, vehículos y set dressing
   instanciado.
3. Exportar GLB web, comprimir con Draco/Meshopt y texturas KTX2; probar en móvil de gama media.
4. Renderizar una imagen por distrito y una vista aérea de ciudad desde la escena maestra.

### Semana 4 — tres distritos restantes, integración y control de calidad

Entregables:

1. Construir Intranet ESS, L'Origine y Academy como composiciones del kit ya aprobado.
2. `CityNavigator` carga el manifiesto y GLBs de landmarks; selección, foco de cámara y fallback
   de imagen por cada proyecto.
3. Hero y páginas usan renders finales de Blender, no imágenes generadas diferentes por página.
4. Añadir snapshots visuales y una revisión de performance, contraste, reduced motion y fallback
   sin WebGL.
5. Congelar `Engineering City v1.0`, etiquetar fuentes/licencias y abrir v1.1 solo para nuevos
   assets, no para cambiar las reglas del mundo.

## Flujo de un asset, obligatorio

```text
Brief de landmark → concept sheet (IA/referencias) → aprobación de silueta
→ modelado/kitbashing en .blend privado → materiales master → LOD + validación
→ render PNG/WebP → export GLB permitido → compresión → manifest → QA web
```

## Prompts de concepto útiles

Todos los prompts deben incluir las reglas de World Bible y declarar que la salida es referencia,
no arte final. Ejemplo:

> Hoja de concepto arquitectónico para **Kliniu Logistics Hub**, universo Engineering Megacity v1,
> vista ortográfica tres cuartos elevada, noche húmeda, metal negro mate, vidrio ahumado, emisión
> verde `#00D26A`, muelles automatizados, módulos de contenedor, 32 m de altura aparente, sin texto,
> sin personas protagonistas, sin edificios de fondo distintivos. Mostrar frontal, lateral, trasera,
> cubierta y una silueta de escala humana en una cuadrícula técnica. Diseño industrial modular,
> chaflanes de 30° y 60°.

Guardar junto a cada hoja: prompt, seed si existe, modelo, fecha, decisión y referencia que ganó.

## Qué comprar y qué no

- **Empezar gratis:** Poly Haven para HDRI, asfalto húmedo, metal, vidrio y cualquier prop CC0;
  modelar el lenguaje arquitectónico propio.
- **Acelerar renders:** adquirir un kit de ciudad industrial/futurista de KitBash3D solo si se
  usará en archivos Blender privados y se registra la licencia correcta de la entidad.
- **Evitar:** descargar packs aleatorios de marketplaces y exportarlos a `public/models`; produce
  estilos incoherentes y puede incumplir licencias aunque el render se vea bien.

## Criterio de éxito de v1

Una persona debe poder identificar cada uno de los seis distritos en una miniatura de 300 px, y
los seis deben parecer parte de una sola ciudad sin leer su nombre. Si falla una de esas dos
pruebas, se corrige kit, escala, materiales o composición antes de producir más renders.

## Estado de ejecución v1.0 — 2026-07-30

La fase de landmarks está cerrada. Los seis modelos son geometría procedural propia de Blender,
con fuente editable, GLB LOD0/LOD1, pivote al suelo y concepto de referencia documentado. El
manifiesto público valida procedencia, licencia, dimensiones, presupuesto y tamaño de carga.

| Distrito | LOD0 | LOD1 | Dimensiones (m) |
| --- | ---: | ---: | --- |
| Command Center | 9,216 tris | 3,816 tris | 53.78 × 46.765 × 72 |
| Kliniu | 14,064 tris | 4,712 tris | 97.8 × 84.87 × 39.6 |
| Vevi | 7,016 tris | 3,584 tris | 67.8 × 58.89 × 55.93 |
| Intranet ESS | 12,376 tris | 4,892 tris | 95.8 × 83.138 × 42 |
| L'Origine | 6,116 tris | 4,472 tris | 67.82 × 73.145 × 29.943 |
| Academy | 7,220 tris | 3,960 tris | 47.82 × 42.033 × 38 |

El primer mapa abre con LOD1 y solicita LOD0 únicamente al acercarse al distrito; el cambio usa
histéresis para no alternar modelos en cada frame. La carga de los seis LOD0 suma 4,226,108 B,
por debajo del límite de 8 MB. También existe una toma aérea reproducible en
`blender/scenes/engineering-city-overview-v1.blend`. La prueba de integración confirmó que no
debe colocarse detrás del canvas actual —duplicaría los landmarks—, por lo que permanece como
master de render hasta definir una superficie web sin ese solapamiento y generar sus derivados
AVIF/WebP finales.

Quedan fuera del congelamiento de v1 únicamente la prueba en teléfono físico de gama media y la
aprobación/postproducción del render maestro para sustituir el fondo de hero existente.
