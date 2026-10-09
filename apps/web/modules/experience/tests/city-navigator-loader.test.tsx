import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useEffect, useLayoutEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CityNavigatorLoader } from '../components/city-navigator-loader';
import type { CityNavigatorProps } from '../components/city-navigator';
import type { CameraSnapshot, CityCameraHandle } from '../workshop-state';

const pose: CameraSnapshot = { position: [2, 3, 4], target: [1, 0, 1], factor: 1.5, offset: [.1, .2], width: 1200, height: 800 };
const restored: CameraSnapshot = { ...pose, position: [7, 8, 9] };
let sceneProps: CityNavigatorProps;
let currentPose: CameraSnapshot;
let intersect: (visible: boolean) => void;
let initializeScene = true;
const restoreScene = vi.fn((snapshot: CameraSnapshot) => { currentPose = snapshot; });

vi.mock('next/dynamic', () => ({ default: () => function Scene(props: CityNavigatorProps) {
  sceneProps = props;
  const { cameraHandle, onCameraSnapshot } = props;
  useLayoutEffect(() => {
    if (!initializeScene || !cameraHandle) return;
    const handle = { capture: () => currentPose, restore: restoreScene };
    cameraHandle.current = handle;
    return () => {
      onCameraSnapshot?.(handle.capture());
      if (cameraHandle.current === handle) cameraHandle.current = null;
    };
  }, [cameraHandle, onCameraSnapshot]);
  const onReady = props.onSceneReady;
  useEffect(() => { if (initializeScene) onReady?.(); }, [onReady]);
  return <><canvas width={300} /><button onClick={props.onSceneError}>Simular fallo del canvas</button></>;
} }));
const base = { selectedProjectId: 'drokex', onProjectSelect: vi.fn(), viewRevision: 0 };
let desktop = true;
beforeEach(() => {
  currentPose = pose;
  initializeScene = true;
  restoreScene.mockClear();
  desktop = true;
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({ matches: query.includes('min-width') && desktop, addEventListener: vi.fn(), removeEventListener: vi.fn() }));
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ getExtension: () => null } as never);
  vi.stubGlobal('IntersectionObserver', class {
    constructor(private callback: IntersectionObserverCallback) {
      intersect = visible => this.callback([{ isIntersecting: visible }] as IntersectionObserverEntry[], this as never);
    }
    observe() { this.callback([{ isIntersecting: true }] as IntersectionObserverEntry[], this as never); }
    disconnect() {}
  });
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });
describe('City loader visit preferences', () => {
  it.each([
    ['section', { section: 'technologies' }],
    ['detail', { detail: false }],
    ['exploded', { exploded: false }],
    ['tourStop', { tourStop: 'purchase' }],
    ['viewRevision', { viewRevision: 1 }],
  ] satisfies [string, Partial<CityNavigatorProps>][])('discards the closed camera after changing %s', (_field, change) => {
    const cameraHandle: { current: CityCameraHandle | null } = { current: null };
    const props: CityNavigatorProps = { ...base, detail: true, exploded: true, section: 'projects', tourStop: 'catalog', initialEnabled: true, cameraHandle };
    const { rerender } = render(<CityNavigatorLoader {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar vista 3D' }));
    expect(cameraHandle.current?.capture()).toEqual(pose);
    rerender(<CityNavigatorLoader {...props} {...change} />);
    expect(cameraHandle.current).toBeNull();
    rerender(<CityNavigatorLoader {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Explorar en 3D' }));
    expect(sceneProps.initialCamera).toBeNull();
  });
  it('preserves a restored camera with the same framing props and night changes', () => {
    const cameraHandle: { current: CityCameraHandle | null } = { current: null };
    const props: CityNavigatorProps = { ...base, detail: true, exploded: true, section: 'projects', tourStop: 'catalog', initialCamera: restored, initialEnabled: false, cameraHandle };
    const { rerender } = render(<CityNavigatorLoader {...props} />);
    rerender(<CityNavigatorLoader {...props} />);
    expect(cameraHandle.current?.capture()).toEqual(restored);
    rerender(<CityNavigatorLoader {...props} night />);
    expect(cameraHandle.current?.capture()).toEqual(restored);
    fireEvent.click(screen.getByRole('button', { name: 'Explorar en 3D' }));
    expect(sceneProps.initialCamera).toEqual(restored);
  });
  it('handles non-bubbling context loss before the scene initializes', () => {
    initializeScene = false;
    const failed = vi.fn();
    const active = vi.fn();
    const { container } = render(<CityNavigatorLoader {...base} initialEnabled onSceneError={failed} onActiveChange={active} />);
    expect(screen.getByRole('img', { name: 'Maqueta del taller de Daniel con sus cuatro proyectos' })).toBeInTheDocument();
    const canvas = container.querySelector('canvas')!;
    const lost = new Event('webglcontextlost', { bubbles: false, cancelable: true });
    fireEvent(canvas, lost);
    expect(lost.defaultPrevented).toBe(true);
    expect(failed).toHaveBeenCalledTimes(1);
    expect(active).toHaveBeenLastCalledWith(false);
    expect(screen.getByRole('img', { name: 'Maqueta del taller de Daniel' })).toBeInTheDocument();
    expect(container.querySelector('canvas')).toBeNull();
  });
  it('removes the native context-loss listener on unmount', () => {
    const failed = vi.fn();
    const { container, unmount } = render(<CityNavigatorLoader {...base} initialEnabled onSceneError={failed} />);
    const loader = container.firstElementChild!;
    unmount();
    const canvas = document.createElement('canvas');
    loader.appendChild(canvas);
    const lost = new Event('webglcontextlost', { bubbles: false, cancelable: true });
    fireEvent(canvas, lost);
    expect(lost.defaultPrevented).toBe(false);
    expect(failed).not.toHaveBeenCalled();
  });
  it('keeps the handle null when there is no canvas or saved snapshot', () => {
    const cameraHandle: { current: CityCameraHandle | null } = { current: null };
    render(<CityNavigatorLoader {...base} initialEnabled={false} cameraHandle={cameraHandle} />);
    expect(cameraHandle.current).toBeNull();
  });
  it('caches the current selection after changing projects with the canvas mounted', () => {
    const cameraHandle: { current: CityCameraHandle | null } = { current: null };
    const { rerender } = render(<CityNavigatorLoader {...base} initialEnabled cameraHandle={cameraHandle} />);
    rerender(<CityNavigatorLoader {...base} selectedProjectId="kliniu" initialEnabled cameraHandle={cameraHandle} />);
    currentPose = restored;
    act(() => intersect(false));
    expect(cameraHandle.current?.capture()).toEqual(restored);
    act(() => intersect(true));
    expect(sceneProps.initialCamera).toEqual(restored);
  });
  it('keeps capture and restore available after the canvas leaves the viewport', () => {
    const cameraHandle: { current: CityCameraHandle | null } = { current: null };
    render(<CityNavigatorLoader {...base} initialEnabled cameraHandle={cameraHandle} />);
    expect(cameraHandle.current?.capture()).toEqual(pose);
    act(() => intersect(false));
    expect(screen.queryByRole('button', { name: 'Simular fallo del canvas' })).not.toBeInTheDocument();
    expect(cameraHandle.current?.capture()).toEqual(pose);
    act(() => cameraHandle.current?.restore(restored));
    expect(cameraHandle.current?.capture()).toEqual(restored);
    expect(restoreScene).not.toHaveBeenCalled();
    act(() => intersect(true));
    expect(sceneProps.initialCamera).toEqual(restored);
    act(() => cameraHandle.current?.restore(pose));
    expect(restoreScene).toHaveBeenCalledWith(pose);
  });
  it('discards the cached pose when selection changes offscreen, even if it changes back', () => {
    const cameraHandle: { current: CityCameraHandle | null } = { current: null };
    const { rerender } = render(<CityNavigatorLoader {...base} initialEnabled cameraHandle={cameraHandle} />);
    act(() => intersect(false));
    rerender(<CityNavigatorLoader {...base} selectedProjectId="kliniu" initialEnabled cameraHandle={cameraHandle} />);
    expect(cameraHandle.current).toBeNull();
    rerender(<CityNavigatorLoader {...base} initialEnabled cameraHandle={cameraHandle} />);
    act(() => intersect(true));
    expect(sceneProps.initialCamera).toBeNull();
  });
  it('exposes the initial camera with 3D closed and keeps opt-in closed during offline restore', () => {
    const cameraHandle: { current: CityCameraHandle | null } = { current: null };
    const change = vi.fn();
    const { unmount } = render(<CityNavigatorLoader {...base} initialCamera={pose} initialEnabled={false} cameraHandle={cameraHandle} onEnabledChange={change} />);
    expect(cameraHandle.current?.capture()).toEqual(pose);
    act(() => cameraHandle.current?.restore(restored));
    expect(cameraHandle.current?.capture()).toEqual(restored);
    expect(change).toHaveBeenLastCalledWith(false);
    expect(screen.getByRole('button', { name: 'Explorar en 3D' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Explorar en 3D' }));
    expect(sceneProps.initialCamera).toEqual(restored);
    unmount();
    expect(cameraHandle.current).toBeNull();
  });
  it('keeps explicitly closed desktop 3D closed after returning', () => {
    render(<CityNavigatorLoader {...base} initialEnabled={false} />);
    expect(screen.getByRole('button', { name: 'Explorar en 3D' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Simular fallo del canvas' })).not.toBeInTheDocument();
  });
  it('restores mobile opt-in and reports close without enabling again', async () => {
    desktop = false;
    const change = vi.fn();
    render(<CityNavigatorLoader {...base} initialEnabled onEnabledChange={change} />);
    await screen.findByRole('button', { name: 'Cerrar vista 3D' });
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar vista 3D' }));
    expect(change).toHaveBeenLastCalledWith(false);
    expect(screen.getByRole('button', { name: 'Explorar en 3D' })).toBeInTheDocument();
  });
  it('reports inactive and restores a poster after a scene failure', async () => {
    const active = vi.fn();
    render(<CityNavigatorLoader {...base} initialEnabled onActiveChange={active} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Simular fallo del canvas' }));
    await waitFor(() => expect(active).toHaveBeenLastCalledWith(false));
    expect(screen.getByRole('img', { name: 'Maqueta del taller de Daniel' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Simular fallo del canvas' })).not.toBeInTheDocument();
  });
});
