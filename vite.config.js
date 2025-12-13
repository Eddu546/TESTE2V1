import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // Configuração de Proxy para Contornar CORS (Senado e Câmara)
    proxy: {
      '/api/senado': {
        target: 'https://legis.senado.leg.br',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/senado/, '/dadosabertos'),
        secure: true,
      },
      '/api/camara': {
        target: 'https://dadosabertos.camara.leg.br',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/camara/, ''),
        secure: true,
      }
    }
  }
})