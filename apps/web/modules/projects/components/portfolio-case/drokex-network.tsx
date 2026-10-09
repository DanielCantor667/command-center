'use client';

import Image from 'next/image';
import { Box, Globe, Focus, Monitor, RotateCcw, X } from 'lucide-react';
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
import styles from './drokex-network.module.css';

export type DrokexView = 'network' | 'detail' | 'platform';
const Scene = lazy(() =>
  import('./drokex-network-scene').then((module) => ({ default: module.DrokexNetworkScene })),
);
const views = [
  {
    id: 'network',
    label: 'Red',
    icon: Globe,
    image: '/experience/drokex-network-v4.webp',
    alt: 'Red conceptual Drokex creada en Blender',
    title: 'Una red de posibilidades.',
    note: 'Escena conceptual. Las conexiones no representan actividad comercial real.',
  },
  {
    id: 'detail',
    label: 'Detalle',
    icon: Focus,
    image: '/experience/drokex-detail-v4.webp',
    alt: 'Detalle del pabellón conceptual Drokex',
    title: 'La conexión, de cerca.',
    note: 'Globo, kioscos y muestras. Aluminio, juntas y superficies de catálogo.',
  },
  {
    id: 'platform',
    label: 'Plataforma',
    icon: Monitor,
    image: '/projects/drokex-products-v4.webp',
    alt: 'Catálogo de productos de Drokex',
    title: 'El catálogo público.',
    note: 'Captura pública del 22 de septiembre de 2026.',
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

export function DrokexNetwork() {
  const [view, setView] = useState<DrokexView>('network');
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [revision, setRevision] = useState(0);
  const root = useRef<HTMLElement>(null);
  const activation = useRef<HTMLButtonElement>(null);
  const closeControl = useRef<HTMLButtonElement>(null);
  const fallback = useRef<HTMLParagraphElement>(null);
  const active = views.find((item) => item.id === view)!;
  const live = enabled && visible && !failed && view !== 'platform';
  const markReady = useCallback(() => setReady(true), []);
  const markFailed = useCallback(() => {
    setFailed(true);
    requestAnimationFrame(() => fallback.current?.focus({ preventScroll: true }));
  }, []);
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotion = () => setReducedMotion(motion.matches);
    syncMotion();
    motion.addEventListener('change', syncMotion);
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(Boolean(entry?.isIntersecting)),
      { rootMargin: '0px' },
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
        markFailed();
        return;
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      setEnabled(true);
      requestAnimationFrame(() => closeControl.current?.focus({ preventScroll: true }));
    } catch {
      markFailed();
    }
  }
  function close() {
    setEnabled(false);
    requestAnimationFrame(() => activation.current?.focus({ preventScroll: true }));
  }

  return (
    <section
      ref={root}
      id="drokex-network"
      className={styles.gallery}
      aria-labelledby="drokex-network-title"
      data-view={view}
    >
      <header className={styles.heading}>
        <h2 id="drokex-network-title">Comercio conectado.</h2>
        <span>Drokex / Catálogo y directorio</span>
      </header>
      <div className={styles.toolbar}>
        <div role="group" aria-label="Perspectivas de Drokex" className={styles.views}>
          {views.map((item) => (
            <button
              type="button"
              key={item.id}
              aria-pressed={view === item.id}
              aria-controls="drokex-study"
              onClick={() => setView(item.id)}
            >
              <item.icon size={17} aria-hidden />
              {item.label}
            </button>
          ))}
        </div>
        <div
          className={styles.actions}
          inert={view === 'platform'}
          style={{ visibility: view === 'platform' ? 'hidden' : undefined }}
        >
          {enabled && !failed ? (
            <>
              <button
                type="button"
                aria-label="Restablecer red"
                title="Restablecer vista"
                onClick={() => setRevision((value) => value + 1)}
              >
                <RotateCcw size={18} aria-hidden />
              </button>
              <button
                type="button"
                aria-label="Cerrar red 3D"
                ref={closeControl}
                title="Cerrar red 3D"
                onClick={close}
              >
                <X size={18} aria-hidden />
              </button>
            </>
          ) : (
            !failed && (
              <button ref={activation} type="button" onClick={enable}>
                <Box size={17} aria-hidden />
                Explorar red en 3D
              </button>
            )
          )}
        </div>
      </div>
      <div id="drokex-study" className={styles.stage} data-live={live && ready}>
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
        {view === 'platform' && (
          <a className={styles.enlarge} href={active.image} target="_blank" rel="noreferrer">
            Ampliar plataforma
            <Focus size={16} aria-hidden />
          </a>
        )}
        {failed && (
          <p ref={fallback} tabIndex={-1} className={styles.fallback} role="status">
            Vista estática. No se pudo abrir la red 3D.
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
