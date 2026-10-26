import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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
  it.each(['hub', 'workbench'] as const)('keeps keyboard focus on the map when the mobile %s navigation control is hidden', point => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({ matches: query.includes('max-width'), addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    render(<WorkshopGame initialSnapshot={{ point, camera: null }} onOpenCase={vi.fn()} onSave={vi.fn()} onPortfolio={vi.fn()} />);
    expect(within(screen.getByRole('navigation', { name: 'Recorrer el taller' })).getByRole('button', { name: 'Mapa' })).toHaveFocus();
  });
  it('keeps the landing and portfolio available without mounting WebGL', () => {
    const portfolio = vi.fn(); const save = vi.fn();
    render(<WorkshopGame onOpenCase={vi.fn()} onSave={save} onPortfolio={portfolio} />);
    expect(screen.queryByTestId('scene-resource')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Ver portafolio' }));
    expect(portfolio).toHaveBeenCalledOnce();
    expect(save).not.toHaveBeenCalled();
  });
  it.each([
    ['Kliniu', 'kliniu'], ["L'ORIGINE", 'lorigine'], ['4U Studio Academy', '4ustudio-academy'], ['Drokex', 'drokex'],
  ])('opens the published %s case directly from the landing without starting or saving 3D', (name, id) => {
    const save = vi.fn(); const open = vi.fn();
    render(<WorkshopGame onOpenCase={open} onSave={save} onPortfolio={vi.fn()} />);
    fireEvent.click(within(screen.getByRole('navigation', { name: 'Proyectos publicados' })).getByRole('button', { name: `Leer caso de ${name}` }));
    expect(open).toHaveBeenCalledOnce();
    expect(open).toHaveBeenCalledWith(id);
    expect(save).not.toHaveBeenCalled();
    expect(document.querySelector('[data-world-canvas]')).not.toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveAttribute('data-workshop-state', 'landing');
  });
  it('saves the current camera before leaving the active world for the portfolio', () => {
    const save = vi.fn(); const portfolio = vi.fn();
    const camera = { position: [0.1, 1.7, 2.8] as [number, number, number], target: [0, 1.2, -0.9] as [number, number, number] };
    render(<WorkshopGame initialSnapshot={{ point: 'workbench', camera: null }} onOpenCase={vi.fn()} onSave={save} onPortfolio={portfolio} />);
    props.cameraHandle.current = { capture: () => camera };
    fireEvent.click(screen.getByRole('button', { name: 'Ver portafolio' }));
    expect(save).toHaveBeenCalledOnce();
    expect(save).toHaveBeenCalledWith({ point: 'workbench', camera });
    expect(save.mock.invocationCallOrder[0]).toBeLessThan(portfolio.mock.invocationCallOrder[0]!);
  });
  it('cancels pending travel and saves its stable origin before leaving for the portfolio', () => {
    const save = vi.fn();
    render(<WorkshopGame initialSnapshot={{ point: 'workbench', camera: null }} onOpenCase={vi.fn()} onSave={save} onPortfolio={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'El taller' }));
    const token = props.token;
    fireEvent.click(screen.getByRole('button', { name: 'Ver portafolio' }));
    act(() => props.onArrived(token));
    expect(save).toHaveBeenCalledOnce();
    expect(save).toHaveBeenCalledWith({ point: 'workbench', camera: null });
    expect(screen.getByRole('main')).toHaveAttribute('data-workshop-state', 'exploring');
    expect(screen.getByRole('main')).toHaveAttribute('data-world-point', 'workbench');
  });
  it('does not create an entrance snapshot when leaving before the first arrival', () => {
    const save = vi.fn(); const portfolio = vi.fn();
    render(<WorkshopGame onOpenCase={vi.fn()} onSave={save} onPortfolio={portfolio} />);
    fireEvent.click(screen.getByRole('button', { name: 'Entrar al taller' }));
    act(() => props.onReady(props.token));
    fireEvent.click(screen.getByRole('button', { name: 'Ver portafolio' }));
    expect(save).not.toHaveBeenCalled();
    expect(portfolio).toHaveBeenCalledOnce();
    expect(screen.getByRole('main')).toHaveAttribute('data-workshop-state', 'landing');
  });
  it('provides desk shortcuts for trajectory, contact and the sound toggle', () => {
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue();
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
    const view = render(<WorkshopGame initialSnapshot={{ point: 'workbench', camera: null }} onOpenCase={vi.fn()} onSave={vi.fn()} onPortfolio={vi.fn()} />);
    const shortcuts = within(screen.getByRole('navigation', { name: 'Accesos del escritorio' }));
    fireEvent.click(shortcuts.getByRole('button', { name: 'Poner música' }));
    expect(shortcuts.getByRole('button', { name: 'Pausar música' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(shortcuts.getByRole('button', { name: 'Trayectoria' }));
    expect(screen.getByRole('main')).toHaveAttribute('data-world-destination', 'trajectory');
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar recorrido' }));
    fireEvent.click(within(screen.getByRole('navigation', { name: 'Accesos del escritorio' })).getByRole('button', { name: 'Contacto' }));
    expect(screen.getByRole('main')).toHaveAttribute('data-world-destination', 'contact');
    view.unmount();
  });
  it('focuses the entrance when returning from the portfolio to the landing', () => {
    const callbacks = { onOpenCase: vi.fn(), onSave: vi.fn(), onPortfolio: vi.fn() };
    const view = render(<WorkshopGame {...callbacks} suspended />);
    screen.getByRole('button', { name: 'Ver portafolio' }).focus();
    view.rerender(<WorkshopGame {...callbacks} suspended={false} />);
    expect(screen.getByRole('button', { name: 'Entrar al taller' })).toHaveFocus();
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
  it.each([
    ['pixels', 50, 0], ['lines', 3, 1], ['pages', 1, 2],
  ])('steps the tour for a wheel reporting %s', (_mode, deltaY, deltaMode) => {
    render(<WorkshopGame initialSnapshot={{ point: 'workbench', camera: null }} onOpenCase={vi.fn()} onSave={vi.fn()} onPortfolio={vi.fn()} />);
    fireEvent.wheel(document.querySelector('[data-world-canvas]')!, { deltaY, deltaMode });
    expect(screen.getByRole('main')).toHaveAttribute('data-world-destination', 'hub');
    expect(screen.getByRole('main')).toHaveAttribute('data-workshop-state', 'moving');
  });
  it('accumulates small trackpad deltas from one gesture into a tour step', () => {
    render(<WorkshopGame initialSnapshot={{ point: 'workbench', camera: null }} onOpenCase={vi.fn()} onSave={vi.fn()} onPortfolio={vi.fn()} />);
    const canvas = document.querySelector('[data-world-canvas]')!;
    fireEvent.wheel(canvas, { deltaY: 10 }); fireEvent.wheel(canvas, { deltaY: 10 });
    expect(screen.getByRole('main')).toHaveAttribute('data-workshop-state', 'exploring');
    fireEvent.wheel(canvas, { deltaY: 6 });
    expect(screen.getByRole('main')).toHaveAttribute('data-world-destination', 'hub');
  });
  it('starts a fresh trackpad gesture when the direction reverses', () => {
    render(<WorkshopGame initialSnapshot={{ point: 'hub', camera: null }} onOpenCase={vi.fn()} onSave={vi.fn()} onPortfolio={vi.fn()} />);
    const canvas = document.querySelector('[data-world-canvas]')!;
    fireEvent.wheel(canvas, { deltaY: 20 }); fireEvent.wheel(canvas, { deltaY: -10 });
    expect(screen.getByRole('main')).toHaveAttribute('data-workshop-state', 'exploring');
    fireEvent.wheel(canvas, { deltaY: -16 });
    expect(screen.getByRole('main')).toHaveAttribute('data-world-destination', 'workbench');
  });
  it('discards partial trackpad deltas after the gesture becomes old', () => {
    let now = 10000; vi.spyOn(Date, 'now').mockImplementation(() => now);
    render(<WorkshopGame initialSnapshot={{ point: 'hub', camera: null }} onOpenCase={vi.fn()} onSave={vi.fn()} onPortfolio={vi.fn()} />);
    const canvas = document.querySelector('[data-world-canvas]')!;
    fireEvent.wheel(canvas, { deltaY: -10 });
    expect(screen.getByRole('main')).toHaveAttribute('data-workshop-state', 'exploring');
    now += 300;
    fireEvent.wheel(canvas, { deltaY: -20 });
    expect(screen.getByRole('main')).toHaveAttribute('data-workshop-state', 'exploring');
    fireEvent.wheel(canvas, { deltaY: -6 });
    expect(screen.getByRole('main')).toHaveAttribute('data-world-destination', 'workbench');
  });
  it('discards partial trackpad deltas when another control starts travel', () => {
    render(<WorkshopGame initialSnapshot={{ point: 'workbench', camera: null }} onOpenCase={vi.fn()} onSave={vi.fn()} onPortfolio={vi.fn()} />);
    const canvas = document.querySelector('[data-world-canvas]')!;
    fireEvent.wheel(canvas, { deltaY: 20 });
    fireEvent.click(screen.getByRole('button', { name: 'El taller' }));
    act(() => props.onArrived(props.token));
    fireEvent.wheel(canvas, { deltaY: 10 });
    expect(screen.getByRole('main')).toHaveAttribute('data-world-point', 'hub');
    expect(screen.getByRole('main')).toHaveAttribute('data-workshop-state', 'exploring');
  });
  it('does not treat a Ctrl-wheel pinch gesture as tour navigation', () => {
    render(<WorkshopGame initialSnapshot={{ point: 'workbench', camera: null }} onOpenCase={vi.fn()} onSave={vi.fn()} onPortfolio={vi.fn()} />);
    fireEvent.wheel(document.querySelector('[data-world-canvas]')!, { deltaY: 100, ctrlKey: true });
    expect(screen.getByRole('main')).toHaveAttribute('data-workshop-state', 'exploring');
  });
  it('ignores the wheel outside the canvas, while suspended and while reading', () => {
    const callbacks = { onOpenCase: vi.fn(), onSave: vi.fn(), onPortfolio: vi.fn() };
    const snapshot = { point: 'workbench' as const, camera: null };
    const view = render(<WorkshopGame {...callbacks} initialSnapshot={snapshot} />);
    fireEvent.wheel(window, { deltaY: 100 });
    expect(screen.getByRole('main')).toHaveAttribute('data-workshop-state', 'exploring');
    view.rerender(<WorkshopGame {...callbacks} initialSnapshot={snapshot} suspended />);
    fireEvent.wheel(document.querySelector('[data-world-canvas]')!, { deltaY: 100 });
    expect(screen.getByRole('main')).toHaveAttribute('data-workshop-state', 'exploring');
    view.rerender(<WorkshopGame {...callbacks} initialSnapshot={snapshot} reading={{ kind: 'contact' }} />);
    fireEvent.wheel(document.querySelector('[data-world-canvas]')!, { deltaY: 100 });
    expect(document.querySelector('main')).toHaveAttribute('data-workshop-state', 'exploring');
  });
  it('keeps the 700ms wheel throttle and drops events during travel', () => {
    let now = 10000; vi.spyOn(Date, 'now').mockImplementation(() => now);
    render(<WorkshopGame initialSnapshot={{ point: 'workbench', camera: null }} onOpenCase={vi.fn()} onSave={vi.fn()} onPortfolio={vi.fn()} />);
    const canvas = document.querySelector('[data-world-canvas]')!;
    fireEvent.wheel(canvas, { deltaY: 50 });
    fireEvent.wheel(canvas, { deltaY: 100 });
    expect(screen.getByRole('main')).toHaveAttribute('data-world-destination', 'hub');
    act(() => props.onArrived(props.token));
    now += 699;
    fireEvent.wheel(canvas, { deltaY: 50 });
    expect(screen.getByRole('main')).toHaveAttribute('data-workshop-state', 'exploring');
    now += 1;
    fireEvent.wheel(canvas, { deltaY: 50 });
    expect(screen.getByRole('main')).toHaveAttribute('data-world-destination', 'kliniu');
    expect(screen.getByRole('main')).toHaveAttribute('data-workshop-state', 'room-loading');
  });
});
