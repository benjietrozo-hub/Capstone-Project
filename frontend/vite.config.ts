import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: 'localhost', // Use localhost instead of 0.0.0.0 to avoid network issues
    port: 5173,
    strictPort: true, // Don't try other ports if 5173 is occupied
    hmr: {
      port: 5173, // Use same port for HMR
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
