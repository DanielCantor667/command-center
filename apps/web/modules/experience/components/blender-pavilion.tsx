'use client';

import { useGLTF } from '@react-three/drei';
import { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Mesh, MeshStandardMaterial } from 'three';

const models: Record<string, string> = {
  kliniu: 'kliniu',
  '4ustudio-academy': 'academy',
  lorigine: 'lorigine',
  drokex: 'drokex',
  stage: 'stage',
};

export function BlenderPavilion({ projectId, active = false, exploded = false, night = false, reducedMotion = false }: {
  projectId: string; active?: boolean; exploded?: boolean; night?: boolean; reducedMotion?: boolean;
}) {
  const { invalidate } = useThree();
  const version = projectId === 'stage' ? 'realistic-v1' : ['kliniu', 'lorigine', 'academy', 'drokex'].includes(projectId) ? 'interactive-v4' : 'interactive-v3';
  const { scene } = useGLTF(`/models/workshop/${models[projectId]}-${version}.glb`);
  const model = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((object) => {
      if (object instanceof Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
        object.material = Array.isArray(object.material)
          ? object.material.map(material => material.clone()) : object.material.clone();
      }
    });
    return clone;
  }, [scene]);
  const parts = useMemo(() => model.children.map(object => ({ object, position: object.position.clone() })), [model]);
  const materials = useMemo(() => {
    const result: MeshStandardMaterial[] = [];
    model.traverse(object => {
      if (object instanceof Mesh) for (const material of [object.material].flat()) {
        if (material instanceof MeshStandardMaterial) result.push(material);
      }
    });
    return result;
  }, [model]);
  useEffect(() => () => materials.forEach(material => material.dispose()), [materials]);
  useEffect(() => { invalidate(); }, [active, exploded, night, reducedMotion, invalidate]);
  useFrame((_, delta) => {
    const step = reducedMotion ? 1 : 1 - Math.exp(-6 * Math.min(delta, .05));
    let moving = false;
    for (const { object, position } of parts) {
      const layer = object.name.replace(/_\d+$/, '');
      const lift = exploded ? ({ roof: 1.25, facade: .3, interior: .15, feature: .15 }[layer] ?? 0) :
        active && layer === 'feature' ? (projectId === '4ustudio-academy' ? -.025 : .07) : 0;
      const forward = exploded && layer === 'facade' ? .65 : 0;
      const y = position.y + lift;
      const z = position.z + forward;
      object.position.y += (y - object.position.y) * step;
      object.position.z += (z - object.position.z) * step;
      moving ||= Math.abs(y - object.position.y) + Math.abs(z - object.position.z) > .0001;
    }
    for (const material of materials) {
      const luminous = material.name.includes('warm') || material.name.includes('screen');
      if (!luminous) continue;
      const strength = night ? 4 : active ? 1.8 : .25;
      material.emissive.set('#ffd39a');
      material.emissiveIntensity += (strength - material.emissiveIntensity) * step;
      moving ||= Math.abs(strength - material.emissiveIntensity) > .001;
    }
    if (moving) invalidate();
  });

  return <group><primitive object={model} dispose={null} />
    {projectId !== 'stage' && <pointLight position={[0, .95, .1]} color="#ffc486" intensity={night ? 1.4 : active ? .35 : 0} distance={2.6} decay={2} />}
  </group>;
}
