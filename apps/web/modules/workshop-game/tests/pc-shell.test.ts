import { describe, expect, it } from 'vitest';
import { PROJECTS } from '../../../data/projects';
import { ask, complete, HOME, isCommand, prompt, run } from '../pc/shell';

describe('workshop PC shell', () => {
  it('walks the virtual files', () => {
    expect(run('ls', HOME).output[0]).toContain('proyectos/');
    const inside = run('cd proyectos', HOME);
    expect(inside.cwd).toBe(`${HOME}/proyectos`);
    expect(prompt(inside.cwd)).toBe('daniel@taller:~/proyectos$');
    expect(run('cd ..', inside.cwd).cwd).toBe(HOME);
    expect(run('cd', '/').cwd).toBe(HOME);
    expect(run('cat ../README.md', inside.cwd).output[0]).toContain('Daniel Cantor');
    expect(run('cat ~/proyectos/vevi.txt', '/').output[0]).toBe('Vevi');
  });

  it('reports errors without moving', () => {
    expect(run('nope', HOME)).toMatchObject({ error: true, output: ['zsh: command not found: nope'], cwd: HOME });
    expect(run('cd nada', HOME)).toMatchObject({ error: true, cwd: HOME });
    expect(run('cat proyectos', HOME).output[0]).toContain('es un directorio');
    expect(run('cat', HOME).error).toBe(true);
    expect(run('git push', HOME).error).toBe(true);
    expect(run('   ', HOME).output).toEqual([]);
  });

  it('asks the desktop to act', () => {
    expect(run('open KLINIU', HOME).action).toEqual({ kind: 'case', id: 'kliniu' });
    expect(run('open nada', HOME).error).toBe(true);
    expect(run('github', HOME).action).toEqual({ kind: 'app', app: 'github' });
    expect(run('clear', HOME).action).toEqual({ kind: 'clear' });
    expect(run('exit', HOME).action).toEqual({ kind: 'exit' });
    expect(run('/clear', HOME).action).toEqual({ kind: 'clear' });
  });

  it('lists every project', () => {
    expect(run('projects', HOME).output).toHaveLength(PROJECTS.length);
  });

  it('completes commands, paths and projects', () => {
    expect(complete('wh', HOME)).toBe('whoami ');
    expect(complete('c', HOME)).toBe('c'); // cat, cd, clear, contact
    expect(complete('cat proy', HOME)).toBe('cat proyectos/');
    expect(complete('cat proyectos/vev', HOME)).toBe('cat proyectos/vevi.txt ');
    expect(complete('open klin', HOME)).toBe('open kliniu ');
    expect(complete('/he', HOME)).toBe('/help ');
  });

  it('tells commands from questions', () => {
    expect(isCommand('ls proyectos')).toBe(true);
    expect(isCommand('/help')).toBe(true);
    expect(isCommand('!nope')).toBe(true);
    expect(isCommand('qué proyectos tienes')).toBe(false);
    expect(run('!whoami', HOME).output[0]).toContain('Daniel Cantor');
  });

  it('answers from the portfolio data and admits it is a demo', () => {
    expect(ask('háblame de Kliniu')).toMatchObject({ tools: [{ name: 'Read', target: 'proyectos/kliniu.txt' }] });
    expect(ask('¿qué proyectos tienes?').text).toHaveLength(PROJECTS.length + 1);
    expect(ask('quiero contratarte').text.join()).toContain('linkedin.com');
    expect(ask('¿eres una IA?').text[0]).toContain('no hay ninguna IA');
    expect(ask('qwerty').text[0]).toContain('sin IA');
  });
});
