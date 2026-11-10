import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../lab-anchors', () => {
  const anchors: Record<string, { position: [number, number, number]; rotationY: number; size: [number, number] }> = {};
  for (const id of ['kliniu', 'lorigine', '4ustudio-academy', 'drokex']) {
    anchors[`screen_gallery_${id}`] = { position: [3.922, 2, -2], rotationY: 4.7124, size: [.7, .44] };
    anchors[`label_gallery_${id}`] = { position: [3.921, 1.7, -2], rotationY: 4.7124, size: [.7, .09] };
  }
  for (const id of ['command-center', 'intranet-ess', 'vevi']) {
    anchors[`screen_${id}`] = { position: [0, 2.7, 6], rotationY: Math.PI, size: [.62, .39] };
    anchors[`label_${id}`] = { position: [0, 2.46, 6], rotationY: Math.PI, size: [.42, .065] };
  }
  return { LAB_ANCHORS: anchors };
});

import { ProjectGallery } from '../project-gallery';

describe('baked gallery', () => {
  it('renders the four interactive captures without temporary wall or frame meshes', () => {
    const view = render(<ProjectGallery renderScreen={(id, name) => <button type="button">{id}: {name}</button>} />);
    expect(screen.getAllByRole('button')).toHaveLength(4);
    expect(view.container.querySelectorAll('mesh')).toHaveLength(0);
  });
});
