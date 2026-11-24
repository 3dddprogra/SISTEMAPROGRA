import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// En desarrollo, Vite reenvía /api y /socket.io al backend (por defecto http://localhost:3000).
// Para otro backend: VITE_BACKEND_URL=http://IP_DEL_BACKEND:3000 npm run dev
const backend = process.env.VITE_BACKEND_URL || 'http://localhost:3000'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': { target: backend, changeOrigin: true },
      '/socket.io': { target: backend, ws: true, changeOrigin: true },
    },
  },
})
