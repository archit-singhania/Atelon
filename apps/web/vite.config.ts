import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['posters/*.webp', 'icons/*.png', 'brand/*.{svg,webp}'],
      manifest: {
        name: 'Atelon',
        short_name: 'Atelon',
        description: 'Every machine in 3D. The AI vehicle atlas.',
        theme_color: '#07090d',
        background_color: '#07090d',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,webp,png}'],
        runtimeCaching: [
          { urlPattern: /\/posters\/.*\.webp$/, handler: 'CacheFirst', options: { cacheName: 'posters-v1', expiration: { maxEntries: 150, maxAgeSeconds: 60 * 60 * 24 * 30 } } },
          { urlPattern: /\/models\/.*\.glb$/, handler: 'CacheFirst', options: { cacheName: 'viewed-models-v1', expiration: { maxEntries: 6, maxAgeSeconds: 60 * 60 * 24 * 14, purgeOnQuotaError: true }, cacheableResponse: { statuses: [0, 200] } } },
          { urlPattern: ({ url }) => url.pathname.startsWith('/api/'), handler: 'NetworkOnly' }
        ]
      }
    })
  ],
  build: { chunkSizeWarningLimit: 1200 }
});
