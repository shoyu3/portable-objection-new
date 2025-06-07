import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: '/yy/',
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  build: {
    target: 'esnext',
    assetsInlineLimit: 0,
  },
  server: {
    allowedHosts: ['g.unq.cc'],
    disableDisconnectRefresh: true,
  }
})