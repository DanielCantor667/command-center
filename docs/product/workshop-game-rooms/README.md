# Taller — fuente y salas de Phase 7.3

Maestro editable: [`workshop-game-v2.blend`](../../../blender/scenes/workshop-game-v2.blend). Generador reproducible: [`generate_workshop_rooms.py`](../../../blender/generate_workshop_rooms.py). Medidas, nombres de nodos, materiales, UV, hashes y presupuesto real de cada GLB: [`manifest.json`](manifest.json).

La arquitectura común conserva el acceso industrial, la puerta existente, la mesa con maqueta, la mezzanine y la escalera de7.2. El shellv2 retira el antiguo showroom/almacenaje trasero y añade cuatro particiones de2.75m y portales de2.2×2.5m. Cada cierre es opaco, independiente y se exporta como `roomgate__kliniu`, `roomgate__lorigine`, `roomgate__academy` o `roomgate__drokex`, con origen global[0,0,0]. La web controla su visibilidad al cargar una sala.

| Sala | Arquitectura y mobiliario editable | Cámara web |
| --- | --- | --- |
| Kliniu | Showroom verde, estanterías de muestras, banco operativo y terminal de evidencia | [-5.1,1.65,-4] → [-5.1,1.5,-8.7] |
| L'ORIGINE | Galería marfil, pedestales, estudios de envases capilares, nichos y consola | [4.8,1.65,-4.1] → [4.8,1.45,-8.5] |
| 4U Studio Academy | Piano vertical con teclas, guitarra, batería de enseñanza, atril y absorción acústica | [-6.4,1.65,5.7] → [-8.6,1.4,5.7] |
| Drokex | Módulos de catálogo, conexiones físicas y banco de exposición | [6.4,1.65,5.7] → [8.6,1.4,5.7] |

Los envases y módulos son estudios espaciales originales del taller; no son reproducciones verificadas de productos comerciales. Los monitores se dejan vacíos y el HTML de la web presenta las capturas y la atribución reales del repositorio. Los nodos Drokex no expresan cifras, métricas ni autoría exclusiva.

Cada sala se exporta por separado, agrupada por material como `room__<id>__<material>`. Sus coordenadas están globales y se monta en[0,0,0]. El maestro conserva piezas individuales, colecciones semánticas, cámaras y luces de referencia. La agrupación sólo afecta copias temporales; el archivo se guarda antes de crear esas copias.

Las texturas PBR se reutilizan del kit propio de7.2 (`docs/product/workshop-game-assets/textures/`): concreto, roble, estuco y normales de concreto/roble. Se empaquetan en el maestro y se embeben en cada GLB. No hay HDRI externo, texturas generativas, descarga de terceros ni nueva dependencia.

La puerta común `workshop-door-v1.glb` y los archivos maestro/generador/shellv1 permanecen idénticos. El generador comprueba sus hashes antes y después de construirv2. Sus valores se registran en `preservedPhase72Sha256` del manifest.

Para regenerar únicamentev2:

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --python-exit-code 1 --python blender/generate_workshop_rooms.py
```

Añadir `-- --render` produce los cinco PNG de referencia desde la cámara del hub y las cuatro poses web. Los cierres están ocultos sólo en esos renders. Los GLB incluyen los cierres opacos. Estos PNG sirven para inspeccionar la fuente; la aceptación de interfaz, carga y rendimiento corresponde a la validación del navegador, guardada aparte en `docs/product/workshop-game-evidence/`.

Límites comprobados por el generador: core(shell+puerta)<=5,000,000bytes, shell<80,000triángulos, cada sala<2,000,000bytes/<25,000triángulos/<=12primitives; geometría dentro de su caja espacial y ningún recurso externo. No se despliega ni se cambia la fase7.4 desde este generador.

Licencia: geometría y texturas originales creadas para el portafolio de Daniel; kit y maqueta Kliniu propios reutilizados. Ningún asset de terceros.

Desde Sprint 8 existe una capa aditiva de props generados que no altera estos archivos: ver [`workshop-game-props`](../workshop-game-props/README.md) y `decisions/ADR-006-generated-3d-assets.md`.
