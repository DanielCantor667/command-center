import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkshopGame } from '../component';
import type { WorldSceneProps } from '../world-scene';

let props: WorldSceneProps;
vi.mock('../renderer-support', () => ({ supportsWorldRenderer: () => true }));
vi.mock('../world-scene', () => ({ resetWorkshopResource: vi.fn() }));
vi.mock('next/dynamic', () => ({ default: () => (sceneProps: WorldSceneProps) => { props = sceneProps; return <div data-testid="scene-resource" />; } }));
describe('workshop game access', () => {
  beforeEach(() => { window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }); window.scrollTo = vi.fn(); });
  afterEach(() => vi.restoreAllMocks());
  it('keeps the landing and portfolio available without mounting WebGL', () => {
    const portfolio = vi.fn();
    render(<WorkshopGame onOpenCase={vi.fn()} onSave={vi.fn()} onPortfolio={portfolio} />);
    expect(screen.queryByTestId('scene-resource')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Ver portafolio' }));
    expect(portfolio).toHaveBeenCalledOnce();
  });
  it('focuses the entrance when a direct reader has no surviving opener', async () => {
    const callbacks = { onOpenCase: vi.fn(), onSave: vi.fn(), onPortfolio: vi.fn() };
    const view = render(<WorkshopGame {...callbacks} reading={{ kind: 'contact' }} />);
    expect(screen.getByRole('dialog', { name: 'Contacto' })).toBeInTheDocument();
    view.rerender(<WorkshopGame {...callbacks} reading={null} />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Entrar al taller' })).toHaveFocus());
  });
  it('focuses retry when the reader opener disappears after actual world failure', async () => {
    const callbacks = { onOpenCase: vi.fn(), onSave: vi.fn(), onPortfolio: vi.fn() };
    const view = render(<WorkshopGame {...callbacks} initialSnapshot={{ point: 'contact', camera: null }} />);
    view.rerender(<WorkshopGame {...callbacks} initialSnapshot={{ point: 'contact', camera: null }} reading={{ kind: 'contact' }} />);
    act(() => props.onError(props.token));
    view.rerender(<WorkshopGame {...callbacks} initialSnapshot={{ point: 'contact', camera: null }} reading={null} />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Reintentar' })).toHaveFocus());
  });
  it('cancels a load and ignores its late first-frame callback', () => {
    render(<WorkshopGame onOpenCase={vi.fn()} onSave={vi.fn()} onPortfolio={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Entrar al taller' }));
    const oldReady = props.onReady;
    const oldToken = props.token;
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar entrada' }));
    act(() => oldReady(oldToken));
    expect(screen.getByRole('button', { name: 'Entrar al taller' })).toBeVisible();
    expect(screen.queryByTestId('scene-resource')).not.toBeInTheDocument();
  });
  it('saves the exact camera before opening the case and restores focus on return', () => {
    const camera = { position: [-5.1, 1.65, -1.9] as [number, number, number], target: [-4.2, 1.6, -6] as [number, number, number] };
    const save = vi.fn(); const open = vi.fn();
    render(<WorkshopGame initialSnapshot={{ point: 'kliniu', camera }} onSave={save} onOpenCase={open} onPortfolio={vi.fn()} />);
    props.cameraHandle.current = { capture: () => camera };
    const button = screen.getByRole('button', { name: 'Abrir caso de Kliniu' });
    expect(button).toHaveFocus();
    fireEvent.click(button);
    expect(save).toHaveBeenCalledWith({ point: 'kliniu', camera });
    expect(save.mock.invocationCallOrder[0]).toBeLessThan(open.mock.invocationCallOrder[0]!);
    expect(open).toHaveBeenCalledWith('kliniu');
  });
  it('returns keyboard focus to a navigation control after Escape and cancellation', () => {
    render(<WorkshopGame initialSnapshot={{ point: 'kliniu', camera: null }} onSave={vi.fn()} onOpenCase={vi.fn()} onPortfolio={vi.fn()} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    act(() => props.onArrived(props.token));
    expect(screen.getByRole('button', { name: 'El taller' })).toHaveFocus();
    fireEvent.click(screen.getByRole('button', { name: 'Ir a Kliniu' }));
    act(() => props.onRoomReady('kliniu', props.token));
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar recorrido' }));
    expect(screen.getByRole('button', { name: 'El taller' })).toHaveFocus();
  });
  it('starts a fresh entrance camera after a restored room loses its GPU context', async () => {
    const camera = { position: [-6.4, 1.65, 5.7] as [number, number, number], target: [-8.6, 1.4, 5.7] as [number, number, number] };
    render(<WorkshopGame initialSnapshot={{ point: 'academy', camera }} onSave={vi.fn()} onOpenCase={vi.fn()} onPortfolio={vi.fn()} />);
    expect(props.initialCamera).toEqual(camera);
    act(() => props.onError(props.token));
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    await waitFor(() => expect(screen.getByTestId('scene-resource')).toBeInTheDocument());
    expect(props.initialCamera).toBeNull();
    expect(props.point).toBe('entrance');
  });
});
