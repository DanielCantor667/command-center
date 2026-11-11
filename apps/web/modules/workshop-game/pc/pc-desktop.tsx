'use client';
/* eslint-disable @next/next/no-img-element -- fixed desktop icons, outside Next's image pipeline */
import { ArrowLeft, ArrowRight, BatteryFull, Cpu, Lock, PanelLeft, Plus, RotateCw, Search, Share, SlidersHorizontal, Undo2, Wifi } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react';
import { PUBLIC_PROFILE } from '../../../data/public-profile';
import { ContactApp, CvApp, GithubApp, NotesApp, ProjectsApp, SettingsApp, TerminalApp, TrashApp, WALLPAPERS, type WallpaperId } from './pc-apps';
import { GITHUB, type PcApp } from './shell';
import { fill } from '../../../i18n/format';
import { useDictionary } from '../../../i18n/locale-provider';
import styles from './pc.module.css';

/** Names and titles come from the dictionary (`pc.appNames`, `pc.appTitles`); these titles are the same in every language. */
const FIXED_TITLES: Partial<Record<PcApp, string>> = { github: 'GitHub', terminal: 'daniel — claude — 120×32', cv: 'CV_Daniel_Cantor.pdf' };
const APPS: { id: PcApp; icon: string; rect: [number, number, number, number] }[] = [
  { id: 'projects', icon: 'finder', rect: [.2, .12, 640, 430] },
  { id: 'github', icon: 'safari', rect: [.33, .05, 920, 650] },
  { id: 'contact', icon: 'mail', rect: [.34, .2, 520, 400] },
  { id: 'notes', icon: 'notes', rect: [.1, .08, 620, 420] },
  { id: 'terminal', icon: 'terminal', rect: [.03, .26, 860, 460] },
  { id: 'settings', icon: 'settings', rect: [.28, .14, 700, 440] },
  { id: 'cv', icon: 'preview', rect: [.3, .04, 680, 700] },
  { id: 'trash', icon: 'trash', rect: [.4, .25, 420, 260] },
];
const MENU_HEIGHT = 28;
type Win = { app: PcApp; x: number; y: number; width: number; height: number; z: number; minimized: boolean; maximized: boolean };
let unlockedThisVisit = false;

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => { const timer = setInterval(() => setNow(new Date()), 5000); return () => clearInterval(timer); }, []);
  return now;
}
const dateText = (date: Date, locale: string, options: Intl.DateTimeFormatOptions) => date.toLocaleDateString(locale, options);
const time = (date: Date, locale: string) => date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false });

function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const now = useClock();
  const { pc } = useDictionary();
  return <section className={styles.lock} aria-label={pc.lock.label}>
    <span className={styles.lockStatus} aria-hidden="true"><BatteryFull size={18} /><Wifi size={15} /></span>
    <header><p>{dateText(now, pc.dateLocale, { weekday: 'long', day: 'numeric', month: 'long' })}</p><time>{time(now, pc.dateLocale)}</time></header>
    <div>
      <span className={styles.avatar} aria-hidden="true" style={{ backgroundImage: `url(${GITHUB.profile.avatarUrl})` }} />
      <strong>{PUBLIC_PROFILE.name}</strong>
      <form onSubmit={event => { event.preventDefault(); onUnlock(); }}><input type="password" aria-label={pc.lock.password} placeholder={pc.lock.placeholder} /></form>
      <small>{pc.lock.hint}</small>
    </div>
  </section>;
}

function Window({ win, title, active, onFocus, onChange, onClose, children }: { win: Win; title: string; active: boolean; onFocus: () => void; onChange: (patch: Partial<Win>) => void; onClose: () => void; children: ReactNode }) {
  const { window: t } = useDictionary().pc;
  const drag = useRef<{ x: number; y: number } | null>(null);
  const down = (event: PointerEvent) => {
    if (win.maximized || (event.target as Element).closest('button')) return;
    drag.current = { x: event.clientX - win.x, y: event.clientY - win.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const move = (event: PointerEvent) => {
    if (!drag.current) return;
    onChange({ x: Math.max(80 - win.width, Math.min(innerWidth - 80, event.clientX - drag.current.x)), y: Math.max(MENU_HEIGHT, Math.min(innerHeight - 40, event.clientY - drag.current.y)) });
  };
  const style: CSSProperties = win.maximized ? { left: 0, top: MENU_HEIGHT, width: '100%', height: `calc(100% - ${MENU_HEIGHT}px)`, zIndex: win.z } : { left: win.x, top: win.y, width: win.width, height: win.height, zIndex: win.z };
  return <section className={styles.window} style={style} data-active={active} hidden={win.minimized} aria-label={title} onPointerDownCapture={onFocus}>
    <header data-tall={win.app === 'github'} onPointerDown={down} onPointerMove={move} onPointerUp={() => { drag.current = null; }} onDoubleClick={() => onChange({ maximized: !win.maximized })}>
      <div className={styles.lights}>
        <button type="button" aria-label={fill(t.close, { title })} onClick={onClose} />
        <button type="button" aria-label={fill(t.minimize, { title })} onClick={() => onChange({ minimized: true })} />
        <button type="button" aria-label={fill(t.maximize, { title })} onClick={() => onChange({ maximized: !win.maximized })} />
      </div>
      {win.app === 'github' ? <div className={styles.toolbar} aria-hidden="true"><PanelLeft size={16} /><ArrowLeft size={16} /><ArrowRight size={16} /><span><Lock size={11} />{PUBLIC_PROFILE.github.replace('https://', '')}<RotateCw size={12} /></span><Share size={15} /><Plus size={16} /></div> : <h2>{title}</h2>}
      {win.app === 'github' && <h2 className={styles.hiddenTitle}>{title}</h2>}
    </header>
    <div className={styles.body}>{children}</div>
  </section>;
}

/** The PC at full screen. A native modal <dialog> brings the focus trap, Esc and the inert page behind it. */
export function PcDesktop({ onClose, onCase, sound, onSound }: { onClose: () => void; onCase: (id: string) => void; sound: boolean; onSound: () => void }) {
  const { pc } = useDictionary();
  const title = (app: PcApp) => FIXED_TITLES[app] ?? pc.appTitles[app as keyof typeof pc.appTitles];
  const dialog = useRef<HTMLDialogElement>(null);
  const [unlocked, setUnlocked] = useState(unlockedThisVisit);
  const [wallpaper, setWallpaper] = useState<WallpaperId>('noche');
  const [windows, setWindows] = useState<Win[]>([]);
  const top = useRef(1);
  const now = useClock();
  // No close() on cleanup: its close event would end the session on StrictMode's effect replay.
  useEffect(() => { if (dialog.current?.open) return; dialog.current?.showModal(); dialog.current?.querySelector<HTMLElement>('input')?.focus(); }, []);
  const open = (app: PcApp) => setWindows(current => {
    const z = ++top.current, found = current.find(win => win.app === app);
    if (found) return current.map(win => win === found ? { ...win, z, minimized: false } : win);
    const [x, y, width, height] = APPS.find(item => item.id === app)!.rect;
    return [...current, { app, x: Math.round(x * innerWidth), y: Math.max(MENU_HEIGHT + 8, Math.round(y * innerHeight)), width: Math.min(width, innerWidth - 32), height: Math.min(height, innerHeight - 140), z, minimized: false, maximized: false }];
  });
  const patch = (app: PcApp, change: Partial<Win>) => setWindows(current => current.map(win => win.app === app ? { ...win, ...change } : win));
  const unlock = () => { unlockedThisVisit = true; setUnlocked(true); };
  // The first look at the desktop matches the working session: the repositories up, the terminal ready.
  const started = useRef(false);
  useEffect(() => { if (!unlocked || started.current) return; started.current = true; open('github'); open('terminal'); }, [unlocked]);
  const active = windows.filter(win => !win.minimized).sort((a, b) => b.z - a.z)[0];
  const content: Record<PcApp, ReactNode> = {
    terminal: <TerminalApp onApp={open} onCase={onCase} onExit={onClose} />, github: <GithubApp />, projects: <ProjectsApp onCase={onCase} />, contact: <ContactApp />, notes: <NotesApp />,
    settings: <SettingsApp wallpaper={wallpaper} onWallpaper={setWallpaper} sound={sound} onSound={onSound} />, trash: <TrashApp />, cv: <CvApp />,
  };
  return <dialog ref={dialog} className={`${styles.desktop} ${WALLPAPERS[wallpaper]}`} aria-label={pc.desktop} onClose={onClose}>
    {!unlocked ? <LockScreen onUnlock={unlock} /> : <>
      <header className={styles.menubar}>
        <Cpu size={15} aria-hidden="true" />
        <strong>{active ? pc.appNames[active.app] : pc.appNames.projects}</strong>
        <span className={styles.menus} aria-hidden="true">{pc.menus.map(menu => <span key={menu}>{menu}</span>)}</span>
        <span className={styles.status}><BatteryFull size={18} aria-hidden="true" /><Wifi size={15} aria-hidden="true" /><Search size={14} aria-hidden="true" /><SlidersHorizontal size={14} aria-hidden="true" /><time>{dateText(now, pc.dateLocale, { weekday: 'short', day: 'numeric', month: 'short' })} {time(now, pc.dateLocale)}</time></span>
      </header>
      <button type="button" className={styles.shortcut} onDoubleClick={() => open('projects')} onClick={event => { if (event.detail === 0 || innerWidth <= 700) open('projects'); }}><img src="/pc-icons/folder.webp" alt="" width={64} height={64} /><span>{pc.projectsFolder}</span></button>
      <button type="button" className={`${styles.shortcut} ${styles.shortcutCv}`} onDoubleClick={() => open('cv')} onClick={event => { if (event.detail === 0 || innerWidth <= 700) open('cv'); }}><img src="/pc-icons/document.webp" alt="" width={64} height={64} /><span>CV_Daniel_Cantor.pdf</span></button>
      {windows.map(win => <Window key={win.app} win={win} title={title(win.app)} active={win === active} onFocus={() => { if (win !== active) open(win.app); }} onChange={change => patch(win.app, change)} onClose={() => setWindows(current => current.filter(item => item !== win))}>{content[win.app]}</Window>)}
      <nav className={styles.dock} aria-label={pc.apps}>{APPS.map(({ id, icon }) => <button key={id} type="button" aria-label={pc.appNames[id]} data-name={pc.appNames[id]} data-trash={id === 'trash'} data-running={windows.some(win => win.app === id)} onClick={() => open(id)}><img src={`/pc-icons/${icon}.webp`} alt="" width={54} height={54} /></button>)}</nav>
    </>}
    <button type="button" className={styles.leave} onClick={onClose}><Undo2 size={14} aria-hidden="true" />{pc.back}</button>
  </dialog>;
}
