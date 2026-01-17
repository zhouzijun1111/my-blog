import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: [
      'packages/*/src/**/*.{test,spec}.{js,mjs,cjs,ts,jsx,tsx}',
      'tests/**/*.{test,spec}.{js,mjs,cjs,ts,jsx,tsx}'
    ],
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/**'
      ],
      all: true,
      lines: 80,
      functions: 80,
      branches: 80,
      statements: 80
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './packages/frontend/src'),
      '@shared': resolve(__dirname, './packages/shared')
    }
  }
})
