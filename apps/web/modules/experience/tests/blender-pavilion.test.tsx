import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { render } from '@testing-library/react';
import { useGLTF } from '@react-three/drei';
import { Group } from 'three';
import { describe, expect, it, vi } from 'vitest';
import { BlenderPavilion } from '../components/blender-pavilion';

vi.mock('@react-three/drei', () => ({ useGLTF: vi.fn() }));
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
  useThree: () => ({ invalidate: vi.fn() }),
}));

describe('pavilion models', () => {
  it.each([
    ['stage', '/models/workshop/stage-realistic-v1.glb'],
    ['kliniu', '/models/workshop/kliniu-interactive-v4.glb'],
    ['4ustudio-academy', '/models/workshop/academy-interactive-v4.glb'],
    ['lorigine', '/models/workshop/lorigine-interactive-v4.glb'],
    ['drokex', '/models/workshop/drokex-interactive-v4.glb'],
  ])('loads an existing model for %s', (projectId, path) => {
    vi.mocked(useGLTF).mockReturnValue({ scene: new Group() } as never);
    const view = render(<BlenderPavilion projectId={projectId} />);

    expect(useGLTF).toHaveBeenLastCalledWith(path);
    expect(existsSync(resolve(process.cwd(), 'public', path.slice(1)))).toBe(true);
    view.unmount();
  });
});
