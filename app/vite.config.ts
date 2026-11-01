import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    preact(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png'],
      workbox: { globPatterns: ['**/*.{js,css,html,png,json,svg}'] },
      manifest: {
        name: 'Locksmith — clés auto',
        short_name: 'Locksmith',
        description: 'Procédures de programmation de clés automobiles pour le terrain',
        lang: 'fr',
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: '#182030',
        theme_color: '#182030',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
    }),
  ],
});
