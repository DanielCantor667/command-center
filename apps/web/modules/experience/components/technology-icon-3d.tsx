'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Component, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Group } from 'three';
import { TechnologyEmblem } from './technology-emblem';

class IconBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
function Badge({ id, reduced }: { id: string; reduced: boolean }) {
  const group = useRef<Group>(null);
  const progress = useRef(0);
  const { invalidate } = useThree();
  useEffect(() => {
    progress.current = reduced ? 1 : 0;
    invalidate();
  }, [id, reduced, invalidate]);
  useFrame((_, delta) => {
    if (!group.current) return;
    progress.current = Math.min(1, progress.current + delta * 2);
    const eased = 1 - (1 - progress.current) ** 3;
    group.current.rotation.y = -0.25 - (1 - eased) * 0.7;
    group.current.rotation.x = 0.14;
    if (progress.current < 1) invalidate();
  });
  return (
    <group ref={group}>
      <TechnologyEmblem technologyId={id} />
    </group>
  );
}
export function TechnologyIcon3D({
  id,
  name,
  fallback,
}: {
  id: string;
  name: string;
  fallback: ReactNode;
}) {
  const [supported, setSupported] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(motion.matches);
    update();
    motion.addEventListener('change', update);
    try {
      const gl = document.createElement('canvas').getContext('webgl2');
      setSupported(!!gl);
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
    } catch {
      setSupported(false);
    }
    const observer = new IntersectionObserver(([entry]) => setVisible(!!entry?.isIntersecting), {
      rootMargin: '0px',
    });
    if (root.current) observer.observe(root.current);
    return () => {
      observer.disconnect();
      motion.removeEventListener('change', update);
    };
  }, []);
  return (
    <div
      ref={root}
      style={{ width: '100%', height: '100%' }}
      role="img"
      aria-label={`Pieza 3D de ${name}`}
    >
      {supported && visible ? (
        <IconBoundary fallback={fallback}>
          <Canvas
            shadows
            orthographic
            frameloop="demand"
            dpr={[1, 1.5]}
            camera={{ position: [0, 0, 6], zoom: 90 }}
            gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
          >
            <ambientLight intensity={1.6} />
            <directionalLight position={[-3, 4, 5]} intensity={3} />
            <directionalLight position={[3, 1, 2]} intensity={1.8} color="#b4d6e5" />
            <Suspense fallback={null}>
              <Badge id={id} reduced={reduced} />
            </Suspense>
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              enableDamping={!reduced}
              minPolarAngle={0.7}
              maxPolarAngle={2.3}
            />
          </Canvas>
        </IconBoundary>
      ) : (
        fallback
      )}
    </div>
  );
}
