import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PerspectiveCamera, Vector3 } from 'three';
import { StrictMode } from 'react';
import { CameraController, type WorldCameraHandle } from '../camera-controller';
import { LAB_ANCHORS } from '../lab-anchors';

const renderer = vi.hoisted(() => ({ current: {} as Record<string, unknown> }));
vi.mock('@react-three/fiber', () => ({
  useThree: () => renderer.current,
  useFrame: () => {},
}));

describe('restoring the workshop camera', () => {
  it.each([false, true])('keeps the saved position and viewing direction on return (strict mode: %s)', strict => {
    const camera = new PerspectiveCamera();
    renderer.current = { camera, gl: { domElement: document.createElement('canvas') }, invalidate: vi.fn(), size: { width: 1440, height: 900 } };
    const saved = { position: [.2, 1.65, -2.1] as [number, number, number], target: [2.9, 1.9, -3.2] as [number, number, number] };
    const cameraHandle = { current: null as WorldCameraHandle | null };
    const controller = <CameraController point="projects" moving={false} token={0} initialCamera={saved} reducedMotion cameraHandle={cameraHandle} onArrived={vi.fn()} suspended={false} />;
    render(strict ? <StrictMode>{controller}</StrictMode> : controller);
    expect(camera.position.toArray()).toEqual(saved.position);
    expect(camera.getWorldDirection(new Vector3()).distanceTo(new Vector3(...saved.target).sub(new Vector3(...saved.position)).normalize())).toBeLessThan(1e-10);
    expect(cameraHandle.current?.capture()).toEqual(saved);
  });
});

describe('portrait project gallery', () => {
  it.each([[375, 812], [320, 568]])('keeps both ends of the gallery inside a %ix%i viewport', (width, height) => {
    const camera = new PerspectiveCamera(78, width / height, .1, 100);
    renderer.current = { camera, gl: { domElement: document.createElement('canvas') }, invalidate: vi.fn(), size: { width, height } };
    const cameraHandle = { current: null as WorldCameraHandle | null };
    render(<CameraController point="projects" moving={false} token={0} initialCamera={null} reducedMotion cameraHandle={cameraHandle} onArrived={vi.fn()} suspended={false} />);
    camera.updateMatrixWorld();
    camera.updateProjectionMatrix();
    for (const id of ['kliniu', 'lorigine', '4ustudio-academy', 'drokex']) {
      const anchor = LAB_ANCHORS[`screen_gallery_${id}`]!;
      for (const side of [-1, 1]) {
        const point = new Vector3(...anchor.position);
        point.z += side * anchor.size[0] / 2;
        expect(Math.abs(point.project(camera).x)).toBeLessThan(.95);
      }
      if (width === 320) {
        const label = LAB_ANCHORS[`label_gallery_${id}`]!;
        const bottom = new Vector3(...label.position);
        bottom.y -= label.size[1] / 2;
        const pixelsFromTop = (1 - bottom.project(camera).y) * height / 2;
        expect(pixelsFromTop).toBeLessThan(260);
      }
    }
    expect(Math.abs(camera.position.x)).toBeLessThan(3.7);
    expect(camera.position.z).toBeGreaterThan(-4.5);
    expect(camera.position.z).toBeLessThan(5.7);
  });
});
