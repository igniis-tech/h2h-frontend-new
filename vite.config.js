import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Treat uppercase JPG/JPEG files as static assets so Vite doesn't try to parse them as JS
  assetsInclude: ['**/*.JPG', '**/*.JPEG'],
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000', // Django
        changeOrigin: true,
      },
    },
  },
})
