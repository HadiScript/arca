import react from '@vitejs/plugin-react'
import { defineConfig, type Connect, type Plugin } from 'vite'
import { handleConcierge } from './server/concierge.ts'

// Serves the AI concierge endpoint from the Vite dev and preview servers.
function concierge(): Plugin {
  const mount = (mw: Connect.Server) => {
    mw.use('/api/concierge', (req, res) => {
      void handleConcierge(req, res)
    })
  }
  return {
    name: 'arca-concierge',
    configureServer: (server) => mount(server.middlewares),
    configurePreviewServer: (server) => mount(server.middlewares),
  }
}

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves the app from /<repo>/; the deploy workflow sets BASE_PATH
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), concierge()],
})
