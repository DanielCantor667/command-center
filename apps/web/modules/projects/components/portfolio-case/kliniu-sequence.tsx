'use client';

import { Box, DraftingCompass, Monitor, RotateCcw, X } from 'lucide-react';
import Image from 'next/image';
import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import styles from './kliniu-sequence.module.css';
import { kliniuCopy } from './copy/kliniu';
import { useCaseCopy, usePick } from './copy/use-case-copy';

export type KliniuStage = 'plan' | 'space' | 'product';
const Scene = lazy(() => import('./kliniu-sequence-scene').then(module => ({ default: module.KliniuSequenceScene })));
const stages = [
  { id: 'plan', label: ['Plano', 'Plan'], icon: DraftingCompass, title: ['La estructura de una idea.', 'The structure of an idea.'], note: ['Estudio conceptual / geometría y proporción', 'Concept study / geometry and proportion'], image: '/experience/kliniu-plan-v4.webp', alt: ['Estudio de líneas del showroom de Kliniu', 'Line study of the Kliniu showroom'] },
  { id: 'space', label: ['Espacio', 'Space'], icon: Box, title: ['La identidad toma forma.', 'The identity takes shape.'], note: ['Showroom conceptual / modelado en Blender', 'Concept showroom / modeled in Blender'], image: '/experience/kliniu-space-v4.webp', alt: ['Showroom conceptual de Kliniu, render de Blender', 'Kliniu concept showroom, Blender render'] },
  { id: 'product', label: ['Producto', 'Product'], icon: Monitor, title: ['Una idea que se puede usar.', 'An idea people can use.'], note: ['Ficha pública / producto digital en producción', 'Public product page / digital product in production'], image: '/projects/kliniu-tour-purchase.jpg', alt: ['Ficha real de producto de Kliniu', 'Real Kliniu product page'] },
] as const;

class SceneBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}

export function KliniuSequence() {
  const c = useCaseCopy(kliniuCopy);
  const pick = usePick();
  const [stage, setStage] = useState<KliniuStage>('plan');
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [revision, setRevision] = useState(0);
  const root = useRef<HTMLElement>(null);
  const activation = useRef<HTMLButtonElement>(null);
  const closeControl = useRef<HTMLButtonElement>(null);
  const fallback = useRef<HTMLParagraphElement>(null);
  const active = stages.find(item => item.id === stage)!;
  const live = enabled && visible && !failed && stage !== 'product';
  const markReady = useCallback(() => setReady(true), []);
  const markFailed = useCallback(() => {
    setFailed(true);
    requestAnimationFrame(() => fallback.current?.focus({ preventScroll: true }));
  }, []);
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
      if (!gl) { markFailed(); return; }
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      setEnabled(true);
      requestAnimationFrame(() => closeControl.current?.focus({ preventScroll: true }));
    } catch { markFailed(); }
  }
  function close() {
    setEnabled(false);
    requestAnimationFrame(() => activation.current?.focus({ preventScroll: true }));
  }

  return <section ref={root} className={styles.sequence} aria-labelledby="kliniu-sequence-title" data-stage={stage}>
    <header className={styles.heading}><div><p>{c.ui02ElEstudio}</p><h2 id="kliniu-sequence-title">{c.uiDelPlanoAlProducto}</h2></div><span>{c.uiKliniuEstudioDeIdentidad}</span></header>
    <div className={styles.toolbar}>
      <div className={styles.segments} role="group" aria-label={c.uiEtapasDelProyecto}>{stages.map((item, index) => <button key={item.id} type="button" aria-pressed={stage === item.id} aria-controls="kliniu-study" onClick={() => setStage(item.id)}><item.icon size={17} aria-hidden /><span>{String(index + 1).padStart(2, '0')} {pick(item.label)}</span></button>)}</div>
      <div className={styles.actions} inert={stage === 'product'} style={{ visibility: stage === 'product' ? 'hidden' : undefined }}>{enabled && !failed ? <><button type="button" onClick={() => setRevision(value => value + 1)} aria-label={c.uiRestablecerVistaDeKliniu} title={c.uiRestablecerVista}><RotateCcw size={18} aria-hidden /></button><button ref={closeControl} type="button" onClick={close} aria-label={c.uiCerrarEstudio3d} title={c.uiCerrarEstudio3d}><X size={18} aria-hidden /></button></> : !failed && <button ref={activation} type="button" onClick={enableScene}><Box size={17} aria-hidden />{c.uiExplorarEn3d}</button>}</div>
    </div>
    <div className={styles.stage} id="kliniu-study" data-live={live && ready}>
      <Image className={styles.poster} src={active.image} alt={pick(active.alt)} width={1600} height={1100} sizes="100vw" />
      {live && <div className={styles.canvas} style={{ opacity: ready ? 1 : 0 }}><SceneBoundary onError={markFailed}><Suspense fallback={null}><Scene stage={stage} revision={revision} reducedMotion={reducedMotion} onReady={markReady} onError={markFailed} /></Suspense></SceneBoundary></div>}
      <div className={styles.caption} aria-live="polite"><span>{pick(active.note)}</span><h3>{pick(active.title)}</h3></div>
      {failed && <p ref={fallback} tabIndex={-1} className={styles.fallback} role="status">{c.uiVistaEstaticaEl3d}</p>}
    </div>
  </section>;
}
