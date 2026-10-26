import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PROJECTS } from '../../../data/projects';
import { WorldMap } from '../world-map';

describe('World map', () => {
  it('exposes every wall of the lab through HTML and travels to the chosen point', () => {
    const go = vi.fn(), read = vi.fn(), open = vi.fn();
    render(<WorldMap currentPoint="hub" worldAvailable onGo={go} onRead={read} onOpenCase={open} />);
    const navigation = screen.getByRole('navigation', { name: 'Destinos del taller' });
    expect(within(navigation).getAllByRole('button')).toHaveLength(5);
    expect(screen.getByRole('img', { name: 'Plano del taller' })).toBeInTheDocument();
    expect(within(navigation).getByRole('button', { name: /El taller/ })).toHaveAttribute('aria-current', 'location');
    fireEvent.click(within(navigation).getByRole('button', { name: /Proyectos/ }));
    expect(go).toHaveBeenCalledWith('projects');
    fireEvent.click(within(navigation).getByRole('button', { name: /Contacto/ }));
    expect(go).toHaveBeenCalledWith('contact');
    expect(open).not.toHaveBeenCalled();
  });

  it('provides readings and every public case without starting a missing world', () => {
    const go = vi.fn(), read = vi.fn(), open = vi.fn();
    render(<WorldMap currentPoint="entrance" worldAvailable={false} onGo={go} onRead={read} onOpenCase={open} />);
    const navigation = screen.getByRole('navigation', { name: 'Destinos del taller' });
    expect(within(navigation).queryByRole('button', { name: /El taller/ })).not.toBeInTheDocument();
    for (const project of PROJECTS.filter(item => item.public)) expect(within(navigation).getByRole('button', { name: new RegExp(project.name) })).toBeInTheDocument();
    fireEvent.click(within(navigation).getByRole('button', { name: /4U Studio Academy/ }));
    expect(open).toHaveBeenCalledWith('4ustudio-academy');
    fireEvent.click(within(navigation).getByRole('button', { name: /Tecnologías/ }));
    expect(read).toHaveBeenCalledWith({ kind: 'technologies', technologyId: 'nextjs' });
    fireEvent.click(within(navigation).getByRole('button', { name: /Trayectoria/ }));
    expect(read).toHaveBeenCalledWith({ kind: 'trajectory' });
    expect(go).not.toHaveBeenCalled();
  });
});
