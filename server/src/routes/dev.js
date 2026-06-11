import { Router } from 'express'
import 'dotenv/config'
import { seed } from '../seed.js'

const router = Router()

// POST /api/dev/seed — wipes the DB and loads demo data. Gated by an env flag
// so it can't be hit in a real deployment. No auth (it runs before any login).
router.post('/seed', async (req, res) => {
  if (process.env.ALLOW_DEV_SEED !== 'true') {
    return res.status(403).json({ error: 'Demo seeding is disabled' })
  }
  const summary = await seed()
  res.json(summary)
})

export default router
