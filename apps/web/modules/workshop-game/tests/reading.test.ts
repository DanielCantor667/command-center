import { expect, it } from 'vitest';
import { readWorkshopReading, writeWorkshopReading } from '../reading';
it('normalizes unknown technology links and rejects unknown readers', () => {
  expect(readWorkshopReading(new URL('https://example.test/?workshop=technologies&technology=unknown'))).toEqual({ kind: 'technologies', technologyId: 'nextjs' });
  expect(readWorkshopReading(new URL('https://example.test/?workshop=unknown'))).toBeNull();
});
it('writes and clears a reader without mutating project, provenance or classic anchors', () => {
  const original = new URL('https://example.test/?project=kliniu&source=shared#tecnologias');
  const next = writeWorkshopReading(original, { kind: 'technologies', technologyId: 'react' });
  expect(original.searchParams.has('workshop')).toBe(false);
  expect(readWorkshopReading(next)).toEqual({ kind: 'technologies', technologyId: 'react' });
  const cleared = writeWorkshopReading(next, null);
  expect(cleared.toString()).toBe(original.toString());
});
