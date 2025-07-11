import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 1212,
    proxy: {
      '/api': {
        target: 'http://relayer:8080', // Адрес сервера
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // Убирает '/api'
      },
    },

  },
})