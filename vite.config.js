import { defineConfig } from 'vite';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const pages = readdirSync(root).filter((f) => f.endsWith('.html'));

export default defineConfig({
  base: './',
  server: { host: true },
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 900,
    rollupOptions: { input: Object.fromEntries(pages.map((f) => [f.replace('.html', ''), resolve(root, f)])) },
  },
});
