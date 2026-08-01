import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

/**
 * Flat config. ESLint 9+ dropped `.eslintrc.json`, and Next 16 dropped the
 * `next lint` wrapper -- `npm run lint` now calls the eslint CLI directly.
 * @type {import('eslint').Linter.Config[]}
 */
const config = [
  {
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'node_modules/**',
      'next-env.d.ts',
      '*.tsbuildinfo',
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
];

export default config;
