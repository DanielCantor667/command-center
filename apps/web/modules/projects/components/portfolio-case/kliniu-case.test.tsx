import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PROJECTS } from '../../../../data/projects';
import { PortfolioCase } from './component';

describe('Kliniu editorial case', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
    window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
    vi.stubGlobal('IntersectionObserver', class { observe() {} disconnect() {} });
  });
  it('preserves entry, real evidence and return navigation', () => {
    const onReturn = vi.fn();
    const project = PROJECTS.find(p => p.id === 'kliniu')!;
    render(<PortfolioCase project={project} onSelect={vi.fn()} onReturn={onReturn} />);
    expect(screen.getByRole('heading', { name: 'Kliniu', level: 1 })).toHaveFocus();
    expect(screen.getByRole('main').querySelector('[data-case-context="kliniu"]')).toHaveTextContent(project.role.title);
    expect(screen.getByRole('heading', { name: 'Del plano al producto.' })).toBeInTheDocument();
    expect(screen.getByAltText('Kliniu · vista de escritorio')).toHaveStyle({ viewTransitionName: 'kliniu-surface' });
    expect(screen.getByRole('link', { name: /Visitar sitio/ })).toHaveAttribute('href', 'https://kliniucolombia.com/');
    expect(screen.getByRole('main').querySelector('canvas')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Volver a la ciudad' }));
    expect(onReturn).toHaveBeenCalledTimes(1);
  });
  it('offers all three stages without requiring WebGL', () => {
    render(<PortfolioCase project={PROJECTS.find(p => p.id === 'kliniu')!} onSelect={vi.fn()} onReturn={vi.fn()} />);
    expect(screen.getByRole('button', { name: '01 Plano' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: '02 Espacio' }));
    expect(screen.getByRole('img', { name: 'Showroom conceptual de Kliniu, render de Blender' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '03 Producto' }));
    expect(screen.getByRole('img', { name: 'Ficha real de producto de Kliniu' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '03 Producto' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: '01 Plano' }));
    expect(screen.getByRole('img', { name: 'Estudio de líneas del showroom de Kliniu' })).toBeInTheDocument();
  });
  it('does not apply the Kliniu narrative to other projects', () => {
    render(<PortfolioCase project={PROJECTS.find(p => p.id === 'lorigine')!} onSelect={vi.fn()} onReturn={vi.fn()} />);
    expect(screen.queryByRole('heading', { name: 'Del plano al producto.' })).not.toBeInTheDocument();
  });
  it('keeps the product available when WebGL is unavailable', () => {
    const context = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    try {
      render(<PortfolioCase project={PROJECTS.find(p => p.id === 'kliniu')!} onSelect={vi.fn()} onReturn={vi.fn()} />);
      fireEvent.click(screen.getByRole('button', { name: 'Explorar en 3D' }));
      expect(screen.getByRole('status')).toHaveTextContent('El 3D no está disponible');
      fireEvent.click(screen.getByRole('button', { name: '03 Producto' }));
      expect(screen.getByAltText('Ficha real de producto de Kliniu')).toBeInTheDocument();
    } finally { context.mockRestore(); }
  });
});
