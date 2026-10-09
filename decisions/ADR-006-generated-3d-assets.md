# ADR-006: Assets 3D generados como capa aditiva

Status

Accepted

Context

Hasta Phase 7.4 el taller declaraba «ningún asset de terceros»: toda la geometría y las texturas salían de generadores Blender propios, con hashes inmutables comprobados por validadores. El resultado era arquitectónicamente sólido pero con objetos genéricos (cajas, bloques, muros vacíos). Se dispone de una cuenta de pago de Magnific con generación image-to-3D y text-to-3D.

Decision

Se permiten assets generados con IA en el taller bajo estas reglas:

- Entran solo como **capa aditiva**: GLB propios por prop, colocados desde `props.ts`. Shell, puerta, estaciones y salas no se regeneran y conservan sus hashes.
- Son opcionales: su fallo nunca rompe una sala ni el taller.
- Cada asset se registra en `docs/product/workshop-game-props/manifest.json` con origen, motor, prompt o referencia, fecha, créditos y sha256, y pasa por `blender/normalize_generated_asset.py`.
- Sin marcas, texto, productos comerciales reconocibles ni datos inventados. Las pantallas siguen mostrando solo capturas reales.
- La licencia se anota con su fuente y fecha de revisión; lo no confirmado se declara pendiente.

Consequences

- La frase «ningún asset de terceros» deja de aplicar a esta capa; sigue siendo cierta para shell, puerta, estaciones y salas.
- Hay un cuarto validador de assets y un presupuesto propio (300 KB y 9.000 triángulos por prop, 1,8 MB en total).
- La coherencia de estilo depende de la curaduría: un prop que no encaje se descarta, como ocurrió con la textura PBR de concreto.
- Pendiente: confirmar con Magnific los derechos sobre modelos 3D antes de un uso comercial.
