/// <reference types="vitest/config" />

import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    clearMocks: true,
    setupFiles: ['src/test-setup.ts'],
    exclude: ['tsdist', '**/node_modules/**', '**/.git/**'],
    coverage: { exclude: ['tsdist', '**/node_modules/**', '**/.git/**'] },
  },
});
