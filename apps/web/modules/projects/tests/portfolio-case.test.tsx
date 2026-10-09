import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PROJECTS } from '../../../data/projects';
import { PortfolioCase } from '../components/portfolio-case/component';

beforeEach(() => {
  window.scrollTo = vi.fn();
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn(),
  });
  vi.stubGlobal('IntersectionObserver', class {
    observe() {}
    disconnect() {}
  });
});

describe('Portfolio case', () => {
  it.each(PROJECTS.filter(project => project.public && project.links.live))('presents $name with real captures and its live link', project => {
    render(<PortfolioCase project={project} onSelect={vi.fn()} onReturn={vi.fn()} />);
    expect(screen.getByRole('heading', { level: 1, name: project.name })).toHaveFocus();
    const visitLabel = project.id === '4ustudio-academy' ? 'Visitar academia' : 'Visitar sitio';
    expect(screen.getByRole('link', { name: visitLabel })).toHaveAttribute('href', project.links.live);
    const captures: Record<string, string[]> = {
      drokex: ['Catálogo público de Drokex', 'Directorio de Drokex en móvil'],
      kliniu: ['Kliniu · vista de escritorio', 'Kliniu · vista de móvil'],
      lorigine: ['Catálogo público de L’ORIGINE', 'Ficha pública de L’ORIGINE en móvil'],
      '4ustudio-academy': ['Lecciones en la web pública de 4U Studio Academy', 'Lecciones de 4U Studio Academy en móvil'],
    };
    for (const alt of captures[project.id] ?? project.media.map(media => media.alt)) {
      expect(screen.getByRole('img', { name: alt })).toBeInTheDocument();
    }
  });

  it('moves to the next case and returns to the city', () => {
    const cases = PROJECTS.filter(project => project.public && project.links.live);
    const select = vi.fn();
    const back = vi.fn();
    render(<PortfolioCase project={cases[0]!} onSelect={select} onReturn={back} />);
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente proyecto ' + cases[1]!.name }));
    expect(select).toHaveBeenCalledWith(cases[1]!.id);
    fireEvent.click(screen.getByRole('button', { name: 'Volver a la ciudad' }));
    expect(back).toHaveBeenCalledOnce();
  });

  it('attributes Drokex participation to the supplied CV without inventing evidence', () => {
    render(<PortfolioCase project={PROJECTS.find(project => project.id === 'drokex')!} onSelect={vi.fn()} onReturn={vi.fn()} />);
    expect(screen.getByText('Participación descrita en el CV de Daniel.')).toBeInTheDocument();
    expect(screen.getByText('Sin evidencia documentada por ahora.')).toBeInTheDocument();
  });
});
