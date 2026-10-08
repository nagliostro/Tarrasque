import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import boundaries from 'eslint-plugin-boundaries';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores(['legacy/**', '.next/**', 'src/generated/**', 'node_modules/**', 'next-env.d.ts']),
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app/**' },
        { type: 'module', pattern: 'src/modules/*', capture: ['name'] },
        { type: 'platform', pattern: 'src/platform/**' },
        { type: 'generated', pattern: 'src/generated/**' },
      ],
    },
    rules: {
      // Módulos só se enxergam pelo index.ts; app pode usar módulos e platform;
      // platform não depende de módulos.
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            {
              from: { element: { type: 'app' } },
              allow: [
                { to: { element: { type: 'module' } } },
                { to: { element: { type: 'platform' } } },
                { to: { element: { type: 'app' } } },
              ],
            },
            {
              from: { element: { type: 'module' } },
              allow: [
                { to: { element: { type: 'module' } } },
                { to: { element: { type: 'platform' } } },
                { to: { element: { type: 'generated' } } },
              ],
            },
            {
              from: { element: { type: 'platform' } },
              allow: [
                { to: { element: { type: 'platform' } } },
                { to: { element: { type: 'generated' } } },
              ],
            },
          ],
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/modules/*/*', '**/modules/*/*'],
              message: 'Importe módulos apenas pelo index.ts (ex.: "@/modules/shared").',
            },
          ],
        },
      ],
    },
  },
]);
