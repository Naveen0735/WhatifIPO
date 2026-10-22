import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import livePriceHandler from './api/live-price.js'
import upcomingIposHandler from './api/upcoming-ipos.js'

// Dev middleware for /api/live-price and /api/upcoming-ipos
function liveApiDevPlugin() {
  return {
    name: 'live-api-dev-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/upcoming-ipos')) {
          const mockReq = { method: req.method, query: {} }
          const mockRes = {
            setHeader: (name, val) => res.setHeader(name, val),
            status: (code) => {
              res.statusCode = code
              return {
                json: (data) => {
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify(data))
                },
                end: () => res.end(),
              }
            },
            end: () => res.end(),
          }
          try {
            await upcomingIposHandler(mockReq, mockRes)
          } catch (e) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: e.message }))
          }
          return
        }

        if (req.url && req.url.startsWith('/api/live-price')) {
          const url = new URL(req.url, 'http://localhost:5173')
          const symbol = url.searchParams.get('symbol')
          const mockReq = { query: { symbol }, method: req.method }
          const mockRes = {
            setHeader: (name, val) => res.setHeader(name, val),
            status: (code) => {
              res.statusCode = code
              return {
                json: (data) => {
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify(data))
                },
                end: () => res.end(),
              }
            },
            end: () => res.end(),
          }
          try {
            await livePriceHandler(mockReq, mockRes)
          } catch (e) {
            res.statusCode = 500
            res.end(JSON.stringify({ error: e.message }))
          }
          return
        }
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), liveApiDevPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
