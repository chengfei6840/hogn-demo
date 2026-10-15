import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: true,
    port: 5174
  },
  // GitHub Pages 部署在 /<repo>/ 子路径下，由 CI 注入 VITE_BASE；本地开发默认 '/'
  base: process.env.VITE_BASE ?? '/'
})
