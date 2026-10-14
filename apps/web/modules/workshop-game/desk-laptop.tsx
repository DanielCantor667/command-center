'use client';
import { useThree } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import { CanvasTexture, SRGBColorSpace } from 'three';
import { OptionalBoundary } from './workshop-props';

/**
 * A generic laptop (no logo) whose screen shows an abstract code editor: coloured
 * bars only, no readable text. Built in code, so it costs no credits and carries no mark.
 */
const PALETTE = ['#8fb8a2', '#d9b56c', '#9bb6d9', '#c98f8f', '#cfd6cc'];

function editorTexture() {
  const w = 512; const h = 320;
  const canvas = document.createElement('canvas'); canvas.width = w; canvas.height = h;
  const g = canvas.getContext('2d')!;
  let seed = 11;
  const rand = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
  g.fillStyle = '#1b2521'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#141b18'; g.fillRect(0, 0, w, 22); g.fillRect(0, 22, 84, h - 22);
  [0, 1, 2].forEach(i => { g.fillStyle = ['#c98f8f', '#d9b56c', '#8fb8a2'][i]!; g.beginPath(); g.arc(14 + i * 16, 11, 4, 0, Math.PI * 2); g.fill(); });
  for (let i = 0; i < 9; i++) { g.fillStyle = i === 2 ? '#8fb8a2' : '#55645c'; g.fillRect(12 + (i % 3) * 6, 38 + i * 22, 28 + rand() * 30, 6); }
  g.fillStyle = '#26332d'; g.fillRect(96, 30, 90, 18); g.fillRect(190, 30, 90, 18);
  g.fillStyle = '#1b2521'; g.fillRect(96, 30, 90, 18);
  for (let line = 0; line < 17; line++) {
    const y = 64 + line * 14;
    g.fillStyle = '#44534b'; g.fillRect(100, y, 10, 5);
    let x = 122 + (line % 4 === 1 || line % 4 === 2 ? 16 : 0) * (line % 3 ? 1 : 2);
    const segments = 2 + Math.floor(rand() * 4);
    for (let s = 0; s < segments; s++) {
      const len = 18 + rand() * 70;
      g.fillStyle = PALETTE[Math.floor(rand() * PALETTE.length)]!;
      g.fillRect(x, y, len, 5); x += len + 8;
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace; texture.anisotropy = 8;
  return texture;
}

function Laptop({ position, turn }: { position: [number, number, number]; turn: number }) {
  const texture = useMemo(editorTexture, []);
  const { gl, invalidate } = useThree();
  useEffect(() => { gl.shadowMap.needsUpdate = true; invalidate(); return () => texture.dispose(); }, [gl, invalidate, texture]);
  const tilt = -.32;
  return <group position={position} rotation={[0, turn, 0]}>
    <mesh position={[0, .006, 0]} castShadow receiveShadow><boxGeometry args={[.34, .012, .23]} /><meshStandardMaterial color="#b9beb7" metalness={.55} roughness={.4} /></mesh>
    <mesh position={[0, .0126, -.025]}><planeGeometry args={[.3, .11]} /><meshStandardMaterial color="#262c29" roughness={.8} /></mesh>
    <group position={[0, .012, -.115]} rotation={[tilt, 0, 0]}>
      <mesh position={[0, .11, 0]} castShadow><boxGeometry args={[.34, .22, .008]} /><meshStandardMaterial color="#b9beb7" metalness={.55} roughness={.4} /></mesh>
      <mesh position={[0, .11, .0045]}><planeGeometry args={[.31, .194]} /><meshBasicMaterial map={texture} toneMapped={false} /></mesh>
    </group>
  </group>;
}

export function DeskLaptop(props: { position: [number, number, number]; turn: number }) {
  return <OptionalBoundary><Laptop {...props} /></OptionalBoundary>;
}
