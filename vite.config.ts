import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import path from 'node:path';
import fs from 'node:fs';
import type { Plugin } from 'vite';

function pwaPlugin(): Plugin {
  return {
    name: 'pwa-sw-version',
    apply: 'build',
    closeBundle() {
      const swSrc = path.resolve(__dirname, 'public/sw.js');
      const swDest = path.resolve(__dirname, 'dist/sw.js');
      if (!fs.existsSync(swSrc)) return;
      const version = `cwh-${Date.now()}`;
      const content = fs.readFileSync(swSrc, 'utf-8').replace(
        /const CACHE_NAME = 'cwh-v1'/,
        `const CACHE_NAME = '${version}'`,
      );
      fs.writeFileSync(swDest, content);
    },
  };
}

export default defineConfig({
  // VITE_BASE_PATH is injected by the GH Pages CI workflow.
  // Locally and in Docker it stays '/' (the default).
  base: process.env.VITE_BASE_PATH ?? '/',
  plugins: [react(), pwaPlugin()],
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  resolve: {
    alias: {
      '@':       path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
});
