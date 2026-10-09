import { fireEvent, render, screen } from '@testing-library/react';
import { useState, type ComponentProps } from 'react';
import { beforeEach, expect, it, vi } from 'vitest';
import { ExperienceGate } from '../component';
import type { WorkshopGame } from '../../../modules/workshop-game/component';
let mounts = 0;
let props: ComponentProps<typeof WorkshopGame>;
const snapshot = { point: 'academy' as const, camera: { position: [-6.4, 1.65, 5.7] as [number, number, number], target: [-8, 1.6, 5.2] as [number, number, number] } };
vi.mock('../../../modules/workshop-game/component', () => ({ WorkshopGame: (value: ComponentProps<typeof WorkshopGame>) => {
  props = value; const [instance] = useState(() => ++mounts);
  return <div data-testid="persistent-game" data-instance={instance}><button onClick={() => { value.onSave(snapshot); value.onOpenCase('4ustudio-academy'); }}>Abrir Academy</button></div>;
} }));
vi.mock('../../../modules/projects/components/portfolio-case/component', () => ({ PortfolioCase: ({ onReturn, onSelect }: { onReturn: () => void; onSelect: (id: string) => void }) => <><h1>Lectura de caso</h1><button onClick={() => onSelect('lorigine')}>Cambiar caso</button><button onClick={onReturn}>Volver al taller</button></> }));
vi.mock('../../../modules/experience', () => ({ ExperienceModule: () => null }));
vi.mock('../../app-shell', () => ({ AppShell: () => null }));
beforeEach(() => { mounts = 0; window.history.replaceState(null, '', '/'); window.scrollTo = vi.fn(); window.matchMedia = vi.fn().mockReturnValue({ matches: true }); });
it('keeps the same game instance paused and inert while reading and switching cases', () => {
  render(<ExperienceGate />); const node = screen.getByTestId('persistent-game');
  fireEvent.click(screen.getByRole('button', { name: 'Abrir Academy' }));
  expect(node).toBeInTheDocument(); expect(mounts).toBe(1); expect(props.suspended).toBe(true);
  expect(node.closest('[inert]')).not.toBeNull(); expect(node).not.toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Cambiar caso' }));
  expect(props.initialSnapshot).toEqual(snapshot); expect(mounts).toBe(1);
  fireEvent.click(screen.getByRole('button', { name: 'Volver al taller' }));
  expect(screen.getByTestId('persistent-game')).toBe(node); expect(props.suspended).toBe(false); expect(node).toBeVisible();
});
