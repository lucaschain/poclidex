import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/index.ts',
        'src/ui/**', // UI components are hard to test
        'src/api/**', // External API wrapper - Phase 2
        'src/utils/terminalDetection.ts', // Terminal utils - Phase 2
        'src/services/imageService.ts', // Image/sprite handling - Phase 2
        'src/repositories/**', // Integration layer - Phase 2
      ],
      thresholds: {
        lines: 70,
        functions: 75,
        branches: 75,
        statements: 70,
      },
    },
  },
});
