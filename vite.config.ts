import { defineConfig } from 'vitest/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/job-application-tracker/' : '/',
  plugins: [tailwindcss()],
  test: {
    passWithNoTests: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    exclude: ['dist/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['dist/**', 'node_modules/**', 'src/test/setup.ts', 'src/main.tsx', 'vite.config.ts'],
      thresholds: {
        statements: 60,
        branches: 60,
        functions: 60,
        lines: 60,
        perFile: false,
        'src/api/*.{ts,tsx}': {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80,
        },
        'src/utils/dashboardMetrics.ts': {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80,
        },
        'src/components/ProtectedRoute.tsx': {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80,
        },
        'src/components/PublicOnlyRoute.tsx': {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80,
        },
        'src/mappers/*.{ts,tsx}': {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80,
        },
      },
    },
  },
}));
