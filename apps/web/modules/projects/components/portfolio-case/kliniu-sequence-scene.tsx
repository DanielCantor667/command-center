'use client';

import { Environment, Lightformer, OrbitControls, useGLTF } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Component, Suspense, useEffect, useMemo, useRef, type ComponentRef, type ReactNode } from 'react';
import { EdgesGeometry, LineBasicMaterial, LineSegments, Mesh, MeshBasicMaterial, OrthographicCamera, Vector3 } from 'three';
import type { KliniuStage } from './kliniu-sequence';

interface SceneProps { stage: KliniuStage; revision: number; reducedMotion: boolean; onReady: () => void; onError: () => void }

class ModelBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

function Showroom({ plan }: { plan: boolean }) {
  const { scene } = useGLTF('/models/workshop/kliniu-interactive-v4.glb');
  const { invalidate } = useThree();
  const model = useMemo(() => {
    const clone = scene.clone(true);
    const meshes: Mesh[] = [];
    clone.traverse(object => { if (object instanceof Mesh) meshes.push(object); });
    const entries = meshes.map(mesh => {
      const original = Array.isArray(mesh.material) ? mesh.material.map(material => material.clone()) : mesh.material.clone();
      const technical = new MeshBasicMaterial({ color: '#f2f5f0', polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
      const edges = new LineSegments(new EdgesGeometry(mesh.geometry, 12), new LineBasicMaterial({ color: '#43685f' }));
      mesh.add(edges);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return { mesh, original, technical, edges };
    });
    return { clone, entries };
  }, [scene]);
  useEffect(() => {
    for (const { mesh, original, technical, edges } of model.entries) {
      mesh.material = plan ? technical : original;
      edges.visible = plan;
    }
    invalidate();
  }, [plan, model, invalidate]);
  useEffect(() => () => {
    for (const { original, technical, edges } of model.entries) {
      [original].flat().forEach(material => material.dispose());
      technical.dispose(); edges.geometry.dispose(); edges.material.dispose();
    }
  }, [model]);
  return <primitive object={model.clone} dispose={null} />;
}

function SceneContent({ stage, revision, reducedMotion, onReady, onError }: SceneProps) {
  const { camera, size, invalidate, gl } = useThree();
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const moving = useRef(true);
  const initial = useRef(true);
  const target = useMemo(() => new Vector3(0, .7, 0), []);
  const position = useMemo(() => new Vector3(...(stage === 'plan' ? [3, 3.6, 5] : [2.8, 2.1, 5]) as [number, number, number]), [stage]);
  useEffect(() => { moving.current = true; invalidate(); }, [stage, revision, size, invalidate]);
  useEffect(() => {
    onReady();
    const lost = (event: Event) => { event.preventDefault(); onError(); };
    gl.domElement.addEventListener('webglcontextlost', lost);
    return () => gl.domElement.removeEventListener('webglcontextlost', lost);
  }, [gl, onReady, onError]);
  useFrame((_, delta) => {
    if (!moving.current || !controls.current || !(camera instanceof OrthographicCamera)) return;
    const step = reducedMotion || initial.current ? 1 : 1 - Math.exp(-7 * Math.min(delta, .05));
    const zoom = Math.min(size.width / 3.35, (size.height - 115) / 2.55);
    camera.position.lerp(position, step);
    camera.zoom += (zoom - camera.zoom) * step;
    camera.setViewOffset(size.width, size.height, 0, size.height * .075, size.width, size.height);
    camera.updateProjectionMatrix();
    controls.current.target.lerp(target, step);
    controls.current.update();
    initial.current = false;
    moving.current = camera.position.distanceTo(position) + Math.abs(camera.zoom - zoom) > .002;
    if (moving.current) invalidate();
  });
  return <>
    <color attach="background" args={['#e6e9e7']} />
    <ambientLight intensity={.4} /><hemisphereLight intensity={.7} args={['#ffffff', '#9aa99e']} />
    <directionalLight position={[-3, 5, 4]} intensity={2.8} castShadow={stage !== 'plan'} shadow-mapSize={[1024, 1024]} shadow-camera-left={-3} shadow-camera-right={3} shadow-camera-top={3} shadow-camera-bottom={-3} shadow-normalBias={.015} />
    <Environment resolution={128}>
      <color attach="background" args={['#bcc6c1']} />
      <Lightformer position={[-3,5,2]} rotation={[Math.PI / 2,0,0]} scale={[5,5,1]} intensity={3} />
      <Lightformer position={[4,2,0]} rotation={[0,-Math.PI / 2,0]} scale={[3,4,1]} intensity={2} />
      <Lightformer position={[0,2,5]} rotation={[0,Math.PI,0]} scale={[3,3,1]} intensity={1.5} />
    </Environment>
    <Showroom plan={stage === 'plan'} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0,-.004,0]} receiveShadow><planeGeometry args={[200,200]} /><meshStandardMaterial color="#e6e9e7" roughness={.85} /></mesh>
    <OrbitControls ref={controls} enablePan={false} enableZoom={false} enableDamping={!reducedMotion} minPolarAngle={.35} maxPolarAngle={1.42} minAzimuthAngle={-.8} maxAzimuthAngle={1.3} target={[0,.7,0]} />
  </>;
}

export function KliniuSequenceScene(props: SceneProps) {
  return <Canvas orthographic shadows frameloop="demand" dpr={[1,1.5]} camera={{ position:[2.8,2.1,5], zoom:100, near:.01, far:250 }} gl={{ antialias:true, alpha:false }} aria-label="Showroom interactivo de Kliniu"><ModelBoundary onError={props.onError}><Suspense fallback={null}><SceneContent {...props} /></Suspense></ModelBoundary></Canvas>;
}
