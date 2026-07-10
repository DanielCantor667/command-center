import { sceneSchema, type Scene } from '@command-center/ai-renderer';

export const EXAMPLE_SCENE: Scene = sceneSchema.parse({
  version: 1,
  id: 'example-office',
  metadata: { name: 'Sample Office' },
  objects: [
    { id: 'desk-1', asset: 'desk', transform: { position: { x: 0, y: 0, z: 0 } } },
    { id: 'chair-1', asset: 'chair', transform: { position: { x: 0, y: 0, z: 1.2 } } },
    { id: 'reception-1', asset: 'reception', transform: { position: { x: -3, y: 0, z: 0 } } },
  ],
});
