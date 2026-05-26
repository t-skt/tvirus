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
        'danmaku-dodge': resolve(__dirname, 'apps/danmaku-dodge/index.html'),
        'replay-scoreboard': resolve(__dirname, 'apps/replay-scoreboard/index.html'),
        'touhou-vote-chart': resolve(__dirname, 'apps/touhou-vote-chart/index.html'),
        'introduce-form': resolve(__dirname, 'apps/introduce-form/index.html'),
      },
    },
  },
  server: { port: 5173 },
});
