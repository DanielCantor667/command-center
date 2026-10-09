import { act, fireEvent, render, screen } from '@testing-library/react';
import { StrictMode, useEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ExperienceModule } from '../component';
import type { CityNavigatorProps } from '../components/city-navigator';
import type { CameraSnapshot } from '../workshop-state';

let sceneProps: CityNavigatorProps;
const camera: CameraSnapshot = { position: [1, 2, 3], target: [0, 0, 0], factor: 1.2, offset: [0.1, 0.2], width: 1440, height: 900 };
const restoreCamera = vi.fn();
vi.mock('../components/city-navigator-loader', () => ({
  CityNavigatorLoader: (props: CityNavigatorProps) => {
    sceneProps = props;
    const { onProjectSelect, exploded, night, detail, onActiveChange, onTourSelect, entering, onEntranceReady } = props;
    if (props.cameraHandle) props.cameraHandle.current = { capture: () => camera, restore: restoreCamera };
    useEffect(() => onActiveChange?.(true), [onActiveChange]);
    return (
    <><button data-entering={entering} data-exploded={exploded} data-night={night} data-detail={detail} onClick={() => onProjectSelect('4ustudio-academy')}>Seleccionar edificio de 4U</button>
    <button onClick={() => onTourSelect?.('purchase')}>Punto de compra 3D</button>
    <button onClick={() => onEntranceReady?.()}>Completar entrada 3D</button></>
  ); },
}));

describe('City portfolio experience', () => {
  afterEach(() => vi.restoreAllMocks());
  beforeEach(() => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
    Element.prototype.scrollIntoView = vi.fn();
    window.scrollTo = vi.fn();
    window.history.replaceState(null, '', '/');
    restoreCamera.mockClear();
  });
  it('keeps reveal nonblocking, ends it after 450ms and cancels on interaction', () => {
    vi.useFakeTimers();
    try {
      const { unmount } = render(<ExperienceModule onEnter={vi.fn()} />);
      expect(screen.getByRole('main')).toHaveAttribute('data-reveal', 'true');
      expect(screen.getByRole('heading', { name: 'Daniel Cantor' })).toBeVisible();
      expect(screen.getByRole('navigation', { name: 'Navegación principal' })).toBeVisible();
      act(() => vi.advanceTimersByTime(450));
      expect(screen.getByRole('main')).toHaveAttribute('data-reveal', 'false');
      unmount();
      render(<ExperienceModule onEnter={vi.fn()} />);
      fireEvent.pointerDown(screen.getByRole('main'));
      expect(screen.getByRole('main')).toHaveAttribute('data-reveal', 'false');
      expect(sceneProps.reveal).toBe(false);
    } finally { vi.useRealTimers(); }
  });
  it('captures scroll before approach changes it and restores overview and focus on Escape', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame'] });
    try {
      const onWorkshopSave = vi.fn();
      vi.spyOn(window, 'scrollY', 'get').mockReturnValue(432);
      render(<ExperienceModule onEnter={vi.fn()} onWorkshopSave={onWorkshopSave} />);
      fireEvent.click(screen.getByRole('button', { name: 'Entrar a Kliniu' }));
      expect(onWorkshopSave).toHaveBeenCalledWith(expect.objectContaining({ scrollY: 432, detail: false, camera }));
      expect(onWorkshopSave.mock.invocationCallOrder[0]).toBeLessThan(vi.mocked(Element.prototype.scrollIntoView).mock.invocationCallOrder[0]!);
      fireEvent.keyDown(window, { key: 'Escape' });
      act(() => vi.runAllTimers());
      expect(sceneProps.detail).toBe(false);
      expect(window.scrollTo).toHaveBeenCalledWith(0, 432);
      expect(screen.getByRole('button', { name: 'Entrar a Kliniu' })).toHaveFocus();
    } finally { vi.useRealTimers(); }
  });
  it('does not override restored scroll when StrictMode replays mount effects', () => {
    vi.useFakeTimers();
    try {
      render(<StrictMode><ExperienceModule onEnter={vi.fn()} restoring reveal={false} initialWorkshop={{ projectId: 'kliniu', detail: true, exploded: false, night: false, sceneEnabled: true, tourStop: 'catalog', camera, scrollY: 0 }} /></StrictMode>);
      act(() => vi.runAllTimers());
      expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole('link', { name: 'Contacto' }));
      act(() => vi.runAllTimers());
      expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    } finally { vi.useRealTimers(); }
  });
  it('keeps the first workshop visit at the top under StrictMode', () => {
    vi.useFakeTimers();
    try {
      render(<StrictMode><ExperienceModule onEnter={vi.fn()} /></StrictMode>);
      act(() => vi.runAllTimers());
      expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
    } finally { vi.useRealTimers(); }
  });
  it('does not restore an old camera over a new navigation destination', () => {
    render(<ExperienceModule onEnter={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Entrar a Kliniu' }));
    fireEvent.click(screen.getByRole('link', { name: 'Tecnologías' }));
    expect(restoreCamera).not.toHaveBeenCalled();
    expect(sceneProps.section).toBe('technologies');
    expect(sceneProps.entering).toBe(false);
  });
  it('restores the original scroll when cancelling an entrance from technologies', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame'] });
    try {
      vi.spyOn(window, 'scrollY', 'get').mockReturnValue(789);
      render(<ExperienceModule onEnter={vi.fn()} />);
      fireEvent.click(screen.getByRole('link', { name: 'Tecnologías' }));
      act(() => vi.runAllTimers());
      fireEvent.click(screen.getByRole('button', { name: 'Entrar a Kliniu' }));
      act(() => vi.advanceTimersByTime(20));
      vi.mocked(Element.prototype.scrollIntoView).mockClear();
      fireEvent.keyDown(window, { key: 'Escape' });
      act(() => vi.runAllTimers());
      expect(window.scrollTo).toHaveBeenLastCalledWith(0, 789);
      expect(Element.prototype.scrollIntoView).not.toHaveBeenCalled();
      expect(screen.getByRole('link', { name: 'Tecnologías' })).toHaveAttribute('aria-current', 'location');
    } finally { vi.useRealTimers(); }
  });
  it.each(['preview', 'tour', 'technology'])('saves a workshop snapshot when entering from %s', (source) => {
    const onWorkshopSave = vi.fn();
    const onEnter = vi.fn();
    render(<ExperienceModule onEnter={onEnter} onWorkshopSave={onWorkshopSave} />);
    if (source === 'tour') fireEvent.click(screen.getByRole('button', { name: 'Seleccionar Kliniu' }));
    if (source === 'technology') fireEvent.click(screen.getByRole('link', { name: 'Tecnologías' }));
    fireEvent.click(screen.getByRole('button', { name: source === 'preview' ? 'Ver caso de Kliniu' : source === 'tour' ? 'Abrir caso completo de Kliniu' : 'Kliniu Ver proyecto' }));
    expect(onWorkshopSave).toHaveBeenCalledWith(expect.objectContaining({ projectId: 'kliniu', camera }));
    expect(onWorkshopSave.mock.invocationCallOrder[0]).toBeLessThan(onEnter.mock.invocationCallOrder[0]!);
  });
  it('opens directly without an active canvas and completes once after a scene error', () => {
    const onEnter = vi.fn();
    const { unmount } = render(<ExperienceModule onEnter={onEnter} />);
    act(() => sceneProps.onActiveChange?.(false));
    fireEvent.click(screen.getByRole('button', { name: 'Entrar a Kliniu' }));
    expect(onEnter).toHaveBeenCalledTimes(1);
    unmount();
    onEnter.mockClear();
    render(<ExperienceModule onEnter={onEnter} />);
    fireEvent.click(screen.getByRole('button', { name: 'Entrar a Kliniu' }));
    act(() => { sceneProps.onSceneError?.(); sceneProps.onEntranceReady?.(); });
    expect(onEnter).toHaveBeenCalledTimes(1);
  });
  it.each([['kliniu', 'Kliniu'], ['lorigine', "L'ORIGINE"], ['4ustudio-academy', '4U Studio Academy'], ['drokex', 'Drokex']])('approaches %s and opens only that case', (id, name) => {
    const onEnter = vi.fn();
    render(<ExperienceModule onEnter={onEnter} initialProjectId={id} />);
    fireEvent.click(screen.getByRole('button', { name: `Entrar a ${name}` }));
    expect(onEnter).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Omitir entrada' }));
    act(() => sceneProps.onEntranceReady?.());
    expect(onEnter).toHaveBeenCalledTimes(1);
    expect(onEnter).toHaveBeenCalledWith('projects', id);
  });
  it('rejects a captured callback from a cancelled entrance after a new entrance starts', () => {
    const onEnter = vi.fn();
    render(<ExperienceModule onEnter={onEnter} />);
    fireEvent.click(screen.getByRole('button', { name: 'Entrar a Kliniu' }));
    const oldReady = sceneProps.onEntranceReady;
    const oldToken = sceneProps.entranceToken;
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar entrada' }));
    fireEvent.click(screen.getByRole('button', { name: 'Entrar a Kliniu' }));
    act(() => { oldReady?.(); sceneProps.onEntranceReady?.(oldToken); });
    expect(onEnter).not.toHaveBeenCalled();
    act(() => sceneProps.onEntranceReady?.());
    expect(onEnter).toHaveBeenCalledTimes(1);
    expect(onEnter).toHaveBeenCalledWith('projects', 'kliniu');
  });
  it('saves flags and camera before approach and restores them on cancellation', () => {
    const onWorkshopSave = vi.fn();
    render(<ExperienceModule onEnter={vi.fn()} onWorkshopSave={onWorkshopSave} />);
    fireEvent.click(screen.getByRole('button', { name: 'Separar capas' }));
    fireEvent.click(screen.getByRole('switch', { name: 'Iluminación nocturna' }));
    act(() => sceneProps.onEnabledChange?.(true));
    fireEvent.click(screen.getByRole('button', { name: 'Entrar a Kliniu' }));
    expect(onWorkshopSave).toHaveBeenCalledWith(expect.objectContaining({ projectId: 'kliniu', detail: true, exploded: true, night: true, sceneEnabled: true, camera }));
    expect(sceneProps.exploded).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar entrada' }));
    expect(sceneProps.exploded).toBe(true);
    expect(restoreCamera).toHaveBeenCalledWith(camera);
  });
  it('restores workshop flags, opt-in, scroll and entrance focus without revealing again', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame'] });
    try {
      render(<ExperienceModule onEnter={vi.fn()} restoring reveal={false} initialWorkshop={{ projectId: 'drokex', detail: true, exploded: true, night: true, sceneEnabled: false, tourStop: 'catalog', camera: null, scrollY: 678 }} />);
      act(() => vi.runAllTimers());
      expect(sceneProps).toMatchObject({ selectedProjectId: 'drokex', detail: true, exploded: true, night: true, initialEnabled: false, reveal: false });
      expect(window.scrollTo).toHaveBeenCalledWith(0, 678);
      expect(screen.getByRole('button', { name: 'Entrar a Drokex' })).toHaveFocus();
    } finally { vi.useRealTimers(); }
  });
  it('applies the initial workshop only on mount, not when saving another entrance', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame'] });
    try {
      const snapshot = { projectId: 'kliniu', detail: true, exploded: false, night: false, sceneEnabled: true, tourStop: 'catalog' as const, camera, scrollY: 100 };
      const onEnter = vi.fn();
      const { rerender } = render(<ExperienceModule onEnter={onEnter} initialWorkshop={snapshot} restoring reveal={false} />);
      act(() => vi.runAllTimers());
      vi.mocked(window.scrollTo).mockClear();
      rerender(<ExperienceModule onEnter={onEnter} initialWorkshop={{ ...snapshot, scrollY: 500, camera: null }} restoring reveal={false} />);
      act(() => vi.runAllTimers());
      expect(window.scrollTo).not.toHaveBeenCalled();
      expect(sceneProps.initialCamera).toEqual(camera);
    } finally { vi.useRealTimers(); }
  });
  it('approaches Kliniu before opening its case and ignores late callbacks after cancellation', () => {
    const onEnter = vi.fn();
    render(<ExperienceModule onEnter={onEnter} />);
    fireEvent.click(screen.getByRole('button', { name: 'Entrar a Kliniu' }));
    expect(onEnter).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Seleccionar edificio de 4U' })).toHaveAttribute('data-entering', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar entrada' }));
    fireEvent.click(screen.getByRole('button', { name: 'Completar entrada 3D' }));
    expect(onEnter).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Entrar a Kliniu' }));
    fireEvent.click(screen.getByRole('button', { name: 'Completar entrada 3D' }));
    fireEvent.click(screen.getByRole('button', { name: 'Completar entrada 3D' }));
    expect(onEnter).toHaveBeenCalledTimes(1);
    expect(onEnter).toHaveBeenCalledWith('projects', 'kliniu');
  });
  it('opens Kliniu immediately with reduced motion', () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });
    const onEnter = vi.fn();
    render(<ExperienceModule onEnter={onEnter} />);
    fireEvent.click(screen.getByRole('button', { name: 'Entrar a Kliniu' }));
    expect(onEnter).toHaveBeenCalledWith('projects', 'kliniu');
    expect(screen.queryByRole('button', { name: 'Cancelar entrada' })).not.toBeInTheDocument();
  });
  it('has a bounded entrance when the renderer never reports completion', () => {
    vi.useFakeTimers();
    try {
      const onEnter = vi.fn();
      render(<ExperienceModule onEnter={onEnter} />);
      fireEvent.click(screen.getByRole('button', { name: 'Entrar a Kliniu' }));
      act(() => vi.advanceTimersByTime(2600));
      expect(onEnter).toHaveBeenCalledTimes(1);
    } finally { vi.useRealTimers(); }
  });
  it('cancels with Escape and does not navigate on the fallback timer', () => {
    vi.useFakeTimers();
    try {
      const onEnter = vi.fn();
      render(<ExperienceModule onEnter={onEnter} />);
      fireEvent.click(screen.getByRole('button', { name: 'Entrar a Kliniu' }));
      fireEvent.keyDown(window, { key: 'Escape' });
      act(() => vi.advanceTimersByTime(3000));
      expect(onEnter).not.toHaveBeenCalled();
    } finally { vi.useRealTimers(); }
  });
  it('opens the Kliniu tour without depending on WebGL and resets between projects', () => {
    const onEnter = vi.fn();
    render(<ExperienceModule onEnter={onEnter} />);
    fireEvent.click(screen.getByRole('button', { name: 'Seleccionar Kliniu' }));
    expect(screen.getByRole('region', { name: 'Recorrido de Kliniu' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Compra' }));
    expect(screen.getByRole('heading', { name: 'Del producto a la cotización.' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Ficha real de producto de Kliniu' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Arquitectura' }));
    expect(screen.getByRole('heading', { name: 'La estructura del producto.' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir caso completo de Kliniu' }));
    expect(onEnter).toHaveBeenCalledWith('projects', 'kliniu');
    fireEvent.click(screen.getByRole('button', { name: 'Seleccionar Drokex' }));
    expect(screen.queryByRole('region', { name: 'Recorrido de Kliniu' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Seleccionar Kliniu' }));
    expect(screen.getByRole('button', { name: 'Catálogo' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Vista general' }));
    expect(screen.queryByRole('region', { name: 'Recorrido de Kliniu' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'El proyecto' }));
    fireEvent.click(screen.getByRole('button', { name: 'Punto de compra 3D' }));
    expect(screen.getByRole('button', { name: 'Compra' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'El taller' }));
    fireEvent.click(screen.getByRole('button', { name: 'El proyecto' }));
    expect(screen.getByRole('button', { name: 'Catálogo' })).toHaveAttribute('aria-pressed', 'true');
  });
  it('focuses selections, separates layers and resets assembly without changing lighting', () => {
    render(<ExperienceModule onEnter={vi.fn()} />);
    const scene = screen.getByRole('button', { name: 'Seleccionar edificio de 4U' });
    fireEvent.click(screen.getByRole('button', { name: 'Seleccionar Drokex' }));
    expect(scene).toHaveAttribute('data-detail', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Separar capas' }));
    expect(scene).toHaveAttribute('data-exploded', 'true');
    fireEvent.click(screen.getByRole('switch', { name: 'Iluminación nocturna' }));
    expect(scene).toHaveAttribute('data-night', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Vista general' }));
    expect(scene).toHaveAttribute('data-exploded', 'false');
    expect(scene).toHaveAttribute('data-detail', 'false');
    expect(scene).toHaveAttribute('data-night', 'true');
  });
  it('shows the author, one selected project and real evidence', () => {
    render(<ExperienceModule onEnter={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Daniel Cantor', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Vista real de Kliniu' })).toBeInTheDocument();
    expect(screen.queryByText('La ciudad se observa a sí misma.')).not.toBeInTheDocument();
  });

  it('selects a project before opening its dossier', () => {
    const onEnter = vi.fn();
    render(<ExperienceModule onEnter={onEnter} />);
    fireEvent.click(screen.getByRole('button', { name: 'Seleccionar Drokex' }));
    expect(onEnter).not.toHaveBeenCalled();
    expect(screen.getByRole('img', { name: 'Vista real de Drokex' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Visitar sitio' })).toHaveAttribute('href', 'https://drokex.com/');
    fireEvent.click(screen.getByRole('button', { name: 'Ver caso de Drokex' }));
    expect(onEnter).toHaveBeenCalledWith('projects', 'drokex');
  });

  it('offers Kliniu detail and clears it when returning to overview', () => {
    render(<ExperienceModule onEnter={vi.fn()} />);
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });
    Element.prototype.scrollIntoView = vi.fn();
    fireEvent.click(screen.getByRole('button', { name: 'Acercar distrito Kliniu' }));
    expect(screen.getByRole('button', { name: 'Alejar distrito' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Seleccionar 4U Studio Academy' }));
    expect(screen.getByRole('button', { name: 'Alejar distrito' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('4U Studio Academy / Distrito de producto')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: "Seleccionar L'ORIGINE" }));
    expect(screen.getByRole('button', { name: 'Alejar distrito' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText("L'ORIGINE / Distrito de producto")).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Seleccionar Drokex' }));
    expect(screen.getByRole('button', { name: 'Alejar distrito' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Drokex / Distrito de producto')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Seleccionar Kliniu' }));
    fireEvent.click(screen.getByRole('button', { name: 'Vista general' }));
    expect(screen.getByRole('button', { name: 'Acercar distrito Kliniu' })).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(screen.getByRole('button', { name: 'Seleccionar Drokex' }));
    expect(screen.queryByRole('button', { name: 'Acercar distrito Kliniu' })).not.toBeInTheDocument();
  });

  it('shares selection between the city and project preview', () => {
    const onEnter = vi.fn();
    render(<ExperienceModule onEnter={onEnter} />);
    fireEvent.click(screen.getByRole('button', { name: 'Seleccionar edificio de 4U' }));
    expect(screen.getByRole('button', { name: 'Seleccionar 4U Studio Academy' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Ver caso de 4U Studio Academy' }));
    expect(onEnter).toHaveBeenCalledWith('projects', '4ustudio-academy');
  });
});
