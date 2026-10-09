'use client';

import Image from 'next/image';
import { Box, Columns3, Focus, Monitor, RotateCcw, X } from 'lucide-react';
import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import styles from './lorigine-gallery.module.css';

export type LorigineView = 'gallery' | 'detail' | 'site';
const Scene = lazy(() =>
  import('./lorigine-gallery-scene').then((module) => ({ default: module.LorigineGalleryScene })),
);
const views = [
  {
    id: 'gallery',
    label: 'Galería',
    icon: Columns3,
    image: '/experience/lorigine-gallery-v4.webp',
    alt: 'Galería conceptual de L’ORIGINE, render de Blender',
    title: 'La identidad, en el espacio.',
    note: 'Estudio conceptual de marca. No representa una tienda física.',
  },
  {
    id: 'detail',
    label: 'Detalle',
    icon: Focus,
    image: '/experience/lorigine-detail-v4.webp',
    alt: 'Detalle conceptual de los envases L’ORIGINE, render de Blender',
    title: 'El carácter está en los detalles.',
    note: 'Piedra, ámbar y metal. Interpretación del catálogo de la marca.',
  },
  {
    id: 'site',
    label: 'Sitio',
    icon: Monitor,
    image: '/projects/lorigine-product-v4.webp',
    alt: 'Ficha pública de L’ORIGINE',
    title: 'El producto, en su contexto real.',
    note: 'Captura pública del 18 de septiembre de 2026.',
  },
] as const;

class SceneBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function LorigineGallery() {
  const [view, setView] = useState<LorigineView>('gallery');
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [revision, setRevision] = useState(0);
  const root = useRef<HTMLElement>(null);
  const activation = useRef<HTMLButtonElement>(null);
  const active = views.find((item) => item.id === view)!;
  const live = enabled && visible && !failed && view !== 'site';
  const markReady = useCallback(() => setReady(true), []);
  const markFailed = useCallback(() => setFailed(true), []);
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotion = () => setReducedMotion(motion.matches);
    syncMotion();
    motion.addEventListener('change', syncMotion);
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(Boolean(entry?.isIntersecting)),
      { rootMargin: '100px' },
    );
    if (root.current) observer.observe(root.current);
    return () => {
      observer.disconnect();
      motion.removeEventListener('change', syncMotion);
    };
  }, []);
  useEffect(() => {
    if (!live) setReady(false);
  }, [live]);
  function enable() {
    try {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) {
        setFailed(true);
        return;
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      setEnabled(true);
    } catch {
      setFailed(true);
    }
  }
  function close() {
    setEnabled(false);
    requestAnimationFrame(() => activation.current?.focus({ preventScroll: true }));
  }

  return (
    <section
      ref={root}
      id="lorigine-gallery"
      className={styles.gallery}
      aria-labelledby="lorigine-gallery-title"
      data-view={view}
    >
      <header className={styles.heading}>
        <h2 id="lorigine-gallery-title">Una marca, tres perspectivas.</h2>
        <span>L’ORIGINE / Estudio de marca</span>
      </header>
      <div className={styles.toolbar}>
        <div role="group" aria-label="Perspectivas de L’ORIGINE" className={styles.views}>
          {views.map((item) => (
            <button
              type="button"
              key={item.id}
              aria-pressed={view === item.id}
              aria-controls="lorigine-study"
              onClick={() => setView(item.id)}
            >
              <item.icon size={17} aria-hidden />
              {item.label}
            </button>
          ))}
        </div>
        <div
          className={styles.actions}
          inert={view === 'site'}
          style={{ visibility: view === 'site' ? 'hidden' : undefined }}
        >
          {enabled && !failed ? (
            <>
              <button
                type="button"
                aria-label="Restablecer galería"
                title="Restablecer vista"
                onClick={() => setRevision((value) => value + 1)}
              >
                <RotateCcw size={18} aria-hidden />
              </button>
              <button
                type="button"
                aria-label="Cerrar galería 3D"
                title="Cerrar galería 3D"
                onClick={close}
              >
                <X size={18} aria-hidden />
              </button>
            </>
          ) : (
            !failed && (
              <button ref={activation} type="button" onClick={enable}>
                <Box size={17} aria-hidden />
                Explorar galería en 3D
              </button>
            )
          )}
        </div>
      </div>
      <div id="lorigine-study" className={styles.stage} data-live={live && ready}>
        <Image className={styles.poster} src={active.image} alt={active.alt} fill sizes="100vw" />
        {live && (
          <div className={styles.canvas} style={{ opacity: ready ? 1 : 0 }}>
            <SceneBoundary onError={markFailed}>
              <Suspense fallback={null}>
                <Scene
                  view={view}
                  revision={revision}
                  reducedMotion={reducedMotion}
                  onReady={markReady}
                  onError={markFailed}
                />
              </Suspense>
            </SceneBoundary>
          </div>
        )}
        {view === 'site' && (
          <a className={styles.enlarge} href={active.image} target="_blank" rel="noreferrer">
            Ampliar ficha pública
            <Focus size={16} aria-hidden />
          </a>
        )}
        {failed && (
          <p className={styles.fallback} role="status">
            Vista estática. El 3D no está disponible en este dispositivo.
          </p>
        )}
      </div>
      <div className={styles.caption} aria-live="polite">
        <h3>{active.title}</h3>
        <p>{active.note}</p>
      </div>
    </section>
  );
}
