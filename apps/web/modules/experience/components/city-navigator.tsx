'use client';

import { Html, OrbitControls, useGLTF } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Component, Suspense, useEffect, useMemo, useRef, useState, type ComponentRef, type ReactNode } from 'react';
import { Group, Mesh, MeshStandardMaterial, Vector3, type Material } from 'three';
import { PROJECTS } from '../../../data/projects';
import { CITY_ASSETS, type CityDistrictAsset } from '../data/city-assets';
import { LorigineDistrict } from './lorigine-district';
import { AcademyDistrict } from './academy-district';
import { DrokexDistrict } from './drokex-district';
import { KliniuDistrict } from './kliniu-district';
import styles from '../experience.module.css';

export interface CityNavigatorProps {
  selectedProjectId: string;
  onProjectSelect: (id: string) => void;
  viewRevision: number;
  reducedMotion?: boolean;
  detail?: boolean;
}

const sceneColor = '#e5e7e2';
const stoneColor = '#c6cec1';

class LandmarkBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

/** View-only materials. The cached GLTF, its materials and its geometry stay untouched. */
function Model({ asset }: { asset: CityDistrictAsset }) {
  const { scene } = useGLTF(asset.lod1Path ?? asset.lod0Path!);
  const model = useMemo(() => {
    const object = scene.clone(true);
    const materials = new Map<Material, MeshStandardMaterial>();
    const materialFor = (source: Material) => {
      const cached = materials.get(source);
      if (cached) return cached;
      const name = source.name;
      const color = /Glass/i.test(name) ? '#6e827b'
        : /Energy|Halo/i.test(name) ? '#879f85'
        : /Steel/i.test(name) ? '#859187'
        : /Asphalt/i.test(name) ? '#bac2b7'
        : /Panel/i.test(name) ? '#dce0d4' : '#c7cdbc';
      const material = new MeshStandardMaterial({ color, roughness: /Glass/i.test(name) ? 0.32 : 0.85, metalness: /Glass/i.test(name) ? 0.2 : 0.04 });
      materials.set(source, material);
      return material;
    };
    object.traverse((node) => {
      if (!(node instanceof Mesh)) return;
      node.material = Array.isArray(node.material) ? node.material.map(materialFor) : materialFor(node.material);
      node.castShadow = true;
      node.receiveShadow = true;
    });
    return { object, materials };
  }, [scene]);
  useEffect(() => () => { model.materials.forEach((material) => material.dispose()); }, [model]);
  return <primitive object={model.object} scale={asset.transform?.scale} rotation={asset.transform?.rotation} dispose={null} />;
}

function Pavilion({ tall = false }: { tall?: boolean }) {
  return (
    <group>
      <mesh position={[0, 0.04, 0]} receiveShadow><boxGeometry args={[1.5, .08, 1.35]} /><meshStandardMaterial color={stoneColor} roughness={.9} /></mesh>
      {[-.43, .43].map((x) => <mesh key={x} position={[x, .62, 0]} castShadow receiveShadow><boxGeometry args={[.45, tall ? 1.8 : 1.12, .85]} /><meshStandardMaterial color="#b6c1b0" roughness={.8} /></mesh>)}
      <mesh position={[0, tall ? 1.5 : 1.1, 0]} castShadow><boxGeometry args={[1.36, .16, .95]} /><meshStandardMaterial color="#7d9081" roughness={.7} /></mesh>
      {[.32, .61, .9].map((y) => <mesh key={y} position={[0, y, .44]}><boxGeometry args={[1.24, .045, .018]} /><meshStandardMaterial color="#6e827b" roughness={.4} /></mesh>)}
    </group>
  );
}

function District({ asset, selected, onSelect, reducedMotion }: { reducedMotion?: boolean; asset: CityDistrictAsset; selected: boolean; onSelect: (id: string) => void }) {
  const [hovered, setHovered] = useState(false);
  const name = PROJECTS.find((project) => project.id === asset.projectId)?.name ?? asset.label;
  const fallback = <Pavilion tall={asset.id === 'command-center'} />;
  return (
    <group position={[asset.position[0], 0, asset.position[2]]}>
      <group
        onClick={(event) => { if (event.delta > 5) return; event.stopPropagation(); onSelect(asset.projectId); }}
        onPointerOver={(event) => { event.stopPropagation(); setHovered(true); }}
        onPointerOut={() => setHovered(false)}
      >
        <mesh position={[0, -.055, 0]} receiveShadow>
          <cylinderGeometry args={[1.18, 1.18, .06, 6]} />
          <meshStandardMaterial color={selected ? '#a8bfa6' : hovered ? '#c7d5c1' : '#d6dccf'} roughness={.95} />
        </mesh>
        {asset.projectId === 'kliniu' ? <KliniuDistrict active={selected || hovered} reducedMotion={reducedMotion} /> : asset.projectId === '4ustudio-academy' ? <AcademyDistrict active={selected || hovered} reducedMotion={reducedMotion} /> : asset.projectId === 'lorigine' ? <LorigineDistrict active={selected || hovered} reducedMotion={reducedMotion} /> : asset.projectId === 'drokex' ? <DrokexDistrict active={selected || hovered} reducedMotion={reducedMotion} /> : asset.lod0Path ? <LandmarkBoundary fallback={fallback}><Suspense fallback={fallback}><Model asset={asset} /></Suspense></LandmarkBoundary> : fallback}
      </group>
      <Html position={[0, .06, 1.02]} center zIndexRange={[15, 0]}>
        <button className={styles.mapLabel} type="button" aria-label={`Seleccionar edificio ${name}`} aria-pressed={selected} onClick={(event) => { event.stopPropagation(); onSelect(asset.projectId); }}>{name}</button>
      </Html>
    </group>
  );
}

function SiteModel() {
  const trees = [[-3.6, -2.5], [-3.5, -2.1], [-3.4, -1.7], [3.45, .1], [3.5, .5], [3.55, .9], [-1.3, 3.45], [-.95, 3.5]];
  return (
    <group>
      <mesh position={[0, -.23, 0]} receiveShadow castShadow><boxGeometry args={[9, .3, 8.8]} /><meshStandardMaterial color="#d2d8ca" roughness={1} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -.39, 0]} receiveShadow><planeGeometry args={[200, 200]} /><meshStandardMaterial color={sceneColor} roughness={1} /></mesh>
      <mesh position={[0, -.072, 0]}><boxGeometry args={[.18, .008, 8.2]} /><meshStandardMaterial color="#e9ece2" /></mesh>
      <mesh position={[0, -.071, 0]}><boxGeometry args={[8.2, .008, .18]} /><meshStandardMaterial color="#e9ece2" /></mesh>
      {trees.map(([x, z], index) => <group key={index} position={[x!, 0, z!]}>
        <mesh position={[0, .13, 0]} castShadow><cylinderGeometry args={[.018, .025, .27, 5]} /><meshStandardMaterial color="#8d9884" /></mesh>
        <mesh position={[0, .34, 0]} castShadow><icosahedronGeometry args={[.15, 1]} /><meshStandardMaterial color="#8fa284" roughness={1} /></mesh>
      </group>)}
    </group>
  );
}

function CameraRig({ selectedProjectId, viewRevision, reducedMotion, detail }: Pick<CityNavigatorProps, 'selectedProjectId' | 'viewRevision' | 'reducedMotion' | 'detail'>) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const { camera, size, invalidate } = useThree();
  const viewport = useRef(size);
  viewport.current = size;
  const moving = useRef(false);
  const zoomFactor = useRef(1);
  const targetZoom = useRef(1);
  const initialized = useRef(false);
  const previousRevision = useRef(viewRevision);
  const destination = useMemo(() => ({ target: new Vector3(), position: new Vector3() }), []);

  useEffect(() => {
    camera.zoom = Math.min(size.width / 12.5, size.height / 9.5) * zoomFactor.current;
    camera.updateProjectionMatrix();
    invalidate();
  }, [size.width, size.height, camera, invalidate]);

  useEffect(() => {
    const overview = !detail && (!initialized.current || previousRevision.current !== viewRevision);
    targetZoom.current = detail ? 2.4 : 1;
    const district = CITY_ASSETS.find((asset) => asset.projectId === selectedProjectId);
    destination.target.set(overview ? 0 : (district?.position[0] ?? 0) * (detail ? 1 : .48), detail ? .75 : .5, overview ? 0 : (district?.position[2] ?? 0) * (detail ? 1 : .48));
    destination.position.copy(destination.target).add(detail ? (selectedProjectId === 'drokex' ? new Vector3(-4, 6, 12) : selectedProjectId === 'lorigine' ? new Vector3(6, 5, 11) : selectedProjectId === '4ustudio-academy' ? new Vector3(3, 5, 12) : new Vector3(-6, 7, 11)) : new Vector3(10, 10, 12));
    if (!initialized.current || reducedMotion) {
      zoomFactor.current = targetZoom.current;
      camera.zoom = Math.min(viewport.current.width / 12.5, viewport.current.height / 9.5) * zoomFactor.current;
      camera.updateProjectionMatrix();
      camera.position.copy(destination.position);
      controls.current?.target.copy(destination.target);
      controls.current?.update();
      moving.current = false;
    } else moving.current = true;
    initialized.current = true;
    previousRevision.current = viewRevision;
    invalidate();
  }, [selectedProjectId, viewRevision, reducedMotion, detail, camera, destination, invalidate]);

  useFrame((_, delta) => {
    if (!moving.current || !controls.current) return;
    const step = 1 - Math.exp(-7 * Math.min(delta, .05));
    zoomFactor.current += (targetZoom.current - zoomFactor.current) * step;
    camera.zoom = Math.min(size.width / 12.5, size.height / 9.5) * zoomFactor.current;
    camera.updateProjectionMatrix();
    camera.position.lerp(destination.position, step);
    controls.current.target.lerp(destination.target, step);
    controls.current.update();
    if (Math.abs(zoomFactor.current - targetZoom.current) < .0001 && camera.position.distanceToSquared(destination.position) < .00002 && controls.current.target.distanceToSquared(destination.target) < .00002) moving.current = false;
    else invalidate();
  });

  return <OrbitControls ref={controls} makeDefault enablePan={false} enableZoom={false} enableDamping={!reducedMotion} dampingFactor={.12} minPolarAngle={.4} maxPolarAngle={1.22} onStart={() => { moving.current = false; }} />;
}

function SceneReveal({ children, reducedMotion }: { children: ReactNode; reducedMotion?: boolean }) {
  const group = useRef<Group>(null);
  const progress = useRef(reducedMotion ? 1 : 0);
  const { invalidate } = useThree();
  useEffect(() => {
    progress.current = reducedMotion ? 1 : 0;
    if (group.current && reducedMotion) { group.current.position.y = 0; group.current.scale.setScalar(1); }
    invalidate();
  }, [reducedMotion, invalidate]);
  useFrame((_, delta) => {
    if (!group.current || progress.current >= 1) return;
    progress.current = Math.min(1, progress.current + delta / .72);
    const eased = 1 - Math.pow(1 - progress.current, 3);
    group.current.position.y = -.28 * (1 - eased);
    group.current.scale.setScalar(.94 + eased * .06);
    if (progress.current < 1) invalidate();
  });
  return <group ref={group}>{children}</group>;
}

export function CityNavigator({ selectedProjectId, onProjectSelect, viewRevision, reducedMotion, detail }: CityNavigatorProps) {
  return (
    <div role="group" aria-label="Maqueta 3D interactiva de proyectos" style={{ height: '100%', width: '100%', cursor: 'grab' }}>
      <Canvas orthographic shadows frameloop="demand" dpr={[1, 1.5]} camera={{ position: [10, 10, 12], zoom: 55, near: .1, far: 150 }} gl={{ antialias: true, powerPreference: 'low-power' }}>
        <color attach="background" args={[sceneColor]} />
        <ambientLight intensity={1.3} />
        <hemisphereLight args={['#fcfff5', '#a8b0a1', 1.2]} />
        <directionalLight position={[-6, 10, 5]} intensity={2.5} color="#fffbef" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-8} shadow-camera-right={8} shadow-camera-top={8} shadow-camera-bottom={-8} shadow-normalBias={.04} shadow-bias={-.0001} />
        <directionalLight position={[5, 4, -6]} intensity={.65} color="#edf3ff" />
        <SceneReveal reducedMotion={reducedMotion}>
          <SiteModel />
          {CITY_ASSETS.map((asset) => <District key={asset.id} asset={asset} selected={asset.projectId === selectedProjectId} onSelect={onProjectSelect} reducedMotion={reducedMotion} />)}
        </SceneReveal>
        <CameraRig detail={detail} selectedProjectId={selectedProjectId} viewRevision={viewRevision} reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
