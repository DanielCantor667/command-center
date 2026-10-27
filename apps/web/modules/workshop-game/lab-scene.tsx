'use client';
import { Html, useAnimations, useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { Component, Suspense, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { Box3, Mesh, MeshBasicMaterial, Quaternion, Vector3, type Bone, type Group, type MeshStandardMaterial, type Object3D } from 'three';
import { ambient } from './ambient';
import { CONTACT_DESK, LAB_ACTORS, LAB_ESSENTIAL_URLS, LAB_PLANTS_URL, labUrl, type LabActor } from './lab';
import { focusRelations, focusViewpoint, type LabFocus } from './lab-focus';
import { ContactMonitor, pointer, ProjectCorners, ProjectWall, Whiteboard } from './lab-content';
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

const HEAD_TURN = .7;
const up = new Vector3(0, 1, 0);
const scratch = { goal: new Vector3(), forward: new Vector3(), toward: new Vector3(), head: new Vector3(), q: new Quaternion(), parent: new Quaternion(), inverse: new Quaternion() };

/**
 * Actors keep their place from the export; a pivot at their centre lets a drone fly to the focus
 * and the cat's head turn towards it. Clips loop while motion is allowed; drones also bob.
 */
function Actor({ actor, phase, target }: { actor: LabActor; phase: number; target: [number, number, number] | null }) {
  const { scene, animations } = useGLTF(labUrl(actor.id));
  // The cached scene is shifted by -centre below; measure without that shift so a remount gets the same pivot.
  const centre = useMemo(() => new Box3().setFromObject(scene).getCenter(new Vector3()).sub(scene.position), [scene]);
  const head = useMemo(() => (actor.looks ? findHead(scene) : null), [actor.looks, scene]);
  // Exports can carry clips of other rigs; play only the ones that drive this model.
  const clips = useMemo(() => animations.filter(clip => clip.tracks.some(track => scene.getObjectByName(track.name.split('.')[0]!))), [animations, scene]);
  // The turn is applied on top of the pose of this frame: the clip's, or the rest pose when no clip drives the head.
  const headRest = useMemo(() => head?.quaternion.clone() ?? null, [head]);
  const headAnimated = useMemo(() => !!head && clips.some(clip => clip.tracks.some(track => track.name === `${head.name}.quaternion`)), [clips, head]);
  const pivot = useRef<Group>(null), rig = useRef<Group>(null);
  const { actions } = useAnimations(clips, rig);
  const rest = useMemo(() => new Vector3(...actor.offset).add(centre), [actor.offset, centre]);
  const place = useRef(rest.clone()), turn = useRef(0);
  useEffect(() => { Object.values(actions).forEach(action => action?.play()); }, [actions]);
  useFrame((_, delta) => {
    Object.values(actions).forEach(action => { if (action) action.paused = !ambient.enabled; });
    if (!pivot.current) return;
    const goal = actor.follows && target && ambient.enabled ? scratch.goal.set(...target) : rest;
    if (ambient.enabled) place.current.lerp(goal, 1 - Math.exp(-2.2 * Math.min(delta, .1))); else place.current.copy(rest);
    pivot.current.position.copy(place.current);
    if (actor.hover && ambient.enabled) pivot.current.position.y += Math.sin(ambient.time.value * 1.3 + phase) * .04;
    if (head?.parent && headRest) {
      if (!headAnimated) head.quaternion.copy(headRest);
      // Forward is "from the body centre towards the head"; turn the head (about world up) towards the focus.
      head.getWorldPosition(scratch.head);
      let wanted = 0;
      if (target && ambient.enabled) {
        const forward = scratch.forward.copy(scratch.head).sub(pivot.current.position).setY(0).normalize();
        const toward = scratch.toward.set(...target).sub(scratch.head).setY(0).normalize();
        wanted = Math.max(-HEAD_TURN, Math.min(HEAD_TURN, Math.atan2(forward.z * toward.x - forward.x * toward.z, forward.dot(toward))));
      }
      turn.current = ambient.enabled ? turn.current + (wanted - turn.current) * (1 - Math.exp(-4 * Math.min(delta, .1))) : 0;
      head.parent.getWorldQuaternion(scratch.parent);
      scratch.q.setFromAxisAngle(up, turn.current);
      // World-up rotation expressed in the parent's space: parent⁻¹ · q · parent.
      head.quaternion.premultiply(scratch.inverse.copy(scratch.parent).invert().multiply(scratch.q).multiply(scratch.parent));
    }
  });
  return <group ref={pivot} position={rest}>
    <group ref={rig}><primitive object={scene} position={centre.clone().negate()} dispose={null} /></group>
  </group>;
}
function findHead(scene: Object3D): Object3D | null {
  const heads: Object3D[] = [];
  scene.traverse(object => { if ((object as Bone).isBone && /head/i.test(object.name)) heads.push(object); });
  return heads[0] ?? null;
}

const HUB_LABELS: { point: WorldPoint; text: string; at: [number, number, number] }[] = [
  { point: 'projects', text: 'Proyectos', at: [2.75, 2.95, -2.4] },
  ...Object.values(STATIONS).map(station => ({ point: station.id, text: station.name, at: station.hotspot })),
];

export function LabScene({ point, focus, onFocus, onGo, onOpenCase, onTechnology }: {
  point: WorldPoint; focus: LabFocus; onFocus: (focus: LabFocus) => void;
  onGo: (point: WorldPoint) => void; onOpenCase: (id: string) => void; onTechnology: (technologyId: string) => void;
}) {
  const { invalidate } = useThree();
  const relations = useMemo(() => focusRelations(focus), [focus]);
  const viewpoint = useMemo(() => focusViewpoint(focus), [focus]);
  // The demand loop does not run under reduced motion: a focus change still has to draw once.
  useEffect(() => { invalidate(); }, [focus, invalidate]);
  useEffect(() => () => { document.body.style.cursor = ''; }, []);
  return <group>
    <Room />
    <OptionalBoundary><Suspense fallback={null}><Plants /></Suspense></OptionalBoundary>
    {LAB_ACTORS.map((actor, index) => <OptionalBoundary key={actor.id}><Suspense fallback={null}>
      <Actor actor={actor} phase={index * 1.7} target={viewpoint} />
    </Suspense></OptionalBoundary>)}
    <OptionalBoundary><Suspense fallback={null}>
      {/* Away from the wall a screen walks up to it; at the wall it opens the case. */}
      <ProjectWall lit={relations.projects} focused={!!focus} onSelect={id => (point === 'projects' ? onOpenCase(id) : onGo('projects'))}
        onHover={id => onFocus(id ? { kind: 'project', id } : null)} />
    </Suspense></OptionalBoundary>
    <ProjectCorners lit={relations.projects} focused={!!focus} onSelect={onOpenCase}
      onHover={id => onFocus(id ? { kind: 'project', id } : null)} />
    <TechnologyShelf point={point} lit={relations.technologies} focused={!!focus} onGo={onGo} onSelect={onTechnology}
      onHover={id => onFocus(id ? { kind: 'technology', id } : null)} />
    <Whiteboard onSelect={() => onGo('trajectory')} />
    <ContactMonitor onSelect={() => onGo('contact')} />
    <mesh position={CONTACT_DESK.position} onPointerOver={pointer(true)} onPointerOut={pointer(false)} onClick={event => { event.stopPropagation(); if (event.delta < 5) onGo('contact'); }}>
      <boxGeometry args={CONTACT_DESK.size} /><meshBasicMaterial visible={false} />
    </mesh>
    {/* Labels only from the overview, where every destination is in view. */}
    {point === 'hub' && HUB_LABELS.map(label => <Html key={label.point} position={label.at} center>
      <button type="button" className={styles.hotspot} onClick={() => onGo(label.point)}>{label.text}</button>
    </Html>)}
  </group>;
}
