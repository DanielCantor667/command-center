import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ExperienceModule } from '../component';

vi.mock('../components/city-navigator-loader', () => ({
  CityNavigatorLoader: ({ onProjectSelect }: { onProjectSelect: (id: string) => void }) => (
    <button onClick={() => onProjectSelect('4ustudio-academy')}>Seleccionar edificio de 4U</button>
  ),
}));

describe('City portfolio experience', () => {
  it('shows the author, one selected project and real evidence', () => {
    render(<ExperienceModule onEnter={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Productos reales. De la idea al despliegue.' })).toBeInTheDocument();
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
