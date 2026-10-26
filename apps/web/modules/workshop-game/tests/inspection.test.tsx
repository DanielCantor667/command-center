import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RoomInspection } from '../room-inspection';
import { StationInspection } from '../station-inspection';

describe('workshop inspection details', () => {
  it('keeps the full Academy name accessible with a short case action and complete expandable details', () => {
    const open = vi.fn(), back = vi.fn();
    const buttonRef = { current: null };
    render(<RoomInspection room="academy" buttonRef={buttonRef} onOpen={open} onBack={back} />);

    expect(screen.getByRole('heading', { name: '4U Studio Academy' })).toBeInTheDocument();
    const action = screen.getByRole('button', { name: 'Abrir caso de 4U Studio Academy' });
    expect(action).toHaveTextContent(/^Abrir caso$/);
    expect(buttonRef.current).toBe(action);
    const fold = screen.getByRole('button', { name: 'Ver detalles' });
    expect(fold).toHaveAttribute('aria-expanded', 'false');
    const details = document.getElementById(fold.getAttribute('aria-controls') ?? '');
    expect(details).not.toBeNull();
    expect(details).not.toHaveAttribute('hidden');
    expect(within(details!).getByText(/Plataforma de una academia de música en Bogotá/)).toBeInTheDocument();
    expect(within(details!).getByRole('img', { name: 'Captura real del sitio de 4U Studio Academy' })).toBeInTheDocument();

    fireEvent.click(fold);
    expect(screen.getByRole('button', { name: 'Ocultar detalles' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('region', { name: '4U Studio Academy' })).toHaveAttribute('data-open', 'true');
    fireEvent.click(action);
    fireEvent.click(within(details!).getByRole('button', { name: 'Volver al taller' }));
    expect(open).toHaveBeenCalledOnce();
    expect(back).toHaveBeenCalledOnce();
    fireEvent.click(fold);
    expect(fold).toHaveAttribute('aria-expanded', 'false');
  });

  it('connects station details to its toggle while preserving reading and return actions', () => {
    const open = vi.fn(), back = vi.fn();
    render(<StationInspection station="technologies" buttonRef={{ current: null }} onOpen={open} onBack={back} />);

    const fold = screen.getByRole('button', { name: 'Ver detalles' });
    const details = document.getElementById(fold.getAttribute('aria-controls') ?? '');
    expect(details).not.toBeNull();
    expect(details).not.toHaveAttribute('hidden');
    expect(within(details!).getByText('Herramientas del taller y los proyectos en los que las utilizo.')).toBeInTheDocument();
    fireEvent.click(fold);
    expect(fold).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Explorar tecnologías' }));
    fireEvent.click(within(details!).getByRole('button', { name: 'Volver al taller' }));
    expect(open).toHaveBeenCalledOnce();
    expect(back).toHaveBeenCalledOnce();
  });
});
