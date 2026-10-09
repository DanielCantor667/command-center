import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PROJECTS } from '../../../../data/projects';
import { PortfolioCase } from './component';

const cases = ['kliniu', 'lorigine', '4ustudio-academy', 'drokex'];

describe('Portfolio case return destination', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    vi.stubGlobal('IntersectionObserver', class {
      observe() {}
      disconnect() {}
    });
  });

  it.each(cases)('returns %s to the workshop with the accessible destination label', (id) => {
    const onReturn = vi.fn();
    render(<PortfolioCase
      project={PROJECTS.find((project) => project.id === id)!}
      onSelect={vi.fn()}
      onReturn={onReturn}
      returnLabel="Volver al taller"
    />);

    fireEvent.click(screen.getByRole('button', { name: 'Volver al taller' }));
    expect(onReturn).toHaveBeenCalledOnce();
    expect(screen.queryByRole('button', { name: 'Volver a la ciudad' })).not.toBeInTheDocument();
  });

  it.each(cases)('keeps the classic return destination for %s when no label is supplied', (id) => {
    const onReturn = vi.fn();
    render(<PortfolioCase
      project={PROJECTS.find((project) => project.id === id)!}
      onSelect={vi.fn()}
      onReturn={onReturn}
    />);

    fireEvent.click(screen.getByRole('button', { name: 'Volver a la ciudad' }));
    expect(onReturn).toHaveBeenCalledOnce();
    expect(screen.queryByRole('button', { name: 'Volver al taller' })).not.toBeInTheDocument();
  });
});
