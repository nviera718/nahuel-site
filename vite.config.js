import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    proxy: {
      '/api': {
        target: 'https://nahuelviera.dev',
        changeOrigin: true,
      },
      '/ws': {
        target: 'wss://nahuelviera.dev',
        ws: true,  // Enable WebSocket proxying
        changeOrigin: true,
      },
    },
  },
})
