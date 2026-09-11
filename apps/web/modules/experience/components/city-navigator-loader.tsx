'use client';

import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Component, useEffect, useRef, useState, type ReactNode } from 'react';
import type { CityNavigatorProps } from './city-navigator';
import styles from '../experience.module.css';

const CityNavigator = dynamic(
  () => import('./city-navigator').then((module) => module.CityNavigator),
  {
    ssr: false,
    loading: () => (
      <div className={styles.scenePrompt} role="status">
        <p>Preparando el taller…</p>
      </div>
    ),
  },
);
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className={styles.scenePrompt} role="status">
        <p>
          La maqueta no está disponible. Puedes recorrer todos los proyectos y tecnologías desde sus
          listas.
        </p>
      </div>
    ) : (
      this.props.children
    );
  }
}
function supportsWebGL() {
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}
export function CityNavigatorLoader(props: CityNavigatorProps) {
  const [unavailable, setUnavailable] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(motion.matches);
    update();
    motion.addEventListener('change', update);
    if (window.matchMedia('(min-width: 801px)').matches) {
      const supported = supportsWebGL();
      setEnabled(supported);
      setUnavailable(!supported);
    }
    setReady(true);
    const observer = new IntersectionObserver(([entry]) => setVisible(!!entry?.isIntersecting), {
      rootMargin: '100px',
    });
    if (container.current) observer.observe(container.current);
    return () => {
      observer.disconnect();
      motion.removeEventListener('change', update);
    };
  }, []);
  return (
    <div ref={container} style={{ height: '100%', width: '100%', position: 'relative' }}>
      {unavailable ? (
        <div className={styles.scenePrompt} role="status">
          <Image
            src="/experience/workshop-preview.png"
            alt="Maqueta del taller de Daniel"
            fill
            sizes="(max-width:800px) 100vw, 75vw"
            className={styles.scenePoster}
          />
          <p className={styles.sceneActivation}>
            Tu navegador no dispone de esta vista 3D. Los proyectos y las tecnologías siguen
            disponibles en las listas.
          </p>
        </div>
      ) : enabled && visible ? (
        <SceneBoundary>
          <CityNavigator {...props} reducedMotion={reducedMotion} />
        </SceneBoundary>
      ) : (
        <div className={styles.scenePrompt} aria-busy={!ready}>
          <Image
            src="/experience/workshop-preview.png"
            alt="Maqueta del taller de Daniel con sus cuatro proyectos"
            fill
            sizes="(max-width:800px) 100vw, 75vw"
            className={styles.scenePoster}
          />
          <p className={styles.sceneActivation}>
            {ready ? 'Los proyectos tienen un lugar en este taller.' : 'Preparando el taller…'}
          </p>
          {ready && !enabled && (
            <button
              className={styles.sceneActivation}
              type="button"
              onClick={() => {
                const supported = supportsWebGL();
                setEnabled(supported);
                setUnavailable(!supported);
              }}
            >
              Explorar en 3D
            </button>
          )}
        </div>
      )}
      {enabled && !unavailable && (
        <button type="button" className={styles.sceneClose} onClick={() => setEnabled(false)}>
          Cerrar vista 3D
        </button>
      )}
    </div>
  );
}
