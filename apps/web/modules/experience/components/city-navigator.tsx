'use client';

import { Environment, Html, Lightformer, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Component, Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ComponentRef, type MutableRefObject, type ReactNode } from 'react';
import { OrthographicCamera, Vector3 } from 'three';
import { PROJECTS } from '../../../data/projects';
import { BlenderPavilion } from './blender-pavilion';
import { KLINIU_TOUR_STOPS, type KliniuTourStop } from './kliniu-tour';
import { TechnologyLibrary, WORKSHOP_POSITIONS } from './workshop-table';
import styles from '../experience.module.css';
import { cameraBaseZoom, entranceProfile, restoreCameraFrame, type CameraSnapshot, type CityCameraHandle } from '../workshop-state';

export interface CityNavigatorProps {
  selectedProjectId: string;
  onProjectSelect: (id: string) => void;
  viewRevision: number;
  reducedMotion?: boolean;
  detail?: boolean;
  exploded?: boolean;
  night?: boolean;
  section?: 'projects' | 'technologies';
  highlightedProjectIds?: readonly string[];
  selectedTechnologyId?: string;
  onTechnologiesOpen?: () => void;
  onActiveChange?: (active: boolean) => void;
  tourStop?: KliniuTourStop;
  onTourSelect?: (stop: KliniuTourStop) => void;
  immersive?: boolean;
  entering?: boolean;
  onEntranceReady?: (token?: number) => void;
  entranceToken?: number;
  cameraHandle?: MutableRefObject<CityCameraHandle | null>;
  initialCamera?: CameraSnapshot | null;
  initialEnabled?: boolean | null;
  onEnabledChange?: (enabled: boolean) => void;
  reveal?: boolean;
  onSceneError?: () => void;
  onSceneReady?: () => void;
  onCameraSnapshot?: (snapshot: CameraSnapshot) => void;
}
const districts = [
  { id: 'kliniu' },
  { id: '4ustudio-academy' },
  { id: 'lorigine' },
  { id: 'drokex' },
];
function District({
  id,
  active,
  onSelect,
  exploded,
  night,
  reducedMotion,
  tourStop,
  onTourSelect,
  entering,
  onScreenReady,
}: {
  id: string;
  active: boolean;
  onSelect: (id: string) => void;
  exploded?: boolean; night?: boolean; reducedMotion?: boolean;
  tourStop?: KliniuTourStop;
  onTourSelect?: (stop: KliniuTourStop) => void;
  entering?: boolean;
  onScreenReady?: () => void;
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
        <BlenderPavilion projectId={id} active={active || hovered} exploded={exploded && active} night={night} reducedMotion={reducedMotion} />
      </group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.067, 0]}>
        <ringGeometry args={[1.23, 1.26, 48]} />
        <meshStandardMaterial color={active || hovered ? '#557b59' : '#c6cfc0'} roughness={0.6} />
      </mesh>
      {!entering && <Html position={[0, 0.16, 1.04]} center zIndexRange={[15, 0]}>
        <button
          type="button"
          className={styles.mapLabel}
          aria-label={`Seleccionar edificio ${name}`}
          aria-pressed={active}
          onClick={() => onSelect(id)}
        >
          {name}
        </button>
      </Html>}
      {id === 'kliniu' && entering && <Html transform position={[0, 0.92, 1.04]} distanceFactor={1} zIndexRange={[22, 21]} style={{ pointerEvents: 'none' }}>
        <div className={styles.entranceScreen} aria-hidden="true">
          {/* The same real capture becomes the first image of the project case. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/projects/kliniu-desktop.png" alt="" width={576} height={400} onLoad={onScreenReady} style={{ viewTransitionName: 'kliniu-surface' }} />
        </div>
      </Html>}
      {id === 'kliniu' && tourStop && KLINIU_TOUR_STOPS.map(({ id: stopId, label, position: point, icon: Icon }) => (
        <Html key={stopId} position={[point[0], point[1] + (exploded && stopId === 'architecture' ? 0.7 : 0), point[2]]} center zIndexRange={[20, 16]}>
          <button type="button" className={styles.tourHotspot} aria-label={`Kliniu: ${label}`}
            title={label} aria-pressed={tourStop === stopId} aria-controls="kliniu-tour-evidence"
            onPointerDown={event => event.stopPropagation()}
            onClick={event => { event.stopPropagation(); onTourSelect?.(stopId); }}>
            <Icon size={19} aria-hidden="true" /><span>{label}</span>
          </button>
        </Html>
      ))}
    </group>
  );
}
function CameraRig({
  selectedProjectId,
  viewRevision,
  reducedMotion,
  detail,
  section,
  exploded,
  tourStop,
  immersive,
  entering,
  onEntranceReady,
  entranceImageReady,
  entranceToken,
  cameraHandle,
  initialCamera,
  onCameraSnapshot,
  reveal,
}: CityNavigatorProps & { entranceImageReady: boolean }) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const { camera, size, invalidate } = useThree();
  const moving = useRef(true);
  const factor = useRef(immersive ? .92 : 1);
  const entranceReported = useRef(false);
  const offset = useRef(new Vector3());
  const framed = useRef(false);
  const pendingRestore = useRef(initialCamera);
  const dimensions = useRef({ width: size.width, height: size.height });
  const initialSettle = useRef(!initialCamera);
  const settleStarted = useRef<number | null>(null);
  const entranceStarted = useRef<number | null>(null);
  const entranceCallback = useRef(onEntranceReady);
  entranceCallback.current = onEntranceReady;
  const capture = useCallback((): CameraSnapshot => ({
    position: camera.position.toArray() as [number, number, number],
    target: (controls.current?.target ?? new Vector3()).toArray() as [number, number, number],
    factor: factor.current,
    offset: [offset.current.x / dimensions.current.width, offset.current.y / dimensions.current.height],
    width: dimensions.current.width,
    height: dimensions.current.height,
  }), [camera]);
  useLayoutEffect(() => {
    if (!cameraHandle) return;
    const handle: CityCameraHandle = {
      capture,
      restore: (snapshot) => { pendingRestore.current = snapshot; moving.current = false; invalidate(); },
    };
    cameraHandle.current = handle;
    return () => {
      onCameraSnapshot?.(capture());
      if (cameraHandle.current === handle) cameraHandle.current = null;
    };
  }, [cameraHandle, capture, invalidate, onCameraSnapshot]);
  const destination = useMemo(() => {
    const p = WORKSHOP_POSITIONS[selectedProjectId] ?? [0, 0, 0];
    if (entering) {
      const profile = entranceProfile(selectedProjectId);
      return { target: new Vector3(...profile.target).add(new Vector3(...p)), position: new Vector3(...profile.position).add(new Vector3(...p)), zoom: profile.zoom };
    }
    if (section === 'technologies')
      return { target: new Vector3(0, 0.55, 0), position: new Vector3(4, 5.5, 9), zoom: 1.45 };
    if (detail)
      return {
        target: new Vector3(p[0], exploded ? 1.3 : 0.75, p[2]),
        position: new Vector3(p[0] + (tourStop === 'purchase' ? 2.5 : tourStop === 'architecture' ? 5 : 4), tourStop === 'architecture' ? 6.3 : 5.5, p[2] + 7),
        zoom: exploded ? 1.65 : immersive ? 1.85 : 2.1,
      };
    return { target: new Vector3(0, 0.25, 0), position: new Vector3(6, 9.6, 13), zoom: 1 };
  }, [selectedProjectId, detail, section, exploded, tourStop, entering, immersive]);
  const initialIntent = useRef({ destination, viewRevision, entranceToken });
  const preserveInitialCamera = useRef(!!initialCamera);
  useEffect(() => {
    // The first frame can restore before passive effects run; only a new intent may replace it.
    const initial = initialIntent.current;
    if (preserveInitialCamera.current && initial.destination === destination && initial.viewRevision === viewRevision && initial.entranceToken === entranceToken) {
      invalidate();
      return;
    }
    preserveInitialCamera.current = false;
    moving.current = !pendingRestore.current;
    entranceReported.current = false;
    entranceStarted.current = null;
    invalidate();
  }, [destination, viewRevision, reducedMotion, entranceToken, invalidate]);
  useEffect(() => {
    if (dimensions.current.width !== size.width || dimensions.current.height !== size.height) {
      pendingRestore.current = capture();
      invalidate();
    }
  }, [size, capture, invalidate]);
  useEffect(() => {
    if (entering && entranceImageReady) { moving.current = true; invalidate(); }
  }, [entering, entranceImageReady, invalidate]);
  useEffect(() => {
    const interrupt = () => {
      if (initialSettle.current) { initialSettle.current = false; moving.current = false; }
    };
    window.addEventListener('pointerdown', interrupt, true);
    window.addEventListener('keydown', interrupt, true);
    window.addEventListener('wheel', interrupt, { capture: true, passive: true });
    return () => {
      window.removeEventListener('pointerdown', interrupt, true);
      window.removeEventListener('keydown', interrupt, true);
      window.removeEventListener('wheel', interrupt, true);
    };
  }, []);
  useFrame((_, delta) => {
    if (!controls.current) return;
    if (pendingRestore.current) {
      const snapshot = pendingRestore.current;
      pendingRestore.current = null;
      const frame = restoreCameraFrame(snapshot, size.width, size.height, !!immersive, !!detail);
      camera.position.fromArray(snapshot.position);
      controls.current.target.fromArray(snapshot.target);
      factor.current = snapshot.factor;
      camera.zoom = frame.zoom;
      offset.current.set(...frame.offset, 0);
      dimensions.current = { width: size.width, height: size.height };
      if (immersive && camera instanceof OrthographicCamera) camera.setViewOffset(size.width, size.height, frame.offset[0], frame.offset[1], size.width, size.height);
      camera.updateProjectionMatrix();
      controls.current.update();
      framed.current = true;
      moving.current = false;
      initialSettle.current = false;
      return;
    }
    if (!moving.current) return;
    const now = performance.now();
    if (settleStarted.current === null) settleStarted.current = now;
    if (entering && entranceStarted.current === null) entranceStarted.current = now;
    const snap = reducedMotion || (initialSettle.current && (!reveal || now - settleStarted.current >= 750));
    const step = snap ? 1 : 1 - Math.exp(-7 * Math.min(delta, 0.05));
    factor.current += (destination.zoom - factor.current) * step;
    const mobile = size.width <= 800;
    const compactMobile = mobile && size.height < 600;
    const baseZoom = cameraBaseZoom(size.width, size.height, !!immersive, !!detail);
    camera.zoom = baseZoom * factor.current;
    if (immersive && camera instanceof OrthographicCamera) {
      const x = entering ? 0 : mobile ? 0 : -size.width * .16;
      const y = entering ? 0 : mobile ? -size.height * (compactMobile ? .04 : .09) : -size.height * .01;
      if (!framed.current) { offset.current.set(x, y, 0); framed.current = true; }
      offset.current.x += (x - offset.current.x) * step;
      offset.current.y += (y - offset.current.y) * step;
      camera.setViewOffset(size.width, size.height, offset.current.x, offset.current.y, size.width, size.height);
    }
    camera.position.lerp(destination.position, step);
    controls.current.target.lerp(destination.target, step);
    camera.updateProjectionMatrix();
    controls.current.update();
    if (entering && entranceImageReady && !entranceReported.current && entranceStarted.current !== null && now - entranceStarted.current >= 900) {
      entranceReported.current = true;
      entranceCallback.current?.(entranceToken);
    }
    if (
      camera.position.distanceToSquared(destination.position) < 0.00001 &&
      controls.current.target.distanceToSquared(destination.target) < 0.00001 &&
      Math.abs(factor.current - destination.zoom) < 0.00001 &&
      (!entering || entranceReported.current)
    )
      { moving.current = false; initialSettle.current = false; }
    else invalidate();
  });
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      enabled={!entering}
      enableZoom={false}
      enableDamping={!reducedMotion}
      dampingFactor={0.12}
      minPolarAngle={0.38}
      maxPolarAngle={entering ? Math.PI / 2 : 1.18}
      minAzimuthAngle={-0.65}
      maxAzimuthAngle={1.05}
      onStart={() => {
        moving.current = false;
        initialSettle.current = false;
      }}
    />
  );
}
class ModelBoundary extends Component<{ children: ReactNode; onError?: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError?.(); }
  render() { return this.state.failed ? null : this.props.children; }
}
function SceneReady({ onReady }: { onReady?: () => void }) {
  useEffect(() => { onReady?.(); }, [onReady]);
  return null;
}
function ContextGuard({ onError }: { onError?: () => void }) {
  const { gl } = useThree();
  useEffect(() => {
    const lost = (event: Event) => { event.preventDefault(); onError?.(); };
    const canvas = gl.domElement;
    canvas.addEventListener('webglcontextlost', lost);
    if (gl.getContext().isContextLost()) onError?.();
    return () => canvas.removeEventListener('webglcontextlost', lost);
  }, [gl, onError]);
  return null;
}
export function CityNavigator(props: CityNavigatorProps) {
  const [entranceImageReady, setEntranceImageReady] = useState(false);
  useEffect(() => { if (!props.entering) setEntranceImageReady(false); }, [props.entering]);
  const {
    selectedProjectId,
    onProjectSelect,
    section,
    highlightedProjectIds,
    selectedTechnologyId,
    onTechnologiesOpen,
    night,
    exploded,
    reducedMotion,
  } = props;
  return (
    <div
      role="group"
      aria-label="Maqueta 3D interactiva de proyectos"
      style={{ height: '100%', width: '100%', cursor: 'grab', pointerEvents: props.entering ? 'none' : 'auto' }}
    >
      <Canvas
        shadows
        orthographic
        frameloop="demand"
        dpr={[1, 1.5]}
        camera={{ position: [6, 9.6, 13], zoom: 50, near: 0.1, far: 100 }}
        gl={{ antialias: true, powerPreference: 'low-power' }}
      >
        <ContextGuard onError={props.onSceneError} />
        <color attach="background" args={[night ? '#151b22' : props.immersive ? '#eef0ef' : '#e9ecee']} />
        <ambientLight intensity={night ? .16 : .35} />
        <hemisphereLight args={['#f5faff', '#626971', night ? .45 : .65]} />
        <Environment resolution={128} frames={1} environmentIntensity={night ? .32 : 1}>
          <Lightformer position={[-5, 7, 3]} rotation={[Math.PI / 2, 0, 0]} scale={[8, 8, 1]} intensity={3} />
          <Lightformer position={[5, 3, -4]} rotation={[0, -Math.PI / 2, 0]} scale={[4, 6, 1]} intensity={2} color="#d8eaff" />
        </Environment>
        <directionalLight
          position={[-5, 10, 7]}
          intensity={night ? .85 : 2.6}
          color={night ? '#a9c8ff' : '#fff9eb'}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-radius={3}
          shadow-camera-left={-7}
          shadow-camera-right={7}
          shadow-camera-top={7}
          shadow-camera-bottom={-7}
          shadow-normalBias={0.025}
          shadow-bias={-0.0001}
        />
        <directionalLight position={[5, 4, -5]} intensity={night ? .55 : 1.1} color="#d5e9f1" />
        <ModelBoundary onError={props.onSceneError}>
        <Suspense fallback={null}>
          <BlenderPavilion projectId="stage" />
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.39, 0]} receiveShadow>
            <planeGeometry args={[200, 200]} />
            <meshStandardMaterial color={night ? '#151b22' : props.immersive ? '#eef0ef' : '#e9ecee'} roughness={0.95} />
          </mesh>
        {districts.map(({ id }) => (
            <District
              key={id}
              id={id}
              active={
                section === 'technologies'
                  ? !!highlightedProjectIds?.includes(id)
                  : id === selectedProjectId
              }
              onSelect={onProjectSelect}
              exploded={exploded}
              night={night}
              reducedMotion={reducedMotion}
              tourStop={props.tourStop}
              onTourSelect={props.onTourSelect}
              entering={props.entering && id === selectedProjectId}
              onScreenReady={() => setEntranceImageReady(true)}
            />
        ))}
          <group visible={!props.entering}>
          <TechnologyLibrary
            selectedId={selectedTechnologyId}
            active={section === 'technologies'}
            onOpen={onTechnologiesOpen}
          />
          </group>
        <SceneReady onReady={props.onSceneReady} />
        </Suspense>
        </ModelBoundary>
        {onTechnologiesOpen && !props.entering && (
          <Html center position={[0, 0.35, 1]} zIndexRange={[15, 0]}>
            <button className={styles.libraryLabel} type="button" onClick={onTechnologiesOpen}>
              Tecnologías
            </button>
          </Html>
        )}
        <CameraRig {...props} entranceImageReady={selectedProjectId !== 'kliniu' || entranceImageReady} />
      </Canvas>
    </div>
  );
}
