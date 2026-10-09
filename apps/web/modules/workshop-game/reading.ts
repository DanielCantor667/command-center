import { PORTFOLIO_TECHNOLOGIES } from '../../data/portfolio-technologies';
export type WorkshopReading = { kind: 'technologies'; technologyId: string } | { kind: 'trajectory' | 'contact' | 'map' };
export function readWorkshopReading(url: URL): WorkshopReading | null {
  const kind = url.searchParams.get('workshop');
  if (kind === 'technologies') {
    const id = url.searchParams.get('technology');
    return { kind, technologyId: PORTFOLIO_TECHNOLOGIES.some(tool => tool.id === id) ? id! : 'nextjs' };
  }
  return kind === 'trajectory' || kind === 'contact' || kind === 'map' ? { kind } : null;
}
export function writeWorkshopReading(url: URL, reading: WorkshopReading | null): URL {
  const next = new URL(url);
  next.searchParams.delete('workshop'); next.searchParams.delete('technology');
  if (reading) {
    next.searchParams.set('workshop', reading.kind);
    if (reading.kind === 'technologies') next.searchParams.set('technology', PORTFOLIO_TECHNOLOGIES.some(tool => tool.id === reading.technologyId) ? reading.technologyId : 'nextjs');
  }
  return next;
}
