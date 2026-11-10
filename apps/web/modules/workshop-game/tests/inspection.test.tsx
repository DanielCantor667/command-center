import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PROJECTS } from '../../../data/projects';
import { ProjectsInspection } from '../projects-inspection';
import { StationInspection } from '../station-inspection';

describe('workshop inspection details', () => {
  it('lists every public project from the wall with a case action and a way back', () => {
    const open = vi.fn(), back = vi.fn();
    const buttonRef = { current: null };
    render(<ProjectsInspection buttonRef={buttonRef} onOpen={open} onBack={back} />);

    expect(screen.getByRole('heading', { name: 'Proyectos' })).toBeInTheDocument();
    const fold = screen.getByRole('button', { name: /Ver lista/ });
    expect(buttonRef.current).toBe(fold);
    expect(fold).toHaveAttribute('aria-expanded', 'false');
    const details = document.getElementById(fold.getAttribute('aria-controls') ?? '');
    expect(details).not.toBeNull();
    for (const project of PROJECTS.filter(item => item.public)) {
      expect(within(details!).getByRole('button', { name: `Abrir caso de ${project.name}` })).toBeInTheDocument();
    }
    fireEvent.click(fold);
    expect(fold).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(within(details!).getByRole('button', { name: 'Abrir caso de 4U Studio Academy' }));
    fireEvent.click(within(details!).getByRole('button', { name: 'Volver al taller' }));
    expect(open).toHaveBeenCalledWith('4ustudio-academy');
    expect(back).toHaveBeenCalledOnce();
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

  it('keeps independent keyboard-accessible actions for contact and the desktop', () => {
    const open = vi.fn(), computer = vi.fn();
    render(<StationInspection station="contact" buttonRef={{ current: null }} onOpen={open} onBack={vi.fn()} onComputer={computer} />);

    fireEvent.click(screen.getByRole('button', { name: 'Entrar al escritorio' }));
    expect(computer).toHaveBeenCalledOnce();
    expect(open).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Ver contacto' }));
    expect(open).toHaveBeenCalledOnce();
    expect(computer).toHaveBeenCalledOnce();
  });
});
