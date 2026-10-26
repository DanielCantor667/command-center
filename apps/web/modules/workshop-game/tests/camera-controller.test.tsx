import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PerspectiveCamera, Vector3 } from 'three';
import { StrictMode } from 'react';
import { CameraController, type WorldCameraHandle } from '../camera-controller';

const renderer = vi.hoisted(() => ({ current: {} as Record<string, unknown> }));
vi.mock('@react-three/fiber', () => ({
  useThree: () => renderer.current,
  useFrame: () => {},
}));

describe('restoring the workshop camera', () => {
  it.each([false, true])('keeps the saved position and viewing direction on return (strict mode: %s)', strict => {
    const camera = new PerspectiveCamera();
    renderer.current = { camera, gl: { domElement: document.createElement('canvas') }, invalidate: vi.fn(), size: { width: 1440, height: 900 } };
    const saved = { position: [-5.1, 1.65, -1.9] as [number, number, number], target: [-4.2, 1.6, -6] as [number, number, number] };
    const cameraHandle = { current: null as WorldCameraHandle | null };
    const controller = <CameraController point="kliniu" moving={false} token={0} initialCamera={saved} reducedMotion cameraHandle={cameraHandle} onArrived={vi.fn()} suspended={false} />;
    render(strict ? <StrictMode>{controller}</StrictMode> : controller);
    expect(camera.position.toArray()).toEqual(saved.position);
    expect(camera.getWorldDirection(new Vector3()).distanceTo(new Vector3(...saved.target).sub(new Vector3(...saved.position)).normalize())).toBeLessThan(1e-10);
    expect(cameraHandle.current?.capture()).toEqual(saved);
  });
});
