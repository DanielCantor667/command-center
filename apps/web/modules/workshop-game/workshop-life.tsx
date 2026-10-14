'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import { AdditiveBlending, BufferAttribute, BufferGeometry, CanvasTexture, Points, PointsMaterial } from 'three';
import { ambient } from './ambient';

const FPS = 30;
const SPREAD = { x: [-8.5, 8.5], y: [.25, 4.2], z: [-8.8, 7.5] } as const;

function dustTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 32;
  const context = canvas.getContext('2d')!;
  const glow = context.createRadialGradient(16, 16, 0, 16, 16, 16);
  glow.addColorStop(0, 'rgba(255,244,224,1)');
  glow.addColorStop(1, 'rgba(255,244,224,0)');
  context.fillStyle = glow;
  context.fillRect(0, 0, 32, 32);
  return new CanvasTexture(canvas);
}

function Dust({ count }: { count: number }) {
  const { points, seeds } = useMemo(() => {
    const seeds = Float32Array.from({ length: count * 4 }, () => Math.random());
    const position = new Float32Array(count * 3);
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(position, 3));
    const material = new PointsMaterial({ map: dustTexture(), size: .05, transparent: true, opacity: .32, depthWrite: false, blending: AdditiveBlending, fog: false });
    const points = new Points(geometry, material);
    points.frustumCulled = false;
    // drei's Html occlusion raycasts the whole scene; Points have a 1 m hit threshold and would hide every screen.
    points.raycast = () => {};
    return { points, seeds };
  }, [count]);
  useEffect(() => () => { points.geometry.dispose(); (points.material as PointsMaterial).map?.dispose(); (points.material as PointsMaterial).dispose(); }, [points]);
  useFrame(() => {
    const t = ambient.time.value;
    const attribute = points.geometry.getAttribute('position') as BufferAttribute;
    for (let i = 0; i < count; i++) {
      const [a, b, c, d] = [seeds[i * 4]!, seeds[i * 4 + 1]!, seeds[i * 4 + 2]!, seeds[i * 4 + 3]!];
      attribute.setXYZ(i,
        SPREAD.x[0] + a * (SPREAD.x[1] - SPREAD.x[0]) + Math.sin(t * .11 + d * 6.3) * .35,
        SPREAD.y[0] + ((b * (SPREAD.y[1] - SPREAD.y[0]) + t * (.012 + d * .02)) % (SPREAD.y[1] - SPREAD.y[0])),
        SPREAD.z[0] + c * (SPREAD.z[1] - SPREAD.z[0]) + Math.cos(t * .09 + a * 6.3) * .35);
    }
    attribute.needsUpdate = true;
  });
  return <primitive object={points} />;
}

/**
 * Dust in the light and leaf sway. The loop is demand-based like the rest of the
 * scene: a 30 fps timer requests frames, and nothing runs when motion is off.
 */
export function AmbientLife({ reducedMotion, suspended }: { reducedMotion: boolean; suspended: boolean }) {
  const { invalidate, size } = useThree();
  const active = !reducedMotion && !suspended;
  useEffect(() => {
    ambient.enabled = active;
    if (!active) { invalidate(); return; }
    const timer = window.setInterval(() => invalidate(), 1000 / FPS);
    return () => { window.clearInterval(timer); ambient.enabled = false; };
  }, [active, invalidate]);
  useFrame(state => { if (ambient.enabled) ambient.time.value = state.clock.elapsedTime; });
  return active ? <Dust count={size.width <= 700 ? 40 : 90} /> : null;
}
