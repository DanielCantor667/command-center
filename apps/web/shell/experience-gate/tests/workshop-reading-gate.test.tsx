import { act, fireEvent, render, screen } from '@testing-library/react';
import { useState, type ComponentProps } from 'react';
import { beforeEach, expect, it, vi } from 'vitest';
import { ExperienceGate } from '../component';
import type { WorkshopGame } from '../../../modules/workshop-game/component';
type Reading = { kind: 'technologies'; technologyId: string } | { kind: 'map' | 'contact' | 'trajectory' };
type Props = ComponentProps<typeof WorkshopGame> & { reading?: Reading | null; onRead?: (value: Reading | null) => void };
let mounts = 0;
vi.mock('../../../modules/workshop-game/component', () => ({ WorkshopGame: (value: Props) => {
  const [instance] = useState(() => ++mounts);
  return <div data-testid="game" data-instance={instance}>
    <output>{value.reading?.kind === 'technologies' ? value.reading.technologyId : value.reading?.kind}</output>
    <output data-testid="filters">{value.technologyFilters?.query}:{value.technologyFilters?.projectId}</output>
    <button onClick={() => value.onTechnologyFiltersChange?.({ query: 'next', category: 'all', projectId: 'kliniu' })}>Filtrar stack</button>
    <button onClick={() => value.onOpenCase('kliniu')}>Abrir caso</button>
    <button onClick={() => value.onRead?.({ kind: 'technologies', technologyId: 'react' })}>Leer React</button>
    <button onClick={() => value.onRead?.(null)}>Cerrar lector</button>
  </div>;
} }));
vi.mock('../../../modules/projects/components/portfolio-case/component', () => ({ PortfolioCase: ({ onReturn, onTechnologySelect, returnLabel }: { onReturn: () => void; onTechnologySelect: (id: string) => void; returnLabel: string }) => <><h1>Caso</h1><button onClick={() => onTechnologySelect('nextjs')}>Tecnología del caso</button><button onClick={onReturn}>{returnLabel}</button></> }));
vi.mock('../../../modules/experience', () => ({ ExperienceModule: () => <h1>Clásico</h1> }));
vi.mock('../../app-shell', () => ({ AppShell: () => null }));
beforeEach(() => { mounts = 0; window.history.replaceState(null, '', '/'); window.scrollTo = vi.fn(); window.matchMedia = vi.fn().mockReturnValue({ matches: true }); });
it('opens a case technology inside the same game instead of losing its world', () => {
  render(<ExperienceGate />); const game = screen.getByTestId('game');
  fireEvent.click(screen.getByRole('button', { name: 'Abrir caso' }));
  fireEvent.click(screen.getByRole('button', { name: 'Tecnología del caso' }));
  expect(screen.getByTestId('game')).toBe(game); expect(mounts).toBe(1);
  expect(screen.getByText('nextjs')).toBeInTheDocument();
  expect(new URL(window.location.href).searchParams.get('workshop')).toBe('technologies');
});
it('returns from a related case to the selected reader and keeps its URL', () => {
  render(<ExperienceGate />);
  fireEvent.click(screen.getByRole('button', { name: 'Leer React' }));
  fireEvent.click(screen.getByRole('button', { name: 'Filtrar stack' }));
  fireEvent.click(screen.getByRole('button', { name: 'Abrir caso' }));
  expect(new URL(window.location.href).searchParams.get('technology')).toBe('react');
  fireEvent.click(screen.getByRole('button', { name: 'Volver a tecnologías' }));
  expect(screen.getByText('react')).toBeInTheDocument(); expect(mounts).toBe(1);
  expect(screen.getByTestId('filters')).toHaveTextContent('next:kliniu');
  expect(new URL(window.location.href).searchParams.has('project')).toBe(false);
});
it('reads public history changes and preserves classic mode precedence', () => {
  render(<ExperienceGate />); const node = screen.getByTestId('game');
  act(() => { window.history.replaceState(null, '', '/?workshop=trajectory'); window.dispatchEvent(new PopStateEvent('popstate')); });
  expect(screen.getByText('trajectory')).toBeInTheDocument(); expect(screen.getByTestId('game')).toBe(node);
  act(() => { window.history.replaceState(null, '', '/?view=portfolio&workshop=contact'); window.dispatchEvent(new PopStateEvent('popstate')); });
  expect(screen.getByRole('heading', { name: 'Clásico' })).toBeInTheDocument();
});
it('opens a public reader link before entering the world and closes only reader parameters', () => {
  window.history.replaceState(null, '', '/?workshop=contact&source=test');
  render(<ExperienceGate />); expect(screen.getByText('contact')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Cerrar lector' }));
  const url = new URL(window.location.href); expect(url.searchParams.has('workshop')).toBe(false); expect(url.searchParams.get('source')).toBe('test');
});
