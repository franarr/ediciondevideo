import { defineConfig } from 'vite';

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
        main: 'index.html',
        alejo: 'alejocabana/index.html',
        francisco: 'franciscoarellano/index.html'
      }
    }
  }
});
