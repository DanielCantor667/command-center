import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, expect, vi } from 'vitest';
import * as matchers from 'vitest-axe/matchers';

expect.extend(matchers);

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
});

afterEach(() => {
  cleanup();
});

// Components are tested outside the root layouts: Spanish, the default locale, stands in for LocaleProvider.
import { es } from './i18n/es';
import { setLocaleFallback } from './i18n/locale-provider';
setLocaleFallback({ locale: 'es', dictionary: es });
