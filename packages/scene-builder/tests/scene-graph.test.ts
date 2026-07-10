import { describe, expect, it } from 'vitest';
import { sceneSchema } from '@command-center/ai-renderer';
import { buildSceneGraph } from '../src/scene-graph';

describe('buildSceneGraph', () => {
  it('resolves scene objects into Three.js-ready nodes', () => {
    const scene = sceneSchema.parse({
      version: 1,
      id: 'scene-1',
      objects: [
        {
          id: 'obj-1',
          asset: 'desk',
          transform: { position: { x: 1, y: 0, z: 2 } },
        },
      ],
    });

    const graph = buildSceneGraph(scene);

    expect(graph.id).toBe('scene-1');
    expect(graph.objects).toHaveLength(1);

    const [resolved] = graph.objects;
    expect(resolved?.position.toArray()).toEqual([1, 0, 2]);
    expect(resolved?.scale).toBe(1);
    expect(resolved?.metadata.id).toBe('desk');
    expect(resolved?.metadata.modelPath).toBe('/models/desk.glb');
  });

  it('preserves rotation from transform', () => {
    const scene = sceneSchema.parse({
      version: 1,
      id: 'scene-2',
      objects: [
        {
          id: 'obj-1',
          asset: 'chair',
          transform: { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 1.57, z: 0 } },
        },
      ],
    });

    const graph = buildSceneGraph(scene);

    expect(graph.objects[0]?.rotation.y).toBeCloseTo(1.57);
  });
});
