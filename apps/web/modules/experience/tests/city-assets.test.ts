import { PROJECTS } from '../../../data/projects';
import { describe, expect, it } from 'vitest';
import { CITY_ASSETS } from '../data/city-assets';

describe('Engineering City asset manifest', () => {
  it('every district opens an existing project dossier', () => {
    for (const asset of CITY_ASSETS) expect(PROJECTS.some((project) => project.id === asset.projectId)).toBe(true);
  });
  it('keeps the original slots and adds a procedural Drokex district', () => {
    expect(CITY_ASSETS.map((asset) => asset.id)).toEqual([
      'drokex',
      'command-center',
      'kliniu',
      'vevi',
      'intranet-ess',
      'lorigine',
      'academy',
    ]);
    expect(
      CITY_ASSETS.every(
        ({ motion }) => motion.pulsePeriodSeconds > 0,
      ),
    ).toBe(true);
  });

  it('publishes Command Center with provenance, two LODs and the defined budgets', () => {
    const commandCenter = CITY_ASSETS.find((asset) => asset.id === 'command-center');

    expect(commandCenter).toMatchObject({
      lod0Path: '/models/city/command-center.glb',
      lod1Path: '/models/city/command-center-lod1.glb',
      source: { kind: 'original' },
      license: { redistributable: true },
      triangleBudget: { lod0: 18_000, lod1: 5_000 },
      dimensions: { unit: 'm' },
    });
  });

  it('keeps all six production landmarks on the public GLB contract', () => {
    const published = CITY_ASSETS.filter((asset) => asset.lod0Path !== null);

    expect(published.map((asset) => asset.id)).toEqual([
      'command-center',
      'kliniu',
      'vevi',
      'intranet-ess',
      'lorigine',
      'academy',
    ]);
    expect(published.every((asset) => asset.lod1Path !== null)).toBe(true);
    expect(published.every((asset) => asset.source?.kind === 'original')).toBe(true);
    expect(published.every((asset) => asset.transform !== undefined)).toBe(true);
  });
});
