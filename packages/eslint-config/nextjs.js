import { FlatCompat } from '@eslint/eslintrc';
import tseslint from 'typescript-eslint';
import baseConfig from './base.js';

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

export default [
  ...baseConfig,
  ...compat.extends('next/core-web-vitals'),
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'error',
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
  },
];
