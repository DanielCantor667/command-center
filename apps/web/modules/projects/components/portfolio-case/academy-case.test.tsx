import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PROJECTS } from '../../../../data/projects';
import { PortfolioCase } from './component';

const project = PROJECTS.find((item) => item.id === '4ustudio-academy')!;
describe('Academy case', () => {
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
  it('routes to its own case and returns to the city', () => {
    const onReturn = vi.fn();
    render(<PortfolioCase project={project} onReturn={onReturn} onSelect={vi.fn()} />);
    expect(screen.getByRole('heading', { name: '4U Studio Academy', level: 1 })).toHaveFocus();
    const context = screen.getByRole('main').querySelector('[data-case-context="4ustudio-academy"]');
    expect(context).toHaveTextContent(project.role.title);
    expect(context).toHaveTextContent(/academia|lecciones/i);
    expect(screen.getByAltText('Estudio musical conceptual de 4U, render de Blender')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Dentro del estudio.' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Volver a la ciudad' }));
    expect(onReturn).toHaveBeenCalledOnce();
  });
  it('switches three views without loading a canvas', () => {
    render(<PortfolioCase project={project} onReturn={vi.fn()} onSelect={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Estudio' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Instrumentos' }));
    expect(screen.getByAltText('Instrumentos del estudio conceptual 4U')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Academia' }));
    expect(screen.getByAltText('Inicio de 4U Studio Academy')).toBeInTheDocument();
    expect(document.querySelector('canvas')).toBeNull();
  });
  it('preserves the academy when WebGL is unavailable', () => {
    const context = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    render(<PortfolioCase project={project} onReturn={vi.fn()} onSelect={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Explorar estudio en 3D' }));
    expect(screen.getByRole('status')).toHaveTextContent('Vista estática');
    fireEvent.click(screen.getByRole('button', { name: 'Academia' }));
    expect(screen.getByRole('link', { name: 'Ampliar academia' })).toBeInTheDocument();
    context.mockRestore();
  });
  it('navigates to previous and next projects', () => {
    const onSelect = vi.fn();
    render(<PortfolioCase project={project} onReturn={vi.fn()} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button', { name: /Proyecto anterior/ }));
    expect(onSelect).toHaveBeenLastCalledWith('lorigine');
    fireEvent.click(screen.getByRole('button', { name: /Siguiente proyecto/ }));
    expect(onSelect).toHaveBeenLastCalledWith('drokex');
  });
});
