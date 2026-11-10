import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { WorldSceneProps } from '../world-scene';

const scene = vi.hoisted(() => ({ props: null as WorldSceneProps | null }));
vi.mock('next/dynamic', () => ({
  default: (loader: () => Promise<unknown>) => {
    if (loader.toString().includes('pc-desktop')) return function Desktop({ onClose }: { onClose: () => void }) { return <button onClick={onClose}>Cerrar PC</button>; };
    if (loader.toString().includes('world-scene')) return function Scene(props: WorldSceneProps) { scene.props = props; return null; };
    return function Empty() { return null; };
  },
}));

import { WorkshopGame } from '../component';

describe('focus after closing the workshop PC', () => {
  it('returns to the desktop button that opened it', async () => {
    render(<WorkshopGame initialSnapshot={{ point: 'contact', camera: null }} onOpenCase={vi.fn()} onSave={vi.fn()} onPortfolio={vi.fn()} />);
    const opener = screen.getByRole('button', { name: 'Entrar al escritorio' });
    opener.focus();
    fireEvent.click(opener);
    act(() => scene.props!.onCloseUp());
    const close = screen.getByRole('button', { name: 'Cerrar PC' });
    close.focus();
    fireEvent.click(close);
    await waitFor(() => expect(opener).toHaveFocus());
  });

  it('uses contact as the fallback when the 3D monitor opens the PC', async () => {
    render(<WorkshopGame initialSnapshot={{ point: 'contact', camera: null }} onOpenCase={vi.fn()} onSave={vi.fn()} onPortfolio={vi.fn()} />);
    act(() => scene.props!.onComputer());
    act(() => scene.props!.onCloseUp());
    const close = screen.getByRole('button', { name: 'Cerrar PC' });
    close.focus();
    fireEvent.click(close);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Ver contacto' })).toHaveFocus());
  });
});
