/**
 * Single source of truth for where .glb models live: apps/web/public/models/.
 * The R3F viewer serves this folder directly (Next.js /public). The Blender
 * pipeline's `assets_dir` CLI argument must point at this same folder on disk
 * so the web viewer and Blender render from identical files.
 */
export const MODELS_BASE_PATH = '/models';
export const THUMBNAILS_BASE_PATH = '/models/thumbnails';
