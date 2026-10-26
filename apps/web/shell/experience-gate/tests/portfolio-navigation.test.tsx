import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ComponentProps } from 'react';
import { ExperienceGate } from '../component';
import type { ExperienceModule } from '../../../modules/experience';
import type { WorkshopGame } from '../../../modules/workshop-game/component';
import type { GameSnapshot } from '../../../modules/workshop-game/world-state';

let gameProps: ComponentProps<typeof WorkshopGame>;
let exitSnapshot: GameSnapshot | undefined;
vi.mock('../../../modules/workshop-game/component', () => ({
  WorkshopGame: (props: ComponentProps<typeof WorkshopGame>) => {
    gameProps = props;
    return <><h1>Taller jugable</h1><button onClick={() => {
      if (exitSnapshot) props.onSave(exitSnapshot);
      props.onPortfolio();
    }}>Ver portafolio</button></>;
  },
}));
vi.mock('../../../modules/experience', () => ({
  ExperienceModule: (props: ComponentProps<typeof ExperienceModule>) => <>
    <h1>Portafolio completo</h1>
    <button onClick={props.onReturnToWorkshop}>Volver al taller</button>
  </>,
}));
vi.mock('../../../modules/projects/components/portfolio-case/component', () => ({ PortfolioCase: () => null }));
vi.mock('../../app-shell', () => ({ AppShell: () => null }));

const traverseHistory = async (direction: 'back' | 'forward') => {
  await act(async () => {
    const changed = new Promise<void>(resolve => window.addEventListener('popstate', () => resolve(), { once: true }));
    window.history[direction]();
    await changed;
  });
};

describe('portfolio and game navigation', () => {
  beforeEach(() => {
    exitSnapshot = undefined;
    window.history.replaceState(null, '', '/?source=portfolio-test');
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });
    window.scrollTo = vi.fn();
  });

  it('adds an entry so browser Back and Forward restore the game and portfolio', async () => {
    exitSnapshot = { point: 'hub', camera: { position: [0.2, 1.8, 2.5], target: [0, 1.2, -0.9] } };
    render(<ExperienceGate />);
    const length = window.history.length;
    fireEvent.click(screen.getByRole('button', { name: 'Ver portafolio' }));
    expect(window.history.length).toBe(length + 1);
    expect(new URL(window.location.href).searchParams.get('view')).toBe('portfolio');
    await traverseHistory('back');
    expect(screen.getByRole('heading', { name: 'Taller jugable' })).toBeInTheDocument();
    expect(gameProps.initialSnapshot).toEqual(exitSnapshot);
    expect(window.location.search).toBe('?source=portfolio-test');
    await traverseHistory('forward');
    expect(screen.getByRole('heading', { name: 'Portafolio completo' })).toBeInTheDocument();
  });

  it('returns from a direct portfolio section with a clean game URL and supports history', async () => {
    window.history.replaceState(null, '', '/?view=portfolio&source=portfolio-test#tecnologias');
    render(<ExperienceGate />);
    fireEvent.click(screen.getByRole('button', { name: 'Volver al taller' }));
    expect(screen.getByRole('heading', { name: 'Taller jugable' })).toBeInTheDocument();
    expect(window.location.search).toBe('?source=portfolio-test');
    expect(window.location.hash).toBe('');
    await traverseHistory('back');
    expect(screen.getByRole('heading', { name: 'Portafolio completo' })).toBeInTheDocument();
    await traverseHistory('forward');
    expect(screen.getByRole('heading', { name: 'Taller jugable' })).toBeInTheDocument();
  });

  it('restores the saved point and camera after returning from the portfolio', () => {
    exitSnapshot = { point: 'projects', camera: { position: [-6.4, 1.65, 5.7], target: [-8, 1.6, 5.2] } };
    render(<ExperienceGate />);
    fireEvent.click(screen.getByRole('button', { name: 'Ver portafolio' }));
    fireEvent.click(screen.getByRole('button', { name: 'Volver al taller' }));
    expect(gameProps.initialSnapshot).toEqual(exitSnapshot);
  });

  it('keeps the landing when the portfolio was opened before entering the 3D world', () => {
    exitSnapshot = { point: 'entrance', camera: null };
    render(<ExperienceGate />);
    fireEvent.click(screen.getByRole('button', { name: 'Ver portafolio' }));
    fireEvent.click(screen.getByRole('button', { name: 'Volver al taller' }));
    expect(screen.getByRole('heading', { name: 'Taller jugable' })).toBeInTheDocument();
    expect(gameProps.initialSnapshot).toBeUndefined();
  });
});
