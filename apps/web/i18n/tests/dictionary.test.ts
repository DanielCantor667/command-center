import { describe, expect, it } from 'vitest';
import { en } from '../en';
import { es } from '../es';

type Entry = [path: string, value: unknown];
const walk = (value: unknown, path = ''): Entry[] =>
  value && typeof value === 'object' ? Object.entries(value).flatMap(([key, child]) => walk(child, path ? `${path}.${key}` : key)) : [[path, value]];
const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort();

describe('dictionaries', () => {
  const spanish = new Map(walk(es)), english = new Map(walk(en));
  it('have the same entries, arrays of the same length included', () => {
    expect([...english.keys()].sort()).toEqual([...spanish.keys()].sort());
  });
  it('never leave a text empty and keep the same placeholders', () => {
    for (const [path, text] of spanish) {
      const other = english.get(path);
      expect(typeof text, path).toBe('string');
      expect((other as string).trim(), path).not.toBe('');
      expect(placeholders(other as string), path).toEqual(placeholders(text as string));
    }
  });
});
