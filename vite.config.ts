import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 6511,
    proxy: {
      '/api': {
       // target: 'http://192.168.50.107:6510',
        target: 'https://backendtracker.thrivebrands.in',
        changeOrigin: true,
        secure: true, // SSL certificate is now properly configured
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
})

