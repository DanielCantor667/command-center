import { describe, expect, it } from 'vitest';
import { cn } from '../cn';

describe('cn', () => {
  it('joins truthy class values', () => {
    // eslint-disable-next-line no-constant-binary-expression
    expect(cn('a', false && 'b', undefined, 'c')).toBe('a c');
  });

  it('merges conflicting Tailwind utilities, keeping the last one', () => {
    expect(cn('p-8', 'p-16')).toBe('p-16');
  });

  it('lets a longhand override a shorthand of the same property', () => {
    expect(cn('p-16', 'px-0')).toBe('p-16 px-0');
  });

  it('keeps a typography size variant and a color class together (no false conflict)', () => {
    expect(cn('text-display-xl', 'text-text-primary')).toBe('text-display-xl text-text-primary');
  });

  it('merges conflicting typography size variants, keeping the last one', () => {
    expect(cn('text-body', 'text-heading-l')).toBe('text-heading-l');
  });

  it('does not conflict-resolve a standard font-size utility against a typography variant', () => {
    expect(cn('text-sm', 'text-heading-l')).toBe('text-sm text-heading-l');
  });
});
