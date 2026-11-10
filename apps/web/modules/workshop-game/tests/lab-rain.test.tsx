import { render, screen } from '@testing-library/react';
import { Suspense } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Group } from 'three';
import { OptionalBoundary } from '../lab-scene';
import { LabRain } from '../lab-rain';

const loader = vi.hoisted(() => ({ load: vi.fn() }));
vi.mock('@react-three/drei', () => ({
  useGLTF: (...args: unknown[]) => loader.load(...args),
  useAnimations: () => ({ actions: {} }),
  Html: () => null,
}));

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });
describe('optional lab rain', () => {
  it('loads the tier model only when the component mounts', () => {
    window.history.replaceState(null, '', '?quality=high');
    loader.load.mockReset().mockReturnValue({ scene: new Group() });
    expect(loader.load).not.toHaveBeenCalled();
    render(<LabRain />);
    expect(loader.load).toHaveBeenCalledWith('/models/workshop-lab/high/lab-rain-v1.glb');
  });
  it('keeps the rest of the scene visible if the model fails', () => {
    loader.load.mockReset().mockImplementation(() => { throw new Error('missing optional model'); });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<><span>taller disponible</span><OptionalBoundary><Suspense fallback={null}><LabRain /></Suspense></OptionalBoundary></>);
    expect(screen.getByText('taller disponible')).toBeInTheDocument();
  });
});
