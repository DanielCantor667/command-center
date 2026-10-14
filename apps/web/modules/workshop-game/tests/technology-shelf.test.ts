import { describe, expect, it } from 'vitest';
import { PORTFOLIO_TECHNOLOGIES } from '../../../data/portfolio-technologies';
import { shelfLayout } from '../technology-shelf';

describe('technology shelf layout', () => {
  const tiles = shelfLayout();
  it('places every portfolio technology exactly once', () => {
    expect(tiles.map(tile => tile.id).sort()).toEqual(PORTFOLIO_TECHNOLOGIES.map(entry => entry.id).sort());
  });
  it('keeps one row per category inside the board', () => {
    expect(Math.max(...tiles.map(tile => tile.col))).toBeLessThan(8);
    expect(new Set(tiles.map(tile => `${tile.row}:${tile.col}`)).size).toBe(tiles.length);
    for (const tile of tiles) {
      const entry = PORTFOLIO_TECHNOLOGIES.find(item => item.id === tile.id)!;
      expect(tiles.filter(other => other.row === tile.row).every(other => PORTFOLIO_TECHNOLOGIES.find(item => item.id === other.id)!.category === entry.category)).toBe(true);
    }
  });
});
