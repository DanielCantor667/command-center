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
  it('focuses the current tour stop on phones too, where every stop stays in the bar', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({ matches: query.includes('max-width'), addEventListener: vi.fn(), removeEventListener: vi.fn() }));
    render(<WorkshopGame initialSnapshot={{ point: 'hub', camera: null }} onOpenCase={vi.fn()} onSave={vi.fn()} onPortfolio={vi.fn()} />);
    expect(within(screen.getByRole('navigation', { name: 'Recorrer el taller' })).getByRole('button', { name: 'El taller' })).toHaveFocus();
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
    render(<WorkshopGame initialSnapshot={{ point: 'projects', camera: null }} onOpenCase={vi.fn()} onSave={save} onPortfolio={portfolio} />);
    props.cameraHandle.current = { capture: () => camera };
    fireEvent.click(screen.getByRole('button', { name: 'Ver portafolio' }));
    expect(save).toHaveBeenCalledOnce();
    expect(save).toHaveBeenCalledWith({ point: 'projects', camera });
    expect(save.mock.invocationCallOrder[0]).toBeLessThan(portfolio.mock.invocationCallOrder[0]!);
  });
  it('cancels pending travel and saves its stable origin before leaving for the portfolio', () => {
    const save = vi.fn();
    render(<WorkshopGame initialSnapshot={{ point: 'projects', camera: null }} onOpenCase={vi.fn()} onSave={save} onPortfolio={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'El taller' }));
    const token = props.token;
    fireEvent.click(screen.getByRole('button', { name: 'Ver portafolio' }));
    act(() => props.onArrived(token));
    expect(save).toHaveBeenCalledOnce();
    expect(save).toHaveBeenCalledWith({ point: 'projects', camera: null });
    expect(screen.getByRole('main')).toHaveAttribute('data-workshop-state', 'exploring');
    expect(screen.getByRole('main')).toHaveAttribute('data-world-point', 'projects');
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
  it('offers every wall of the lab in tour order, without the removed project rooms', () => {
    render(<WorkshopGame initialSnapshot={{ point: 'hub', camera: null }} onOpenCase={vi.fn()} onSave={vi.fn()} onPortfolio={vi.fn()} />);
    const tour = within(screen.getByRole('navigation', { name: 'Recorrer el taller' }));
    expect(tour.getAllByRole('button').map(button => button.textContent)).toEqual(['El taller', 'Proyectos', 'Tecnologías', 'Trayectoria', 'Contacto', 'Mapa']);
    fireEvent.click(tour.getByRole('button', { name: 'Ir a Trayectoria' }));
    expect(screen.getByRole('main')).toHaveAttribute('data-world-destination', 'trajectory');
    expect(screen.queryByRole('button', { name: /Noche|Día/ })).not.toBeInTheDocument();
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
  it('saves the exact camera before opening a case from the project wall', () => {
    const camera = { position: [.4, 1.6, -2.45] as [number, number, number], target: [2.95, 2.15, -2.45] as [number, number, number] };
    const save = vi.fn(); const open = vi.fn();
    render(<WorkshopGame initialSnapshot={{ point: 'projects', camera }} onSave={save} onOpenCase={open} onPortfolio={vi.fn()} />);
    props.cameraHandle.current = { capture: () => camera };
    expect(screen.getByRole('button', { name: /Ver lista/ })).toHaveFocus();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir caso de Kliniu' }));
    expect(save).toHaveBeenCalledWith({ point: 'projects', camera });
    expect(save.mock.invocationCallOrder[0]).toBeLessThan(open.mock.invocationCallOrder[0]!);
    expect(open).toHaveBeenCalledWith('kliniu');
  });
  it('lights a project in 3D while its list entry has hover or keyboard focus, and clears it on travel', () => {
    render(<WorkshopGame initialSnapshot={{ point: 'projects', camera: null }} onSave={vi.fn()} onOpenCase={vi.fn()} onPortfolio={vi.fn()} />);
    const entry = screen.getByRole('button', { name: 'Abrir caso de Drokex' });
    fireEvent.focus(entry);
    expect(props.focus).toEqual({ kind: 'project', id: 'drokex' });
    fireEvent.blur(entry);
    expect(props.focus).toBeNull();
    fireEvent.mouseEnter(entry);
    expect(props.focus).toEqual({ kind: 'project', id: 'drokex' });
    act(() => props.onFocus({ kind: 'technology', id: 'typescript' }));
    expect(props.focus).toEqual({ kind: 'technology', id: 'typescript' });
    fireEvent.click(screen.getByRole('button', { name: 'Ir a Contacto' }));
    expect(props.focus).toBeNull();
  });
  it('opens a case straight from the 3D wall at the projects point and walks up to it elsewhere', () => {
    const open = vi.fn();
    render(<WorkshopGame initialSnapshot={{ point: 'projects', camera: null }} onSave={vi.fn()} onOpenCase={open} onPortfolio={vi.fn()} />);
    act(() => props.onOpenCase('drokex'));
    expect(open).toHaveBeenCalledWith('drokex');
  });
  it('returns keyboard focus to a navigation control after Escape and cancellation', () => {
    render(<WorkshopGame initialSnapshot={{ point: 'projects', camera: null }} onSave={vi.fn()} onOpenCase={vi.fn()} onPortfolio={vi.fn()} />);
    fireEvent.keyDown(window, { key: 'Escape' });
    act(() => props.onArrived(props.token));
    expect(screen.getByRole('button', { name: 'El taller' })).toHaveFocus();
    fireEvent.click(screen.getByRole('button', { name: 'Ir a Proyectos' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar recorrido' }));
    expect(screen.getByRole('button', { name: 'El taller' })).toHaveFocus();
  });
  it('starts a fresh entrance camera after a restored visit loses its GPU context', async () => {
    const camera = { position: [0, 1.6, -3.0] as [number, number, number], target: [0, 1.5, -4.9] as [number, number, number] };
    render(<WorkshopGame initialSnapshot={{ point: 'trajectory', camera }} onSave={vi.fn()} onOpenCase={vi.fn()} onPortfolio={vi.fn()} />);
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
    render(<WorkshopGame initialSnapshot={{ point: 'hub', camera: null }} onOpenCase={vi.fn()} onSave={vi.fn()} onPortfolio={vi.fn()} />);
    fireEvent.wheel(document.querySelector('[data-world-canvas]')!, { deltaY, deltaMode });
    expect(screen.getByRole('main')).toHaveAttribute('data-world-destination', 'projects');
    expect(screen.getByRole('main')).toHaveAttribute('data-workshop-state', 'moving');
  });
  it('accumulates small trackpad deltas from one gesture into a tour step', () => {
    render(<WorkshopGame initialSnapshot={{ point: 'hub', camera: null }} onOpenCase={vi.fn()} onSave={vi.fn()} onPortfolio={vi.fn()} />);
    const canvas = document.querySelector('[data-world-canvas]')!;
    fireEvent.wheel(canvas, { deltaY: 10 }); fireEvent.wheel(canvas, { deltaY: 10 });
    expect(screen.getByRole('main')).toHaveAttribute('data-workshop-state', 'exploring');
    fireEvent.wheel(canvas, { deltaY: 6 });
    expect(screen.getByRole('main')).toHaveAttribute('data-world-destination', 'projects');
  });
  it('starts a fresh trackpad gesture when the direction reverses', () => {
    render(<WorkshopGame initialSnapshot={{ point: 'projects', camera: null }} onOpenCase={vi.fn()} onSave={vi.fn()} onPortfolio={vi.fn()} />);
    const canvas = document.querySelector('[data-world-canvas]')!;
    fireEvent.wheel(canvas, { deltaY: 20 }); fireEvent.wheel(canvas, { deltaY: -10 });
    expect(screen.getByRole('main')).toHaveAttribute('data-workshop-state', 'exploring');
    fireEvent.wheel(canvas, { deltaY: -16 });
    expect(screen.getByRole('main')).toHaveAttribute('data-world-destination', 'hub');
  });
  it('discards partial trackpad deltas after the gesture becomes old', () => {
    let now = 10000; vi.spyOn(Date, 'now').mockImplementation(() => now);
    render(<WorkshopGame initialSnapshot={{ point: 'projects', camera: null }} onOpenCase={vi.fn()} onSave={vi.fn()} onPortfolio={vi.fn()} />);
    const canvas = document.querySelector('[data-world-canvas]')!;
    fireEvent.wheel(canvas, { deltaY: -10 });
    expect(screen.getByRole('main')).toHaveAttribute('data-workshop-state', 'exploring');
    now += 300;
    fireEvent.wheel(canvas, { deltaY: -20 });
    expect(screen.getByRole('main')).toHaveAttribute('data-workshop-state', 'exploring');
    fireEvent.wheel(canvas, { deltaY: -6 });
    expect(screen.getByRole('main')).toHaveAttribute('data-world-destination', 'hub');
  });
  it('discards partial trackpad deltas when another control starts travel', () => {
    render(<WorkshopGame initialSnapshot={{ point: 'projects', camera: null }} onOpenCase={vi.fn()} onSave={vi.fn()} onPortfolio={vi.fn()} />);
    const canvas = document.querySelector('[data-world-canvas]')!;
    fireEvent.wheel(canvas, { deltaY: 20 });
    fireEvent.click(screen.getByRole('button', { name: 'El taller' }));
    act(() => props.onArrived(props.token));
    fireEvent.wheel(canvas, { deltaY: 10 });
    expect(screen.getByRole('main')).toHaveAttribute('data-world-point', 'hub');
    expect(screen.getByRole('main')).toHaveAttribute('data-workshop-state', 'exploring');
  });
  it('does not treat a Ctrl-wheel pinch gesture as tour navigation', () => {
    render(<WorkshopGame initialSnapshot={{ point: 'hub', camera: null }} onOpenCase={vi.fn()} onSave={vi.fn()} onPortfolio={vi.fn()} />);
    fireEvent.wheel(document.querySelector('[data-world-canvas]')!, { deltaY: 100, ctrlKey: true });
    expect(screen.getByRole('main')).toHaveAttribute('data-workshop-state', 'exploring');
  });
  it('ignores the wheel outside the canvas, while suspended and while reading', () => {
    const callbacks = { onOpenCase: vi.fn(), onSave: vi.fn(), onPortfolio: vi.fn() };
    const snapshot = { point: 'hub' as const, camera: null };
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
    render(<WorkshopGame initialSnapshot={{ point: 'hub', camera: null }} onOpenCase={vi.fn()} onSave={vi.fn()} onPortfolio={vi.fn()} />);
    const canvas = document.querySelector('[data-world-canvas]')!;
    fireEvent.wheel(canvas, { deltaY: 50 });
    fireEvent.wheel(canvas, { deltaY: 100 });
    expect(screen.getByRole('main')).toHaveAttribute('data-world-destination', 'projects');
    act(() => props.onArrived(props.token));
    now += 699;
    fireEvent.wheel(canvas, { deltaY: 50 });
    expect(screen.getByRole('main')).toHaveAttribute('data-workshop-state', 'exploring');
    now += 1;
    fireEvent.wheel(canvas, { deltaY: 50 });
    expect(screen.getByRole('main')).toHaveAttribute('data-world-destination', 'corner-lorigine');
    expect(screen.getByRole('main')).toHaveAttribute('data-workshop-state', 'moving');
  });
  it('walks the project corners after the wall and reads each case from its corner', () => {
    const open = vi.fn();
    render(<WorkshopGame initialSnapshot={{ point: 'projects', camera: null }} onSave={vi.fn()} onOpenCase={open} onPortfolio={vi.fn()} />);
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getByRole('main')).toHaveAttribute('data-world-destination', 'corner-lorigine');
    act(() => props.onArrived(props.token));
    expect(screen.getByRole('heading', { name: "L'ORIGINE" })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ir a Proyectos' })).toHaveAttribute('aria-current', 'location');
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(screen.getByRole('main')).toHaveAttribute('data-world-destination', 'corner-drokex');
    act(() => props.onArrived(props.token));
    fireEvent.click(screen.getByRole('button', { name: 'Abrir caso de Drokex' }));
    expect(open).toHaveBeenCalledWith('drokex');
    fireEvent.click(screen.getByRole('button', { name: 'Ver todos los proyectos' }));
    expect(screen.getByRole('main')).toHaveAttribute('data-world-destination', 'projects');
  });
});
