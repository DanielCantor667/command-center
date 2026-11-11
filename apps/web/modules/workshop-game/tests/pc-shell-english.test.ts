import { describe, expect, it } from 'vitest';
import { localizeContent } from '../../../data/content/content';
import { ENGLISH_CONTENT } from '../../../data/content/en';
import { en } from '../../../i18n/en';
import { createShell, HOME } from '../pc/shell';

const content = localizeContent(ENGLISH_CONTENT);
const { run, ask } = createShell(content, en.pc.shell);

describe('terminal in English', () => {
  it('names its files in English and only knows the translated cases', () => {
    expect(run('ls', HOME).output[0]).toBe('README.md  career.txt  contact.txt  github/  projects/');
    expect(run('projects', HOME).output).toHaveLength(4);
    expect(run('open vevi', HOME)).toMatchObject({ error: true, output: ['open: vevi: project not found. Try projects.'] });
    expect(run('open kliniu', HOME).action).toEqual({ kind: 'case', id: 'kliniu' });
    expect(run('cat career.txt', HOME).output[0]).toContain('Full-Stack Developer');
    expect(run('nope', HOME).output[0]).toBe('zsh: command not found: nope');
  });
  it('answers per-project questions from the English case data', () => {
    const lorigine = content.projects.find(project => project.id === 'lorigine')!;
    expect(ask('what was hard about lorigine?').text[0]).toContain(lorigine.challenges[0]!.title);
    expect(ask('what stack did you use in kliniu?').text[0]).toMatch(/^\*\*Kliniu\*\* uses: /);
    expect(ask('when did academy start?').text[0]).toMatch(/^Started in \w+ 2026; still ongoing\.$/);
    expect(ask('tell me about drokex').text.at(-1)).toBe('Full case study: `open drokex`');
  });
  it('finds technologies only in the published cases, and says so when none used them', () => {
    const prisma = ask('have you used Prisma?').text;
    expect(prisma[0]).toBe('Daniel used **Prisma** in:');
    expect(prisma.join(' ')).not.toMatch(/Vevi|Intranet|Command Center/);
    expect(ask('have you used Cobol?').text[0]).toContain('does not appear');
  });
  it('greets, admits it is a demo and falls back in English', () => {
    expect(ask('hi').text[0]).toMatch(/^Hi\./);
    expect(ask('are you an AI?').text[0]).toContain('no AI behind it');
    expect(ask('qwerty').text[0]).toContain('scripted demo');
  });
});
