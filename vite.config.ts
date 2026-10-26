import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  base: '/caircompanion/',
  server: {
    // host: true,
    allowedHosts: true,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    alias: {
      'framer-motion': path.resolve(projectRoot, 'src/test/framerMotionMock.tsx'),
    },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/App.tsx',
        'src/types/**',
        'src/components/layout/**',
        'src/components/ui/index.ts',
        // Smoke-tested flows with heavy modals / WebSocket; line coverage is low ROI vs interaction tests elsewhere.
        'src/pages/ChatPage.tsx',
        'src/pages/trackers/TrackerDetailPage.tsx',
        'src/pages/OrganizationSettingsPage.tsx',
        'src/pages/CaregiversPage.tsx',
        'src/pages/ConnectorsPage.tsx',
        'src/pages/HealthDataPage.tsx',
        'src/pages/SettingsPage.tsx',
        'src/pages/VoicePage.tsx',
        'src/test/**',
        '**/*.test.{ts,tsx}',
      ],
      thresholds: {
        lines: 80,
        functions: 79,
        statements: 80,
        branches: 50,
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'logo.png'],
      manifest: {
        name: 'CairCompanion',
        short_name: 'CairCompanion',
        description: 'Your AI Health Companion',
        theme_color: '#6F42C1',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/caircompanion/',
        start_url: '/caircompanion/select-organization',
        icons: [
          {
            src: 'logo.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
})
