import { fireEvent, render, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkshopReader, type WorkshopReaderProps } from '../workshop-reader';
import type { WorkshopReading } from '../reading';
import type { TechnologyFilters } from '../../experience/components/technology-explorer';

vi.mock('next/dynamic', () => ({ default: () => () => <canvas aria-label="Technology renderer" /> }));
beforeEach(() => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: false });
});

function Reader({ reading, ...props }: Partial<WorkshopReaderProps> & { reading: WorkshopReading }) {
  const [selected, setSelected] = useState(reading);
  const [filters, setFilters] = useState<TechnologyFilters>(props.technologyFilters ?? { query: '', category: 'all', projectId: null });
  return <WorkshopReader reading={selected} currentPoint="hub" worldAvailable technologyFilters={filters}
    onTechnologyFiltersChange={setFilters} onRead={setSelected} onGo={vi.fn()} onOpenCase={vi.fn()} onClose={vi.fn()} {...props} />;
}

describe('Workshop reader', () => {
  it('reads and filters the complete technology catalogue in HTML, including projects without a physical room', () => {
    const open = vi.fn();
    render(<Reader reading={{ kind: 'technologies', technologyId: 'nextjs' }} onOpenCase={open} />);
    expect(screen.getByRole('dialog', { name: 'Tecnologías' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('34 tecnologías');
    expect(document.querySelector('canvas')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Command Center Ver proyecto' }));
    expect(open).toHaveBeenCalledWith('command-center');
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'testing' } });
    fireEvent.click(screen.getByRole('button', { name: 'Explorar Playwright' }));
    expect(within(screen.getByRole('complementary', { name: 'Detalle de tecnología' })).getByRole('heading', { name: 'Playwright' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Datos 5' }));
    expect(screen.getByRole('heading', { name: 'No hay coincidencias' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));
    expect(screen.getByRole('status')).toHaveTextContent('34 tecnologías');
  });

  it('retains a supplied project filter and exposes the real CV-only empty association', () => {
    render(<Reader reading={{ kind: 'technologies', technologyId: 'python' }} technologyFilters={{ query: '', category: 'all', projectId: 'kliniu' }} />);
    expect(screen.getByText('Stack de Kliniu')).toBeInTheDocument();
    expect(screen.getByText('Incluida en mi CV. Aún sin un proyecto asociado en este portafolio.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Explorar Python' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Quitar filtro' }));
    expect(screen.getByRole('button', { name: 'Explorar Python' })).toBeInTheDocument();
  });

  it('shows documented experience, education and language proficiency', () => {
    render(<Reader reading={{ kind: 'trajectory' }} />);
    expect(screen.getByRole('dialog', { name: 'Trayectoria' })).toBeInTheDocument();
    expect(screen.getByText('Agrocinco · Bogotá')).toBeInTheDocument();
    expect(screen.getByText('Ene — Dic 2025')).toBeInTheDocument();
    expect(screen.getByText('Corporación Universitaria Minuto de Dios')).toBeInTheDocument();
    expect(screen.getByText('Universitaria Agustiniana')).toBeInTheDocument();
    expect(screen.getByText('B2 · Intermedio-alto')).toBeInTheDocument();
  });

  it('offers exactly the existing public contact channels without requesting WebGL', () => {
    render(<Reader reading={{ kind: 'contact' }} worldAvailable={false} />);
    const links = within(screen.getByRole('dialog')).getAllByRole('link');
    expect(links.map(link => link.getAttribute('href'))).toEqual([
      'https://www.linkedin.com/in/danielcantorayala', 'https://github.com/DanielCantor667',
    ]);
    expect(screen.getByText('Bogotá, Colombia')).toBeInTheDocument();
    expect(document.querySelector('canvas')).not.toBeInTheDocument();
  });

  it('portals the modal, traps Tab, closes with Escape and restores its opener and body scroll', () => {
    function Modal() {
      const [opened, setOpened] = useState(false);
      return <><button type="button" onClick={() => setOpened(true)}>Abrir contacto</button>{opened && <Reader reading={{ kind: 'contact' }} onClose={() => setOpened(false)} />}</>;
    }
    const { container } = render(<Modal />);
    const opener = screen.getByRole('button', { name: 'Abrir contacto' });
    opener.focus();
    const previousOverflow = document.body.style.overflow;
    fireEvent.click(opener);
    const dialog = screen.getByRole('dialog');
    expect(container.contains(dialog)).toBe(false);
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(document.body.style.overflow).toBe('hidden');
    const first = within(dialog).getByRole('button', { name: 'Cerrar lectura' });
    const last = within(dialog).getByRole('link', { name: /GitHub/ });
    last.focus();
    fireEvent.keyDown(last, { key: 'Tab' });
    expect(first).toHaveFocus();
    fireEvent.keyDown(first, { key: 'Tab', shiftKey: true });
    expect(last).toHaveFocus();
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
    expect(document.body.style.overflow).toBe(previousOverflow);
  });
});
