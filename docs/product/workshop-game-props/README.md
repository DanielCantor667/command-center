# Taller — props y láminas generados (Sprint 8)

Capa **aditiva** sobre el taller de Phase 7.4: siete props 3D y dos láminas enmarcadas. No modifica shell, puerta, estaciones ni salas; sus GLB y hashes siguen idénticos y sus tres validadores pasan sin cambios.

| Lugar | Añadido |
| --- | --- |
| Hub | Lámpara de banquero en la mesa; dos láminas en los muros de yeso que flanquean el pasillo |
| Kliniu | Foca (mascota real de la marca) y dispensador de jabón sobre el banco |
| L'ORIGINE | Frasco ámbar con dosificador, sin etiqueta |
| 4U Studio Academy | Audífonos y micrófono de condensador sobre el piano |
| Drokex | Globo terráqueo sobre un módulo de catálogo |

Antes y después por vista: [`evidence/`](evidence/).

## Contrato

- Colocación: [`props.ts`](../../../apps/web/modules/workshop-game/props.ts). Render: [`workshop-props.tsx`](../../../apps/web/modules/workshop-game/workshop-props.tsx).
- Cada prop es un GLB propio en `public/models/workshop-game/props/`, con una malla `prop__<id>`, pivote en el apoyo y frente hacia +X.
- Son opcionales: cada uno tiene su propio límite de error y `Suspense`. Si falla, la sala y el taller siguen funcionando (comprobado bloqueando todos los recursos).
- Los props de sala se cargan con su sala; solo la lámpara y las láminas se piden al entrar al hub.
- Presupuestos y procedencia por asset: [`manifest.json`](manifest.json). Validación: `node apps/web/scripts/validate-workshop-props-assets.mjs`.

## Añadir un prop

1. Generarlo (referencia sin sombra ni fondo; objetos sueltos, sin vidrio ni texto).
2. Normalizarlo:

```sh
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup --python-exit-code 1 \
  --python blender/normalize_generated_asset.py -- <origen.glb> apps/web/public/models/workshop-game/props/<id>-v1.glb \
  --name <id> --height <metros> [--drop-base]
```

3. Registrarlo en `manifest.json` (origen, motor, prompt o referencia, créditos, bytes, triángulos, sha256) y colocarlo en `props.ts`.
4. Pasar el validador y verificar en navegador.

## Procedencia y licencia

Todos los assets de esta capa se generaron con Magnific el 9 de octubre de 2026 (cuenta de pago Premium+); el manifest guarda motor, prompt y créditos de cada uno. La foca parte del arte propio de Kliniu. Los demás son objetos genéricos sin marca ni texto: no reproducen productos comerciales ni representan datos de los proyectos. Los monitores siguen mostrando solo capturas reales.

La documentación pública de Magnific concede licencia comercial a imágenes y vídeo generados en planes de pago y deja al usuario la responsabilidad sobre derechos de terceros. **No menciona los modelos 3D**: queda pendiente de confirmar antes de un uso comercial. Decisión registrada en [`ADR-006`](../../../decisions/ADR-006-generated-3d-assets.md).

Descartado: la textura PBR de concreto generada resultó casi plana y con normal sesgada; se conserva la textura propia del shell.
