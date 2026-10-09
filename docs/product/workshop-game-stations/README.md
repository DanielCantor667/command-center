# Taller — estaciones de Phase 7.4

Fuente editable: [`workshop-game-v3.blend`](../../../blender/scenes/workshop-game-v3.blend). Generador reproducible: [`generate_workshop_stations.py`](../../../blender/generate_workshop_stations.py). Contratos espaciales, objetos seleccionables, pivote, materiales, UV, hashes y límites medidos: [`manifest.json`](manifest.json).

El maestro v3 abre el entorno v2 y añade únicamente tres estaciones propias, con piezas individuales organizadas en colecciones. Guarda una fuente nueva antes de agrupar copias temporales. El GLB exporta exclusivamente las piezas nuevas: arquitectura, mesa, puerta y cuatro salas siguen usando los exports de 7.2/7.3.

| Estación | Objeto y posición física | Pose web |
| --- | --- | --- |
| Tecnologías | Pared de herramientas/módulos en el lateral izquierdo, cara `+X`; encabezado verde seleccionable `stationhit__technologies` | `[-6.8,1.65,1.55]` → `[-9.14,1.6,1.55]` |
| Trayectoria | Archivo a nivel del suelo bajo el borde del mezzanine, junto al tramo izquierdo del portal Kliniu, cara `+Z`; placa `stationhit__trajectory` | `[-7.7,1.65,.8]` → `[-8.1,1.55,-2.65]` |
| Contacto | Escritorio entre el gabinete existente y el corredor frontal, cara `+Z`; terminal `stationhit__contact` | `[6.7,1.65,2.7]` → `[6.7,1.3,1.45]` |

Todos los objetos usan metros de Three.js: `x` horizontal, `y` vertical, `z` hacia la entrada. El generador aplica el mapa Blender `(x,-z,y)` y exporta glTF Y-up. El kit se monta en `[0,0,0]`; los nueve nodos tienen origen global cero. Los seis batches decorativos se nombran `station__<material>`. Las tres superficies físicas opacas seleccionables conservan nombres exactos independientes, junto con `stationId` en sus extras.

Los `hitAnchor` del manifest apuntan a regiones lisas de las placas/terminal, lejos de las letras físicas que podrían recibir primero un raycast. Son referencias para la verificación del renderer; no añaden colliders invisibles. La navegación HTML ofrece acciones equivalentes y no depende de esos raycasts.

Las cajas de cada estación dejan libres banco, particiones, portales, escalera y recorridos por el corredor `z=3`. El archivo no requiere subir al mezzanine. La cámara de contacto conserva `z=2.7`, por debajo del umbral `2.8` del controlador existente: una pose más adelantada hacia `z=3.25` provocaría una diagonal desde las salas frontales que cruzaría su partición.

Los módulos, herramientas, folios y hojas son decoración original sin métricas, marcas tecnológicas, fechas, cargos, diplomas o datos de contacto. Los únicos textos físicos nuevos son «Tecnologías», «Trayectoria» y «Contacto». El contenido real procede de los lectores HTML basados en `PORTFOLIO_TECHNOLOGIES`, `PORTFOLIO_CAREER` y `PUBLIC_PROFILE`.

El kit reutiliza seis materiales `WG_*` existentes del maestro v2: acero verde, roble, papel, grafito, latón y acero claro. El roble conserva su mapa de color y normal propios empaquetados. Los materiales son opacos; cada primitive conserva UV y normales. No se generan texturas nuevas ni se descargan recursos. Los datos PBR necesarios se embeben en el GLB.

Medición del export:

- Kit: **786.652 bytes**, **7.860 triángulos**, **9 meshes/primitives**, **6 materiales**, **2 imágenes**.
- Core anterior: **3.678.840 bytes**; core con estaciones: **4.465.492 bytes**.
- Límites: kit ≤1.200.000 bytes, <12.000 triángulos, ≤13 primitives; core completo ≤5.000.000 bytes.
- Los once hashes de fuentes/exports anteriores se verifican antes y después de generar; quedan registrados por ruta en `preservedPhase72And73Sha256`.

Para regenerar sólo esta fase:

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --python-exit-code 1 --python blender/generate_workshop_stations.py
```

Añadir `-- --render` produce cuatro PNG de referencia en [`previews`](previews): hub y tres estaciones desde las poses web. Las puertas de las salas aparecen cerradas. Las luces Cycles de referencia no se exportan; los PNG no sustituyen la aceptación en Three.js/navegador ni son capturas de la web. Las estaciones laterales no caben todas a la vez en el encuadre inicial del hub: el mapa y las acciones HTML deben exponer sus destinos.

Licencia: geometría original propia creada para el portafolio de Daniel; materiales y texturas propios de las fases anteriores reutilizados. Sin assets de terceros, imágenes generativas ni dependencia de licencias externas. No se despliega ni se modifica Phase 7.5 desde este generador.
