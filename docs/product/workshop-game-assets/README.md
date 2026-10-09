# Taller base — Sprint 7, Phase 7.2

Fuente maestra: [`workshop-game-v1.blend`](../../../blender/scenes/workshop-game-v1.blend).
Generador reproducible: [`generate_workshop_game.py`](../../../blender/generate_workshop_game.py).
Blender comprobado: 5.1.2 local. No requiere instalar paquetes ni descargar recursos.

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup \
  --python-exit-code 1 --python blender/generate_workshop_game.py -- --render
node apps/web/scripts/validate-workshop-game-assets.mjs
```

El `.blend` conserva piezas individuales en colecciones: arquitectura/ventanas,
mezzanine/escalera, banco, zona existente Kliniu, lámparas/plantas, puerta y maqueta.
Los GLB utilizan copias agrupadas por material; la exportación conserva UV y
texturas embebidas. Los originales anteriores del repo no se modifican.

Los dos recursos esenciales suman **4.600.212 bytes**. Shell: 62.633 triángulos,
15 primitives/materiales, cinco texturas propias y dos materiales con normal map.
Puerta: 58.072 bytes, 980 triángulos y tres primitives/materiales. Son medidas
del GLB final, no estimaciones de rendimiento. El [manifiesto](manifest.json)
registra métricas, nombres, coordenadas y licencia. La validación de navegador se
documenta por separado en `workshop-game-evidence`; los renders Blender no la sustituyen.

Cada mesh exportado tiene origen `[0,0,0]`. Nombres: `shell__<material>` y
`door__<material>`. Ejes web: x horizontal, y arriba, z hacia la entrada;
Blender recibe `(x,-z,y)` y exporta glTF con Y arriba. Puerta local: panel
3,6 × 4,3 × 0,16 m; posición cerrada `[-1.8,0,8.05]`, abierta
`[-7.4,0,8.05]`. Una hoja fija cubre x=0..3,6 m y dos cierres fijos
completan el vano hasta x±4,18 m. Carruajes y tirador sobresalen ligeramente
del panel. El manifiesto incluye SHA-256 del generador, `.blend`, shell y puerta.

La tapa del banco queda en y=1 m. La maqueta Kliniu v4 se reutiliza como estudio
de 1,05 m sobre la mesa, con LOD aplicado y materiales compartidos. La pantalla
de Kliniu es un plano vacío: no simula contenido real del producto. Los nombres
físicos se generan con texto controlado: «Taller» en `[-6.05,3.29,8.29]`;
«Kliniu» en `[-5.5,2.41,-8.39]`, delante de una placa teal compartida
2,6 × 0,56 × 0,04 m en `[-5.5,2.56,-8.43]` que evita el solape con las muestras.
El mezzanine es arquitectura y decorado, sin
destinos nuevos ni salas de Phase 7.3.

Materiales: concreto, plaster, oak, greensteel, brass, graphite, steel_light,
paper, teal, glass, leaf, leaflight, ceramic, soil y warm. Las texturas de
concreto/madera/plaster y las dos normales se generan con píxeles propios, en
512/256 px. El vidrio usa alpha suave compatible; no requiere transmisión ni
reflejos de pantalla. Las luces de preview no se exportan; la web recrea la luz.

Previews sin UI, desde la misma escena y poses a 1,65 m:

- [Entrada](workshop-entrance-v1.png): cámara `[-1.8,1.65,14]`, objetivo `[-.5,1.6,-4]`.
- [Sala central](workshop-hub-v1.png): cámara `[0,1.65,5.1]`.

Se desplaza únicamente la cámara de entrada 1,8 m a la izquierda para mirar
por la apertura y recorrerla sin centrar la hoja fija ni la unión de las hojas.
Los puntos y poses del interior permanecen iguales. La adaptación corresponde
al acceso completo observado en navegador, después de sustituir el prototipo.

Geometría y texturas originales creadas para el portafolio de Daniel; maqueta
previa propia del repo. No hay assets ni licencias de terceros incorporados.
