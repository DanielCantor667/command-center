'use client';

import { Environment, Lightformer } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect, useState } from 'react';

const ROOM_LIGHTS = [
  { id: 'kliniu', position: [-5.1, 2.7, -7.3], color: '#cfe6ff', intensity: 6 },
  { id: 'lorigine', position: [4.8, 2.7, -7], color: '#ffe0bd', intensity: 6 },
  { id: 'academy', position: [-8.1, 2.7, 5.7], color: '#ffd0a0', intensity: 5 },
  { id: 'drokex', position: [8.1, 2.7, 5.7], color: '#c4f0e6', intensity: 5 },
] as const;

/** 11.7: night mode (palette B). Only colours and intensities change, so the light count and shaders stay the same. */
const DAY = { ambient: .3, sky: '#fff3df', ground: '#687967', hemi: .8, sun: '#fff0d5', sunI: 2.7, desk: '#ffd5a1', deskI: 12, rooms: 1, env: 1 };
const NIGHT = { ambient: .1, sky: '#4a5f8f', ground: '#1b2335', hemi: .45, sun: '#9fb3d9', sunI: .5, desk: '#ffb15c', deskI: 16, rooms: 1.5, env: .3 };

export function WorkshopLighting({ night = false }: { night?: boolean }) {
  const look = night ? NIGHT : DAY;
  const { gl, invalidate, size } = useThree();
  // Keep the capture target for this visit. Replacing it on resize retains a
  // generated PMREM texture in Three 0.171; DPR and shadows still adapt below.
  const [reflectionResolution] = useState(() => size.width <= 700 ? 64 : 128);
  useEffect(() => {
    const previous = gl.shadowMap.autoUpdate;
    gl.shadowMap.autoUpdate = false;
    gl.shadowMap.needsUpdate = true;
    invalidate();
    return () => { gl.shadowMap.autoUpdate = previous; };
  }, [gl, invalidate, size.width, night]);
  return <>
    <ambientLight intensity={look.ambient} />
    <hemisphereLight args={[look.sky, look.ground, look.hemi]} />
    {/* Three retains an allocated shadow target; a new profile needs a new light. */}
    <directionalLight key={size.width <= 700 ? 'mobile' : 'desktop'} position={[-6, 11, 9]} color={look.sun} intensity={look.sunI} castShadow
      shadow-mapSize={size.width <= 700 ? [1024, 1024] : [2048, 2048]}
      shadow-camera-left={-16} shadow-camera-right={16} shadow-camera-top={16} shadow-camera-bottom={-16}
      shadow-camera-near={.5} shadow-camera-far={45} shadow-normalBias={.02} shadow-bias={-.0001}
      shadow-radius={4} shadow-blurSamples={12} />
    <pointLight position={[0, 4, -.8]} color={look.desk} intensity={look.deskI} distance={13} decay={2} />
    <pointLight position={[-5, 2.9, -6.5]} color="#ffe3b4" intensity={5} distance={8} decay={2} />
    {/* One warm/cool accent per room, always mounted so the light count never changes (no shader recompiles). */}
    {ROOM_LIGHTS.map(light => <pointLight key={light.id} position={light.position} color={light.color} intensity={light.intensity * look.rooms} distance={7} decay={2} />)}
    {/* Local reflection panels, generated once. No remote HDRI or preset download. */}
    <Environment key={night ? 'night' : 'day'} resolution={reflectionResolution} frames={1} environmentIntensity={look.env}>
      <Lightformer position={[0, 9, -2]} rotation={[Math.PI / 2, 0, 0]} scale={[18, 14, 1]} intensity={1.4} color="#fff3df" />
      <Lightformer position={[-12, 4, 1]} rotation={[0, Math.PI / 2, 0]} scale={[9, 6, 1]} intensity={1.1} color="#f2f7ed" />
      <Lightformer position={[0, 3, 18]} rotation={[0, Math.PI, 0]} scale={[12, 7, 1]} intensity={.8} color="#e7eddd" />
    </Environment>
  </>;
}
