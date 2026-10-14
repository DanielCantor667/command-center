'use client';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { ArrowUpRight, DoorOpen, Map, Move, RotateCcw, Volume2, VolumeX, X } from 'lucide-react';
import { Component, useCallback, useEffect, useReducer, useRef, useState, type ReactNode } from 'react';
import { PUBLIC_PROFILE } from '../../data/public-profile';
import { initialWorldState, worldReducer, type GameSnapshot, type WorldPoint } from './world-state';
import { ROOM_IDS, WORKSHOP_ROOMS, roomForPoint, type RoomId } from './rooms';
import { RoomInspection } from './room-inspection';
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
const saveData = () => typeof navigator !== 'undefined' && !!(navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
export interface WorkshopGameProps { initialSnapshot?: GameSnapshot; suspended?: boolean; onSave: (snapshot: GameSnapshot) => void; onOpenCase: (id: string) => void; onPortfolio: () => void; reading?: WorkshopReading | null; onRead?: (reading: WorkshopReading | null) => void; technologyFilters?: TechnologyFilters; onTechnologyFiltersChange?: (filters: TechnologyFilters) => void }
const pointNames: Record<WorldPoint, string> = { entrance: 'Entrada', hub: 'El taller', workbench: 'Mesa de trabajo', kliniu: 'Kliniu', lorigine: "L'ORIGINE", academy: '4U Studio Academy', drokex: 'Drokex', technologies: STATIONS.technologies.name, trajectory: STATIONS.trajectory.name, contact: STATIONS.contact.name };
const navigation: Exclude<WorldPoint, 'entrance'>[] = ['hub', 'workbench', ...ROOM_IDS, 'technologies', 'trajectory', 'contact'];
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
  const openButton = useRef<HTMLButtonElement>(null), enterButton = useRef<HTMLButtonElement>(null), retryButton = useRef<HTMLButtonElement>(null);
  const navigationButtons = useRef<Partial<Record<WorldPoint, HTMLButtonElement | null>>>({});
  const stateRef = useRef(state); stateRef.current = state;
  const active = ['loading', 'moving', 'exploring', 'room-loading', 'room-error'].includes(state.status);
  const inside = ['exploring', 'room-loading', 'room-error'].includes(state.status) || (state.status === 'moving' && state.destination !== 'entrance');
  const inspecting = state.status === 'exploring' ? roomForPoint(state.point) : null;
  const station = state.status === 'exploring' ? stationForPoint(state.point) : null;
  const pending = state.pendingRoom ? WORKSHOP_ROOMS[state.pendingRoom] : null;
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
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);
  useWorkshopAudio({ enabled: sound && inside, point: state.status === 'moving' ? state.destination : state.point, paused: suspended || tabHidden });
  useEffect(() => {
    const wasReading = previousReading.current; previousReading.current = !!reading;
    if (suspended || reading) return;
    const button = state.status === 'room-error' || state.status === 'error' ? retryButton.current : state.status === 'exploring' ? (inspecting || station ? openButton.current : navigationButtons.current[state.point]) : null;
    if (!wasReading) { button?.focus({ preventScroll: true }); return; }
    // Let the portal restore a surviving opener before supplying the world fallback.
    const frame = requestAnimationFrame(() => {
      const focused = document.activeElement;
      if (!focused || focused === document.body || focused.closest('[inert],[aria-hidden="true"]')) (button ?? enterButton.current)?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [suspended, reading, inspecting, station, state.status, state.point]);
  useEffect(() => {
    if (reading && ['loading', 'moving', 'room-loading', 'room-error'].includes(stateRef.current.status)) dispatch({ type: 'cancel' });
  }, [reading]);
  const cancel = useCallback(() => { dispatch({ type: 'cancel' }); requestAnimationFrame(() => { if (stateRef.current.point === 'entrance') enterButton.current?.focus({ preventScroll: true }); }); }, []);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || suspended || reading) return;
      const current = stateRef.current;
      if (['loading', 'moving', 'room-loading', 'room-error'].includes(current.status)) cancel();
      else if (current.status === 'exploring' && (roomForPoint(current.point) || stationForPoint(current.point))) dispatch({ type: 'go', point: 'hub' });
    };
    window.addEventListener('keydown', escape); return () => window.removeEventListener('keydown', escape);
  }, [cancel, suspended, reading]);
  const ready = useCallback((token: number) => dispatch({ type: 'ready', token }), []);
  const arrived = useCallback((token: number) => dispatch({ type: 'arrived', token }), []);
  const failed = useCallback((token: number) => dispatch({ type: 'failed', token }), []);
  const roomReady = useCallback((room: RoomId, token: number) => dispatch({ type: 'room-ready', room, token }), []);
  const roomFailed = useCallback((room: RoomId, token: number) => dispatch({ type: 'room-failed', room, token }), []);
  const materialsReady = useCallback(() => setPreparing(true), []);
  const go = useCallback((point: WorldPoint) => dispatch({ type: 'go', point }), []);
  const start = async () => {
    initialCamera.current = null;
    if (!supportsWorldRenderer()) { dispatch({ type: 'start' }); dispatch({ type: 'failed', token: stateRef.current.token + 1 }); return; }
    if (state.status === 'error') { try { (await import('./world-scene')).resetWorkshopResource(); } catch { return; } }
    setPreparing(false); setAttempt(value => value + 1); dispatch({ type: 'start' });
  };
  const retryRoom = async () => {
    if (!state.pendingRoom) return;
    (await import('./world-scene')).resetRoomResource(state.pendingRoom);
    dispatch({ type: 'retry-room' });
  };
  const portfolio = () => { if (['loading', 'moving', 'room-loading'].includes(state.status)) dispatch({ type: 'cancel' }); onPortfolio(); };
  const openCase = (room: RoomId) => {
    onSave({ point: state.point, camera: cameraHandle.current?.capture() ?? initialCamera.current });
    onOpenCase(WORKSHOP_ROOMS[room].projectId);
  };
  const openRelatedCase = (id: string) => {
    onSave({ point: state.point, camera: cameraHandle.current?.capture() ?? initialCamera.current });
    onOpenCase(id);
  };
  const openStation = () => { if (station) setReading(station === 'technologies' ? { kind: station, technologyId: 'nextjs' } : { kind: station }); };
  return <><main className={styles.game} inert={!!reading} aria-hidden={reading ? true : undefined} data-workshop-state={state.status} data-world-point={state.point} data-world-destination={state.destination} data-room-active={state.activeRoom ?? ''} data-room-pending={state.pendingRoom ?? ''}>
    <div className={styles.poster} aria-hidden="true"><Image src="/experience/workshop-entrance-v3.webp" alt="" fill sizes="100vw" priority />
      {/* Optional loop over the still poster: skipped for reduced motion and Data Saver, and once the world takes over. */}
      {state.status === 'landing' && !reducedMotion && !saveData() && <video src="/experience/workshop-entrance-loop-v1.mp4" poster="/experience/workshop-entrance-v3.webp" autoPlay muted loop playsInline preload="auto" tabIndex={-1} />}
    </div>
    {active && <div className={styles.world} data-world-canvas><WorldBoundary key={attempt} onError={() => failed(stateRef.current.token)}>
      <WorldScene point={state.status === 'moving' ? state.destination : state.point} moving={state.status === 'moving'} token={state.token} opened={inside} reducedMotion={reducedMotion} initialCamera={initialCamera.current} cameraHandle={cameraHandle} onReady={ready} onArrived={arrived} onError={failed} onGo={go} sound={sound} onSound={toggleSound} onTechnology={technologyId => setReading({ kind: 'technologies', technologyId })} onPreparing={materialsReady} suspended={suspended || !!reading} activeRoom={state.activeRoom} pendingRoom={state.pendingRoom} roomMoving={state.status === 'moving'} onRoomReady={roomReady} onRoomError={roomFailed} />
    </WorldBoundary></div>}
    <div className={styles.shade} aria-hidden="true" />
    <header className={styles.header}><div className={styles.identity}><span>{PUBLIC_PROFILE.name}</span><small>{PUBLIC_PROFILE.role}</small></div><div className={styles.headerActions}>{!inside && <button type="button" className={styles.portfolio} onClick={() => setReading({ kind: 'map' })}>Mapa<Map size={17} aria-hidden="true" /></button>}{inside && <button type="button" className={styles.portfolio} aria-pressed={sound} onClick={() => setSound(value => !value)}>Sonido{sound ? <Volume2 size={17} aria-hidden="true" /> : <VolumeX size={17} aria-hidden="true" />}</button>}<button type="button" className={styles.portfolio} onClick={portfolio}>Ver portafolio<ArrowUpRight size={17} aria-hidden="true" /></button></div></header>
    {state.status === 'landing' && <section className={styles.welcome} aria-labelledby="workshop-title">
      <p className={styles.location}>{PUBLIC_PROFILE.location}</p><h1 id="workshop-title">El taller de Daniel</h1><p>Un lugar para explorar<br />lo que construyo.</p>
      <button ref={enterButton} className={styles.primary} type="button" onClick={() => void start()}>Entrar al taller<DoorOpen size={19} aria-hidden="true" /></button><span className={styles.hint}>Recorre el espacio con clic o toque.</span>
    </section>}
    {(state.status === 'loading' || state.status === 'error') && <section className={styles.loadPanel} aria-labelledby="world-loading-title">
      <div className={styles.blueprint} aria-hidden="true"><span /><span /><span /><span /></div>
      <h1 id="world-loading-title">{state.status === 'error' ? 'El taller no está disponible' : 'Encendiendo la lámpara'}</h1>
      <p role="status" aria-live="polite">{state.status === 'error' ? 'Puedes reintentar o explorar los proyectos en el portafolio.' : preparing ? 'Preparando la escena' : 'Cargando el espacio del taller'}</p>
      {state.status === 'loading' ? <><div className={styles.loadTrack} role="progressbar" aria-label="Carga del taller" aria-valuetext={preparing ? 'Preparando la escena' : 'Cargando el espacio'}><span /></div><button type="button" className={styles.cancel} onClick={cancel}>Cancelar entrada<X size={16} aria-hidden="true" /></button></> : <button ref={retryButton} className={styles.primary} type="button" onClick={() => void start()}>Reintentar<RotateCcw size={17} aria-hidden="true" /></button>}
    </section>}
    {inside && <>
      <div className={styles.destination} aria-live="polite">{state.status === 'moving' ? `Acercándote a ${pointNames[state.destination]}` : pointNames[state.point]}</div>
      {state.status === 'moving' && <button className={styles.stop} type="button" onClick={cancel}>Cancelar recorrido<X size={16} aria-hidden="true" /></button>}
      {pending && (state.status === 'room-loading' || state.status === 'room-error') && <section className={styles.roomLoad} aria-labelledby="room-loading-title">
        <span className={styles.roomLabel}>Sala de proyecto</span><h1 id="room-loading-title">{state.status === 'room-error' ? `No se pudo cargar ${pending.name}` : `Cargando sala de ${pending.name}`}</h1>
        <p role="status">{state.status === 'room-error' ? 'El caso sigue disponible para leer.' : 'Preparando el espacio para entrar.'}</p>
        {state.status === 'room-loading' ? <><div className={styles.loadTrack} role="progressbar" aria-label={`Carga de ${pending.name}`} aria-valuetext="Cargando la sala"><span /></div><button className={styles.back} type="button" onClick={cancel}>Cancelar carga de sala<X size={16} aria-hidden="true" /></button></> : <><button ref={retryButton} className={styles.primary} type="button" onClick={() => void retryRoom()}>Reintentar sala<RotateCcw size={16} aria-hidden="true" /></button><button className={styles.back} type="button" onClick={() => openCase(pending.id)}>Abrir caso sin 3D<ArrowUpRight size={16} aria-hidden="true" /></button><button className={styles.back} type="button" onClick={cancel}>Volver al taller</button></>}
      </section>}
      {inspecting && <RoomInspection key={inspecting} room={inspecting} buttonRef={openButton} onOpen={() => openCase(inspecting)} onBack={() => go('hub')} />}
      {station && <StationInspection key={station} station={station} buttonRef={openButton} onOpen={openStation} onBack={() => go('hub')} />}
      <nav className={styles.navigation} aria-label="Recorrer el taller">{navigation.map(point => <button key={point} data-world-nav={point} ref={node => { navigationButtons.current[point] = node; }} type="button" onClick={() => go(point)} aria-label={roomForPoint(point) || stationForPoint(point) ? `Ir a ${pointNames[point]}` : undefined} aria-current={state.point === point && state.status === 'exploring' ? 'location' : undefined}>{point === 'academy' ? 'Academy' : point === 'workbench' ? 'Mesa de trabajo' : pointNames[point]}</button>)}<button type="button" onClick={() => setReading({ kind: 'map' })}>Mapa<Map size={14} aria-hidden="true" /></button></nav>
      <p className={styles.lookHint}><Move size={14} aria-hidden="true" /> Arrastra para mirar. Elige un lugar para acercarte.</p>
    </>}
    <footer className={styles.footer}><span>El taller de Daniel</span>{!inside && <span>3D al entrar</span>}</footer>
  </main>{reading && !suspended && <WorkshopReader reading={reading} currentPoint={state.point} worldAvailable={active && state.point !== 'entrance'} technologyFilters={technologyFilters} onTechnologyFiltersChange={onTechnologyFiltersChange} onRead={setReading} onOpenCase={openRelatedCase} onClose={() => setReading(null)} onGo={point => { setReading(null); go(point); }} />}</>;
}
