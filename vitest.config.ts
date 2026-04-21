import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'e2e'],
    coverage: {
      provider: 'v8',
      // Scope to the modules that have unit tests.
      // Components (.tsx) and integration-heavy modules are covered by E2E.
      // Expand this list as new test files are added.
      include: [
        'src/actions/tasks.ts',
        'src/hooks/use-tasks-by-status.ts',
      ],
      exclude: ['src/test/**', 'src/**/*.d.ts'],
      thresholds: {
        lines: 20,
        functions: 20,
        branches: 20,
        statements: 20,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
