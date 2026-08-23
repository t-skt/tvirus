import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync } from 'fs';

/** SPA fallback for introduce (/concept/* deep links) on GitHub Pages. */
function spaFallback(): Plugin {
  return {
    name: 'spa-fallback',
    closeBundle() {
      copyFileSync(resolve(__dirname, '404.html'), resolve(__dirname, 'dist/404.html'));
    },
  };
}

export default defineConfig({
  plugins: [react(), spaFallback()],
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
        'introduce': resolve(__dirname, 'apps/introduce/index.html'),
        'introduce-form': resolve(__dirname, 'apps/introduce-form/index.html'),
        'character-tool': resolve(__dirname, 'apps/character-tool/index.html'),
        'shisensho': resolve(__dirname, 'apps/shisensho/index.html'),
        'touhou-favorites-chart': resolve(__dirname, 'apps/touhou-favorites-chart/index.html'),
        'fortune-slip': resolve(__dirname, 'apps/fortune-slip/index.html'),
      },
    },
  },
  server: { port: 5173 },
});
