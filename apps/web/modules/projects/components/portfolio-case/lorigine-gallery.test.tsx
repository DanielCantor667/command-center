import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LorigineGallery } from './lorigine-gallery';

let sceneError: (() => void) | undefined;
vi.mock('./lorigine-gallery-scene', () => ({
  LorigineGalleryScene: ({ onError }: { onError: () => void }) => {
    sceneError = onError;
    return null;
  },
}));

beforeEach(() => {
  sceneError = undefined;
  window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
  vi.stubGlobal('IntersectionObserver', class {
    constructor(private callback: IntersectionObserverCallback) {}
    observe() { this.callback([{ isIntersecting: true }] as IntersectionObserverEntry[], this as never); }
    disconnect() {}
  });
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ getExtension: () => null } as never);
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('Lorigine gallery focus', () => {
  it('moves focus to the close control on activation and restores it on close', async () => {
    render(<LorigineGallery />);
    const activate = screen.getByRole('button', { name: 'Explorar galería en 3D' });
    activate.focus();
    fireEvent.click(activate);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Cerrar galería 3D' })).toHaveFocus());
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar galería 3D' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Explorar galería en 3D' })).toHaveFocus());
  });

  it.each(['unavailable', 'throws'] as const)('focuses the static fallback when WebGL %s and preserves the site', async (failure) => {
    if (failure === 'unavailable') {
      vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null);
    } else {
      vi.mocked(HTMLCanvasElement.prototype.getContext).mockImplementation(() => { throw new Error('WebGL unavailable'); });
    }
    render(<LorigineGallery />);
    screen.getByRole('button', { name: 'Explorar galería en 3D' }).focus();
    fireEvent.click(screen.getByRole('button', { name: 'Explorar galería en 3D' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveFocus());
    fireEvent.click(screen.getByRole('button', { name: 'Sitio' }));
    expect(screen.getByRole('link', { name: 'Ampliar ficha pública' })).toBeInTheDocument();
  });

  it('focuses the static fallback after a scene failure removes the controls', async () => {
    render(<LorigineGallery />);
    fireEvent.click(screen.getByRole('button', { name: 'Explorar galería en 3D' }));
    await waitFor(() => expect(sceneError).toBeTypeOf('function'));
    screen.getByRole('button', { name: 'Cerrar galería 3D' }).focus();
    act(() => sceneError?.());
    await waitFor(() => expect(screen.getByRole('status')).toHaveFocus());
    expect(screen.getByAltText('Galería conceptual de L’ORIGINE, render de Blender')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cerrar galería 3D' })).not.toBeInTheDocument();
  });
});
