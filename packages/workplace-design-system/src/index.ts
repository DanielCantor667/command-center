export {
  MODULE_IDS,
  MODULE_CATEGORIES,
  MODULE_PRIORITIES,
  MATERIAL_FAMILIES,
  MATERIAL_IDS,
  MATERIAL_FINISHES,
  STYLE_IDS,
  SPACE_DENSITIES,
} from './constants';
export type {
  ModuleId,
  ModuleCategory,
  ModulePriority,
  MaterialFamily,
  MaterialId,
  MaterialFinish,
  StyleId,
  SpaceDensity,
} from './constants';

export { moduleSchema, MODULE_REGISTRY, getModule, listModules } from './modules';
export type { Module } from './modules';

export { moduleRelationSchema, MODULE_RELATIONS, getModuleRelations, listModuleRelations } from './module-relations';
export type { ModuleRelation } from './module-relations';

export { styleSchema, STYLE_REGISTRY, getStyle, listStyles } from './styles';
export type { Style } from './styles';

export { materialSchema, MATERIAL_REGISTRY, getMaterial, listMaterials, getCompatibleStyles } from './materials';
export type { Material } from './materials';

export { spatialRulesSchema, SPATIAL_RULES } from './spatial-rules';
export type { SpatialRules } from './spatial-rules';

export { planningPresetSchema, PLANNING_PRESETS, getPlanningPreset, listPlanningPresets } from './planning-presets';
export type { PlanningPreset } from './planning-presets';
