import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: ['grabit.test'],
  },
  plugins: [
    react(),
    VitePWA({
      // В демо-режиме service worker занят MSW — два воркера на одном scope не уживаются
      disable: mode === 'demo',
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt'],
      manifest: false,
      workbox: {
        navigateFallbackDenylist: [/^\/api\//],
        // Файлы демо-режима не нужны в кэше продакшн-PWA
        globIgnores: ['**/mockServiceWorker.js', 'demo/**'],
      },
    }),
  ],
  resolve: {
    alias: {
      '@app': '/src/app',
      '@pages': '/src/pages',
      '@widgets': '/src/widgets',
      '@features': '/src/features',
      '@entities': '/src/entities',
      '@shared': '/src/shared',
    },
  },
}));
