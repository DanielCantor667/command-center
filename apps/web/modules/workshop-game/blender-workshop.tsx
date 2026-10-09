'use client';

import { Html, useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { Group } from 'three';
import { cloneWorkshopModel } from './model-instance';
import { ROOM_IDS, WORKSHOP_ROOMS, roomForPoint, type RoomId } from './rooms';
import { ENTRY_DOOR, WORKSHOP_RESOURCE_URLS } from './workshop-assets';
import { StationGeometry } from './station-geometry';
import { workshopHitAt } from './workshop-hit';
import type { WorldPoint } from './world-state';
import styles from './workshop-game.module.css';

/** The cache owns source geometry and materials; each instance only owns its Object3D clone. */
function useWorkshopModels() {
  const resources = useGLTF(WORKSHOP_RESOURCE_URLS);
  return useMemo(() => {
    const models = resources.map(resource => cloneWorkshopModel(resource.scene));
    return { shell: models[0]!, door: models[1]!, stations: models[2]! };
  }, [resources]);
}

export function BlenderWorkshop({ opened, point, reducedMotion, onGo, openRooms, suspended }: {
  opened: boolean; point: WorldPoint; reducedMotion: boolean; openRooms: RoomId[]; suspended: boolean; onGo: (point: WorldPoint) => void;
}) {
  const { shell, door, stations } = useWorkshopModels();
  const slidingDoor = useRef<Group>(null);
  const { gl, invalidate } = useThree();
  useEffect(() => invalidate(), [opened, reducedMotion, invalidate]);
  const openKey = openRooms.join(',');
  useEffect(() => {
    for (const id of ROOM_IDS) { const gate = shell.getObjectByName(`roomgate__${id}`); if (gate) gate.visible = !openKey.split(',').includes(id); }
    gl.shadowMap.needsUpdate = true; invalidate();
  }, [shell, gl, invalidate, openKey]);
  useFrame((_, delta) => {
    if (suspended) return;
    if (!slidingDoor.current) return;
    const destination = opened ? ENTRY_DOOR.openX : ENTRY_DOOR.position[0];
    const remaining = destination - slidingDoor.current.position.x;
    if (Math.abs(remaining) < .003) return;
    slidingDoor.current.position.x += remaining * (reducedMotion ? 1 : 1 - Math.exp(-5 * Math.min(delta, .06)));
    gl.shadowMap.needsUpdate = true;
    invalidate();
  });

  return <group>
    <group onClick={event => {
      event.stopPropagation();
      if (event.delta >= 5) return;
      const destination = event.object.name.startsWith('roomgate__') ? roomForPoint(event.object.name.slice(10)) : workshopHitAt(event.point);
      if (destination) onGo(destination);
    }}>
      <primitive object={shell} dispose={null} />
    </group>
    <group ref={slidingDoor} position={ENTRY_DOOR.position}><primitive object={door} dispose={null} /></group>
    <StationGeometry model={stations} point={point} onGo={onGo} />
    {point !== 'workbench' && <Html position={[0, 1.25, .5]} occlude center distanceFactor={4}>
      <button className={styles.hotspot} onClick={() => onGo('workbench')}>Mesa de trabajo</button>
    </Html>}
    {ROOM_IDS.filter(id => id !== point).map(id => <Html key={id} position={WORKSHOP_ROOMS[id].portal} occlude center distanceFactor={4}>
      <button className={styles.hotspot} onClick={() => onGo(id)}>Entrar a {WORKSHOP_ROOMS[id].name}</button>
    </Html>)}
  </group>;
}
