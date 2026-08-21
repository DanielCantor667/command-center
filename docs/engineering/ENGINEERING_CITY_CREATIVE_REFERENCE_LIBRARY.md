# Engineering City — Creative Reference Library

**Propósito:** una biblioteca pequeña y operativa; no una colección de
plantillas para copiar. Cada referencia debe convertirse en una decisión de
diseño, una implementación propia y una prueba de rendimiento antes de entrar
en producción.

## Regla de uso

1. Reutilizar directamente solo código o assets cuya licencia esté verificada y
   sea compatible con el repositorio.
2. Mantener URL, autor, licencia y versión en el manifiesto antes de publicar
   un GLB de terceros.
3. Codrops, showcases, CodePen y portfolios son **referencia de técnica y
   lenguaje**, nunca una fuente de arte o código para copiar sin revisar la
   licencia del demo concreto.
4. Para la ciudad, preferir geometría propia y procedural: preserva la
   identidad del universo y simplifica la distribución pública.

## Prioridad de adopción

| Prioridad | Referencia | Aplicación propia en Command Center | Categoría | Uso / licencia | Decisión |
| --- | --- | --- | --- | --- | --- |
| P0 | [R3F Performance Pitfalls](https://r3f.docs.pmnd.rs/advanced/pitfalls) | Animar con `useFrame`, reutilizar GLTF y evitar estado React dentro del render loop. | Rendimiento | Documentación oficial. | Adoptar ahora. |
| P0 | [Three.js LOD](https://threejs.org/docs/pages/LOD.html) | Conmutar LOD0/LOD1 por distancia cuando haya más de tres landmarks publicados. | Rendimiento | API oficial de Three.js ([MIT](https://github.com/mrdoob/three.js/blob/dev/LICENSE)). | Adaptar en la fase de seis landmarks. |
| P0 | [Color Management](https://threejs.org/manual/en/color-management.html) | Mantener salida sRGB, emisión esmeralda controlada y no compensar el color con luces excesivas. | Iluminación | Manual oficial. | Adoptar ahora. |
| P1 | [drei: `useGLTF` / `Clone`](https://github.com/pmndrs/drei#usegltf) | Cargar una vez cada modelo y clonar la escena para futuras instancias del mismo asset. | Arquitectura 3D | [MIT](https://github.com/pmndrs/drei/blob/master/LICENSE). | Ya adoptado; mantener. |
| P1 | [R3F Scaling Performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance) | Presupuesto de draw calls, DPR contenido y degradación gradual antes de añadir postprocesado. | Rendimiento | Documentación oficial. | Adoptar por hitos. |
| P1 | [Three.js Journey / Codrops: scroll + parallax](https://tympanus.net/codrops/2022/01/05/crafting-scroll-based-animations-in-three-js/) | Cámara y parallax sutil conectados a la narrativa, no un efecto que compita con el contenido. | Narrativa / interacción | Tutorial para estudio; revisar términos del demo antes de reutilizar código. | Solo referencia. |
| P2 | [Three.js Resources](https://threejsresources.com/) | Descubrir boilerplates, shaders o proveedores; registrar licencia antes de incorporar cualquier elemento. | Descubrimiento | Directorio; cada recurso tiene condiciones propias. | Solo descubrimiento. |
| P2 | [Three.js Examples](https://threejs.org/examples/) | Validar una técnica aislada antes de construirla con R3F. | Laboratorio | Código de Three.js bajo MIT; no copiar escenas completas. | Adaptar por necesidad. |

## Traducción de referencias a lenguaje propio

| Influencia | Regla para Engineering City |
| --- | --- |
| Active Theory | La cámara y el entorno ayudan a contar el recorrido: un foco visual por pantalla, profundidad y una transición con propósito. |
| Bruno Simon | Interacción directa y legible: arrastrar, seleccionar, observar respuesta inmediata; nunca física o controles como adorno. |
| Apple | Contraste limpio, jerarquía silenciosa y microanimación lenta; el brillo confirma una acción, no sustituye el contenido. |
| Linear / Vercel | Tipografía funcional, grid estable, densidad contenida y estados de carga o fallo explícitos. |

## Backlog creativo aprobado

1. Publicar Kliniu y Vevi como landmarks propios con LOD0/LOD1 y procedencia.
2. Introducir movimiento de baja amplitud definido por distrito; utilizar `useFrame`
   y valores reutilizados, sin estado por frame.
3. Cambiar a LOD por distancia al publicar el cuarto landmark; mantener la carga
   inicial de LOD0 por debajo de 8 MB.
4. Medir draw calls, FPS y Core Web Vitals antes de añadir bloom, SSR o shaders
   de pantalla completa.
5. Reservar postprocesado para una escena que lo justifique y que tenga un
   fallback visual equivalente en dispositivos de menor capacidad.
