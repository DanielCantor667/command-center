import { describe, expect, it } from 'vitest';
import type { LabAnchor } from '../lab-anchors';
import { resolveGalleryLayout } from '../project-gallery';

const gallery = ['kliniu', 'lorigine', '4ustudio-academy', 'drokex'];
const relocated = ['command-center', 'intranet-ess', 'vevi'];
function generatedAnchors() {
  const anchors: Record<string, LabAnchor> = {};
  for (const [i, id] of gallery.entries()) {
    anchors[`screen_gallery_${id}`] = { position: [3.922, 2.03, -3.78 + i * .82], rotationY: 4.7124, size: [.7, .44] };
    anchors[`label_gallery_${id}`] = { position: [3.921, 1.737, -3.78 + i * .82], rotationY: 4.7124, size: [.7, .09] };
  }
  for (const [i, id] of relocated.entries()) {
    anchors[`screen_${id}`] = { position: [i * .7 - .7, 2.7, 6.035], rotationY: Math.PI, size: [.62, .39] };
    anchors[`label_${id}`] = { position: [i * .7 - .7, 2.46, 6.035], rotationY: Math.PI, size: [.42, .065] };
  }
  return anchors;
}

describe('gallery geometry transition', () => {
  it('uses the exported positions for the gallery and relocated screens together', () => {
    const anchors = generatedAnchors();
    const layout = resolveGalleryLayout(anchors);
    expect(layout.baked).toBe(true);
    expect(layout.screens[0]?.anchor).toBe(anchors.screen_gallery_kliniu);
    expect(layout.screens[0]?.label).toBe(anchors.label_gallery_kliniu);
    expect(layout.relocated['command-center']?.anchor).toBe(anchors['screen_command-center']);
    expect(layout.relocated['command-center']?.label).toBe(anchors['label_command-center']);
  });
  it('keeps the complete temporary layout while an anchor is missing', () => {
    const anchors = generatedAnchors();
    delete anchors['label_gallery_drokex'];
    const layout = resolveGalleryLayout(anchors);
    expect(layout.baked).toBe(false);
    expect(layout.screens[0]?.anchor.position).toEqual([3.88, 2.03, -3.78]);
    expect(layout.relocated['command-center']?.anchor.position).toEqual([-.7, 2.7, 6.035]);
  });
});
