'use client';

import { Center, RoundedBox, Text3D } from '@react-three/drei';
import { useEffect, useMemo } from 'react';
import { ExtrudeGeometry } from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { PORTFOLIO_TECHNOLOGIES } from '../../../data/portfolio-technologies';
import { TECHNOLOGY_ICON_PATHS } from '../../../data/technology-icons';

function RaisedMark({ paths }: { paths: readonly string[] }) {
  const geometries = useMemo(() => {
    const svg = new SVGLoader().parse(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${paths.map((d) => `<path d="${d}"/>`).join('')}</svg>`,
    );
    return svg.paths.flatMap((path) =>
      SVGLoader.createShapes(path).map(
        (shape) =>
          new ExtrudeGeometry(shape, {
            depth: 0.45,
            bevelEnabled: true,
            bevelThickness: 0.08,
            bevelSize: 0.06,
            bevelSegments: 2,
            curveSegments: 8,
          }),
      ),
    );
  }, [paths]);
  useEffect(() => () => geometries.forEach((geometry) => geometry.dispose()), [geometries]);
  return (
    <group scale={[0.045, -0.045, 0.045]} position={[-0.54, 0.54, 0.196]}>
      {geometries.map((geometry, i) => (
        <mesh key={i} geometry={geometry} castShadow>
          <meshStandardMaterial color="#ffffff" roughness={0.35} metalness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

/** A real beveled mesh with an extruded brand mark, shared by the workshop and inspector. */
export function TechnologyEmblem({ technologyId }: { technologyId: string }) {
  const technology =
    PORTFOLIO_TECHNOLOGIES.find((item) => item.id === technologyId) ?? PORTFOLIO_TECHNOLOGIES[0]!;
  const paths = TECHNOLOGY_ICON_PATHS[technology.icon];
  return (
    <group>
      <RoundedBox args={[1.7, 1.7, 0.3]} radius={0.24} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial color="#adbbb4" metalness={0.7} roughness={0.32} />
      </RoundedBox>
      <RoundedBox
        args={[1.6, 1.6, 0.26]}
        position={[0, 0.015, 0.05]}
        radius={0.21}
        smoothness={4}
        castShadow
      >
        <meshPhysicalMaterial
          color={technology.color}
          roughness={0.3}
          metalness={0.23}
          clearcoat={0.5}
          clearcoatRoughness={0.4}
        />
      </RoundedBox>
      {paths ? (
        <RaisedMark paths={paths} />
      ) : (
        <Center position={[0, 0, 0.195]}>
          <Text3D
            font="/fonts/workshop-bold.typeface.json"
            size={technology.shortName.length > 3 ? 0.27 : 0.4}
            height={0.025}
            bevelEnabled
            bevelSize={0.003}
            bevelThickness={0.003}
          >
            {technology.shortName}
            <meshStandardMaterial color="#fff" roughness={0.3} metalness={0.2} />
          </Text3D>
        </Center>
      )}
    </group>
  );
}
