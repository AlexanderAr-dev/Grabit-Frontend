import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt'],
      manifest: false,
    }),
  ],
  resolve: {
    alias: {
      '@ui': '/src/ui',
      '@components': '/src/components',
      '@modules': '/src/modules',
      '@pages': '/src/pages',
      '@styles': '/src/app/styles',
      '@app-types': '/src/app/types',
      '@hooks': '/src/app/hooks',
      '@themes': '/src/app/themes',
      '@store': '/src/app/store',
      '@utils': '/src/app/utils',
      '@constants': '/src/app/constants',
      '@routes': '/src/app/routes',
      '@api': '/src/app/api',
      '@assets': '/src/app/assets',
    },
  },
});
