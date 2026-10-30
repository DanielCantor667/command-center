import { PORTFOLIO_CAREER } from '../../../data/portfolio-career';
import { PROJECTS } from '../../../data/projects';
import { PUBLIC_PROFILE } from '../../../data/public-profile';
import snapshot from '../../../data/github-snapshot.json';

/** The workshop PC terminal (specs/workshop-realism.md, R.1b): every file is generated from the portfolio data. */
export type PcApp = 'terminal' | 'github' | 'projects' | 'contact' | 'notes' | 'settings' | 'trash' | 'cv';
export type ShellAction = { kind: 'clear' } | { kind: 'exit' } | { kind: 'app'; app: PcApp } | { kind: 'case'; id: string };
export interface ShellResult { output: string[]; cwd: string; error?: boolean; action?: ShellAction }
export const GITHUB = snapshot;
export const HOME = '/home/daniel';

const repoLine = (repo: (typeof snapshot.repos)[number]) => `${repo.pushedAt}  ${repo.name}${repo.language ? `  (${repo.language})` : ''}`;
const lines = (...rows: string[]) => rows.join('\n');
const FILES: Record<string, string> = {
  [`${HOME}/README.md`]: lines(`${PUBLIC_PROFILE.name} · ${PUBLIC_PROFILE.role}`, PUBLIC_PROFILE.location, '', PUBLIC_PROFILE.availability),
  [`${HOME}/trayectoria.txt`]: [...PORTFOLIO_CAREER.experience, ...PORTFOLIO_CAREER.education].map(item => `${item.period}  ${item.title} · ${item.organization}`).join('\n'),
  [`${HOME}/contacto.txt`]: lines(`GitHub    ${PUBLIC_PROFILE.github}`, `LinkedIn  ${PUBLIC_PROFILE.linkedin}`),
  [`${HOME}/github/repos.txt`]: snapshot.repos.length ? snapshot.repos.map(repoLine).join('\n') : 'sin datos',
  ...Object.fromEntries(PROJECTS.map(project => [`${HOME}/proyectos/${project.id}.txt`, lines(project.name, project.tagline, '', project.summary, '', `Stack: ${project.technologies.map(technology => technology.name).join(', ')}`)])),
};
export const COMMANDS = ['help', 'whoami', 'pwd', 'ls', 'cd', 'cat', 'projects', 'open', 'github', 'cv', 'git', 'contact', 'clear', 'exit'];
/** Easter eggs: left out of help and of the Tab list on purpose, finding them is the point. */
const EGGS: Record<string, string[]> = {
  sudo: ['daniel no está en el archivo sudoers. Este incidente será reportado.'],
  rm: ['rm: no. Este taller costó demasiado horneado.'],
  vim: ['Entraste a vim. Nadie ha vuelto para contarlo.', 'Pista: esto no es vim. Sigues a salvo.'],
  nano: ['Bien elegido. Aquí nadie juzga, pero tampoco edita: el disco es de solo lectura.'],
  emacs: ['Primero termina de instalarse. Vuelve en unos días.'],
  ssh: ['ssh: conexión rechazada. El robot de la puerta no te conoce.'],
  ping: ['64 bytes desde el gato: tiempo=9 vidas', '64 bytes desde el gato: tiempo=ignorado'],
  coffee: ['Error 418: soy una tetera.'],
  neofetch: [],
};

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
export const display = (cwd: string) => cwd === HOME ? '~' : cwd.startsWith(`${HOME}/`) ? `~${cwd.slice(HOME.length)}` : cwd;
export const prompt = (cwd: string) => `daniel@taller:${display(cwd)}$`;

const findProject = (name = '') => PROJECTS.find(project => project.id === name.toLowerCase() || project.slug === name.toLowerCase());

export function run(input: string, cwd: string): ShellResult {
  const [command, ...args] = input.trim().replace(/^[/!]\s*/, '').split(/\s+/);
  const fail = (message: string): ShellResult => ({ output: [message], cwd, error: true });
  const print = (...output: string[]): ShellResult => ({ output, cwd });
  switch (command) {
    case undefined: case '': return print();
    case 'help': return print('whoami           quién soy', 'ls, cd, cat, pwd  recorrer los archivos', 'projects         lista de proyectos', 'open <proyecto>  abrir un caso', 'github           mis repositorios', 'cv               abrir mi CV', 'git log          últimos repositorios con cambios', 'contact          cómo escribirme', 'clear            limpiar la pantalla', 'exit             volver al taller');
    case 'whoami': return print(`${PUBLIC_PROFILE.name} · ${PUBLIC_PROFILE.role} · ${PUBLIC_PROFILE.location}`);
    case 'pwd': return print(cwd);
    case 'ls': {
      const path = resolve(cwd, args[0]);
      if (FILES[path] !== undefined) return print(args[0]!);
      return isDirectory(path) ? print(list(path).join('  ')) : fail(`ls: ${args[0]}: no existe el archivo o directorio`);
    }
    case 'cd': {
      const path = resolve(cwd, args[0] ?? '~');
      return isDirectory(path) ? { output: [], cwd: path } : fail(`cd: ${args[0]}: no es un directorio`);
    }
    case 'cat': {
      if (!args[0]) return fail('cat: falta el archivo');
      const path = resolve(cwd, args[0]), content = FILES[path];
      if (content !== undefined) return print(...content.split('\n'));
      return fail(`cat: ${args[0]}: ${isDirectory(path) ? 'es un directorio' : 'no existe el archivo o directorio'}`);
    }
    case 'projects': return print(...PROJECTS.map(project => `${project.id.padEnd(18)} ${project.tagline}`));
    case 'open': {
      const project = findProject(args[0]);
      return project ? { output: [`Abriendo ${project.name}…`], cwd, action: { kind: 'case', id: project.id } } : fail(`open: ${args[0] ?? '(vacío)'}: proyecto no encontrado. Usa projects.`);
    }
    case 'github': return { output: [], cwd, action: { kind: 'app', app: 'github' } };
    case 'cv': return { output: ['Abriendo el CV…'], cwd, action: { kind: 'app', app: 'cv' } };
    case 'neofetch': return print(`daniel@taller`, '-------------', 'OS: Taller OS', `Host: ${PUBLIC_PROFILE.location}`, `Shell: ${PUBLIC_PROFILE.role}`, `Stack: ${[...new Set(PROJECTS.flatMap(project => project.technologies.map(technology => technology.name)))].slice(0, 6).join(', ')}`, `Proyectos: ${PROJECTS.length}`, `Repos: ${snapshot.repos.length}`);
    case 'contact': return print(...FILES[`${HOME}/contacto.txt`]!.split('\n'));
    case 'git':
      if (args[0] === 'push') return fail(args.includes('--force') ? 'git: un viernes, en serio? No.' : 'git: nada que subir. El taller ya está desplegado.');
      if (args[0] !== 'log') return fail(`git: solo está disponible git log`);
      return print(...(snapshot.repos.length ? snapshot.repos.slice(0, 10).map(repoLine) : ['sin datos']));
    case 'clear': return { output: [], cwd, action: { kind: 'clear' } };
    case 'exit': return { output: [], cwd, action: { kind: 'exit' } };
    default: return EGGS[command!]?.length ? print(...EGGS[command!]!) : fail(`zsh: command not found: ${command}`);
  }
}

/** Tab: the first word completes commands; the rest paths (projects for `open`). Returns the line unchanged without a single match. */
export function complete(input: string, cwd: string) {
  const words = input.split(' ');
  const last = words[words.length - 1]!;
  let matches: string[];
  if (words.length === 1) matches = COMMANDS.map(name => (last.startsWith('/') ? `/${name}` : name)).filter(name => name.startsWith(last));
  else if (words[0] === 'open') matches = PROJECTS.map(project => project.id).filter(id => id.startsWith(last));
  else {
    const slash = last.lastIndexOf('/') + 1, folder = last.slice(0, slash), start = last.slice(slash);
    matches = list(resolve(cwd, folder)).filter(name => name.startsWith(start)).map(name => folder + name);
  }
  if (matches.length !== 1) return input;
  return [...words.slice(0, -1), matches[0]].join(' ') + (matches[0]!.endsWith('/') ? '' : ' ');
}

export interface Answer { tools: { name: string; target: string; summary: string }[]; text: string[] }
const read = (file: string) => ({ name: 'Read', target: file, summary: `Read ${FILES[`${HOME}/${file}`]!.split('\n').length} lines` });
const normalize = (text: string) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
/** A shell line, as opposed to a question: a known command, `/command` or `!command`. */
export const isCommand = (input: string) => { const word = input.trim().split(/\s+/)[0]!; return /^[/!]/.test(word) || COMMANDS.includes(word) || word in EGGS; };

/** The terminal's chat. It is scripted, there is no model behind it: every answer comes from the portfolio data. */
export function ask(question: string): Answer {
  const text = normalize(question);
  const has = (...words: string[]) => words.some(word => text.includes(word));
  const project = PROJECTS.find(item => text.includes(normalize(item.name)) || text.includes(item.id));
  if (project) return { tools: [read(`proyectos/${project.id}.txt`)], text: [`**${project.name}**: ${project.summary}`, `Para abrir el caso completo: \`open ${project.id}\``] };
  if (has('proyecto', 'portafolio', 'que has hecho', 'construi')) return { tools: [{ name: 'Bash', target: 'ls ~/proyectos', summary: `${PROJECTS.length} archivos` }], text: ['Estos son los proyectos de Daniel:', ...PROJECTS.map(item => `- **${item.name}**: ${item.tagline}`)] };
  if (has('contact', 'contrat', 'trabaj', 'escrib', 'freelance', 'dispon')) return { tools: [read('contacto.txt')], text: [PUBLIC_PROFILE.availability, `- GitHub: ${PUBLIC_PROFILE.github}`, `- LinkedIn: ${PUBLIC_PROFILE.linkedin}`] };
  if (has('experiencia', 'trayectoria', 'estudi', 'carrera', 'cv')) return { tools: [read('trayectoria.txt')], text: FILES[`${HOME}/trayectoria.txt`]!.split('\n').map(line => `- ${line}`) };
  if (has('stack', 'tecnolog', 'lenguaje', 'framework')) return { tools: [{ name: 'Grep', target: 'Stack: ~/proyectos', summary: `${PROJECTS.length} archivos` }], text: [`Lo que más usa Daniel: ${[...new Set(PROJECTS.flatMap(item => item.technologies.map(technology => technology.name)))].slice(0, 12).join(', ')}.`] };
  if (has('github', 'repo', 'codigo')) return { tools: [read('github/repos.txt')], text: [`Tiene ${snapshot.repos.length} repositorios públicos. Abre Safari en el Dock para ver su perfil, o escribe \`github\`.`] };
  if (has('quien eres', 'eres claude', 'eres una ia', 'eres ia', 'modelo')) return { tools: [], text: ['Soy una demo: esta terminal imita Claude Code, pero no hay ninguna IA detrás. Las respuestas están programadas con los datos reales del portafolio.'] };
  if (has('daniel', 'quien', 'sobre ti')) return { tools: [read('README.md')], text: [`**${PUBLIC_PROFILE.name}**, ${PUBLIC_PROFILE.role} en ${PUBLIC_PROFILE.location}.`, PUBLIC_PROFILE.availability] };
  if (has('hola', 'buenas', 'hey')) return { tools: [], text: ['Hola. Pregúntame por los proyectos de Daniel, su experiencia, su stack o cómo contactarlo.'] };
  return { tools: [], text: ['No tengo respuesta para eso: soy una demo programada, sin IA detrás. Pregúntame por los proyectos, la experiencia, el stack o el contacto de Daniel, o escribe `/help`.'] };
}
