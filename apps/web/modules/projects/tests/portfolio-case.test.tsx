import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PROJECTS } from '../../../data/projects';
import { PortfolioCase } from '../components/portfolio-case/component';

beforeEach(() => { window.scrollTo = vi.fn(); });

describe('Portfolio case', () => {
  it.each(PROJECTS.filter(project => project.public && project.links.live))('presents $name with real captures and its live link', project => {
    render(<PortfolioCase project={project} onSelect={vi.fn()} onReturn={vi.fn()} />);
    expect(screen.getByRole('heading', { level: 1, name: project.name })).toHaveFocus();
    expect(screen.getByRole('link', { name: 'Visitar sitio' })).toHaveAttribute('href', project.links.live);
    for (const media of project.media) expect(screen.getByRole('img', { name: media.alt })).toBeInTheDocument();
  });

  it('moves to the next case and returns to the city', () => {
    const cases = PROJECTS.filter(project => project.public && project.links.live);
    const select = vi.fn();
    const back = vi.fn();
    render(<PortfolioCase project={cases[0]!} onSelect={select} onReturn={back} />);
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente ' + cases[1]!.name }));
    expect(select).toHaveBeenCalledWith(cases[1]!.id);
    fireEvent.click(screen.getByRole('button', { name: 'Volver a la ciudad' }));
    expect(back).toHaveBeenCalledOnce();
  });

  it('keeps unconfirmed authorship and missing evidence explicit', () => {
    render(<PortfolioCase project={PROJECTS.find(project => project.id === 'drokex')!} onSelect={vi.fn()} onReturn={vi.fn()} />);
    expect(screen.getByText('Autoría y alcance por confirmar.')).toBeInTheDocument();
    expect(screen.getByText('Sin evidencia documentada por ahora.')).toBeInTheDocument();
  });
});
