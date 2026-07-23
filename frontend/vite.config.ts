import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // dev-only: forward API calls to the FastAPI server so the browser
      // sees one origin, matching production
      '/api': 'http://localhost:8000',
    },
  },
})
