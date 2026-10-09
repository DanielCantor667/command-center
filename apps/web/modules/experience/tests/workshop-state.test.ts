import { describe, expect, it } from 'vitest';
import { ENTRANCE_PROFILES, cameraBaseZoom, restoreCameraFrame } from '../workshop-state';

describe('Workshop camera contract', () => {
  it('maps four projects to their own district and visual destination', () => {
    expect(Object.keys(ENTRANCE_PROFILES)).toEqual(['kliniu', 'lorigine', '4ustudio-academy', 'drokex']);
    expect(ENTRANCE_PROFILES['4ustudio-academy'].district).toBe('academy');
    expect(Object.values(ENTRANCE_PROFILES).filter(p => p.screen)).toHaveLength(1);
    expect(ENTRANCE_PROFILES.drokex.screen).toBeNull();
  });
  it('restores normalized framing at a new viewport without copying stale pixel zoom', () => {
    const snapshot = { position: [1, 2, 3] as [number, number, number], target: [0, 1, 0] as [number, number, number], factor: 1.85, offset: [-.16, -.01] as [number, number], width: 1440, height: 900 };
    const frame = restoreCameraFrame(snapshot, 1920, 1080, true, true);
    expect(frame.zoom).toBeCloseTo(cameraBaseZoom(1920, 1080, true, true) * 1.85);
    expect(frame.offset).toEqual([-307.2, -10.8]);
    expect(snapshot.offset).toEqual([-.16, -.01]);
  });
});
