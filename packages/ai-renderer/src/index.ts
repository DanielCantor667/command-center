export { ASSET_IDS } from './constants/asset-catalog';
export type { AssetId } from './constants/asset-catalog';

export { MODELS_BASE_PATH, THUMBNAILS_BASE_PATH } from './constants/models-path';

export { vector3Schema } from './schemas/vector3.schema';
export type { Vector3 } from './schemas/vector3.schema';

export { transformSchema } from './schemas/transform.schema';
export type { Transform } from './schemas/transform.schema';

export { sceneObjectSchema } from './schemas/scene-object.schema';
export type { SceneObject } from './schemas/scene-object.schema';

export { sceneSchema } from './schemas/scene.schema';
export type { Scene } from './schemas/scene.schema';

export { assetMetadataSchema, assetCategorySchema } from './schemas/asset-metadata.schema';
export type { AssetMetadata, AssetCategory } from './schemas/asset-metadata.schema';

export { ASSET_REGISTRY, getAssetMetadata, listAssets, listAssetsByCategory } from './assets/asset-registry';
export { resolveModelUrl, resolveThumbnailUrl } from './assets/asset-loader';
