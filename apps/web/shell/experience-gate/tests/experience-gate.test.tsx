import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ExperienceGate } from '../component';
import type { ComponentProps } from 'react';
import { useEffect } from 'react';
import type { ExperienceModule } from '../../../modules/experience';
import type { PortfolioCase } from '../../../modules/projects/components/portfolio-case/component';

let workshopProps: ComponentProps<typeof ExperienceModule>;
beforeEach(() => window.history.replaceState(null, '', '/?view=portfolio'));
const snapshot = { projectId: 'kliniu', detail: false, exploded: true, night: true, sceneEnabled: false, tourStop: 'purchase' as const, camera: null, scrollY: 654 };
vi.mock('../../../modules/experience', () => ({ ExperienceModule: (props: ComponentProps<typeof ExperienceModule>) => {
  workshopProps = props;
  return <button onClick={() => { props.onWorkshopSave?.(snapshot); props.onEnter('projects', 'kliniu'); }}>Abrir Kliniu</button>;
} }));
vi.mock('../../../modules/projects/components/portfolio-case/component', () => ({ PortfolioCase: ({ project, onReturn, onSelect, onNavigate }: ComponentProps<typeof PortfolioCase>) => {
  useEffect(() => { document.querySelector('h1')?.focus(); }, []);
  return <main><h1 tabIndex={-1}>Caso {project.name}</h1><button onClick={onReturn}>Volver</button><button onClick={() => onSelect('drokex')}>Siguiente</button><button onClick={() => onSelect('kliniu')}>Anterior</button><button onClick={() => onNavigate?.('contact')}>Contacto</button></main>;
} }));
vi.mock('../../app-shell', () => ({ AppShell: () => null }));

afterEach(() => {
  Reflect.deleteProperty(document, 'startViewTransition');
  delete document.documentElement.dataset.portfolioTransition;
  delete document.documentElement.dataset.portfolioProject;
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('Portfolio case transitions', () => {
  it('keeps opening, changing and returning cases when a resized viewport aborts readiness', async () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
    Object.defineProperty(document, 'startViewTransition', { configurable: true, value: (update: () => void) => {
      update();
      return { ready: Promise.reject(new DOMException('Viewport size changed', 'AbortError')), updateCallbackDone: Promise.resolve(), finished: Promise.resolve(), skipTransition: vi.fn() };
    } });
    render(<ExperienceGate />);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Abrir Kliniu' })); });
    expect(screen.getByRole('heading', { name: 'Caso Kliniu' })).toBeInTheDocument();
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Siguiente' })); });
    expect(screen.getByRole('heading', { name: 'Caso Drokex' })).toBeInTheDocument();
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Volver' })); });
    expect(screen.getByRole('button', { name: 'Abrir Kliniu' })).toBeInTheDocument();
  });
  it('opens directly when startViewTransition throws', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
    Object.defineProperty(document, 'startViewTransition', { configurable: true, value: () => { throw new Error('unsupported transition'); } });
    render(<ExperienceGate />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir Kliniu' }));
    expect(screen.getByRole('heading', { name: 'Caso Kliniu' })).toBeInTheDocument();
  });
  it('falls back on transition rejection and ignores a stale transition callback', async () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
    let oldUpdate: (() => void) | undefined;
    Object.defineProperty(document, 'startViewTransition', { configurable: true, value: (update: () => void) => {
      oldUpdate = update;
      return { ready: Promise.resolve(), updateCallbackDone: Promise.reject(new Error('update rejected')), finished: Promise.reject(new Error('transition rejected')) };
    } });
    render(<ExperienceGate />);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Abrir Kliniu' })); });
    expect(screen.getByRole('heading', { name: 'Caso Kliniu' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Volver' }));
    act(() => oldUpdate?.());
    expect(screen.getByRole('button', { name: 'Abrir Kliniu' })).toBeInTheDocument();
  });
  it('does not let an old finished transition unlock a newer entrance', async () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
    const updates: (() => void)[] = [];
    const finish: (() => void)[] = [];
    const start = vi.fn((update: () => void) => {
      updates.push(update);
      return { ready: Promise.resolve(), updateCallbackDone: Promise.resolve(), finished: new Promise<void>(resolve => finish.push(resolve)) };
    });
    Object.defineProperty(document, 'startViewTransition', { configurable: true, value: start });
    render(<ExperienceGate />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir Kliniu' }));
    act(() => updates[0]?.());
    fireEvent.click(screen.getByRole('button', { name: 'Volver' }));
    act(() => updates[1]?.());
    fireEvent.click(screen.getByRole('button', { name: 'Abrir Kliniu' }));
    await act(async () => finish[0]?.());
    fireEvent.click(screen.getByRole('button', { name: 'Abrir Kliniu' }));
    expect(start).toHaveBeenCalledTimes(3);
    act(() => updates[2]?.());
    expect(screen.getByRole('heading', { name: 'Caso Kliniu' })).toBeInTheDocument();
    await act(async () => { finish[1]?.(); finish[2]?.(); });
  });
  it('keeps the original snapshot and reveals only the first workshop visit', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
    window.scrollTo = vi.fn();
    render(<ExperienceGate />);
    expect(workshopProps.reveal).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir Kliniu' }));
    fireEvent.click(screen.getByRole('button', { name: 'Volver' }));
    expect(workshopProps.initialWorkshop).toEqual(snapshot);
    expect(workshopProps.restoring).toBe(true);
    expect(workshopProps.reveal).toBe(false);
  });
  it('remounts the next case to focus its heading and returns to its canonical view', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
    render(<ExperienceGate />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir Kliniu' }));
    screen.getByRole('button', { name: 'Siguiente' }).focus();
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(screen.getByRole('heading', { name: 'Caso Drokex' })).toHaveFocus();
    fireEvent.click(screen.getByRole('button', { name: 'Volver' }));
    expect(workshopProps.initialWorkshop).toEqual({ ...snapshot, projectId: 'drokex', detail: true, camera: null });
  });
  it('prioritizes section navigation over workshop scroll restoration and stale hash', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
    window.history.replaceState(null, '', '#proyectos');
    render(<ExperienceGate />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir Kliniu' }));
    fireEvent.click(screen.getByRole('button', { name: 'Contacto' }));
    expect(workshopProps.initialSection).toBe('contact');
    expect(workshopProps.restoring).toBe(false);
    expect(window.location.hash).toBe('#contacto');
  });
  it('opens and returns directly without the View Transition API', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
    window.scrollTo = vi.fn();
    render(<ExperienceGate />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir Kliniu' }));
    expect(screen.getByRole('heading', { name: 'Caso Kliniu' })).toBeInTheDocument();
    expect(screen.queryByText('Abriendo proyecto')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Volver' }));
    expect(screen.getByRole('button', { name: 'Abrir Kliniu' })).toBeInTheDocument();
  });
  it('reveals the selected city district and restores the saved scroll inside the update', async () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
    const scroll = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const starts: string[] = [];
    Object.defineProperty(document, 'startViewTransition', { configurable: true, value: (update: () => void) => {
      starts.push(document.documentElement.dataset.portfolioTransition ?? '');
      update();
      return { ready: Promise.resolve(), updateCallbackDone: Promise.resolve(), finished: Promise.resolve(), skipTransition: vi.fn() };
    } });
    render(<ExperienceGate />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir Kliniu' }));
    fireEvent.click(screen.getByRole('button', { name: 'Volver' }));
    expect(starts).toContain('return');
    expect(document.documentElement.dataset.portfolioProject).toBe('kliniu');
    expect(scroll).toHaveBeenCalledWith(0, 654);
    expect(workshopProps.initialWorkshop).toEqual(snapshot);
    await act(async () => { await Promise.resolve(); });
    expect(document.documentElement.dataset.portfolioTransition).toBeUndefined();
  });
  it('turns the editorial page forward and backward with the next heading focused', async () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
    const modes: string[] = [];
    Object.defineProperty(document, 'startViewTransition', { configurable: true, value: (update: () => void) => {
      modes.push(document.documentElement.dataset.portfolioTransition ?? '');
      update();
      return { ready: Promise.resolve(), updateCallbackDone: Promise.resolve(), finished: Promise.resolve(), skipTransition: vi.fn() };
    } });
    render(<ExperienceGate />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir Kliniu' }));
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(screen.getByRole('heading', { name: 'Caso Drokex' })).toHaveFocus();
    fireEvent.click(screen.getByRole('button', { name: 'Anterior' }));
    expect(screen.getByRole('heading', { name: 'Caso Kliniu' })).toHaveFocus();
    expect(modes).toEqual(expect.arrayContaining(['next', 'previous']));
    await act(async () => { await Promise.resolve(); });
  });
  it('lets Escape skip an active visual transition', async () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
    const skip = vi.fn();
    Object.defineProperty(document, 'startViewTransition', { configurable: true, value: (update: () => void) => {
      update();
      return { ready: Promise.resolve(), updateCallbackDone: Promise.resolve(), finished: new Promise(() => {}), skipTransition: skip };
    } });
    render(<ExperienceGate />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir Kliniu' }));
    fireEvent.click(screen.getByRole('button', { name: 'Volver' }));
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(skip).toHaveBeenCalledTimes(1);
    await act(async () => { await Promise.resolve(); });
  });
  it('returns immediately with reduced motion and when the transition API throws', () => {
    const start = vi.fn(() => { throw new Error('unavailable'); });
    Object.defineProperty(document, 'startViewTransition', { configurable: true, value: start });
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });
    const { unmount } = render(<ExperienceGate />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir Kliniu' }));
    fireEvent.click(screen.getByRole('button', { name: 'Volver' }));
    expect(start).not.toHaveBeenCalled();
    unmount();
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
    render(<ExperienceGate />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir Kliniu' }));
    fireEvent.click(screen.getByRole('button', { name: 'Volver' }));
    expect(screen.getByRole('button', { name: 'Abrir Kliniu' })).toBeInTheDocument();
    expect(document.documentElement.dataset.portfolioTransition).toBeUndefined();
  });
  it('commits a case change when the visual update rejects', async () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
    let count = 0;
    Object.defineProperty(document, 'startViewTransition', { configurable: true, value: (update: () => void) => {
      count += 1;
      if (count === 1) update();
      return {
        ready: Promise.resolve(),
        updateCallbackDone: count === 1 ? Promise.resolve() : Promise.reject(new Error('visual update failed')),
        finished: count === 1 ? Promise.resolve() : Promise.reject(new Error('visual finish failed')),
        skipTransition: vi.fn(),
      };
    } });
    render(<ExperienceGate />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir Kliniu' }));
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Siguiente' })); });
    expect(screen.getByRole('heading', { name: 'Caso Drokex' })).toBeInTheDocument();
    expect(document.documentElement.dataset.portfolioTransition).toBeUndefined();
  });
  it('ignores an obsolete callback after a repeated case selection', async () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
    const updates: (() => void)[] = [];
    const skip = vi.fn();
    Object.defineProperty(document, 'startViewTransition', { configurable: true, value: (update: () => void) => {
      updates.push(update);
      if (updates.length === 1) update();
      return { ready: Promise.resolve(), updateCallbackDone: Promise.resolve(), finished: new Promise(() => {}), skipTransition: skip };
    } });
    render(<ExperienceGate />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir Kliniu' }));
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(skip).toHaveBeenCalledTimes(1);
    act(() => updates[1]?.());
    expect(screen.getByRole('heading', { name: 'Caso Kliniu' })).toBeInTheDocument();
    act(() => updates[2]?.());
    expect(screen.getByRole('heading', { name: 'Caso Drokex' })).toBeInTheDocument();
    await act(async () => { await Promise.resolve(); });
  });
});
