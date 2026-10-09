'use client';

import { Box, DraftingCompass, Monitor, RotateCcw, X } from 'lucide-react';
import Image from 'next/image';
import { Component, lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react';
import styles from './kliniu-sequence.module.css';

export type KliniuStage = 'plan' | 'space' | 'product';
const Scene = lazy(() => import('./kliniu-sequence-scene').then(module => ({ default: module.KliniuSequenceScene })));
const stages = [
  { id: 'plan', label: 'Plano', icon: DraftingCompass, title: 'La estructura de una idea.', note: 'Estudio conceptual / geometría y proporción', image: '/experience/kliniu-plan-v4.webp', alt: 'Estudio de líneas del showroom de Kliniu' },
  { id: 'space', label: 'Espacio', icon: Box, title: 'La identidad toma forma.', note: 'Showroom conceptual / modelado en Blender', image: '/experience/kliniu-space-v4.webp', alt: 'Showroom conceptual de Kliniu, render de Blender' },
  { id: 'product', label: 'Producto', icon: Monitor, title: 'Una idea que se puede usar.', note: 'Ficha pública / producto digital en producción', image: '/projects/kliniu-tour-purchase.jpg', alt: 'Ficha real de producto de Kliniu' },
] as const;

class SceneBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export function KliniuSequence() {
  const [stage, setStage] = useState<KliniuStage>('plan');
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [revision, setRevision] = useState(0);
  const root = useRef<HTMLElement>(null);
  const active = stages.find(item => item.id === stage)!;
  const live = enabled && visible && !failed && stage !== 'product';
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReducedMotion(motion.matches);
    updateMotion();
    motion.addEventListener('change', updateMotion);
    const observer = new IntersectionObserver(([entry]) => setVisible(Boolean(entry?.isIntersecting)), { rootMargin: '100px' });
    if (root.current) observer.observe(root.current);
    return () => { observer.disconnect(); motion.removeEventListener('change', updateMotion); };
  }, []);
  useEffect(() => { if (!live) setReady(false); }, [live]);
  function enableScene() {
    try {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) { setFailed(true); return; }
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      setEnabled(true);
    } catch { setFailed(true); }
  }

  return <section ref={root} className={styles.sequence} aria-labelledby="kliniu-sequence-title" data-stage={stage}>
    <header className={styles.heading}><div><p>02 / El estudio</p><h2 id="kliniu-sequence-title">Del plano al producto.</h2></div><span>Kliniu / Estudio de identidad espacial</span></header>
    <div className={styles.toolbar}>
      <div className={styles.segments} role="group" aria-label="Etapas del proyecto">{stages.map((item, index) => <button key={item.id} type="button" aria-pressed={stage === item.id} aria-controls="kliniu-study" onClick={() => setStage(item.id)}><item.icon size={17} aria-hidden /><span>{String(index + 1).padStart(2, '0')} {item.label}</span></button>)}</div>
      <div className={styles.actions} inert={stage === 'product'} style={{ visibility: stage === 'product' ? 'hidden' : undefined }}>{enabled && !failed ? <><button type="button" onClick={() => setRevision(value => value + 1)} aria-label="Restablecer vista de Kliniu" title="Restablecer vista"><RotateCcw size={18} aria-hidden /></button><button type="button" onClick={() => setEnabled(false)} aria-label="Cerrar estudio 3D" title="Cerrar estudio 3D"><X size={18} aria-hidden /></button></> : !failed && <button type="button" onClick={enableScene}><Box size={17} aria-hidden />Explorar en 3D</button>}</div>
    </div>
    <div className={styles.stage} id="kliniu-study" data-live={live && ready}>
      <Image className={styles.poster} src={active.image} alt={active.alt} width={1600} height={1100} sizes="100vw" />
      {live && <div className={styles.canvas} style={{ opacity: ready ? 1 : 0 }}><SceneBoundary onError={() => setFailed(true)}><Suspense fallback={null}><Scene stage={stage} revision={revision} reducedMotion={reducedMotion} onReady={() => setReady(true)} onError={() => setFailed(true)} /></Suspense></SceneBoundary></div>}
      <div className={styles.caption} aria-live="polite"><span>{active.note}</span><h3>{active.title}</h3></div>
      {failed && <p className={styles.fallback} role="status">Vista estática. El 3D no está disponible en este dispositivo.</p>}
    </div>
  </section>;
}
