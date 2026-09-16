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
    // Proxy all /api/* requests to the Express server during development.
    // This avoids CORS entirely — the browser sees everything on port 5173.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
        timeout: 120000,
        proxyTimeout: 120000,
        configure: (proxy) => {
          proxy.on('error', (err, _req, res) => {
            console.error('[vite proxy error]:', err.message)
            if (res && !res.headersSent && typeof res.writeHead === 'function') {
              res.writeHead(502, { 'Content-Type': 'application/json' })
              res.end(
                JSON.stringify({
                  success: false,
                  error: `Proxy error connecting to backend server: ${err.message}`,
                })
              )
            }
          })
        },
      },
    },
  },
})
