import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { TechnologyExplorer } from '../components/technology-explorer';

vi.mock('next/dynamic', () => ({ default: () => () => null }));
beforeEach(() => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: false });
});
function Explorer({ onProjectSelect = vi.fn() }: { onProjectSelect?: (id: string) => void }) {
  const [id, setId] = useState('nextjs');
  return <TechnologyExplorer selectedId={id} onSelect={setId} onProjectSelect={onProjectSelect} />;
}

describe('Technology explorer', () => {
  it('searches by alias and changes the selected detail without leaving the catalogue', () => {
    render(<Explorer />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'testing' } });
    expect(screen.getByRole('status')).toHaveTextContent('1 tecnología');
    fireEvent.click(screen.getByRole('button', { name: 'Explorar Playwright' }));
    expect(
      within(screen.getByRole('complementary', { name: 'Detalle de tecnología' })).getByRole(
        'heading',
        { name: 'Playwright' },
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Explorar Playwright' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('combines filters and restores all tools from an empty result', () => {
    render(<Explorer />);
    fireEvent.click(screen.getByRole('button', { name: 'Lenguajes 5' }));
    expect(screen.getByRole('status')).toHaveTextContent('5 tecnologías');
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'React' } });
    expect(screen.getByRole('heading', { name: 'No hay coincidencias' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));
    expect(screen.getByRole('searchbox')).toHaveValue('');
    expect(screen.getByRole('status')).toHaveTextContent('34 tecnologías');
  });

  it('filters the stack of a real project and opens that project', () => {
    const onProjectSelect = vi.fn();
    render(<Explorer onProjectSelect={onProjectSelect} />);
    fireEvent.click(screen.getByRole('button', { name: 'Ver tecnologías de Kliniu' }));
    expect(screen.getByText('Stack de Kliniu')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Explorar Python' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Kliniu Ver proyecto' }));
    expect(onProjectSelect).toHaveBeenCalledWith('kliniu');
    fireEvent.click(screen.getByRole('button', { name: 'Quitar filtro' }));
    expect(screen.getByRole('button', { name: 'Explorar Python' })).toBeInTheDocument();
  });
});
