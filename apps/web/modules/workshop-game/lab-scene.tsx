'use client';
import { Html, useAnimations, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Component, Suspense, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { Mesh, MeshBasicMaterial, type Group, type MeshStandardMaterial } from 'three';
import { ambient } from './ambient';
import { CONTACT_DESK, LAB_ACTORS, LAB_ESSENTIAL_URLS, LAB_PLANTS_URL, labUrl } from './lab';
import { pointer, ProjectWall, Whiteboard } from './lab-content';
import { STATIONS } from './stations';
import { TechnologyShelf } from './technology-shelf';
import type { WorldPoint } from './world-state';
import styles from './workshop-game.module.css';

/** Decoration is optional: a failed plant or actor never fails the workshop. */
export class OptionalBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

/** The baked lightmaps already hold the final look (Blender view transform): shown unlit. */
function Room() {
  const [baked, emissive] = useGLTF(LAB_ESSENTIAL_URLS);
  useMemo(() => baked!.scene.traverse(object => {
    if (!(object instanceof Mesh) || object.userData.unlit) return;
    object.material = new MeshBasicMaterial({ map: (object.material as MeshStandardMaterial).map, toneMapped: false });
    object.userData.unlit = true;
  }), [baked]);
  return <>
    <primitive object={baked!.scene} dispose={null} />
    <primitive object={emissive!.scene} dispose={null} />
  </>;
}

function Plants() {
  const { scene } = useGLTF(LAB_PLANTS_URL);
  return <primitive object={scene} dispose={null} />;
}

/** Actors keep their place from the export; clips loop while motion is allowed, drones also bob. */
function Actor({ id, hover, offset, phase }: { id: string; hover: boolean; offset: [number, number, number]; phase: number }) {
  const { scene, animations } = useGLTF(labUrl(id));
  const group = useRef<Group>(null);
  const { actions } = useAnimations(animations, group);
  useEffect(() => { Object.values(actions).forEach(action => action?.play()); }, [actions]);
  useFrame(() => {
    Object.values(actions).forEach(action => { if (action) action.paused = !ambient.enabled; });
    if (hover && group.current) group.current.position.y = offset[1] + (ambient.enabled ? Math.sin(ambient.time.value * 1.3 + phase) * .04 : 0);
  });
  return <group ref={group} position={offset}><primitive object={scene} dispose={null} /></group>;
}

const HUB_LABELS: { point: WorldPoint; text: string; at: [number, number, number] }[] = [
  { point: 'projects', text: 'Proyectos', at: [2.75, 2.95, -2.4] },
  ...Object.values(STATIONS).map(station => ({ point: station.id, text: station.name, at: station.hotspot })),
];

export function LabScene({ point, onGo, onOpenCase, onTechnology }: {
  point: WorldPoint; onGo: (point: WorldPoint) => void; onOpenCase: (id: string) => void; onTechnology: (technologyId: string) => void;
}) {
  useEffect(() => () => { document.body.style.cursor = ''; }, []);
  return <group>
    <Room />
    <OptionalBoundary><Suspense fallback={null}><Plants /></Suspense></OptionalBoundary>
    {LAB_ACTORS.map((actor, index) => <OptionalBoundary key={actor.id}><Suspense fallback={null}><Actor id={actor.id} hover={actor.hover} offset={actor.offset} phase={index * 1.7} /></Suspense></OptionalBoundary>)}
    <OptionalBoundary><Suspense fallback={null}>
      {/* Away from the wall a screen walks up to it; at the wall it opens the case. */}
      <ProjectWall onSelect={id => (point === 'projects' ? onOpenCase(id) : onGo('projects'))} />
    </Suspense></OptionalBoundary>
    <TechnologyShelf point={point} onGo={onGo} onSelect={onTechnology} />
    <Whiteboard onSelect={() => onGo('trajectory')} />
    <mesh position={CONTACT_DESK.position} onPointerOver={pointer(true)} onPointerOut={pointer(false)} onClick={event => { event.stopPropagation(); if (event.delta < 5) onGo('contact'); }}>
      <boxGeometry args={CONTACT_DESK.size} /><meshBasicMaterial visible={false} />
    </mesh>
    {/* Labels only from the overview, where every destination is in view. */}
    {point === 'hub' && HUB_LABELS.map(label => <Html key={label.point} position={label.at} center>
      <button type="button" className={styles.hotspot} onClick={() => onGo(label.point)}>{label.text}</button>
    </Html>)}
  </group>;
}
