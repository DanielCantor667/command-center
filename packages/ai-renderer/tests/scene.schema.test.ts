import { describe, expect, it } from 'vitest';
import { sceneSchema } from '../src/schemas/scene.schema';

describe('sceneSchema', () => {
  it('parses a valid scene with two objects', () => {
    const result = sceneSchema.parse({
      version: 1,
      id: 'scene-1',
      objects: [
        {
          id: 'obj-1',
          asset: 'desk',
          transform: { position: { x: 1, y: 0, z: 2 } },
          properties: {},
        },
        {
          id: 'obj-2',
          asset: 'chair',
          transform: { position: { x: 1.2, y: 0, z: 2 } },
          properties: {},
        },
      ],
    });

    expect(result.objects).toHaveLength(2);
  });

  it('rejects an invalid asset id', () => {
    expect(() =>
      sceneSchema.parse({
        version: 1,
        id: 'scene-1',
        objects: [
          {
            id: 'obj-1',
            asset: 'unknown_asset',
            transform: {},
            properties: {},
          },
        ],
      }),
    ).toThrow();
  });

  it('rejects an invalid position', () => {
    expect(() =>
      sceneSchema.parse({
        version: 1,
        id: 'scene-1',
        objects: [
          {
            id: 'obj-1',
            asset: 'desk',
            transform: { position: { x: 1, y: 0 } },
            properties: {},
          },
        ],
      }),
    ).toThrow();
  });

  it('applies the rotation default', () => {
    const result = sceneSchema.parse({
      version: 1,
      id: 'scene-1',
      objects: [
        { id: 'obj-1', asset: 'desk', transform: { position: { x: 0, y: 0, z: 0 } } },
      ],
    });

    expect(result.objects[0]?.transform.rotation).toEqual({ x: 0, y: 0, z: 0 });
  });

  it('applies the scale default', () => {
    const result = sceneSchema.parse({
      version: 1,
      id: 'scene-1',
      objects: [
        { id: 'obj-1', asset: 'desk', transform: { position: { x: 0, y: 0, z: 0 } } },
      ],
    });

    expect(result.objects[0]?.transform.scale).toBe(1);
  });

  it('requires version', () => {
    expect(() =>
      sceneSchema.parse({
        id: 'scene-1',
        objects: [],
      }),
    ).toThrow();
  });

  it('allows metadata to be omitted', () => {
    const result = sceneSchema.parse({
      version: 1,
      id: 'scene-1',
      objects: [],
    });

    expect(result.metadata).toEqual({});
  });

  it('includes properties on scene objects', () => {
    const result = sceneSchema.parse({
      version: 1,
      id: 'scene-1',
      objects: [
        { id: 'obj-1', asset: 'desk', transform: { position: { x: 0, y: 0, z: 0 } } },
      ],
    });

    expect(result.objects[0]?.properties).toEqual({});
  });
});
