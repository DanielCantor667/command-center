# Scene Schema — Design Spec

## Contexto

Command Center quiere generar escenas 3D (oficinas, bodegas, salas) a partir de
instrucciones en lenguaje natural. La arquitectura completa involucra IA (Claude/OpenAI),
Blender headless para render, y React Three Fiber para visualización interactiva.

Ese sistema completo se descompone en subproyectos independientes:
1. **Scene Schema** (este spec) — el contrato de datos entre todos los componentes.
2. Asset Catalog (ampliación futura del catálogo, con metadata de cada asset).
3. Scene Builder (Three.js).
4. React Three Fiber Viewer.
5. Blender Render Pipeline.
6. AI Prompt → Scene Generator.

Este spec cubre únicamente el subproyecto 1. Es la pieza fundacional: ningún otro
componente podrá depender de Blender, React Three Fiber o la IA — el único contrato
entre ellos es este schema.

## Objetivo

Definir un paquete workspace `@command-center/ai-renderer`, completamente desacoplado
del resto del proyecto, que exponga el modelo de datos oficial de una escena 3D.
Solo depende de TypeScript, Zod y Vitest.

## Alcance (versión mínima)

Incluye:
- Catálogo fijo de asset IDs válidos (`ASSET_IDS`).
- `Vector3`: objeto `{x, y, z}` (no tupla — el sistema crecerá hacia Blender/Three.js/edición
  interactiva, donde acceso por clave es más natural que por índice).
- `Transform`: `position`, `rotation`, `scale`, los tres con default.
- `SceneObject`: `id`, `asset`, `transform`, `properties` (vacío por ahora, existe para
  no romper compatibilidad cuando lleguen materiales/colores/texturas/visibilidad).
- `Scene`: `version` (literal `1`), `id`, `metadata` (`name?`, `createdAt?`, opcional),
  `objects`.

Explícitamente fuera de alcance en esta versión:
- Materiales, colores, texturas.
- Cámara e iluminación.
- Entorno/HDRI.
- Colisiones/física.
- Exportadores (Blender, glTF, etc.).

## Ubicación y estructura

```
packages/ai-renderer/
  package.json
  tsconfig.json          (extiende @command-center/tsconfig/base.json)
  eslint.config.js        (@command-center/eslint-config)
  vitest.config.ts         (environment: node)
  src/
    constants/
      asset-catalog.ts    ← ASSET_IDS, AssetId
    schemas/
      vector3.schema.ts
      transform.schema.ts
      scene-object.schema.ts
      scene.schema.ts
    index.ts              ← exports públicos únicamente
  tests/
    scene.schema.test.ts
```

Sigue la misma convención que `packages/config` y `packages/ui` (mismo `tsconfig` base,
mismo `eslint-config`, mismo runner Vitest).

## Contenido del schema

```ts
// constants/asset-catalog.ts
export const ASSET_IDS = [
  'office', 'meeting_room', 'warehouse', 'truck', 'rack',
  'computer', 'employee', 'desk', 'chair', 'tree', 'reception', 'factory',
] as const;
export type AssetId = (typeof ASSET_IDS)[number];
```

```ts
// schemas/vector3.schema.ts
export const vector3Schema = z.object({ x: z.number(), y: z.number(), z: z.number() });
export type Vector3 = z.infer<typeof vector3Schema>;
```

```ts
// schemas/transform.schema.ts
export const transformSchema = z.object({
  position: vector3Schema.default({ x: 0, y: 0, z: 0 }),
  rotation: vector3Schema.default({ x: 0, y: 0, z: 0 }),
  scale: z.number().default(1),
});
export type Transform = z.infer<typeof transformSchema>;
```

```ts
// schemas/scene-object.schema.ts
export const sceneObjectSchema = z.object({
  id: z.string(),
  asset: z.enum(ASSET_IDS),
  transform: transformSchema.default({ position: {x:0,y:0,z:0}, rotation: {x:0,y:0,z:0}, scale: 1 }),
  properties: z.object({}).default({}),
});
export type SceneObject = z.infer<typeof sceneObjectSchema>;
```

```ts
// schemas/scene.schema.ts
const sceneMetadataSchema = z.object({ name: z.string().optional(), createdAt: z.string().optional() });
export const sceneSchema = z.object({
  version: z.literal(1),
  id: z.string(),
  metadata: sceneMetadataSchema.default({}),
  objects: z.array(sceneObjectSchema),
});
export type Scene = z.infer<typeof sceneSchema>;
```

`index.ts` re-exporta únicamente la API pública: `sceneSchema`, `sceneObjectSchema`,
`transformSchema`, `vector3Schema`, `ASSET_IDS`, y los tipos `Scene`, `SceneObject`,
`Transform`, `Vector3`, `AssetId`. Nada más se importa desde fuera del paquete.

## Testing

`tests/scene.schema.test.ts`, con Vitest, cubre:
- Escena válida con dos objetos.
- Asset inválido → rechazo.
- Posición inválida (falta un componente) → rechazo.
- Default de `rotation`.
- Default de `scale`.
- `version` requerido (ausente → rechazo).
- `metadata` opcional (se omite y no falla).
- `properties` presente tras el parseo.

Sin snapshots, sin `any`.

## Verificación (ejecutada)

- `pnpm --filter @command-center/ai-renderer test` → 8/8 tests pasan.
- `pnpm --filter @command-center/ai-renderer build` (`tsc --noEmit`) → sin errores.
- `pnpm --filter @command-center/ai-renderer lint` → sin errores.
- `pnpm test` y `pnpm lint` a nivel monorepo → sin regresiones en `ai-renderer`
  (errores de lint preexistentes en `apps/web` quedan fuera de este alcance, no se tocan).

## Fuera de alcance / próximos pasos

- Subproyectos 2–6 (asset catalog extendido, scene builder, visor R3F, pipeline Blender,
  generador IA) tienen su propio spec futuro y consumirán `@command-center/ai-renderer`
  como dependencia workspace.
- Evolución del schema (materiales, cámara, luces, entorno) se hace vía el campo `version`
  y la estructura extensible (`properties`, `metadata`), sin romper compatibilidad.
