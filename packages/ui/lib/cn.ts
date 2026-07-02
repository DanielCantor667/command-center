import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const twMerge = extendTailwindMerge<'text-size' | 'text-color'>({
  extend: {
    classGroups: {
      'text-size': [
        {
          text: [
            'display-xl',
            'display-l',
            'heading-xl',
            'heading-l',
            'heading-m',
            'title',
            'body-l',
            'body',
            'body-small',
            'caption',
            'mono',
            'mono-small',
          ],
        },
      ],
      'text-color': [
        {
          text: ['text-primary', 'text-secondary', 'text-muted', 'accent', 'danger'],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(...inputs));
}
