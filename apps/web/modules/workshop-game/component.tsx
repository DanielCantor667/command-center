'use client';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { ArrowUpRight, DoorOpen, Map, Move, RotateCcw, Volume2, VolumeX, X } from 'lucide-react';
import { Component, useCallback, useEffect, useReducer, useRef, useState, type ReactNode } from 'react';
import { PROJECTS } from '../../data/projects';
import { PUBLIC_PROFILE } from '../../data/public-profile';
import { initialWorldState, worldReducer, type GameSnapshot, type WorldPoint } from './world-state';
import { ProjectsInspection } from './projects-inspection';
import { StationInspection } from './station-inspection';
import { STATIONS, stationForPoint } from './stations';
import { WorkshopReader } from './workshop-reader';
import type { WorkshopReading } from './reading';
import type { TechnologyFilters } from '../experience/components/technology-explorer';
import type { WorldCameraHandle } from './camera-controller';
import { supportsWorldRenderer } from './renderer-support';
import { useWorkshopAudio } from './workshop-audio';
import styles from './workshop-game.module.css';
const WorldScene = dynamic(() => import('./world-scene').then(module => module.WorldScene), { ssr: false, loading: () => null });
class WorldBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  render() { return this.state.failed ? null : this.props.children; }
}
export interface WorkshopGameProps { initialSnapshot?: GameSnapshot; suspended?: boolean; onSave: (snapshot: GameSnapshot) => void; onOpenCase: (id: string) => void; onPortfolio: () => void; reading?: WorkshopReading | null; onRead?: (reading: WorkshopReading | null) => void; technologyFilters?: TechnologyFilters; onTechnologyFiltersChange?: (filters: TechnologyFilters) => void }
const pointNames: Record<WorldPoint, string> = { entrance: 'Entrada', hub: 'El taller', projects: 'Proyectos', technologies: STATIONS.technologies.name, trajectory: STATIONS.trajectory.name, contact: STATIONS.contact.name };
/** 11.4: guided tour order (wheel or arrow keys), the same as the navigation: overview first, then each wall. */
export const TOUR: Exclude<WorldPoint, 'entrance'>[] = ['hub', 'projects', 'technologies', 'trajectory', 'contact'];
/** Cover shortcuts: the cases with their own designed page. */
const QUICK_PROJECTS = ['kliniu', 'lorigine', '4ustudio-academy', 'drokex'].map(id => PROJECTS.find(project => project.id === id)!);
const defaultFilters: TechnologyFilters = { query: '', category: 'all', projectId: null };
export function WorkshopGame({ initialSnapshot, suspended = false, onSave, onOpenCase, onPortfolio, reading: controlledReading, onRead, technologyFilters = defaultFilters, onTechnologyFiltersChange = () => {} }: WorkshopGameProps) {
  const [localReading, setLocalReading] = useState<WorkshopReading | null>(null);
  const reading = controlledReading === undefined ? localReading : controlledReading;
  const previousReading = useRef(!!reading);
  const setReading = onRead ?? setLocalReading;
  const [state, dispatch] = useReducer(worldReducer, initialSnapshot, initialWorldState);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [preparing, setPreparing] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const cameraHandle = useRef<WorldCameraHandle | null>(null);
  const initialCamera = useRef(initialSnapshot?.camera ?? null);
  const openButton = useRef<HTMLButtonElement>(null), enterButton = useRef<HTMLButtonElement>(null), retryButton = useRef<HTMLButtonElement>(null), mapButton = useRef<HTMLButtonElement>(null);
  const navigationButtons = useRef<Partial<Record<WorldPoint, HTMLButtonElement | null>>>({});
  const stateRef = useRef(state); stateRef.current = state;
  const wheelGesture = useRef({ delta: 0, at: 0 });
  const active = ['loading', 'moving', 'exploring'].includes(state.status);
  const inside = state.status === 'exploring' || (state.status === 'moving' && state.destination !== 'entrance');
  const inspecting = state.status === 'exploring' && state.point === 'projects';
  const station = state.status === 'exploring' ? stationForPoint(state.point) : null;
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)'); const update = () => setReducedMotion(media.matches);
    update(); media.addEventListener?.('change', update); return () => media.removeEventListener?.('change', update);
  }, []);
  // Sound stays off until the visitor asks for it; the toggle click is the gesture that unlocks playback.
  const [sound, setSound] = useState(false);
  const toggleSound = useCallback(() => setSound(value => !value), []);
  const [tabHidden, setTabHidden] = useState(false);
  useEffect(() => {
    const update = () => setTabHidden(document.hidden);
    update();
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  useWorkshopAudio({ enabled: sound && inside, paused: suspended || tabHidden || !!reading || state.status !== 'exploring' });
  useEffect(() => {
    const wasReading = previousReading.current; previousReading.current = !!reading;
    if (suspended || reading) return;
    const compact = window.matchMedia('(max-width: 700px), (max-height: 480px)').matches;
    const navigationTarget = compact && state.point === 'hub' ? mapButton.current : navigationButtons.current[state.point];
    const button = state.status === 'error' ? retryButton.current : state.status === 'exploring' ? (inspecting || station ? openButton.current : navigationTarget) : state.status === 'landing' ? enterButton.current : null;
    if (!wasReading) { button?.focus({ preventScroll: true }); return; }
    // Let the portal restore a surviving opener before supplying the world fallback.
    const frame = requestAnimationFrame(() => {
      const focused = document.activeElement;
      if (!focused || focused === document.body || focused.closest('[inert],[aria-hidden="true"]')) (button ?? enterButton.current)?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [suspended, reading, inspecting, station, state.status, state.point]);
  useEffect(() => {
    if (reading && ['loading', 'moving'].includes(stateRef.current.status)) dispatch({ type: 'cancel' });
  }, [reading]);
  const cancel = useCallback(() => { dispatch({ type: 'cancel' }); requestAnimationFrame(() => { if (stateRef.current.point === 'entrance') enterButton.current?.focus({ preventScroll: true }); }); }, []);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || suspended || reading) return;
      const current = stateRef.current;
      if (['loading', 'moving'].includes(current.status)) cancel();
      else if (current.status === 'exploring' && (current.point === 'projects' || stationForPoint(current.point))) dispatch({ type: 'go', point: 'hub' });
    };
    window.addEventListener('keydown', escape); return () => window.removeEventListener('keydown', escape);
  }, [cancel, suspended, reading]);
  useEffect(() => {
    if (state.status !== 'exploring') wheelGesture.current = { delta: 0, at: 0 };
  }, [state.status]);
  useEffect(() => {
    let last = 0;
    wheelGesture.current = { delta: 0, at: 0 };
    const step = (direction: 1 | -1) => {
      const current = stateRef.current;
      if (current.status !== 'exploring' || Date.now() - last < 700) return;
      const index = TOUR.indexOf(current.point as (typeof TOUR)[number]);
      const next = TOUR[Math.min(TOUR.length - 1, Math.max(0, (index < 0 ? 0 : index) + direction))]!;
      if (next === current.point) return;
      last = Date.now(); dispatch({ type: 'go', point: next });
    };
    const wheel = (event: WheelEvent) => {
      if (suspended || reading || event.ctrlKey || stateRef.current.status !== 'exploring' || !(event.target as Element | null)?.closest?.('[data-world-canvas]')) {
        wheelGesture.current = { delta: 0, at: 0 }; return;
      }
      // Wheels can report lines/pages; trackpads usually send a burst of small pixel deltas.
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1);
      if (!Number.isFinite(delta) || delta === 0) return;
      const now = Date.now(), previous = wheelGesture.current;
      const continuing = now - previous.at <= 160 && Math.sign(previous.delta) === Math.sign(delta);
      const accumulated = (continuing ? previous.delta : 0) + delta;
      wheelGesture.current = { delta: accumulated, at: now };
      if (Math.abs(accumulated) < 25) return;
      wheelGesture.current = { delta: 0, at: 0 };
      step(accumulated > 0 ? 1 : -1);
    };
    const key = (event: KeyboardEvent) => {
      if (suspended || reading || event.altKey || event.ctrlKey || event.metaKey) return;
      const focus = document.activeElement;
      if (focus && focus.matches('input, textarea, [contenteditable="true"]')) return;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') { event.preventDefault(); step(1); }
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') { event.preventDefault(); step(-1); }
    };
    window.addEventListener('wheel', wheel, { passive: true }); window.addEventListener('keydown', key);
    return () => { window.removeEventListener('wheel', wheel); window.removeEventListener('keydown', key); };
  }, [suspended, reading]);
  const ready = useCallback((token: number) => dispatch({ type: 'ready', token }), []);
  const arrived = useCallback((token: number) => dispatch({ type: 'arrived', token }), []);
  const failed = useCallback((token: number) => dispatch({ type: 'failed', token }), []);
  const materialsReady = useCallback(() => setPreparing(true), []);
  const go = useCallback((point: WorldPoint) => dispatch({ type: 'go', point }), []);
  const start = async () => {
    initialCamera.current = null;
    if (!supportsWorldRenderer()) { dispatch({ type: 'start' }); dispatch({ type: 'failed', token: stateRef.current.token + 1 }); return; }
    if (state.status === 'error') { try { (await import('./world-scene')).resetWorkshopResource(); } catch { return; } }
    setPreparing(false); setAttempt(value => value + 1); dispatch({ type: 'start' });
  };
  const saveWorld = () => {
    if (['loading', 'moving'].includes(state.status)) dispatch({ type: 'cancel' });
    if (active && state.point !== 'entrance') onSave({ point: state.point, camera: cameraHandle.current?.capture() ?? initialCamera.current });
  };
  const portfolio = () => { saveWorld(); onPortfolio(); };
  const openRelatedCase = (id: string) => {
    saveWorld();
    onOpenCase(id);
  };
  const openStation = () => { if (station) setReading(station === 'technologies' ? { kind: station, technologyId: 'nextjs' } : { kind: station }); };
  return <><main className={styles.game} inert={!!reading} aria-hidden={reading ? true : undefined} data-workshop-state={state.status} data-world-point={state.point} data-world-destination={state.destination}>
    {/* Cycles render of the lab from the overview camera (blender/prototype_workshop_room_v2.py). */}
    <div className={styles.poster} aria-hidden="true"><Image src="/experience/workshop-lab-entrance-v1.webp" alt="" fill sizes="100vw" priority /></div>
    {active && <div className={styles.world} data-world-canvas><WorldBoundary key={attempt} onError={() => failed(stateRef.current.token)}>
      <WorldScene point={state.status === 'moving' ? state.destination : state.point} moving={state.status === 'moving'} token={state.token} reducedMotion={reducedMotion} initialCamera={initialCamera.current} cameraHandle={cameraHandle} onReady={ready} onArrived={arrived} onError={failed} onGo={go} onOpenCase={openRelatedCase} onTechnology={technologyId => setReading({ kind: 'technologies', technologyId })} onPreparing={materialsReady} suspended={suspended || !!reading} />
    </WorldBoundary></div>}
    <div className={styles.shade} aria-hidden="true" />
    <header className={styles.header}><div className={styles.identity}><span>{PUBLIC_PROFILE.name}</span><small>{PUBLIC_PROFILE.role}</small></div><div className={styles.headerActions}>
      {!inside && <button type="button" className={styles.portfolio} aria-label="Mapa" title="Mapa" onClick={() => setReading({ kind: 'map' })}><span className={styles.actionText}>Mapa</span><Map size={17} aria-hidden="true" /></button>}
      {inside && <button type="button" className={styles.portfolio} aria-label="Sonido" title={sound ? 'Apagar sonido' : 'Activar sonido'} aria-pressed={sound} onClick={toggleSound}><span className={styles.actionText}>Sonido</span>{sound ? <Volume2 size={17} aria-hidden="true" /> : <VolumeX size={17} aria-hidden="true" />}</button>}
      <button type="button" className={styles.portfolio} aria-label="Ver portafolio" title="Ver portafolio" onClick={portfolio}><span className={styles.actionText}>Ver portafolio</span><ArrowUpRight size={17} aria-hidden="true" /></button>
    </div></header>
    {state.status === 'landing' && <section className={styles.welcome} aria-labelledby="workshop-title">
      <p className={styles.location}>{PUBLIC_PROFILE.location}</p><h1 id="workshop-title">El taller de Daniel</h1><p>Un lugar para explorar<br />lo que construyo.</p>
      <button ref={enterButton} className={styles.primary} type="button" onClick={() => void start()}>Entrar al taller<DoorOpen size={19} aria-hidden="true" /></button><span className={styles.hint}>Recorre el espacio con clic o toque.</span>
      <nav className={styles.quickProjects} aria-label="Proyectos publicados">{QUICK_PROJECTS.map(project => <button key={project.id} className={styles.quickProject} type="button" aria-label={`Leer caso de ${project.name}`} onClick={() => openRelatedCase(project.id)}>{project.name}<ArrowUpRight size={14} aria-hidden="true" /></button>)}</nav>
    </section>}
    {(state.status === 'loading' || state.status === 'error') && <section className={styles.loadPanel} aria-labelledby="world-loading-title">
      <div className={styles.blueprint} aria-hidden="true"><span /><span /><span /><span /></div>
      <h1 id="world-loading-title">{state.status === 'error' ? 'El taller no está disponible' : 'Encendiendo la lámpara'}</h1>
      <p role="status" aria-live="polite">{state.status === 'error' ? 'Puedes reintentar o explorar los proyectos en el portafolio.' : preparing ? 'Preparando la escena' : 'Cargando el espacio del taller'}</p>
      {state.status === 'loading' ? <><div className={styles.loadTrack} role="progressbar" aria-label="Carga del taller" aria-valuetext={preparing ? 'Preparando la escena' : 'Cargando el espacio'}><span /></div><button type="button" className={styles.cancel} onClick={cancel}>Cancelar entrada<X size={16} aria-hidden="true" /></button></> : <button ref={retryButton} className={styles.primary} type="button" onClick={() => void start()}>Reintentar<RotateCcw size={17} aria-hidden="true" /></button>}
    </section>}
    {inside && <>
      <div className={styles.journey}>
        <div className={styles.destination} role="status">{(() => { const shown = state.status === 'moving' ? state.destination : state.point; const index = TOUR.indexOf(shown as (typeof TOUR)[number]); return <>{index >= 0 && <span className={styles.tourStep}>{index + 1} / {TOUR.length}</span>}<span>{state.status === 'moving' && <span className={styles.movingPrefix}>Acercándote a </span>}{pointNames[shown]}</span></>; })()}</div>
        {state.status === 'moving' && <button className={styles.stop} type="button" aria-label="Cancelar recorrido" title="Cancelar recorrido" onClick={cancel}><span className={styles.stopText}>Cancelar recorrido</span><X size={16} aria-hidden="true" /></button>}
      </div>
      <div className={styles.bottomControls}>
      {inspecting && <ProjectsInspection buttonRef={openButton} onOpen={openRelatedCase} onBack={() => go('hub')} />}
      {station && <StationInspection key={station} station={station} buttonRef={openButton} onOpen={openStation} onBack={() => go('hub')} />}
      <nav className={styles.navigation} aria-label="Recorrer el taller">{TOUR.map(point => <button key={point} data-world-nav={point} ref={node => { navigationButtons.current[point] = node; }} type="button" onClick={() => go(point)} aria-label={point === 'hub' ? undefined : `Ir a ${pointNames[point]}`} aria-current={state.point === point && state.status === 'exploring' ? 'location' : undefined}>{pointNames[point]}</button>)}<button ref={mapButton} type="button" onClick={() => setReading({ kind: 'map' })}>Mapa<Map size={14} aria-hidden="true" /></button></nav>
      <p className={styles.lookHint}><Move size={14} aria-hidden="true" /> Arrastra para mirar. <span className={styles.wideOnly}>Usa la rueda o las flechas para recorrer el taller.</span><span className={styles.narrowOnly}>Elige un lugar para acercarte.</span></p>
      </div>
    </>}
    <footer className={styles.footer}><span>El taller de Daniel</span>{!inside && <span>3D al entrar</span>}</footer>
  </main>{reading && !suspended && <WorkshopReader reading={reading} currentPoint={state.point} worldAvailable={active && state.point !== 'entrance'} technologyFilters={technologyFilters} onTechnologyFiltersChange={onTechnologyFiltersChange} onRead={setReading} onOpenCase={openRelatedCase} onClose={() => setReading(null)} onGo={point => { setReading(null); go(point); }} />}</>;
}
