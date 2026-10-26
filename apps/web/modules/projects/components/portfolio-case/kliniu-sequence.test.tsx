import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { KliniuSequence } from './kliniu-sequence';

let sceneError: () => void;
vi.mock('./kliniu-sequence-scene', () => ({
  KliniuSequenceScene: ({ onError }: { onError: () => void }) => {
    sceneError = onError;
    return null;
  },
}));

beforeEach(() => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
  vi.stubGlobal('IntersectionObserver', class {
    constructor(private callback: IntersectionObserverCallback) {}
    observe() { this.callback([{ isIntersecting: true }] as IntersectionObserverEntry[], this as never); }
    disconnect() {}
  });
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ getExtension: () => null } as never);
});
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('Kliniu study focus', () => {
  it('moves focus to the close control on activation and restores it on close', async () => {
    render(<KliniuSequence />);
    const activate = screen.getByRole('button', { name: 'Explorar en 3D' });
    activate.focus();
    fireEvent.click(activate);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Cerrar estudio 3D' })).toHaveFocus());
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar estudio 3D' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Explorar en 3D' })).toHaveFocus());
  });

  it('focuses the static fallback when WebGL is unavailable and preserves the product', async () => {
    vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null);
    render(<KliniuSequence />);
    fireEvent.click(screen.getByRole('button', { name: 'Explorar en 3D' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveFocus());
    fireEvent.click(screen.getByRole('button', { name: '03 Producto' }));
    expect(screen.getByAltText('Ficha real de producto de Kliniu')).toBeInTheDocument();
  });

  it('focuses the static fallback after a scene failure', async () => {
    render(<KliniuSequence />);
    sceneError = vi.fn();
    const beforeMount = sceneError;
    fireEvent.click(screen.getByRole('button', { name: 'Explorar en 3D' }));
    await waitFor(() => expect(sceneError).not.toBe(beforeMount));
    act(() => sceneError());
    await waitFor(() => expect(screen.getByRole('status')).toHaveFocus());
    expect(screen.getByAltText('Estudio de líneas del showroom de Kliniu')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cerrar estudio 3D' })).not.toBeInTheDocument();
  });
});
