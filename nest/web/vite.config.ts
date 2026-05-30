import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  // 加载当前模式 (development/production) 对应的 .env 文件
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  return {
    plugins: [
      vue(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg'],
        manifest: {
          name: 'Nest - 权限管理系统',
          short_name: 'Nest PMS',
          description: '企业级权限管理系统',
          theme_color: '#2080f0',
          background_color: '#f0f2f5',
          display: 'standalone',
          scope: '/',
          start_url: '/',
          icons: [
            { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^\/api\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: { maxEntries: 50, maxAgeSeconds: 60 },
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    server: {
      port: parseInt(env.VITE_DEV_PORT || '5173', 10),
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET || 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },
  }
})
