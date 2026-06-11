import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { pool } from './db.js'
import { applySchema } from './schema.js'
import authRoutes from './routes/auth.js'
import groupRoutes from './routes/groups.js'
import noteRoutes from './routes/notes.js'
import devRoutes from './routes/dev.js'

const app = express()
const PORT = process.env.PORT || 5000
const here = dirname(fileURLToPath(import.meta.url))
const clientDist = join(here, '..', '..', 'client', 'dist')

app.use(cors())
app.use(express.json())

// Health check — verifies the server and DB connection are alive.
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ status: 'ok', db: 'connected' })
  } catch {
    res.json({ status: 'ok', db: 'disconnected' })
  }
})

app.use('/api/auth', authRoutes)
app.use('/api/groups', groupRoutes)
app.use('/api/notes', noteRoutes)
app.use('/api/dev', devRoutes)

// In production we serve the built React app from the same service. Skipped
// automatically when no build is present (e.g. local dev, where Vite serves it).
if (existsSync(clientDist)) {
  app.use(express.static(clientDist))
  // SPA fallback: any non-API GET returns index.html so client routing works.
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) return next()
    res.sendFile(join(clientDist, 'index.html'))
  })
}

// Catch-all error handler. Express 5 forwards rejected async handlers here.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Something went wrong' })
})

// Ensure the schema exists, then start. We start regardless so /api/health can
// report a DB problem instead of the whole service failing to boot.
applySchema()
  .then(() => console.log('✓ Schema ensured'))
  .catch((err) => console.error('⚠ Schema check failed:', err.message))
  .finally(() => {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
  })
