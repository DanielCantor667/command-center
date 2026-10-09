import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PROJECTS } from '../../../../data/projects';
import { PortfolioCase } from './component';

const project = PROJECTS.find((item) => item.id === 'drokex')!;
let visibility: (entries: { isIntersecting: boolean }[]) => void;
vi.mock('./drokex-network-scene', () => ({
  DrokexNetworkScene: ({ revision }: { revision: number }) => <canvas aria-label="Red de prueba" data-revision={revision} />,
}));
describe('Drokex case', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
    window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() });
    vi.stubGlobal('IntersectionObserver', class {
      constructor(callback: typeof visibility) { visibility = callback; }
      observe() { visibility([{ isIntersecting: true }]); }
      disconnect() {}
    });
  });
  it('opens its own case with heading focus and honest attribution', () => {
    render(<PortfolioCase project={project} onReturn={vi.fn()} onSelect={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Drokex', level: 1 })).toHaveFocus();
    const context = screen.getByRole('main').querySelector('[data-case-context="drokex"]');
    expect(context).toHaveTextContent(project.role.title);
    expect(context).toHaveTextContent('Participación descrita en el CV de Daniel.');
    expect(context).toHaveTextContent('Propiedad no confirmada.');
    expect(screen.getByRole('region', { name: 'Comercio conectado.' })).toBeInTheDocument();
    expect(screen.getByText('Participación descrita en el CV de Daniel.')).toBeInTheDocument();
    expect(screen.getByText('Sin evidencia documentada por ahora.')).toBeInTheDocument();
  });
  it('switches all views without mounting a canvas', () => {
    render(<PortfolioCase project={project} onReturn={vi.fn()} onSelect={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Red' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Detalle' }));
    expect(screen.getByAltText('Detalle del pabellón conceptual Drokex')).toBeInTheDocument();
    expect(screen.getByText('Globo, kioscos y muestras. Aluminio, juntas y superficies de catálogo.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Plataforma' }));
    expect(screen.getByRole('link', { name: 'Ampliar plataforma' })).toHaveAttribute('href', '/projects/drokex-products-v4.webp');
    expect(document.querySelector('canvas')).toBeNull();
  });
  it('keeps the platform accessible without WebGL', () => {
    const context = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    render(<PortfolioCase project={project} onReturn={vi.fn()} onSelect={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Explorar red en 3D' }));
    expect(screen.getByRole('status')).toHaveTextContent('Vista estática');
    fireEvent.click(screen.getByRole('button', { name: 'Plataforma' }));
    expect(screen.getByRole('link', { name: 'Ampliar plataforma' })).toBeInTheDocument();
    context.mockRestore();
  });
  it('returns to 4U and the city', () => {
    const onSelect = vi.fn();
    const onReturn = vi.fn();
    render(<PortfolioCase project={project} onReturn={onReturn} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button', { name: /Proyecto anterior/ }));
    expect(onSelect).toHaveBeenCalledWith('4ustudio-academy');
    fireEvent.click(screen.getByRole('button', { name: 'Volver a la ciudad' }));
    expect(onReturn).toHaveBeenCalledOnce();
  });
  it('preserves opt-in across platform and visibility changes, resets and restores focus on close', async () => {
    const context = vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ getExtension: () => null } as unknown as WebGL2RenderingContext);
    render(<PortfolioCase project={project} onReturn={vi.fn()} onSelect={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Explorar red en 3D' }));
    await screen.findByLabelText('Red de prueba');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Cerrar red 3D' })).toHaveFocus());
    fireEvent.click(screen.getByRole('button', { name: 'Restablecer red' }));
    expect(screen.getByLabelText('Red de prueba')).toHaveAttribute('data-revision', '1');
    fireEvent.click(screen.getByRole('button', { name: 'Plataforma' }));
    expect(document.querySelector('canvas')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Red' }));
    expect(await screen.findByLabelText('Red de prueba')).toBeInTheDocument();
    act(() => visibility([{ isIntersecting: false }]));
    expect(document.querySelector('canvas')).toBeNull();
    act(() => visibility([{ isIntersecting: true }]));
    expect(await screen.findByLabelText('Red de prueba')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar red 3D' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Explorar red en 3D' })).toHaveFocus());
    expect(document.querySelector('canvas')).toBeNull();
    context.mockRestore();
  });
});
