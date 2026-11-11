import { useMemo } from 'react';
import type { Content } from '../../../data/content/content';
import { useContent } from '../../../data/content/content';
import { PORTFOLIO_CAREER } from '../../../data/portfolio-career';
import { PROJECTS } from '../../../data/projects';
import { PUBLIC_PROFILE } from '../../../data/public-profile';
import snapshot from '../../../data/github-snapshot.json';
import { es, type Dictionary } from '../../../i18n/es';
import { fill } from '../../../i18n/format';
import { useDictionary } from '../../../i18n/locale-provider';

/** The workshop PC terminal (specs/workshop-realism.md, R.1b): every file is generated from the portfolio data. */
export type PcApp = 'terminal' | 'github' | 'projects' | 'contact' | 'notes' | 'settings' | 'trash' | 'cv';
export type ShellAction = { kind: 'clear' } | { kind: 'exit' } | { kind: 'app'; app: PcApp } | { kind: 'case'; id: string };
export interface ShellResult { output: string[]; cwd: string; error?: boolean; action?: ShellAction }
export interface Answer { tools: { name: string; target: string; summary: string }[]; text: string[] }
export const GITHUB = snapshot;
export const HOME = '/home/daniel';
export const COMMANDS = ['help', 'whoami', 'pwd', 'ls', 'cd', 'cat', 'projects', 'open', 'github', 'cv', 'git', 'contact', 'clear', 'exit'];

type ShellText = Dictionary['pc']['shell'];
type ShellData = Pick<Content, 'projects' | 'career' | 'availability'>;
type Project = ShellData['projects'][number];

export const display = (cwd: string) => cwd === HOME ? '~' : cwd.startsWith(`${HOME}/`) ? `~${cwd.slice(HOME.length)}` : cwd;
export const prompt = (cwd: string) => `daniel@taller:${display(cwd)}$`;

const repoLine = (repo: (typeof snapshot.repos)[number]) => `${repo.pushedAt}  ${repo.name}${repo.language ? `  (${repo.language})` : ''}`;
const lines = (...rows: string[]) => rows.join('\n');
const normalize = (text: string) => text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const compact = (text: string) => text.replace(/[^a-z0-9]/g, '');
const GENERIC = new Set(['studio', 'center', 'command']);
/** Every way a visitor may name a project: its name, id, slug and their distinctive words ("academy", "intranet"). */
const aliases = (project: Project) => [project.name, project.id, project.slug, ...project.id.split('-'), ...project.name.split(/\s+/)]
  .map(alias => normalize(alias).replace(/[^a-z0-9]/g, '')).filter(alias => alias.length >= 4 && !GENERIC.has(alias));
/** Whole-word match, so "go" or "r" never hit inside other words. "Next.js" also matches "nextjs" and "next js". */
const mentionsTechnology = (text: string, name: string) => {
  const key = normalize(name).replace(/[^a-z0-9]+/g, ' ').trim();
  return key.length > 1 && new RegExp(`(^|[^a-z0-9])(${key.replace(/ /g, '[^a-z0-9]?')})([^a-z0-9]|$)`).test(text.replace(/[^a-z0-9]+/g, ' '));
};

/**
 * The terminal in one language (specs/i18n-english.md, I.4): its files, commands and scripted answers are built from
 * that language's content and texts. There is no model behind it: every answer comes from the portfolio data.
 */
export function createShell(data: ShellData, t: ShellText) {
  const { projects, career, availability } = data;
  const dir = `${HOME}/${t.files.projects}`;
  const FILES: Record<string, string> = {
    [`${HOME}/README.md`]: lines(`${PUBLIC_PROFILE.name} · ${PUBLIC_PROFILE.role}`, PUBLIC_PROFILE.location, '', availability),
    [`${HOME}/${t.files.career}`]: [...career.experience, ...career.education].map(item => `${item.period}  ${item.title} · ${item.organization}`).join('\n'),
    [`${HOME}/${t.files.contact}`]: lines(`GitHub    ${PUBLIC_PROFILE.github}`, `LinkedIn  ${PUBLIC_PROFILE.linkedin}`),
    [`${HOME}/github/repos.txt`]: snapshot.repos.length ? snapshot.repos.map(repoLine).join('\n') : t.noData,
    ...Object.fromEntries(projects.map(project => [`${dir}/${project.id}.txt`, lines(project.name, project.tagline, '', project.summary, '', `Stack: ${project.technologies.map(technology => technology.name).join(', ')}`)])),
  };
  /** Easter eggs: left out of help and of the Tab list on purpose, finding them is the point. */
  const EGGS: Record<string, readonly string[]> = { ...t.eggs, neofetch: [] };
  const technologies = [...new Set(projects.flatMap(project => project.technologies.map(technology => technology.name)))];
  const date = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString(t.dateLocale, { month: 'long', year: 'numeric' });
  const a = t.answers, k = t.keywords;

  function resolve(cwd: string, path = '') {
    const base = path.startsWith('/') ? [] : (path === '~' || path.startsWith('~/') ? HOME : cwd).split('/');
    const parts = base.filter(Boolean);
    for (const part of path.replace(/^~\/?/, '').split('/')) {
      if (part === '..') parts.pop();
      else if (part && part !== '.') parts.push(part);
    }
    return `/${parts.join('/')}`;
  }
  const isDirectory = (path: string) => path === '/' || Object.keys(FILES).some(file => file.startsWith(`${path}/`));
  function list(path: string) {
    const prefix = path === '/' ? '/' : `${path}/`;
    return [...new Set(Object.keys(FILES).filter(file => file.startsWith(prefix)).map(file => {
      const [name, ...rest] = file.slice(prefix.length).split('/');
      return rest.length ? `${name}/` : name!;
    }))].sort();
  }
  const findProject = (name = '') => projects.find(project => project.id === name.toLowerCase() || project.slug === name.toLowerCase());

  function run(input: string, cwd: string): ShellResult {
    const [command, ...args] = input.trim().replace(/^[/!]\s*/, '').split(/\s+/);
    const fail = (message: string): ShellResult => ({ output: [message], cwd, error: true });
    const print = (...output: string[]): ShellResult => ({ output, cwd });
    switch (command) {
      case undefined: case '': return print();
      case 'help': return print(...t.help);
      case 'whoami': return print(`${PUBLIC_PROFILE.name} · ${PUBLIC_PROFILE.role} · ${PUBLIC_PROFILE.location}`);
      case 'pwd': return print(cwd);
      case 'ls': {
        const path = resolve(cwd, args[0]);
        if (FILES[path] !== undefined) return print(args[0]!);
        return isDirectory(path) ? print(list(path).join('  ')) : fail(fill(t.errors.lsMissing, { path: args[0] ?? '' }));
      }
      case 'cd': {
        const path = resolve(cwd, args[0] ?? '~');
        return isDirectory(path) ? { output: [], cwd: path } : fail(fill(t.errors.cdNotDirectory, { path: args[0] ?? '' }));
      }
      case 'cat': {
        if (!args[0]) return fail(t.errors.catNoFile);
        const path = resolve(cwd, args[0]), content = FILES[path];
        if (content !== undefined) return print(...content.split('\n'));
        return fail(fill(isDirectory(path) ? t.errors.catIsDirectory : t.errors.catMissing, { path: args[0] }));
      }
      case 'projects': return print(...projects.map(project => `${project.id.padEnd(18)} ${project.tagline}`));
      case 'open': {
        const project = findProject(args[0]);
        return project ? { output: [fill(t.opening, { name: project.name })], cwd, action: { kind: 'case', id: project.id } } : fail(fill(t.errors.openMissing, { name: args[0] ?? t.errors.empty }));
      }
      case 'github': return { output: [], cwd, action: { kind: 'app', app: 'github' } };
      case 'cv': return { output: [t.openingCv], cwd, action: { kind: 'app', app: 'cv' } };
      case 'neofetch': return print(`daniel@taller`, '-------------', 'OS: Taller OS', `Host: ${PUBLIC_PROFILE.location}`, `Shell: ${PUBLIC_PROFILE.role}`, `Stack: ${technologies.slice(0, 6).join(', ')}`, `${t.neofetchProjects}: ${projects.length}`, `Repos: ${snapshot.repos.length}`);
      case 'contact': return print(...FILES[`${HOME}/${t.files.contact}`]!.split('\n'));
      case 'git':
        if (args[0] === 'push') return fail(args.includes('--force') ? t.errors.gitForce : t.errors.gitPush);
        if (args[0] !== 'log') return fail(t.errors.gitOnlyLog);
        return print(...(snapshot.repos.length ? snapshot.repos.slice(0, 10).map(repoLine) : [t.noData]));
      case 'clear': return { output: [], cwd, action: { kind: 'clear' } };
      case 'exit': return { output: [], cwd, action: { kind: 'exit' } };
      default: return EGGS[command!]?.length ? print(...EGGS[command!]!) : fail(fill(t.errors.notFound, { command: command! }));
    }
  }

  /** Tab: the first word completes commands; the rest paths (projects for `open`). Returns the line unchanged without a single match. */
  function complete(input: string, cwd: string) {
    const words = input.split(' ');
    const last = words[words.length - 1]!;
    let matches: string[];
    if (words.length === 1) matches = COMMANDS.map(name => (last.startsWith('/') ? `/${name}` : name)).filter(name => name.startsWith(last));
    else if (words[0] === 'open') matches = projects.map(project => project.id).filter(id => id.startsWith(last));
    else {
      const slash = last.lastIndexOf('/') + 1, folder = last.slice(0, slash), start = last.slice(slash);
      matches = list(resolve(cwd, folder)).filter(name => name.startsWith(start)).map(name => folder + name);
    }
    if (matches.length !== 1) return input;
    return [...words.slice(0, -1), matches[0]].join(' ') + (matches[0]!.endsWith('/') ? '' : ' ');
  }

  /** A shell line, as opposed to a question: a known command, `/command` or `!command`. */
  const isCommand = (input: string) => { const word = input.trim().split(/\s+/)[0]!; return /^[/!]/.test(word) || COMMANDS.includes(word) || word in EGGS; };
  const read = (file: string) => ({ name: 'Read', target: file, summary: `Read ${FILES[`${HOME}/${file}`]!.split('\n').length} lines` });
  const filesSummary = (count: number) => fill(a.files, { count });

  /** Questions about one project, answered only from its case data; anything missing says so instead of guessing. */
  function aboutProject(project: Project, has: (words: readonly string[]) => boolean): Answer {
    const tools = [read(`${t.files.projects}/${project.id}.txt`)];
    const answer = (...text: string[]) => ({ tools, text: [...text, fill(a.fullCase, { id: project.id })] });
    if (has(k.stack)) return answer(fill(a.uses, { name: project.name, list: project.technologies.map(technology => technology.name).join(', ') }));
    if (has(k.challenges)) return answer(...(project.challenges.length ? project.challenges.map(item => `- **${item.title}**${item.resolution ? `: ${item.resolution}` : ''}`) : [a.noChallenges]));
    if (has(k.decisions)) return answer(...(project.engineeringDecisions.length ? project.engineeringDecisions.map(item => `- **${item.title}**: ${item.decision}`) : [a.noDecisions]));
    if (has(k.lessons)) return answer(...(project.lessonsLearned.length ? project.lessonsLearned.map(item => `- **${item.title}**: ${item.description}`) : [a.noLessons]));
    if (has(k.role)) return answer(fill(a.role, { title: project.role.title }), ...project.role.responsibilities.map(item => `- ${item}`));
    if (has(k.dates)) return answer(fill(a.started, { date: date(project.startedAt), end: project.completedAt ? fill(a.ended, { date: date(project.completedAt) }) : a.ongoing }), ...(project.metrics.durationWeeks ? [fill(a.duration, { weeks: project.metrics.durationWeeks })] : []));
    if (has(k.link)) return answer(project.links.live ? fill(a.live, { url: project.links.live }) : a.noLive);
    if (has(k.features)) return answer(...project.features.map(item => `- **${item.title}**: ${item.description}`));
    return answer(`**${project.name}**: ${project.summary}`, a.askMore);
  }

  /** The terminal's chat: scripted, every answer comes from the portfolio data. */
  function ask(question: string): Answer {
    const text = normalize(question);
    // Padded so keywords with spaces (" hi ", "usas ") also match at either end of the question.
    const has = (words: readonly string[]) => words.some(word => ` ${text} `.includes(word));
    const project = projects.find(item => aliases(item).some(alias => compact(text).includes(alias)));
    if (project) return aboutProject(project, has);
    const technology = technologies.find(name => mentionsTechnology(text, name));
    if (technology) {
      const used = projects.filter(item => item.technologies.some(entry => entry.name === technology));
      return { tools: [{ name: 'Grep', target: `${technology} ~/${t.files.projects}`, summary: filesSummary(used.length) }], text: [fill(a.usedIn, { name: technology }), ...used.map(item => `- **${item.name}**: ${item.tagline}`)] };
    }
    const ls = { name: 'Bash', target: `ls ~/${t.files.projects}`, summary: filesSummary(projects.length) };
    if (has(k.usedTech)) return { tools: [{ name: 'Grep', target: `~/${t.files.projects}`, summary: a.noMatches }], text: [a.notInPortfolio] };
    if (has(k.featured)) return { tools: [ls], text: [a.featured, ...projects.filter(item => item.featured).map(item => `- **${item.name}**: ${item.tagline}`)] };
    if (has(k.projects)) return { tools: [ls], text: [a.projects, ...projects.map(item => `- **${item.name}**: ${item.tagline}`)] };
    if (has(k.contact)) return { tools: [read(t.files.contact)], text: [availability, `- GitHub: ${PUBLIC_PROFILE.github}`, `- LinkedIn: ${PUBLIC_PROFILE.linkedin}`] };
    if (has(k.career)) return { tools: [read(t.files.career)], text: FILES[`${HOME}/${t.files.career}`]!.split('\n').map(line => `- ${line}`) };
    if (has(k.stackGeneral)) return { tools: [{ name: 'Grep', target: `Stack: ~/${t.files.projects}`, summary: filesSummary(projects.length) }], text: [fill(a.mostUsed, { list: technologies.slice(0, 12).join(', ') })] };
    if (has(k.github)) return { tools: [read('github/repos.txt')], text: [fill(a.repos, { count: snapshot.repos.length })] };
    if (has(k.ai)) return { tools: [], text: [a.demo] };
    if (has(k.who)) return { tools: [read('README.md')], text: [fill(a.who, { name: PUBLIC_PROFILE.name, role: PUBLIC_PROFILE.role, location: PUBLIC_PROFILE.location }), availability] };
    if (has(k.hello)) return { tools: [], text: [a.hello] };
    return { tools: [], text: [a.fallback] };
  }

  return { run, complete, ask, isCommand, files: t.files };
}

/** The terminal in the page's language. */
export function useShell() {
  const { projects, career, availability } = useContent();
  const t = useDictionary().pc.shell;
  return useMemo(() => createShell({ projects, career, availability }, t), [projects, career, availability, t]);
}

/** Spanish, the default locale: what tests and non-React callers use. */
export const { run, complete, ask, isCommand } = createShell({ projects: PROJECTS, career: PORTFOLIO_CAREER, availability: PUBLIC_PROFILE.availability }, es.pc.shell);
