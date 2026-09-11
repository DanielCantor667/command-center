'use client';

import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Component, useEffect, useState, type ReactNode } from 'react';
import type { CityNavigatorProps } from './city-navigator';
import styles from '../experience.module.css';

const CityNavigator = dynamic(() => import('./city-navigator').then((module) => module.CityNavigator), {
  ssr: false,
  loading: () => <div className={styles.scenePrompt} role="status"><p>Preparando la ciudad…</p></div>,
});

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? <div className={styles.scenePrompt} role="status"><p>La vista 3D no está disponible en este navegador. Puedes explorar todos los proyectos desde la lista.</p></div> : this.props.children;
  }
}

function supportsWebGL() {
  try {
    const context = document.createElement('canvas').getContext('webgl2');
    if (!context) return false;
    context.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch { return false; }
}

export function CityNavigatorLoader(props: CityNavigatorProps) {
  const [unavailable, setUnavailable] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReducedMotion(motion.matches);
    updateMotion();
    motion.addEventListener('change', updateMotion);
    if (window.matchMedia('(min-width: 801px)').matches) {
      const supported = supportsWebGL();
      setEnabled(supported);
      setUnavailable(!supported);
    }
    setReady(true);
    return () => motion.removeEventListener('change', updateMotion);
  }, []);

  if (unavailable) return <div className={styles.scenePrompt} role="status" aria-live="polite"><p>La vista 3D no está disponible en este navegador. Puedes explorar todos los proyectos desde la lista.</p></div>;

  if (!enabled) return <div className={styles.scenePrompt} aria-busy={!ready}>
    <Image src="/experience/city-workshop-lorigine.png" alt="Maqueta de la ciudad de proyectos" fill sizes="800px" className={styles.scenePoster} />
    <p className={styles.sceneActivation}>{ready ? 'Los proyectos también tienen un lugar en esta maqueta.' : 'Preparando la ciudad…'}</p>
    {ready && <button type="button" className={styles.sceneActivation} onClick={() => { const supported = supportsWebGL(); setEnabled(supported); setUnavailable(!supported); }}>Explorar en 3D</button>}
  </div>;

  return <SceneBoundary><CityNavigator {...props} reducedMotion={reducedMotion} /></SceneBoundary>;
}
