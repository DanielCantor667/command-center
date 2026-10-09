'use client';

import Image from 'next/image';
import { Box, Piano, Focus, Monitor, RotateCcw, X } from 'lucide-react';
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
import styles from './academy-studio.module.css';

export type AcademyView = 'studio' | 'instruments' | 'academy';
const Scene = lazy(() =>
  import('./academy-studio-scene').then((module) => ({ default: module.AcademyStudioScene })),
);
const views = [
  {
    id: 'studio',
    label: 'Estudio',
    icon: Piano,
    image: '/experience/academy-studio-v4.webp',
    alt: 'Estudio conceptual 4U creado en Blender',
    title: 'Un espacio para hacer música.',
    note: 'Estudio conceptual. No representa la sede física de la academia.',
  },
  {
    id: 'instruments',
    label: 'Instrumentos',
    icon: Focus,
    image: '/experience/academy-instruments-v4.webp',
    alt: 'Instrumentos del estudio conceptual 4U',
    title: 'La forma de cada sonido.',
    note: 'Piano, guitarra, voz y percusión. Madera, metal y tela acústica.',
  },
  {
    id: 'academy',
    label: 'Academia',
    icon: Monitor,
    image: '/projects/academy-home-v4.webp',
    alt: 'Inicio de 4U Studio Academy',
    title: 'La academia, en la web.',
    note: 'Captura pública del 21 de septiembre de 2026.',
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

export function AcademyStudio() {
  const [view, setView] = useState<AcademyView>('studio');
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
  const live = enabled && visible && !failed && view !== 'academy';
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
      id="academy-studio"
      className={styles.gallery}
      aria-labelledby="academy-studio-title"
      data-view={view}
    >
      <header className={styles.heading}>
        <h2 id="academy-studio-title">Dentro del estudio.</h2>
        <span>4U / Música y aprendizaje</span>
      </header>
      <div className={styles.toolbar}>
        <div role="group" aria-label="Perspectivas de 4U Studio Academy" className={styles.views}>
          {views.map((item) => (
            <button
              type="button"
              key={item.id}
              aria-pressed={view === item.id}
              aria-controls="academy-study"
              onClick={() => setView(item.id)}
            >
              <item.icon size={17} aria-hidden />
              {item.label}
            </button>
          ))}
        </div>
        <div
          className={styles.actions}
          inert={view === 'academy'}
          style={{ visibility: view === 'academy' ? 'hidden' : undefined }}
        >
          {enabled && !failed ? (
            <>
              <button
                type="button"
                aria-label="Restablecer estudio"
                title="Restablecer vista"
                onClick={() => setRevision((value) => value + 1)}
              >
                <RotateCcw size={18} aria-hidden />
              </button>
              <button
                type="button"
                aria-label="Cerrar estudio 3D"
                ref={closeControl}
                title="Cerrar estudio 3D"
                onClick={close}
              >
                <X size={18} aria-hidden />
              </button>
            </>
          ) : (
            !failed && (
              <button ref={activation} type="button" onClick={enable}>
                <Box size={17} aria-hidden />
                Explorar estudio en 3D
              </button>
            )
          )}
        </div>
      </div>
      <div id="academy-study" className={styles.stage} data-live={live && ready}>
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
        {view === 'academy' && (
          <a className={styles.enlarge} href={active.image} target="_blank" rel="noreferrer">
            Ampliar academia
            <Focus size={16} aria-hidden />
          </a>
        )}
        {failed && (
          <p ref={fallback} tabIndex={-1} className={styles.fallback} role="status">
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
