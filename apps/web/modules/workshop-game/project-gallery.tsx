'use client';

import type { ReactNode } from 'react';
import { PROJECTS } from '../../data/projects';
import { LAB_ANCHORS, type LabAnchor } from './lab-anchors';

/** Temporary web geometry: the baked wall is rebuilt in Visual 3. */
const WALL_ROTATION = Math.PI * 1.5;
const GALLERY_IDS = ['kliniu', 'lorigine', '4ustudio-academy', 'drokex'] as const;
const GALLERY_Z = [-3.78, -2.96, -2.14, -1.32] as const;
const RELOCATED: Record<string, number> = { 'command-center': -.7, 'intranet-ess': 0, vevi: .7 };

/** Switch all geometry together only when the export has every interactive anchor. */
export function resolveGalleryLayout(anchors: Record<string, LabAnchor>) {
  const baked = GALLERY_IDS.every(id => !!anchors[`screen_gallery_${id}`] && !!anchors[`label_gallery_${id}`]) &&
    Object.keys(RELOCATED).every(id => !!anchors[`screen_${id}`] && !!anchors[`label_${id}`]);
  const screens = GALLERY_IDS.map((id, index) => ({
    id,
    anchor: baked ? anchors[`screen_gallery_${id}`]! : { position: [3.88, 2.03, GALLERY_Z[index]!], rotationY: WALL_ROTATION, size: [.70, .44] } as LabAnchor,
    label: baked ? anchors[`label_gallery_${id}`]! : { position: [3.88, 1.737, GALLERY_Z[index]!], rotationY: WALL_ROTATION, size: [.70, .09] } as LabAnchor,
  }));
  const relocated = Object.fromEntries(Object.entries(RELOCATED).map(([id, x]) => [id, {
    anchor: baked ? anchors[`screen_${id}`]! : { position: [x, 2.7, 6.035], rotationY: Math.PI, size: [.62, .39] } as LabAnchor,
    label: baked ? anchors[`label_${id}`]! : { position: [x, 2.46, 6.035], rotationY: Math.PI, size: [.42, .065] } as LabAnchor,
  }]));
  return { baked, screens, relocated };
}
export const GALLERY_LAYOUT = resolveGalleryLayout(LAB_ANCHORS);
export const GALLERY_SCREENS = GALLERY_LAYOUT.screens;

export function ProjectGallery({ renderScreen }: { renderScreen: (id: string, name: string, anchor: LabAnchor, label: LabAnchor) => ReactNode }) {
  return <>
    {/* Covers the former baked frames until the scene is re-exported. */}
    {!GALLERY_LAYOUT.baked && <mesh position={[3.915, 2.005, -2.42]} rotation={[0, WALL_ROTATION, 0]} raycast={() => {}}>
      <planeGeometry args={[3.65, .75]} /><meshBasicMaterial color="#20282b" toneMapped={false} />
    </mesh>}
    {GALLERY_SCREENS.map(({ id, anchor, label }, index) => {
      const project = PROJECTS.find(entry => entry.id === id && entry.public)!;
      return <group key={id}>
        {!GALLERY_LAYOUT.baked && <mesh position={[3.9, 2.03, GALLERY_Z[index]!]} rotation={[0, WALL_ROTATION, 0]} raycast={() => {}}>
          <planeGeometry args={[.74, .48]} /><meshBasicMaterial color="#101416" toneMapped={false} />
        </mesh>}
        {renderScreen(id, project.name, anchor, label)}
      </group>;
    })}
  </>;
}
