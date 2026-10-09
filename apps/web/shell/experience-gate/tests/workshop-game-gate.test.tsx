import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ComponentProps } from 'react';
import { ExperienceGate } from '../component';
import type { WorkshopGame } from '../../../modules/workshop-game/component';

const snapshot = { point: 'kliniu' as const, camera: { position: [-5.1, 1.65, -1.9] as [number, number, number], target: [-4.4, 1.7, -6] as [number, number, number] } };
let props: ComponentProps<typeof WorkshopGame>;
vi.mock('../../../modules/workshop-game/component', () => ({ WorkshopGame: (value: ComponentProps<typeof WorkshopGame>) => {
  props = value;
  return <><h1>Taller jugable</h1><button onClick={() => { value.onSave(snapshot); value.onOpenCase('kliniu'); }}>Abrir caso desde taller</button><button onClick={value.onPortfolio}>Ver portafolio</button></>;
} }));
vi.mock('../../../modules/experience', () => ({ ExperienceModule: () => <h1>Portafolio completo</h1> }));
vi.mock('../../../modules/projects/components/portfolio-case/component', () => ({ PortfolioCase: ({ onReturn }: { onReturn: () => void }) => <><h1>Caso Kliniu</h1><button onClick={onReturn}>Volver al taller</button></> }));
vi.mock('../../app-shell', () => ({ AppShell: () => null }));
describe('game entry in the public portfolio', () => {
  beforeEach(() => { window.history.replaceState(null, '', '/'); window.matchMedia = vi.fn().mockReturnValue({ matches: true }); window.scrollTo = vi.fn(); });
  it('starts in the game and restores its independent camera after the case', () => {
    render(<ExperienceGate />);
    expect(screen.getByRole('heading', { name: 'Taller jugable' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Abrir caso desde taller' }));
    fireEvent.click(screen.getByRole('button', { name: 'Volver al taller' }));
    expect(props.initialSnapshot).toEqual(snapshot);
  });
  it('opens the complete existing portfolio through the explicit alternative', () => {
    render(<ExperienceGate />);
    fireEvent.click(screen.getByRole('button', { name: 'Ver portafolio' }));
    expect(screen.getByRole('heading', { name: 'Portafolio completo' })).toBeInTheDocument();
  });
  it('clears a direct case URL when returning to the classic portfolio', () => {
    window.history.replaceState(null, '', '/?view=portfolio&project=kliniu');
    render(<ExperienceGate />);
    fireEvent.click(screen.getByRole('button', { name: 'Volver al taller' }));
    expect(screen.getByRole('heading', { name: 'Portafolio completo' })).toBeInTheDocument();
    expect(new URL(window.location.href).searchParams.has('project')).toBe(false);
  });
});
