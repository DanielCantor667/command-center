'use client';

import Image from 'next/image';
import dynamic from 'next/dynamic';
import { Component, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { CityNavigatorProps } from './city-navigator';
import type { CameraSnapshot, CityCameraHandle } from '../workshop-state';
import styles from '../experience.module.css';

const CityNavigator = dynamic(
  () => import('./city-navigator').then((module) => module.CityNavigator),
  {
    ssr: false,
    loading: () => null,
  },
);
class SceneBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() { this.props.onError(); }
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
  const [sceneReady, setSceneReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const container = useRef<HTMLDivElement>(null);
  const activation = useRef<HTMLButtonElement>(null);
  const initialEnabled = useRef(props.initialEnabled);
  const ownedHandle = useRef<CityCameraHandle | null>(null);
  const cameraHandle = props.cameraHandle ?? ownedHandle;
  const sceneHandle = useRef<CityCameraHandle | null>(null);
  const mounted = useRef(false);
  const { selectedProjectId, section, detail, exploded, tourStop, viewRevision } = props;
  const cameraIntent = useMemo(() => ({ selectedProjectId, section, detail, exploded, tourStop, viewRevision }),
    [selectedProjectId, section, detail, exploded, tourStop, viewRevision]);
  const lastCamera = useRef<{ intent: typeof cameraIntent; snapshot: CameraSnapshot | null }>({
    intent: cameraIntent,
    snapshot: props.initialCamera ?? null,
  });
  if (lastCamera.current.intent !== cameraIntent) {
    lastCamera.current = { intent: cameraIntent, snapshot: null };
  }
  const exposeCamera = useCallback((snapshot: CameraSnapshot | null) => {
    if (!mounted.current) return;
    if (!snapshot) {
      cameraHandle.current = null;
      return;
    }
    let saved = snapshot;
    cameraHandle.current = {
      capture: () => sceneHandle.current?.capture() ?? saved,
      restore: (next) => {
        saved = next;
        lastCamera.current = { intent: cameraIntent, snapshot: next };
        sceneHandle.current?.restore(next);
      },
    };
  }, [cameraHandle, cameraIntent]);
  const rememberCamera = useCallback((snapshot: CameraSnapshot) => {
    // CameraRig reports its final pose before clearing its private handle.
    if (lastCamera.current.intent !== cameraIntent) return;
    lastCamera.current.snapshot = snapshot;
    exposeCamera(snapshot);
  }, [exposeCamera, cameraIntent]);
  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      cameraHandle.current = null;
    };
  }, [cameraHandle]);
  useLayoutEffect(() => {
    exposeCamera(sceneHandle.current?.capture() ?? lastCamera.current.snapshot);
  });
  const sceneLoaded = useCallback(() => setSceneReady(true), []);
  const errorCallback = useRef(props.onSceneError);
  errorCallback.current = props.onSceneError;
  const sceneFailed = useCallback(() => {
    setUnavailable(true);
    setSceneReady(false);
    errorCallback.current?.();
  }, []);
  useLayoutEffect(() => {
    const element = container.current;
    if (!element) return;
    const contextLost = (event: Event) => {
      event.preventDefault();
      sceneFailed();
    };
    element.addEventListener('webglcontextlost', contextLost, true);
    return () => element.removeEventListener('webglcontextlost', contextLost, true);
  }, [sceneFailed]);
  const enabledCallback = useRef(props.onEnabledChange);
  enabledCallback.current = props.onEnabledChange;
  const onActiveChange = props.onActiveChange;
  const live = enabled && visible && !unavailable;
  useEffect(() => { onActiveChange?.(live && sceneReady); }, [live, sceneReady, onActiveChange]);
  useEffect(() => { if (!live) setSceneReady(false); }, [live]);
  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(motion.matches);
    update();
    motion.addEventListener('change', update);
    if (initialEnabled.current ?? window.matchMedia('(min-width: 801px)').matches) {
      const supported = supportsWebGL();
      setEnabled(supported);
      setUnavailable(!supported);
      enabledCallback.current?.(supported);
    } else {
      enabledCallback.current?.(false);
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
    <div ref={container} className={props.immersive ? styles.immersiveLoader : undefined} data-entering={props.entering} style={{ height: '100%', width: '100%', position: 'relative' }}>
      {unavailable ? (
        <div className={styles.scenePrompt} role="status">
          <Image
            src="/experience/workshop-brands-v3.jpg"
            alt="Maqueta del taller de Daniel"
            priority
            fill
            sizes="(max-width:800px) 100vw, 75vw"
            className={styles.scenePoster}
          />
          <p className={styles.sceneActivation}>
            Tu navegador no dispone de esta vista 3D. Los proyectos y las tecnologías siguen
            disponibles en las listas.
          </p>
        </div>
      ) : (
        <>
        {live && <div style={{ position: 'absolute', inset: 0, opacity: sceneReady ? 1 : 0 }} inert={!sceneReady}>
          <SceneBoundary onError={sceneFailed}>
            <CityNavigator {...props} cameraHandle={sceneHandle} initialCamera={lastCamera.current.snapshot}
              onCameraSnapshot={rememberCamera} onSceneReady={sceneLoaded} onSceneError={sceneFailed}
              reducedMotion={reducedMotion} />
          </SceneBoundary>
        </div>}
        {(!live || !sceneReady) && (
        <div className={styles.scenePrompt} aria-busy={!ready}>
          <Image
            src="/experience/workshop-brands-v3.jpg"
            alt="Maqueta del taller de Daniel con sus cuatro proyectos"
            priority
            fill
            sizes="(max-width:800px) 100vw, 75vw"
            className={styles.scenePoster}
          />
          {!props.immersive && <p className={styles.sceneActivation}>
            {ready ? 'Los proyectos tienen un lugar en este taller.' : 'Preparando el taller…'}
          </p>}
          {ready && !enabled && (
            <button
              ref={activation}
              className={styles.sceneActivation}
              type="button"
              onClick={() => {
                const supported = supportsWebGL();
                setEnabled(supported);
                setUnavailable(!supported);
                enabledCallback.current?.(supported);
              }}
            >
              Explorar en 3D
            </button>
          )}
        </div>
        )}
        </>
      )}
      {enabled && !unavailable && !props.entering && (
        <button type="button" className={styles.sceneClose} onClick={() => {
          if (cameraHandle.current) rememberCamera(cameraHandle.current.capture());
          setEnabled(false);
          enabledCallback.current?.(false);
          requestAnimationFrame(() => activation.current?.focus({ preventScroll: true }));
        }}>
          Cerrar vista 3D
        </button>
      )}
    </div>
  );
}
