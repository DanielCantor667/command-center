# 3D Office Pipeline

> Guía operativa corta. La descripción completa de arquitectura, contratos, estado y límites está
> en [`3d-office-system.md`](./3d-office-system.md). La fase siguiente está especificada en
> [`SPRINT-0.7-SCENE-PROJECTS.md`](../04-sprints/SPRINT-0.7-SCENE-PROJECTS.md).

## Resultado actual

El módulo **Lab** permite crear una oficina 3D desde cantidad de personas, estilo y una instrucción opcional de IA. La escena se puede orbitar, seleccionar, arrastrar, deshacer, rehacer y guardar en `localStorage`.

El canvas incluye un plano de zonas (reception, open workspace, meeting y support) derivado de los activos de la escena. El inspector permite rotar, escalar, alinear a una cuadrícula de 0.5 m, duplicar y eliminar el activo seleccionado.

La biblioteca expone todo el catálogo de assets permitido por el schema, los inserta en posiciones libres de la cuadrícula y selecciona el nuevo objeto. **Export JSON** descarga el `Scene` validado para reutilizarlo en la API o en el pipeline de Blender.

**Import JSON** valida el archivo antes de cargarlo. **Save draft** conserva una recuperación en
`localStorage`. La galería autenticada crea proyectos en Supabase y cada **Nueva revisión**
mantiene un estado durable recuperable.

El panel **Estado del plano** aplica verificaciones de preparación antes de persistir o renderizar: perímetro de oficina, recepción, relación escritorio/silla, cantidad de salas y activos fuera de los límites.

## Flujo

1. `@command-center/scene-planner` usa `@command-center/workplace-design-system` para elegir el preset, la cantidad de salas y el layout inicial.
2. Devuelve un `Scene` validado por `@command-center/ai-renderer`.
3. `apps/web/modules/scene-viewer` carga el GLB declarado por cada asset mediante React Three Fiber; mientras carga conserva una representación procedural de respaldo.
4. `POST /api/scenes` devuelve el plan determinista por defecto. Si existe `ANTHROPIC_API_KEY` y se envía `prompt`, usa `@command-center/scene-generator` y valida la respuesta contra el mismo schema.

## Uso local

```bash
pnpm dev
```

Abre **Lab** en la navegación. Para llamar el endpoint directamente:

```bash
curl -X POST http://localhost:3000/api/scenes \
  -H 'content-type: application/json' \
  --data '{"occupants": 24, "style": "scandinavian"}'
```

## Blender

El catálogo mínimo completo contiene doce GLB reproducibles. Para regenerarlo desde los primitivos editables de Blender:

```bash
pnpm blender:assets
```

El render headless usa exactamente esos mismos GLB que carga el Lab:

```bash
pnpm blender:render
```

Los comandos localizan `blender` desde el PATH, `BLENDER_BIN` o la instalación estándar de macOS. El render produce `blender/output/starter-office.glb` y `blender/output/starter-office.png`; el script de assets escribe los doce modelos en `apps/web/public/models`, que es la única fuente de verdad compartida entre web y Blender.

Antes de renderizar, valida el JSON y sus GLB requeridos sin Blender:

```bash
pnpm blender:validate
```

Para procesar el siguiente render job pendiente:

```bash
pnpm --filter @command-center/web render:worker
```

## Verificación completa

```bash
pnpm lint
pnpm test
pnpm build
pnpm blender:validate
pnpm blender:render
git diff --check
```

## Persistencia

La migración Prisma crea proyectos, revisiones y render jobs con políticas RLS. Las claves reales
permanecen exclusivamente en `apps/web/.env`, ignorado por Git. Para una instalación nueva:

```bash
cd apps/web
pnpm exec prisma migrate deploy
pnpm exec prisma generate
```
