import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PROJECTS } from '../../../../data/projects';
import { PortfolioCase } from './component';

const project = PROJECTS.find((item) => item.id === 'lorigine')!;
describe('Lorigine gallery case', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
    window.matchMedia = vi
      .fn()
      .mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe() {}
        disconnect() {}
      },
    );
  });
  it('opens its own editorial case and returns to the city', () => {
    const onReturn = vi.fn();
    render(<PortfolioCase project={project} onSelect={vi.fn()} onReturn={onReturn} />);
    expect(screen.getByRole('heading', { name: "L'ORIGINE", level: 1 })).toHaveFocus();
    expect(screen.getByRole('main').querySelector('[data-case-context="lorigine"]')).toHaveTextContent(project.role.title);
    expect(screen.getByAltText('Galería conceptual L’ORIGINE creada en Blender')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Una marca, tres perspectivas.' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Visitar sitio' })).toHaveAttribute(
      'href',
      project.links.live,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Volver a la ciudad' }));
    expect(onReturn).toHaveBeenCalledTimes(1);
  });
  it('shows gallery, detail and actual site without requiring a canvas', () => {
    render(<PortfolioCase project={project} onSelect={vi.fn()} onReturn={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Galería' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Detalle' }));
    expect(
      screen.getByAltText('Detalle conceptual de los envases L’ORIGINE, render de Blender'),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Sitio' }));
    expect(screen.getByAltText('Ficha pública de L’ORIGINE')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ampliar ficha pública' })).toBeInTheDocument();
  });
  it('retains the site when WebGL is unavailable', () => {
    const getContext = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    try {
      render(<PortfolioCase project={project} onSelect={vi.fn()} onReturn={vi.fn()} />);
      fireEvent.click(screen.getByRole('button', { name: 'Explorar galería en 3D' }));
      expect(screen.getByRole('status')).toHaveTextContent('Vista estática');
      fireEvent.click(screen.getByRole('button', { name: 'Sitio' }));
      expect(screen.getByAltText('Ficha pública de L’ORIGINE')).toBeInTheDocument();
    } finally {
      getContext.mockRestore();
    }
  });
  it('keeps the project and technology navigation', () => {
    const onSelect = vi.fn();
    const onNavigate = vi.fn();
    render(
      <PortfolioCase
        project={project}
        onSelect={onSelect}
        onReturn={vi.fn()}
        onNavigate={onNavigate}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Siguiente proyecto 4U/ }));
    expect(onSelect).toHaveBeenCalledWith('4ustudio-academy');
    fireEvent.click(screen.getByRole('button', { name: 'Tecnologías' }));
    expect(onNavigate).toHaveBeenCalledWith('technologies');
  });
});
