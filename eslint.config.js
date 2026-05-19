// @ts-check
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import unicorn from 'eslint-plugin-unicorn';
import * as importX from 'eslint-plugin-import-x';
import n from 'eslint-plugin-n';
import promise from 'eslint-plugin-promise';
import globals from 'globals';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const ignores = [
  'dist/**',
  'coverage/**',
  'docs/api/**',
  'site/**',
  'node_modules/**',
  '.tsup/**',
  '*.tsbuildinfo',
];

export default tseslint.config(
  { ignores },

  { settings: { react: { version: 'detect' } } },

  js.configs.recommended,
  unicorn.configs['flat/recommended'],
  importX.default.flatConfigs.recommended,
  promise.configs['flat/recommended'],
  n.configs['flat/recommended-module'],
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],

  // Type-aware rules: only on TS/TSX in our tsconfig.
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
  },

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: projectRoot,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,

      // typescript-eslint pragmatic tuning
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',

      // Unicorn — disable the ones that fight with the React idiom.
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/no-null': 'off',
      'unicorn/filename-case': [
        'error',
        {
          cases: { kebabCase: true, pascalCase: true, camelCase: true },
        },
      ],
      'unicorn/no-keyword-prefix': 'off',
      'unicorn/prefer-export-from': 'off',

      // import-x — let TS handle resolution checks (its TS resolver
      // depends on a deeper config than we want for a 5-file library).
      'import-x/no-unresolved': 'off',
      'import-x/namespace': 'off',
      'import-x/no-duplicates': 'off',
      'import-x/order': [
        'warn',
        {
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],

      // node plugin: we ship a library, not a CLI — let the bundler
      // handle resolution.
      'n/no-missing-import': 'off',
      'n/no-extraneous-import': 'off',
      'n/no-unsupported-features/node-builtins': 'off',
    },
  },

  // Tests + tool configs: relax a handful of library-only rules.
  {
    files: [
      '**/*.test.{ts,tsx}',
      '**/*.test-d.ts',
      'test/**/*',
      'vitest.config.ts',
      'tsup.config.ts',
      'eslint.config.js',
    ],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      'unicorn/no-useless-undefined': 'off',
      'unicorn/consistent-function-scoping': 'off',
      'n/no-unpublished-import': 'off',
      'react/display-name': 'off',
    },
  },
);
