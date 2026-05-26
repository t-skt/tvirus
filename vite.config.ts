import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/tvirus/',
  resolve: {
    alias: { '@shared': resolve(__dirname, 'shared') },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'cirno-donation': resolve(__dirname, 'apps/cirno-donation/index.html'),
        'gacha-game': resolve(__dirname, 'apps/gacha-game/index.html'),
      },
    },
  },
  server: { port: 5173 },
});
