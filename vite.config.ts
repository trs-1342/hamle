import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['simge.svg', 'simge-180.png', 'piece/*.svg'],
      manifest: {
        name: 'Hamle: satranç öğren',
        short_name: 'Hamle',
        description: 'Satranç açılışları, temel prensipler, bulmacalar ve Stockfish analizi.',
        lang: 'tr',
        theme_color: '#101217',
        background_color: '#0f1115',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/simge-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/simge-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/simge-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png}'],
        globIgnores: ['engine/**'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: /\/veri\//,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'hamle-veri', expiration: { maxEntries: 10 } },
          },
          {
            urlPattern: /\/engine\//,
            handler: 'CacheFirst',
            options: { cacheName: 'hamle-motor', expiration: { maxEntries: 5 } },
          },
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'hamle-yazi', expiration: { maxEntries: 20 } },
          },
        ],
      },
    }),
  ],
})
