import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        alejo: resolve(__dirname, 'alejocabana/index.html'),
        francisco: resolve(__dirname, 'franciscoarellano/index.html')
      }
    }
  }
});
