import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WorldMap } from '../world-map';

describe('World map', () => {
  it('exposes all nine destinations through HTML and travels to the chosen point', () => {
    const go = vi.fn(), read = vi.fn(), open = vi.fn();
    render(<WorldMap currentPoint="hub" worldAvailable onGo={go} onRead={read} onOpenCase={open} />);
    const navigation = screen.getByRole('navigation', { name: 'Destinos del taller' });
    expect(within(navigation).getAllByRole('button')).toHaveLength(9);
    expect(screen.getByRole('img', { name: 'Plano del taller' })).toBeInTheDocument();
    expect(within(navigation).getByRole('button', { name: /El taller/ })).toHaveAttribute('aria-current', 'location');
    fireEvent.click(within(navigation).getByRole('button', { name: /4U Studio Academy/ }));
    expect(go).toHaveBeenCalledWith('academy');
    fireEvent.click(within(navigation).getByRole('button', { name: /Contacto/ }));
    expect(go).toHaveBeenCalledWith('contact');
    expect(open).not.toHaveBeenCalled();
  });

  it('provides reading and cases without starting a missing world, and disables physical-only points', () => {
    const go = vi.fn(), read = vi.fn(), open = vi.fn();
    render(<WorldMap currentPoint="entrance" worldAvailable={false} onGo={go} onRead={read} onOpenCase={open} />);
    const navigation = screen.getByRole('navigation', { name: 'Destinos del taller' });
    expect(within(navigation).getByRole('button', { name: /El taller/ })).toBeDisabled();
    expect(within(navigation).getByRole('button', { name: /Mesa de trabajo/ })).toBeDisabled();
    fireEvent.click(within(navigation).getByRole('button', { name: /4U Studio Academy/ }));
    expect(open).toHaveBeenCalledWith('4ustudio-academy');
    fireEvent.click(within(navigation).getByRole('button', { name: /Tecnologías/ }));
    expect(read).toHaveBeenCalledWith({ kind: 'technologies', technologyId: 'nextjs' });
    fireEvent.click(within(navigation).getByRole('button', { name: /Trayectoria/ }));
    expect(read).toHaveBeenCalledWith({ kind: 'trajectory' });
    expect(go).not.toHaveBeenCalled();
  });
});
