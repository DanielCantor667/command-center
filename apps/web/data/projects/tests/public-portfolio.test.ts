import { describe, expect, it } from 'vitest';
import { PROJECTS, projectMediaSchema } from '..';

describe('public portfolio evidence', () => {
  it('connects the four public sites to captured evidence', () => {
    const expected = { kliniu: 'https://kliniucolombia.com/', '4ustudio-academy': 'https://4ustudioacademy.com/', drokex: 'https://drokex.com/', lorigine: 'https://www.lorigine.com.co/' };
    for (const [id, url] of Object.entries(expected)) {
      const project = PROJECTS.find((item) => item.id === id);
      expect(project?.links.live).toBe(url);
      expect(project?.media.length).toBeGreaterThanOrEqual(2);
    }
  });
  it('accepts local project captures without allowing protocol-relative URLs', () => {
    const media = { type: 'image', alt: 'Captura real', featured: true };
    expect(projectMediaSchema.safeParse({ ...media, url: '/projects/kliniu-desktop.webp' }).success).toBe(true);
    expect(projectMediaSchema.safeParse({ ...media, url: '//untrusted.example/image.png' }).success).toBe(false);
    expect(projectMediaSchema.safeParse({ ...media, url: '/projects/../private.png' }).success).toBe(false);
  });
});
