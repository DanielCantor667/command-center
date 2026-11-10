import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { ProjectWall } from '../lab-content';

vi.mock('@react-three/fiber', () => ({ useFrame: () => {} }));
vi.mock('../dom-screens', () => ({
  DomScreen: ({ anchor, onClick, onPointerOver, onPointerOut, children }: { anchor: { position: number[] }; onClick: (event: { stopPropagation: () => void; delta: number }) => void; onPointerOver: () => void; onPointerOut: () => void; children: ReactNode }) =>
    <button type="button" data-position={anchor.position.join(',')} onMouseOver={onPointerOver} onMouseOut={onPointerOut} onClick={() => onClick({ stopPropagation() {}, delta: 0 })}>{children}</button>,
}));

// The label texture normally uses a browser canvas.
beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    fillRect() {}, fillText() {}, measureText: () => ({ width: 10 }),
  } as never);
});
afterEach(() => vi.restoreAllMocks());

describe('project gallery', () => {
  it('shows the four real captures in the gallery and selects the corresponding project', () => {
    const onSelect = vi.fn();
    render(<ProjectWall lit={new Set()} focused={false} onSelect={onSelect} onHover={() => {}} />);
    const captures = ['/projects/kliniu-desktop.webp', '/projects/lorigine-catalog-v4.webp', '/projects/academy-lessons-v4.webp', '/projects/drokex-products-v4.webp'];
    const positions = ['3.922,2.03,-3.78', '3.922,2.03,-2.96', '3.922,2.03,-2.14', '3.922,2.03,-1.32'];
    const ids = ['kliniu', 'lorigine', '4ustudio-academy', 'drokex'];
    const buttons = screen.getAllByRole('button');
    positions.forEach((position, index) => {
      const button = buttons.find(element => element.getAttribute('data-position') === position);
      expect(button).toBeDefined();
      expect(button?.querySelector('img')).toHaveAttribute('src', captures[index]);
      fireEvent.click(button!);
      expect(onSelect).toHaveBeenLastCalledWith(ids[index]);
    });
  });

  it('keeps the corner screens and moves the other three above the entrance', () => {
    render(<ProjectWall lit={new Set()} focused={false} onSelect={() => {}} onHover={() => {}} />);
    const positions = screen.getAllByRole('button').map(element => element.getAttribute('data-position'));
    expect(positions).toEqual(expect.arrayContaining([
      '-3.945,2.1,4.7', '3.945,2.1,2', '-3.945,2.1,2', '3.945,2.1,4.7',
      '-0.7,2.7,6.035', '0,2.7,6.035', '0.7,2.7,6.035',
    ]));
  });
  it('reports the actual hovered screen anchor for gallery and relocated projects', () => {
    const onHover = vi.fn();
    render(<ProjectWall lit={new Set()} focused={false} onSelect={() => {}} onHover={onHover} />);
    const buttons = screen.getAllByRole('button');
    const gallery = buttons.find(button => button.getAttribute('data-position') === '3.922,2.03,-3.78')!;
    fireEvent.mouseOver(gallery);
    expect(onHover).toHaveBeenLastCalledWith('kliniu', expect.objectContaining({ position: [3.922, 2.03, -3.78] }));
    fireEvent.mouseOut(gallery);
    expect(onHover).toHaveBeenLastCalledWith(null, undefined);
    const moved = buttons.find(button => button.getAttribute('data-position') === '-0.7,2.7,6.035')!;
    fireEvent.mouseOver(moved);
    expect(onHover).toHaveBeenLastCalledWith('command-center', expect.objectContaining({ position: [-.7, 2.7, 6.035] }));
  });
});
