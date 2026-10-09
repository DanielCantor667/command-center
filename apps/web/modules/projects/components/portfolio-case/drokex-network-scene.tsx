'use client';

import { Environment, Lightformer, OrbitControls, useGLTF } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  type ComponentRef,
  type ReactNode,
} from 'react';
import { Mesh, OrthographicCamera, Spherical, Vector3 } from 'three';
import type { DrokexView } from './drokex-network';

interface NetworkProps {
  view: DrokexView;
  revision: number;
  reducedMotion: boolean;
  onReady: () => void;
  onError: () => void;
}
class ModelBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function NetworkModel({ detail }: { detail: boolean }) {
  const { scene } = useGLTF('/models/workshop/drokex-interactive-v4.glb');
  const { invalidate } = useThree();
  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((object) => {
      if (object instanceof Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
    return clone;
  }, [scene]);
  useEffect(() => {
    for (const part of model.children) {
      const name = part.name.replace(/_\d+$/, '');
      if (name === 'facade') part.visible = false;
      if (name === 'roof') part.visible = !detail;
    }
    invalidate();
  }, [model, detail, invalidate]);
  // Geometry and materials belong to the GLTF cache; only the object hierarchy is local.
  return <primitive object={model} dispose={null} />;
}

function ContextGuard({ onError }: { onError: () => void }) {
  const { gl } = useThree();
  useEffect(() => {
    const lost = (event: Event) => {
      event.preventDefault();
      onError();
    };
    const canvas = gl.domElement;
    canvas.addEventListener('webglcontextlost', lost);
    if (gl.getContext().isContextLost()) onError();
    return () => canvas.removeEventListener('webglcontextlost', lost);
  }, [gl, onError]);
  return null;
}

function NetworkContent({ view, revision, reducedMotion, onReady }: NetworkProps) {
  const { camera, size, invalidate, gl } = useThree();
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const moving = useRef(true);
  const initial = useRef(true);
  const detail = view === 'detail';
  const target = useMemo(() => new Vector3(0, 0.82, 0), []);
  const position = useMemo(
    () => (detail ? new Vector3(-1.6, 2.4, 5) : new Vector3(-3, 2.5, 5)),
    [detail],
  );
  useEffect(() => {
    moving.current = true;
    invalidate();
  }, [view, revision, size, invalidate]);
  useEffect(() => {
    const canvas = gl.domElement;
    canvas.tabIndex = 0;
    canvas.setAttribute(
      'aria-label',
      'Red 3D de Drokex. Flechas para girar; Inicio para restablecer.',
    );
    canvas.setAttribute('aria-keyshortcuts', 'ArrowLeft ArrowRight ArrowUp ArrowDown Home');
    const rotate = (event: KeyboardEvent) => {
      const orbit = controls.current;
      if (!orbit || event.altKey || event.ctrlKey || event.metaKey) return;
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(event.key)) return;
      event.preventDefault();
      if (event.key === 'Home') {
        moving.current = true;
      } else {
        moving.current = false;
        const spherical = new Spherical().setFromVector3(camera.position.clone().sub(orbit.target));
        if (event.key === 'ArrowLeft') spherical.theta -= 0.15;
        if (event.key === 'ArrowRight') spherical.theta += 0.15;
        if (event.key === 'ArrowUp') spherical.phi -= 0.12;
        if (event.key === 'ArrowDown') spherical.phi += 0.12;
        spherical.theta = Math.max(
          orbit.minAzimuthAngle,
          Math.min(orbit.maxAzimuthAngle, spherical.theta),
        );
        spherical.phi = Math.max(orbit.minPolarAngle, Math.min(orbit.maxPolarAngle, spherical.phi));
        camera.position.copy(orbit.target).add(new Vector3().setFromSpherical(spherical));
        orbit.update();
      }
      invalidate();
    };
    canvas.addEventListener('keydown', rotate);
    return () => canvas.removeEventListener('keydown', rotate);
  }, [camera, gl, invalidate]);
  useEffect(() => {
    onReady();
  }, [onReady]);
  useFrame((_, delta) => {
    if (!moving.current || !controls.current || !(camera instanceof OrthographicCamera)) return;
    const step = reducedMotion || initial.current ? 1 : 1 - Math.exp(-6 * Math.min(delta, 0.05));
    const zoom = Math.min(size.width / (detail ? 2.9 : 3.7), size.height / (detail ? 2.35 : 2.8));
    camera.position.lerp(position, step);
    camera.zoom += (zoom - camera.zoom) * step;
    camera.updateProjectionMatrix();
    controls.current.target.lerp(target, step);
    controls.current.update();
    initial.current = false;
    moving.current = camera.position.distanceTo(position) + Math.abs(camera.zoom - zoom) > 0.002;
    if (moving.current) invalidate();
  });
  return (
    <>
      <color attach="background" args={['#e4e6e5']} />
      <ambientLight intensity={0.3} />
      <hemisphereLight args={['#ffffff', '#acb0b1']} intensity={0.5} />
      <directionalLight
        position={[-3, 5, 4]}
        intensity={2.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
        shadow-normalBias={0.018}
      />
      <Environment resolution={128} environmentIntensity={0.8}>
        <color attach="background" args={['#c4c7c8']} />
        <Lightformer
          position={[-3, 5, 2]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[5, 5, 1]}
          intensity={3}
        />
        <Lightformer
          position={[4, 2, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[3, 4, 1]}
          intensity={2}
        />
        <Lightformer
          position={[0, 2, 5]}
          rotation={[0, Math.PI, 0]}
          scale={[2, 4, 1]}
          intensity={1.5}
        />
      </Environment>
      <NetworkModel detail={detail} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#e4e6e5" roughness={0.8} />
      </mesh>
      <OrbitControls
        ref={controls}
        onStart={() => { moving.current = false; }}
        target={[0, 0.82, 0]}
        enablePan={false}
        enableZoom={false}
        enableDamping={!reducedMotion}
        minPolarAngle={0.4}
        maxPolarAngle={1.42}
        minAzimuthAngle={-1.2}
        maxAzimuthAngle={0.7}
      />
    </>
  );
}

export function DrokexNetworkScene(props: NetworkProps) {
  return (
    <Canvas
      orthographic
      shadows
      frameloop="demand"
      dpr={[1, 1.5]}
      camera={{ position: [-3, 2.5, 5], zoom: 100, near: 0.01, far: 250 }}
      gl={{ antialias: true, alpha: false }}
      aria-label="Red interactiva de Drokex"
    >
      <ContextGuard onError={props.onError} />
      <ModelBoundary onError={props.onError}>
        <Suspense fallback={null}>
          <NetworkContent {...props} />
        </Suspense>
      </ModelBoundary>
    </Canvas>
  );
}
