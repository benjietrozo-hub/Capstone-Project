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
    host: '0.0.0.0', // Listen on all network interfaces (allows Android access)
    port: 5173,
    strictPort: true, // Don't try other ports if 5173 is occupied
    hmr: {
      host: 'localhost', // HMR uses localhost for stability
    },
    // Note: Proxy not used - we use dynamic hostname detection in axios.js instead
    // This allows the same code to work on localhost AND network IPs
  }
})
