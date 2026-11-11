'use client';
/* eslint-disable @next/next/no-img-element -- fixed desktop icons, outside Next's image pipeline */
import { BookMarked, BookOpen, Download, MapPin, Monitor, Search, Users, Volume2, VolumeX, Wallpaper } from 'lucide-react';
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { PROJECTS } from '../../../data/projects';
import { PUBLIC_PROFILE } from '../../../data/public-profile';
import { ask, COMMANDS, complete, display, GITHUB, HOME, isCommand, run, type PcApp } from './shell';
import { fill } from '../../../i18n/format';
import { useDictionary, useLocale } from '../../../i18n/locale-provider';
import styles from './pc.module.css';

export const WALLPAPERS = { noche: styles.wallNight, neon: styles.wallNeon, taller: styles.wallWorkshop } as const;
export type WallpaperId = keyof typeof WALLPAPERS;

const SPINNER = ['·', '✢', '✳', '✶', '✻', '✽', '✻', '✶', '✳', '✢'];
const VERBS = ['Clauding', 'Compiling', 'Thinking', 'Reviewing', 'Forging'];
const COMMAND_MS = 420, QUESTION_MS = 1100;
/** The mascot of the banner: 18 × 6 cells, stretched like block glyphs in a terminal. */
const CLAWD = ['...XXXXXXXXXXXXX..', '...XX.XXXXXXX.XX..', '.XXXXXXXXXXXXXXXXX', '...XXXXXXXXXXXXX..', '...X.X.......X.X..', '..................'];
type Tool = { name: string; target: string; lines: string[]; summary?: string; error?: boolean };
type Turn = { id: number; text: string; bash: boolean; tools: Tool[]; answer: string[] };

/** `**bold**` and `code`, the only markdown the scripted answers use. */
function Markdown({ text }: { text: string }) {
  return <>{text.split(/(\*\*[^*]+\*\*|`[^`]+`)/).map((part, index) => part.startsWith('**') ? <strong key={index}>{part.slice(2, -2)}</strong> : part.startsWith('`') ? <code key={index}>{part.slice(1, -1)}</code> : part)}</>;
}

export function TerminalApp({ onApp, onCase, onExit }: { onApp: (app: PcApp) => void; onCase: (id: string) => void; onExit: () => void }) {
  const t = useDictionary().pc.terminal;
  const [cwd, setCwd] = useState(HOME);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [line, setLine] = useState('');
  const [busy, setBusy] = useState<{ verb: string; frame: number; text: string } | null>(null);
  const history = useRef<string[]>([]), cursor = useRef(0), nextId = useRef(1), place = useRef(cwd);
  const input = useRef<HTMLInputElement>(null), end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest' }); }, [turns, busy]);
  const running = !!busy;
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setBusy(current => current && { ...current, frame: current.frame + 1 }), 110);
    return () => clearInterval(timer);
  }, [running]);
  const finish = (text: string) => {
    const bash = text.startsWith('!'), id = nextId.current++;
    if (isCommand(text)) {
      const result = run(text, place.current);
      const target = text.replace(/^[/!]\s*/, '');
      setTurns(current => result.action?.kind === 'clear' ? [] : [...current, { id, text, bash, answer: [], tools: [{ name: 'Bash', target, lines: result.output, error: result.error }] }]);
      place.current = result.cwd; setCwd(result.cwd); setBusy(null);
      if (result.action?.kind === 'exit') onExit();
      if (result.action?.kind === 'app') onApp(result.action.app);
      if (result.action?.kind === 'case') onCase(result.action.id);
    } else {
      const reply = ask(text);
      setTurns(current => [...current, { id, text, bash, answer: reply.text, tools: reply.tools.map(tool => ({ ...tool, lines: [] })) }]);
      setBusy(null);
    }
    requestAnimationFrame(() => input.current?.focus());
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const text = line.trim();
    if (!text || busy) return;
    history.current.push(text); cursor.current = history.current.length; setLine('');
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { finish(text); return; }
    setBusy({ verb: VERBS[history.current.length % VERBS.length]!, frame: 0, text });
    setTimeout(() => finish(text), isCommand(text) ? COMMAND_MS : QUESTION_MS);
  };
  const key = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Tab') { event.preventDefault(); setLine(complete(line, cwd)); return; }
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    event.preventDefault();
    cursor.current = Math.max(0, Math.min(history.current.length, cursor.current + (event.key === 'ArrowUp' ? -1 : 1)));
    setLine(history.current[cursor.current] ?? '');
  };
  const suggestions = line.startsWith('/') && !line.includes(' ') ? COMMANDS.filter(name => `/${name}`.startsWith(line)) : [];
  const bashMode = line.startsWith('!');
  return <div className={styles.terminal} onClick={() => { if (!getSelection()?.toString()) input.current?.focus(); }}>
    <header className={styles.ccHeader}>
      <svg viewBox="0 0 18 6" preserveAspectRatio="none" aria-hidden="true">{CLAWD.flatMap((row, y) => [...row].map((pixel, x) => pixel === 'X' ? <rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" /> : null))}</svg>
      <div><p><strong>Claude Code</strong> <span>v2.1.314</span></p><p><span>{t.model}</span></p><p><span>{display(cwd)}</span></p></div>
    </header>
    <div role="log" aria-live="polite" aria-label={t.log}>{turns.map(turn => <div key={turn.id}>
      <p className={styles.ccUser}><span>{turn.bash ? '!' : '❯'}</span> {turn.bash ? turn.text.slice(1) : turn.text}</p>
      {turn.tools.map(tool => <div key={tool.target} className={styles.ccBlock}>
        <p className={styles.ccMessage}><span className={tool.error ? styles.ccDotError : styles.ccDotOk}>●</span><span><strong>{tool.name}</strong>({tool.target})</span></p>
        {(tool.summary ? [tool.summary] : tool.lines).map((text, index) => <p key={index} className={styles.ccResult}><span aria-hidden="true">{index ? '' : '⎿'}</span><span className={tool.error ? styles.ccFailure : undefined}>{text}</span></p>)}
      </div>)}
      {turn.answer.length > 0 && <div className={`${styles.ccBlock} ${styles.ccMessage}`}><span>●</span><div>{turn.answer.map((text, index) => <p key={index}><Markdown text={text} /></p>)}</div></div>}
    </div>)}</div>
    {busy && <>
      <p className={styles.ccUser}><span>{busy.text.startsWith('!') ? '!' : '❯'}</span> {busy.text.replace(/^!/, '')}</p>
      <p className={styles.ccSpinner} role="status"><span aria-hidden="true">{SPINNER[busy.frame % SPINNER.length]}</span> {busy.verb}… <small>{t.escape}</small></p>
    </>}
    <form onSubmit={submit} className={styles.ccInput} data-bash={bashMode}>
      <span aria-hidden="true">{bashMode ? '!' : '❯'}</span>
      <input id="pc-terminal-input" ref={input} autoFocus aria-label={fill(t.input, { cwd: display(cwd) })} placeholder={turns.length ? '' : t.placeholder} value={bashMode ? line.slice(1) : line} onChange={event => setLine((bashMode ? '!' : '') + event.target.value)} onKeyDown={key} autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false} enterKeyHint="send" />
    </form>
    {suggestions.length > 0 ? <ul className={styles.ccOptions}>{suggestions.map(name => <li key={name}>/{name}</li>)}</ul> : <p className={styles.ccHint}><span>{bashMode ? t.bashMode : t.hint}</span></p>}
    <div ref={end} />
  </div>;
}

const LANGUAGE_COLORS: Record<string, string> = { TypeScript: '#3178c6', JavaScript: '#f1e05a', 'Jupyter Notebook': '#DA5B0B', Python: '#3572A5', HTML: '#e34c26', CSS: '#663399' };
const MARK = 'M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z';

function Language({ name }: { name: string | null }) {
  return name ? <span className={styles.ghLanguage}><i style={{ background: LANGUAGE_COLORS[name] ?? '#8b949e' }} />{name}</span> : null;
}

/** The GitHub profile page, drawn from the real public snapshot. */
export function GithubApp() {
  const t = useDictionary().pc.github;
  const [tab, setTab] = useState<'overview' | 'repositories'>('overview');
  const { profile, contributions, repos, login } = GITHUB;
  // The calendar starts on a Sunday, so the days fill columns of seven like on the real profile.
  return <div className={styles.github}>
    <header className={styles.ghHeader}>
      <svg viewBox="0 0 16 16" width="30" height="30" aria-hidden="true"><path fill="currentColor" d={MARK} /></svg>
      <strong>{login}</strong>
      <span className={styles.ghSearch}><Search size={13} aria-hidden="true" />Type / to search</span>
    </header>
    <nav className={styles.ghTabs} aria-label={t.tabs}>
      <button type="button" aria-current={tab === 'overview' ? 'page' : undefined} onClick={() => setTab('overview')}><BookOpen size={15} aria-hidden="true" />Overview</button>
      <button type="button" aria-current={tab === 'repositories' ? 'page' : undefined} onClick={() => setTab('repositories')}><BookMarked size={15} aria-hidden="true" />Repositories<span>{repos.length}</span></button>
    </nav>
    <div className={styles.ghLayout}>
      <aside>
        <img src={profile.avatarUrl} alt={fill(t.avatar, { name: profile.name })} width={230} height={230} loading="lazy" referrerPolicy="no-referrer" />
        <h3>{profile.name}</h3>
        <p className={styles.ghLogin}>{login}</p>
        <a className={styles.ghFollow} href={PUBLIC_PROFILE.github} target="_blank" rel="noreferrer">Follow</a>
        {profile.bio && <p>{profile.bio}</p>}
        <p className={styles.ghMuted}><Users size={14} aria-hidden="true" /><b>{profile.followers}</b> follower{profile.followers === 1 ? '' : 's'} · <b>{profile.following}</b> following</p>
        {profile.location && <p className={styles.ghMuted}><MapPin size={14} aria-hidden="true" />{profile.location}</p>}
      </aside>
      <main>
        {tab === 'overview' ? <>
          <h4>Popular repositories</h4>
          <ul className={styles.ghPinned}>{repos.slice(0, 6).map(repo => <li key={repo.name}><div><a href={repo.url} target="_blank" rel="noreferrer">{repo.name}</a><span>Public</span></div><p>{repo.description}</p><Language name={repo.language} /></li>)}</ul>
          <h4>{contributions.total} contributions in the last year</h4>
          <div className={styles.ghCalendar} role="img" aria-label={fill(t.contributions, { total: contributions.total })}>{contributions.levels.map((level, index) => <i key={index} data-level={level} />)}</div>
        </> : <ul className={styles.ghRepos}>{repos.map(repo => <li key={repo.name}><div><a href={repo.url} target="_blank" rel="noreferrer">{repo.name}</a><span>Public</span></div>{repo.description && <p>{repo.description}</p>}<small><Language name={repo.language} />Updated {repo.pushedAt}</small></li>)}</ul>}
        <p className={styles.ghMuted}>{fill(t.snapshot, { date: GITHUB.generatedAt })}</p>
      </main>
    </div>
  </div>;
}

export function ProjectsApp({ onCase }: { onCase: (id: string) => void }) {
  return <div className={styles.files}>{PROJECTS.map(project => <button key={project.id} type="button" title={project.tagline} onClick={() => onCase(project.id)}><img src="/pc-icons/folder.webp" alt="" width={64} height={64} /><span>{project.name}</span></button>)}</div>;
}

export function ContactApp() {
  return <div className={styles.list}>
    <header><h3>{PUBLIC_PROFILE.name}</h3></header>
    <p className={styles.note}>{PUBLIC_PROFILE.availability}</p>
    <ul>
      <li><a href={PUBLIC_PROFILE.linkedin} target="_blank" rel="noreferrer"><strong>LinkedIn</strong><span>{PUBLIC_PROFILE.linkedin.replace('https://www.', '')}</span></a></li>
      <li><a href={PUBLIC_PROFILE.github} target="_blank" rel="noreferrer"><strong>GitHub</strong><span>{PUBLIC_PROFILE.github.replace('https://', '')}</span></a></li>
    </ul>
  </div>;
}

const NOTES = [{ file: 'README.md', title: 'about' }, { file: 'trayectoria.txt', title: 'career' }] as const;
export function TrashApp() {
  return <p className={styles.empty}>{useDictionary().pc.trash}</p>;
}

/** Preview: the browser's own PDF viewer in a frame; the download link covers phones that only show the first page. */
export function CvApp() {
  const t = useDictionary().pc.cv;
  // The CV opens in the page's language; both stay one click away.
  const [language, setLanguage] = useState<'ES' | 'EN'>(useLocale() === 'en' ? 'EN' : 'ES');
  const file = `/cv/CV_Daniel_Cantor_${language}.pdf`;
  return <div className={styles.preview}>
    <div className={styles.previewBar}>
      <div role="group" aria-label={t.language}>{(['ES', 'EN'] as const).map(id => <button key={id} type="button" lang={id.toLowerCase()} aria-pressed={id === language} onClick={() => setLanguage(id)}>{id === 'ES' ? t.spanish : t.english}</button>)}</div>
      <a href={file} download>{t.download}<Download size={14} aria-hidden="true" /></a>
    </div>
    <iframe key={file} src={`${file}#toolbar=0&navpanes=0&view=FitH`} title={fill(t.title, { name: PUBLIC_PROFILE.name })} />
  </div>;
}

export function NotesApp() {
  const t = useDictionary().pc.notes;
  const [open, setOpen] = useState<(typeof NOTES)[number]>(NOTES[0]);
  return <div className={styles.split}>
    <nav aria-label={t.label}>{NOTES.map(note => <button key={note.file} type="button" aria-current={note === open ? 'true' : undefined} onClick={() => setOpen(note)}>{t[note.title]}</button>)}</nav>
    <article><h3>{t[open.title]}</h3>{run(`cat ${open.file}`, HOME).output.map((text, index) => <p key={index}>{text}</p>)}</article>
  </div>;
}

const SETTINGS = [{ id: 'wallpaper', icon: Wallpaper }, { id: 'sound', icon: Volume2 }, { id: 'about', icon: Monitor }] as const;
export function SettingsApp({ wallpaper, onWallpaper, sound, onSound }: { wallpaper: WallpaperId; onWallpaper: (id: WallpaperId) => void; sound: boolean; onSound: () => void }) {
  const t = useDictionary().pc.settings;
  const [page, setPage] = useState<(typeof SETTINGS)[number]['id']>('wallpaper');
  return <div className={styles.split}>
    <nav aria-label={t.label}>
      <p className={styles.account}>
        <img src={GITHUB.profile.avatarUrl} alt="" width={36} height={36} referrerPolicy="no-referrer" /><span>{PUBLIC_PROFILE.name}<small>Taller OS</small></span>
      </p>
      {SETTINGS.map(({ id, icon: Icon }) => <button key={id} type="button" aria-current={id === page ? 'true' : undefined} onClick={() => setPage(id)}><Icon size={15} aria-hidden="true" />{t[id]}</button>)}
    </nav>
    <article>
      <h3>{t[page]}</h3>
      {page === 'wallpaper' && <div className={styles.swatches}>{(Object.keys(WALLPAPERS) as WallpaperId[]).map(id => <button key={id} type="button" className={WALLPAPERS[id]} aria-label={fill(t.wallpaperOf, { name: t.wallpapers[id] })} aria-pressed={id === wallpaper} onClick={() => onWallpaper(id)} />)}</div>}
      {page === 'sound' && <div className={styles.setting}><span>{t.workshopSound}</span><button type="button" role="switch" aria-checked={sound} aria-label={t.workshopSound} onClick={onSound}>{sound ? <Volume2 size={15} aria-hidden="true" /> : <VolumeX size={15} aria-hidden="true" />}{sound ? t.on : t.off}</button></div>}
      {page === 'about' && <><p>{fill(t.aboutText, { name: PUBLIC_PROFILE.name })}</p><p>{t.builtWith}</p></>}
    </article>
  </div>;
}
