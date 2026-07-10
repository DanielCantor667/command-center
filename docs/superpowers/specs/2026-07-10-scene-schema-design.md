# Scene Schema — Design Spec

## Contexto

Command Center quiere generar escenas 3D (oficinas, bodegas, salas) a partir de
instrucciones en lenguaje natural. La arquitectura completa involucra IA (Claude/OpenAI),
Blender headless para render, y React Three Fiber para visualización interactiva.

Ese sistema completo se descompone en subproyectos independientes:
1. **Schema JSON de escena** (este spec) — el contrato de datos entre la IA y el renderer.
2. Visor R3F — componente de visualización 3D.
3. API route que invoca la IA y genera el JSON.
4. Pipeline Blender — script Python headless que consume el JSON y renderiza.

Este spec cubre únicamente el subproyecto 1. Es la pieza fundacional: sin un contrato de
datos validado, ningún otro subproyecto puede consumir o producir escenas de forma consistente.

## Objetivo

Definir un paquete compartido en el monorepo con el schema de una "escena" mínima:
una lista de objetos (assets) posicionados en el espacio, validado en runtime con Zod
e inferido a tipos TypeScript.

## Alcance (versión mínima)

Incluye:
- Catálogo fijo de asset IDs válidos (enum).
- Objeto de escena: asset + posición (obligatorio), rotación y escala (opcionales, con defaults).
- Escena: id + lista de objetos.

Explícitamente fuera de alcance en esta versión (se añadirán en iteraciones futuras):
- Materiales/colores por objeto.
- Cámara y configuración de iluminación.
- Entorno/HDRI.
- Validación de que un `asset` + `position` no colisionen entre sí (validación espacial).

## Ubicación y estructura

Nuevo paquete workspace `@command-center/ai-renderer`, siguiendo la convención de
`packages/config` y `packages/ui` ya existentes en el repo.

```
packages/ai-renderer/
  package.json
  tsconfig.json          (extiende packages/tsconfig)
  src/
    schemas/
      asset-catalog.ts   ← enum AssetId
      scene.schema.ts    ← Zod schemas + tipos inferidos
    index.ts             ← exports públicos
  tests/
    scene.schema.test.ts
```

Runtime de validación: **Zod** (ya usado en `apps/web`, versión `^4.4.3`).
Test runner: **Vitest** (`vitest run`, consistente con el resto del monorepo).

## Contenido del schema

```ts
// asset-catalog.ts
export const ASSET_IDS = [
  'office', 'meeting_room', 'warehouse', 'truck', 'rack',
  'computer', 'employee', 'desk', 'chair', 'tree', 'reception', 'factory',
] as const;

export type AssetId = typeof ASSET_IDS[number];
```

```ts
// scene.schema.ts
const vector3 = z.tuple([z.number(), z.number(), z.number()]);

export const sceneObjectSchema = z.object({
  asset: z.enum(ASSET_IDS),
  position: vector3,
  rotation: vector3.default([0, 0, 0]),
  scale: z.number().default(1),
});

export const sceneSchema = z.object({
  id: z.string(),
  objects: z.array(sceneObjectSchema),
});

export type SceneObject = z.infer<typeof sceneObjectSchema>;
export type Scene = z.infer<typeof sceneSchema>;
```

`index.ts` re-exporta `Scene`, `SceneObject`, `AssetId`, `sceneSchema`, `sceneObjectSchema`,
`ASSET_IDS`.

## Testing

`tests/scene.schema.test.ts` cubre con Vitest:
- Parseo exitoso de una escena válida con 2+ objetos.
- Rechazo cuando `asset` no está en `ASSET_IDS`.
- Rechazo cuando `position` no tiene 3 componentes numéricos.
- Defaults aplicados: `rotation` → `[0,0,0]`, `scale` → `1` cuando se omiten.

## Verificación

- `pnpm --filter @command-center/ai-renderer test` pasa sin errores.
- `pnpm --filter @command-center/ai-renderer build` (o `tsc --noEmit`) compila sin errores de tipos.
- El paquete queda listado en el workspace (`pnpm -r list` lo muestra) y es importable desde
  `apps/web` vía `@command-center/ai-renderer` sin cambios adicionales de configuración
  (gracias a los `workspace:*` del monorepo).

## Fuera de alcance / próximos pasos

- Subproyectos 2, 3 y 4 (visor R3F, API route, pipeline Blender) tienen su propio spec futuro
  y consumirán este paquete como dependencia.
- Versión "intermedia" del schema (materiales + cámara) y "completa" (luces + entorno) quedan
  documentadas como evolución futura, no se implementan ahora.
