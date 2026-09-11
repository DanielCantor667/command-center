'use client';

import { Html, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef, useState, type ComponentRef } from 'react';
import { Vector3 } from 'three';
import { PROJECTS } from '../../../data/projects';
import { LorigineDistrict } from './lorigine-district';
import { AcademyDistrict } from './academy-district';
import { DrokexDistrict } from './drokex-district';
import { KliniuDistrict } from './kliniu-district';
import { TechnologyLibrary, WorkshopTable, WORKSHOP_POSITIONS } from './workshop-table';
import styles from '../experience.module.css';

export interface CityNavigatorProps {
  selectedProjectId: string;
  onProjectSelect: (id: string) => void;
  viewRevision: number;
  reducedMotion?: boolean;
  detail?: boolean;
  section?: 'projects' | 'technologies';
  highlightedProjectIds?: readonly string[];
  selectedTechnologyId?: string;
  onTechnologiesOpen?: () => void;
}
const districts = [
  { id: 'kliniu', Component: KliniuDistrict },
  { id: '4ustudio-academy', Component: AcademyDistrict },
  { id: 'lorigine', Component: LorigineDistrict },
  { id: 'drokex', Component: DrokexDistrict },
];
function District({
  id,
  Component,
  active,
  onSelect,
  reducedMotion,
}: {
  id: string;
  Component: typeof KliniuDistrict;
  active: boolean;
  onSelect: (id: string) => void;
  reducedMotion?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const name = PROJECTS.find((project) => project.id === id)!.name;
  const position = WORKSHOP_POSITIONS[id]!;
  return (
    <group position={position}>
      <group
        scale={0.92}
        onClick={(event) => {
          if (event.delta > 5) return;
          event.stopPropagation();
          onSelect(id);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <Component active={active || hovered} reducedMotion={reducedMotion} />
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.067, 0]}>
        <ringGeometry args={[1.23, 1.26, 48]} />
        <meshStandardMaterial color={active ? '#557b59' : '#c6cfc0'} roughness={0.6} />
      </mesh>
      <Html position={[0, 0.16, 1.04]} center zIndexRange={[15, 0]}>
        <button
          type="button"
          className={styles.mapLabel}
          aria-label={`Seleccionar edificio ${name}`}
          aria-pressed={active}
          onClick={() => onSelect(id)}
        >
          {name}
        </button>
      </Html>
    </group>
  );
}
function CameraRig({
  selectedProjectId,
  viewRevision,
  reducedMotion,
  detail,
  section,
}: CityNavigatorProps) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const { camera, size, invalidate } = useThree();
  const moving = useRef(true);
  const factor = useRef(1);
  const destination = useMemo(() => {
    const p = WORKSHOP_POSITIONS[selectedProjectId] ?? [0, 0, 0];
    if (section === 'technologies')
      return { target: new Vector3(0, 0.55, 0), position: new Vector3(4, 5.5, 9), zoom: 1.45 };
    if (detail)
      return {
        target: new Vector3(p[0], 0.75, p[2]),
        position: new Vector3(p[0] + 4, 5.5, p[2] + 7),
        zoom: 2.1,
      };
    return { target: new Vector3(0, 0.25, 0), position: new Vector3(6, 9.6, 13), zoom: 1 };
  }, [selectedProjectId, detail, section]);
  useEffect(() => {
    moving.current = true;
    invalidate();
  }, [destination, viewRevision, reducedMotion, size, invalidate]);
  useFrame((_, delta) => {
    if (!moving.current || !controls.current) return;
    const step = reducedMotion ? 1 : 1 - Math.exp(-7 * Math.min(delta, 0.05));
    factor.current += (destination.zoom - factor.current) * step;
    camera.zoom = Math.min(size.width / 12.7, size.height / 9.4) * factor.current;
    camera.position.lerp(destination.position, step);
    controls.current.target.lerp(destination.target, step);
    camera.updateProjectionMatrix();
    controls.current.update();
    if (
      camera.position.distanceToSquared(destination.position) < 0.00001 &&
      controls.current.target.distanceToSquared(destination.target) < 0.00001 &&
      Math.abs(factor.current - destination.zoom) < 0.00001
    )
      moving.current = false;
    else invalidate();
  });
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      enableZoom={false}
      enableDamping={!reducedMotion}
      dampingFactor={0.12}
      minPolarAngle={0.38}
      maxPolarAngle={1.18}
      minAzimuthAngle={-0.65}
      maxAzimuthAngle={1.05}
      onStart={() => {
        moving.current = false;
      }}
    />
  );
}
export function CityNavigator(props: CityNavigatorProps) {
  const {
    selectedProjectId,
    onProjectSelect,
    reducedMotion,
    section,
    highlightedProjectIds,
    selectedTechnologyId,
    onTechnologiesOpen,
  } = props;
  return (
    <div
      role="group"
      aria-label="Maqueta 3D interactiva de proyectos"
      style={{ height: '100%', width: '100%', cursor: 'grab' }}
    >
      <Canvas
        shadows
        orthographic
        frameloop="demand"
        dpr={[1, 1.5]}
        camera={{ position: [6, 9.6, 13], zoom: 50, near: 0.1, far: 100 }}
        gl={{ antialias: true, powerPreference: 'low-power' }}
      >
        <color attach="background" args={['#e8ebe3']} />
        <ambientLight intensity={1.05} />
        <hemisphereLight args={['#f9fff4', '#7f8a75', 1.2]} />
        <directionalLight
          position={[-5, 10, 7]}
          intensity={3.2}
          color="#fff9eb"
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-7}
          shadow-camera-right={7}
          shadow-camera-top={7}
          shadow-camera-bottom={-7}
          shadow-normalBias={0.04}
          shadow-bias={-0.0001}
        />
        <directionalLight position={[5, 4, -5]} intensity={1.1} color="#d5e9f1" />
        <WorkshopTable />
        {districts.map(({ id, Component }) => (
          <District
            key={id}
            id={id}
            Component={Component}
            active={
              section === 'technologies'
                ? !!highlightedProjectIds?.includes(id)
                : id === selectedProjectId
            }
            onSelect={onProjectSelect}
            reducedMotion={reducedMotion}
          />
        ))}
        <Suspense fallback={null}>
          <TechnologyLibrary
            selectedId={selectedTechnologyId}
            active={section === 'technologies'}
            onOpen={onTechnologiesOpen}
          />
        </Suspense>
        {onTechnologiesOpen && (
          <Html center position={[0, 0.35, 1]} zIndexRange={[15, 0]}>
            <button className={styles.libraryLabel} type="button" onClick={onTechnologiesOpen}>
              Tecnologías
            </button>
          </Html>
        )}
        <CameraRig {...props} />
      </Canvas>
    </div>
  );
}
