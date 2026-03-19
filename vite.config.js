import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://api.groq.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        headers: {
          'Authorization': 'Bearer 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'
        }
      }
    }
  }
})