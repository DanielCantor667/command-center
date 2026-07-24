'use client';

import type { Scene } from '@command-center/ai-renderer';
import { Text } from '@react-three/drei';

interface Zone {
  id: string;
  label: string;
  color: string;
  x: number;
  z: number;
  width: number;
  depth: number;
}

function Wall({ position, size }: { position: [number, number, number]; size: [number, number, number] }) {
  return (
    <mesh position={position}>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#334155" transparent opacity={0.34} roughness={0.85} depthWrite={false} />
    </mesh>
  );
}

function OfficeShell({ width, depth, x, z }: { width: number; depth: number; x: number; z: number }) {
  const height = 3;
  const doorWidth = Math.min(2.4, width / 3);
  const sideWidth = (width - doorWidth) / 2;
  return (
    <group>
      <Wall position={[x, height / 2, z - depth / 2]} size={[width, height, 0.14]} />
      <Wall position={[x - width / 2, height / 2, z]} size={[0.14, height, depth]} />
      <Wall position={[x + width / 2, height / 2, z]} size={[0.14, height, depth]} />
      <Wall position={[x - (doorWidth + sideWidth) / 2, height / 2, z + depth / 2]} size={[sideWidth, height, 0.14]} />
      <Wall position={[x + (doorWidth + sideWidth) / 2, height / 2, z + depth / 2]} size={[sideWidth, height, 0.14]} />
      <mesh position={[x, 0.02, z + depth / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[doorWidth, 0.8]} />
        <meshBasicMaterial color="#22c55e" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

function bounds(scene: Scene, ids: string[], padding: number): Zone | null {
  const objects = scene.objects.filter((object) => ids.includes(object.asset));
  if (objects.length === 0) return null;
  const xs = objects.map((object) => object.transform.position.x);
  const zs = objects.map((object) => object.transform.position.z);
  const minX = Math.min(...xs) - padding;
  const maxX = Math.max(...xs) + padding;
  const minZ = Math.min(...zs) - padding;
  const maxZ = Math.max(...zs) + padding;
  return { id: ids.join('-'), label: '', color: '', x: (minX + maxX) / 2, z: (minZ + maxZ) / 2, width: maxX - minX, depth: maxZ - minZ };
}

function zonesFromAsset(scene: Scene, asset: string, label: string, color: string, width: number, depth: number): Zone[] {
  return scene.objects.filter((candidate) => candidate.asset === asset).map((object) => ({
    id: `${object.id}-zone`, label, color, x: object.transform.position.x, z: object.transform.position.z, width, depth,
  }));
}

export function OfficeFloorPlan({ scene }: { scene: Scene }) {
  const workspace = bounds(scene, ['desk', 'chair', 'computer'], 1.4);
  const office = scene.objects.find((object) => object.asset === 'office');
  const officeWidth = Math.max(12, (office?.transform.scale ?? 1) * 10);
  const officeDepth = officeWidth;
  const officeX = office?.transform.position.x ?? 0;
  const officeZ = office?.transform.position.z ?? 0;
  const zones: Zone[] = [
    workspace && { ...workspace, id: 'workspace', label: 'Open workspace', color: '#2563eb' },
    ...zonesFromAsset(scene, 'reception', 'Reception', '#16a34a', 5, 4),
    ...zonesFromAsset(scene, 'meeting_room', 'Meeting room', '#7c3aed', 5, 4),
    ...zonesFromAsset(scene, 'rack', 'Support', '#f59e0b', 3, 3),
  ].filter((zone): zone is Zone => Boolean(zone));

  return (
    <group>
      <OfficeShell width={officeWidth} depth={officeDepth} x={officeX} z={officeZ} />
      {zones.map((zone) => (
        <group key={zone.id}>
          <mesh position={[zone.x, 0.012, zone.z]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[zone.width, zone.depth]} />
            <meshBasicMaterial color={zone.color} transparent opacity={0.14} depthWrite={false} />
          </mesh>
          <Text position={[zone.x, 0.035, zone.z]} rotation={[-Math.PI / 2, 0, 0]} fontSize={0.35} color={zone.color} anchorX="center" anchorY="middle">
            {zone.label.toUpperCase()}
          </Text>
        </group>
      ))}
    </group>
  );
}
