'use client';
import { Html, useAnimations, useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';
import { BackSide, Box3, Mesh, MeshBasicMaterial, MeshStandardMaterial, Quaternion, SRGBColorSpace, TextureLoader, Vector3, type Bone, type Group, type Object3D, type Texture } from 'three';
import { ambient } from './ambient';
import { CONTACT_DESK, LAB_ACTORS, labEssentialUrls, labSkyUrl, labTier, labUrl, type LabActor } from './lab';
import { LabRain } from './lab-rain';
import { patrolAt } from './lab-patrol';
import { soundscape } from './lab-soundscape';
import { focusRelations, focusViewpoint, type LabFocus } from './lab-focus';
import { ContactMonitor, pointer, ProjectCorners, ProjectWall, Whiteboard } from './lab-content';
import { STATIONS } from './stations';
import { TechnologyShelf } from './technology-shelf';
import { cornerPoint, type WorldPoint } from './world-state';
import styles from './workshop-game.module.css';

/** Decoration is optional: a failed plant or actor never fails the workshop. */
export class OptionalBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

let ktx2: KTX2Loader | null = null;
/** The lab GLBs carry KTX2 textures: one transcoder (public/basis, copied from three's examples) shared by every load. */
function useLabGLTF<T extends string | string[]>(url: T) {
  const gl = useThree(state => state.gl);
  // drei's GLTFLoader is three-stdlib's: same loader contract, different typings. three's own KTX2Loader matches public/basis.
  return useGLTF(url, true, true, loader => { loader.setKTX2Loader((ktx2 ??= new KTX2Loader().setTranscoderPath('/basis/').detectSupport(gl)) as never); });
}

/** The detail textures hold albedo over its mean, halved and sRGB-encoded: this undoes the halving after decoding (2 ^ 2.2). */
const DETAIL_GAIN = '4.59';
const ANISOTROPY = 8;
/**
 * R.2b (specs/workshop-realism.md): the lightmap holds the light, the materials' own textures the detail, multiplied in
 * display space so the bake's Blender look stays intact. `chunk` is where the shader has the colour to modulate.
 */
function withDetail<T extends MeshBasicMaterial | MeshStandardMaterial>(material: T, detail: Texture, chunk: string, target: string) {
  material.onBeforeCompile = shader => {
    shader.uniforms.detailMap = { value: detail };
    shader.vertexShader = `varying vec2 vDetailUv;\n${shader.vertexShader.replace('#include <uv_vertex>', '#include <uv_vertex>\nvDetailUv = uv;')}`;
    shader.fragmentShader = `uniform sampler2D detailMap;\nvarying vec2 vDetailUv;\n${shader.fragmentShader.replace(chunk, `${chunk}\n${target} *= texture2D(detailMap, vDetailUv).rgb * ${DETAIL_GAIN};`)}`;
  };
  material.customProgramCacheKey = () => `detail-${chunk}`;
  return material;
}

/**
 * The bake goes in as emission, untouched. On a black base that leaves only the specular term of the environment on
 * top: reflections that move with the camera, with the surface's own normals. The low tier stays unlit.
 */
function Room() {
  const [baked, emissive] = useLabGLTF(labEssentialUrls());
  useMemo(() => baked!.scene.traverse(object => {
    if (!(object instanceof Mesh) || object.userData.unlit) return;
    const { map, emissiveMap: detail, normalMap, roughness } = object.material as MeshStandardMaterial;
    [map, detail, normalMap].forEach(texture => { if (texture) texture.anisotropy = ANISOTROPY; });
    const unlit = labTier() === 'low';
    const material = unlit ? new MeshBasicMaterial({ map, toneMapped: false })
      : new MeshStandardMaterial({ color: 'black', emissive: 'white', emissiveMap: map, normalMap, roughness, metalness: 0, envMapIntensity: .7, toneMapped: false });
    object.material = !detail ? material : unlit ? withDetail(material, detail, '#include <map_fragment>', 'diffuseColor.rgb')
      : withDetail(material, detail, '#include <emissivemap_fragment>', 'totalEmissiveRadiance');
    object.userData.unlit = true;
  }), [baked]);
  return <>
    <primitive object={baked!.scene} dispose={null} />
    <primitive object={emissive!.scene} dispose={null} />
  </>;
}

/** The city through the window: the panorama of bake_workshop_lab.py, with +Y of Blender (the window) at its centre. */
function CitySky() {
  const { invalidate } = useThree();
  const [map, setMap] = useState<Texture | null>(null);
  useEffect(() => {
    const texture = new TextureLoader().load(labSkyUrl, loaded => { loaded.colorSpace = SRGBColorSpace; setMap(loaded); invalidate(); });
    return () => texture.dispose();
  }, [invalidate]);
  return map && <mesh rotation={[0, -Math.PI / 2, 0]} scale={[-1, 1, 1]} renderOrder={-1}>
    <sphereGeometry args={[30, 48, 24]} />
    <meshBasicMaterial map={map} side={BackSide} toneMapped={false} depthWrite={false} />
  </mesh>;
}

function Plants() {
  const { scene } = useLabGLTF(labUrl('lab-plants'));
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
  const { scene, animations } = useLabGLTF(labUrl(actor.id));
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
  const walked = useRef(0), facing = useRef(actor.patrol ? patrolAt(actor.patrol, 0).heading : 0);
  useEffect(() => { Object.values(actions).forEach(action => action?.play()); }, [actions]);
  useFrame((_, delta) => {
    Object.values(actions).forEach(action => { if (action) action.paused = !ambient.enabled; });
    if (!pivot.current) return;
    const goal = actor.follows && target && ambient.enabled ? scratch.goal.set(...target) : rest;
    if (ambient.enabled) place.current.lerp(goal, 1 - Math.exp(-2.2 * Math.min(delta, .1))); else place.current.copy(rest);
    pivot.current.position.copy(place.current);
    if (actor.patrol) {
      // Walkers keep their height; under reduced motion they stand at the start of the route.
      if (ambient.enabled) walked.current += actor.patrol.speed * Math.min(delta, .1);
      const step = patrolAt(actor.patrol, walked.current);
      pivot.current.position.set(step.x, rest.y, step.z);
      // Ease the yaw the short way round so corners are turns, not snaps.
      const diff = Math.atan2(Math.sin(step.heading - facing.current), Math.cos(step.heading - facing.current));
      facing.current += diff * (1 - Math.exp(-6 * Math.min(delta, .1)));
      pivot.current.rotation.y = facing.current;
      soundscape.move(actor.id, step.x, rest.y, step.z);
    }
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
  { point: 'projects', text: 'Proyectos', at: [3.75, 2.45, -2.4] },
  ...Object.values(STATIONS).map(station => ({ point: station.id, text: station.name, at: station.hotspot })),
];

export function LabScene({ point, focus, onFocus, onGo, onOpenCase, onTechnology, onComputer, freeWalk }: {
  point: WorldPoint; focus: LabFocus; onFocus: (focus: LabFocus) => void;
  onGo: (point: WorldPoint) => void; onOpenCase: (id: string) => void; onTechnology: (technologyId: string) => void; onComputer: () => void; freeWalk: boolean;
}) {
  const { invalidate } = useThree();
  const relations = useMemo(() => focusRelations(focus), [focus]);
  const viewpoint = useMemo(() => focusViewpoint(focus), [focus]);
  // The demand loop does not run under reduced motion: a focus change still has to draw once.
  useEffect(() => { invalidate(); }, [focus, invalidate]);
  // Away from a project's place (its corner, or the wall for projects without one) the visitor walks up to it; there it opens the case.
  const selectProject = (id: string) => {
    const place = cornerPoint(id) ?? 'projects';
    if (point === place) onOpenCase(id); else onGo(place);
  };
  useEffect(() => () => { document.body.style.cursor = ''; }, []);
  // P.2 (specs/workshop-performance.md): this effect runs once the room has loaded, so rain, plants and actors only
  // start downloading then and never share the bandwidth with the essential room.
  const [decorate, setDecorate] = useState(false);
  useEffect(() => { setDecorate(true); }, []);
  return <group>
    <Room /><CitySky />
    {decorate && <>
      <OptionalBoundary><Suspense fallback={null}><LabRain /></Suspense></OptionalBoundary>
      <OptionalBoundary><Suspense fallback={null}><Plants /></Suspense></OptionalBoundary>
      {LAB_ACTORS.map((actor, index) => <OptionalBoundary key={actor.id}><Suspense fallback={null}>
        <Actor actor={actor} phase={index * 1.7} target={viewpoint} />
      </Suspense></OptionalBoundary>)}
    </>}
    <OptionalBoundary><Suspense fallback={null}>
      <ProjectWall lit={relations.projects} focused={!!focus} onSelect={selectProject}
        onHover={(id, anchor) => onFocus(id ? { kind: 'project', id, anchor } : null)} />
    </Suspense></OptionalBoundary>
    <ProjectCorners lit={relations.projects} focused={!!focus} onSelect={selectProject}
      onHover={id => onFocus(id ? { kind: 'project', id } : null)} />
    <TechnologyShelf point={point} lit={relations.technologies} focused={!!focus} onGo={onGo} onSelect={onTechnology}
      onHover={id => onFocus(id ? { kind: 'technology', id } : null)} />
    <Whiteboard onSelect={() => onGo('trajectory')} />
    <ContactMonitor onSelect={() => { if (point === 'contact') onComputer(); else onGo('contact'); }} />
    <mesh position={CONTACT_DESK.position} onPointerOver={pointer(true)} onPointerOut={pointer(false)} onClick={event => { event.stopPropagation(); if (event.delta < 5) onGo('contact'); }}>
      <boxGeometry args={CONTACT_DESK.size} /><meshBasicMaterial visible={false} />
    </mesh>
    {/* Labels only from the overview, where every destination is in view. */}
    {point === 'hub' && !freeWalk && HUB_LABELS.map(label => <Html key={label.point} position={label.at} center>
      <button type="button" className={styles.hotspot} onClick={() => onGo(label.point)}>{label.text}</button>
    </Html>)}
  </group>;
}
