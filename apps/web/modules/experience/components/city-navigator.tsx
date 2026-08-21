'use client';

import { Clone, OrbitControls, Sparkles, useGLTF } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Vector3, type Group, type MeshBasicMaterial } from 'three';
import { CITY_ASSETS, type CityDistrictAsset } from '../data/city-assets';

interface LandmarkLoadBoundaryProps {
  readonly assetPath: string;
  readonly children: ReactNode;
  readonly fallback: ReactNode;
}

interface LandmarkLoadBoundaryState {
  readonly hasError: boolean;
}

class LandmarkLoadBoundary extends Component<LandmarkLoadBoundaryProps, LandmarkLoadBoundaryState> {
  state: LandmarkLoadBoundaryState = { hasError: false };

  static getDerivedStateFromError(): LandmarkLoadBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error(
      `Unable to load city landmark at ${this.props.assetPath}; using procedural fallback.`,
      error,
    );
  }

  componentDidUpdate(previousProps: LandmarkLoadBoundaryProps) {
    if (previousProps.assetPath !== this.props.assetPath && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

function DistrictCrown({
  emissive,
  scale,
}: Pick<CityDistrictAsset, 'scale'> & { emissive: string }) {
  return (
    <mesh
      position={[0, 0.5, 0]}
      scale={[scale[0] * 0.52, 0.75, scale[2] * 0.52]}
      castShadow
      receiveShadow
    >
      <octahedronGeometry args={[0.55, 0]} />
      <meshStandardMaterial
        color="#0a2c20"
        emissive={emissive}
        emissiveIntensity={1.4}
        metalness={0.55}
        roughness={0.12}
      />
    </mesh>
  );
}

function CommandCenterFallback({ emissive }: { emissive: string }) {
  return (
    <group>
      <mesh position={[0, 0.66, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.34, 0.5, 0.96, 6]} />
        <meshStandardMaterial
          color="#0a2c20"
          emissive={emissive}
          emissiveIntensity={0.82}
          metalness={0.72}
          roughness={0.22}
        />
      </mesh>
      {[0.38, 0.69, 0.98].map((y) => (
        <mesh key={y} position={[0, y, 0]} castShadow receiveShadow>
          <torusGeometry args={[0.5, 0.026, 8, 6]} />
          <meshStandardMaterial
            color="#123d2c"
            emissive={emissive}
            emissiveIntensity={1.15}
            metalness={0.7}
            roughness={0.18}
          />
        </mesh>
      ))}
      <mesh position={[0, 1.23, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.34, 0.22, 6]} />
        <meshStandardMaterial
          color="#0b251b"
          emissive={emissive}
          emissiveIntensity={1.05}
          metalness={0.68}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}

function LoadedLandmarkModel({
  modelPath,
  transform,
}: {
  modelPath: string;
  transform: NonNullable<CityDistrictAsset['transform']>;
}) {
  const gltf = useGLTF(modelPath);

  return (
    <Clone
      object={gltf.scene}
      position={transform.position}
      rotation={transform.rotation}
      scale={transform.scale}
      castShadow
      receiveShadow
    />
  );
}

// Keep the wide hero light: all districts start at LOD1 and only request the
// detail mesh when the visitor deliberately moves close. The hysteresis keeps
// the model from thrashing while OrbitControls settles around the threshold.
const LOD0_ENTER_DISTANCE = 8.25;
const LOD1_EXIT_DISTANCE = 9.25;

function useDistrictModelPath(asset: CityDistrictAsset) {
  const [activeLod, setActiveLod] = useState<0 | 1>(() => (asset.lod1Path ? 1 : 0));
  const activeLodRef = useRef(activeLod);
  const landmarkPosition = useMemo(
    () => new Vector3(
      asset.position[0] + (asset.transform?.position[0] ?? 0),
      asset.position[1] + (asset.transform?.position[1] ?? 0),
      asset.position[2] + (asset.transform?.position[2] ?? 0),
    ),
    [asset.position, asset.transform?.position],
  );

  useEffect(() => {
    const nextLod = asset.lod1Path ? 1 : 0;
    activeLodRef.current = nextLod;
    setActiveLod(nextLod);
  }, [asset.lod0Path, asset.lod1Path]);

  useFrame(({ camera }) => {
    if (!asset.lod0Path || !asset.lod1Path) return;

    const threshold = activeLodRef.current === 1 ? LOD0_ENTER_DISTANCE : LOD1_EXIT_DISTANCE;
    const nextLod: 0 | 1 = camera.position.distanceToSquared(landmarkPosition) < threshold ** 2 ? 0 : 1;
    if (nextLod === activeLodRef.current) return;

    activeLodRef.current = nextLod;
    setActiveLod(nextLod);
  });

  return activeLod === 1 && asset.lod1Path ? asset.lod1Path : asset.lod0Path;
}

function LandmarkVisual({ asset, fallback }: { asset: CityDistrictAsset; fallback: ReactNode }) {
  const modelPath = useDistrictModelPath(asset);
  if (!modelPath || !asset.transform) return fallback;

  return (
    <LandmarkLoadBoundary assetPath={modelPath} fallback={fallback}>
      <Suspense fallback={fallback}>
        <LoadedLandmarkModel key={modelPath} modelPath={modelPath} transform={asset.transform} />
      </Suspense>
    </LandmarkLoadBoundary>
  );
}

function DistrictBeacon({
  pulsePeriodSeconds,
  active,
}: {
  pulsePeriodSeconds: number;
  active: boolean;
}) {
  const beacon = useRef<Group>(null);
  const material = useRef<MeshBasicMaterial>(null);

  useFrame(({ clock }, delta) => {
    const wave = (Math.sin((clock.getElapsedTime() / pulsePeriodSeconds) * Math.PI * 2) + 1) / 2;
    if (beacon.current) {
      beacon.current.rotation.y += delta * 0.15;
      beacon.current.scale.setScalar(1 + wave * 0.055 + (active ? 0.035 : 0));
    }
    if (material.current) material.current.opacity = 0.20 + wave * 0.22 + (active ? 0.24 : 0);
  });

  return (
    <group ref={beacon} position={[0, 0.39, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.57, 0.605, 6]} />
        <meshBasicMaterial
          ref={material}
          color="#5CFF9D"
          transparent
          opacity={0.32}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

const CITY_DRONE_ROUTES = [
  { radius: 3.95, altitude: 1.55, phase: 0, speed: 0.23 },
  { radius: 3.15, altitude: 1.15, phase: Math.PI, speed: 0.29 },
] as const;

function CityTrafficDrone({
  radius,
  altitude,
  phase,
  speed,
}: (typeof CITY_DRONE_ROUTES)[number]) {
  const drone = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!drone.current) return;
    const angle = clock.getElapsedTime() * speed + phase;
    drone.current.position.set(
      Math.cos(angle) * radius,
      altitude + Math.sin(angle * 2) * 0.08,
      Math.sin(angle) * radius * 0.65,
    );
    drone.current.rotation.y = -angle + Math.PI / 2;
  });

  return (
    <group ref={drone}>
      <mesh>
        <octahedronGeometry args={[0.085, 0]} />
        <meshStandardMaterial
          color="#17372a"
          emissive="#00D26A"
          emissiveIntensity={1.6}
          metalness={0.72}
          roughness={0.25}
        />
      </mesh>
      <pointLight color="#5CFF9D" intensity={1.4} distance={1.4} />
    </group>
  );
}

function CityTraffic() {
  return (
    <>
      {CITY_DRONE_ROUTES.map((route) => (
        <CityTrafficDrone key={route.phase} {...route} />
      ))}
    </>
  );
}

function District({ onSelect, ...asset }: CityDistrictAsset & { onSelect: (id: string) => void }) {
  const { id, position, scale, motion } = asset;
  const [hovered, setHovered] = useState(false);
  const emissive = id === 'command-center' ? '#53ffad' : '#16885d';
  const baseEmissiveIntensity = (id === 'command-center' ? 0.18 : 0.65) + (hovered ? 0.32 : 0);

  useEffect(() => () => {
    document.body.style.cursor = '';
  }, []);

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect(id);
  };
  const handlePointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };
  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = 'auto';
  };
  const fallback =
    id === 'command-center' ? (
      <CommandCenterFallback emissive={emissive} />
    ) : (
      <DistrictCrown emissive={emissive} scale={scale} />
    );

  return (
    <group
      position={position}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <mesh scale={scale} castShadow receiveShadow>
        <cylinderGeometry args={[1, 1.14, 0.34, 6]} />
        <meshStandardMaterial
          color="#061710"
          emissive={emissive}
          emissiveIntensity={baseEmissiveIntensity}
          metalness={0.82}
          roughness={0.28}
        />
      </mesh>
      <LandmarkVisual asset={asset} fallback={fallback} />
      <DistrictBeacon pulsePeriodSeconds={motion.pulsePeriodSeconds} active={hovered} />
    </group>
  );
}

export function CityNavigator({ onProjectSelect }: { onProjectSelect: (id: string) => void }) {
  const stars = useMemo(() => [0.8, 1.2, 1.8] as const, []);
  return (
    <div
      aria-label="Mapa 3D interactivo de distritos de proyectos"
      role="application"
      className="h-full w-full"
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [6.5, 6.5, 8], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      >
        <color attach="background" args={['#020807']} />
        <fogExp2 attach="fog" args={['#020807', 0.032]} />
        <ambientLight intensity={0.55} />
        <directionalLight position={[-4, 7, 5]} intensity={1.6} color="#d5e1dc" />
        <pointLight position={[0, 5, 0]} intensity={14} color="#42f59a" distance={12} />
        <pointLight position={[4, 2, -2]} intensity={8} color="#5c8977" distance={8} />
        <gridHelper args={[12, 18, '#1a6b49', '#0a271d']} position={[0, -0.25, 0]} />
        {CITY_ASSETS.map((district) => (
          <District key={district.id} {...district} onSelect={onProjectSelect} />
        ))}
        {stars.map((size) => (
          <Sparkles
            key={size}
            count={18}
            scale={[11, 5, 11]}
            size={size}
            speed={0.18}
            color="#77ffc0"
          />
        ))}
        <CityTraffic />
        <OrbitControls
          enablePan={false}
          minDistance={7}
          maxDistance={14}
          minPolarAngle={0.65}
          maxPolarAngle={1.25}
        />
      </Canvas>
    </div>
  );
}
