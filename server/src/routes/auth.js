import { Router } from 'express'
import { pool } from '../db.js'
import { hashPassword, verifyPassword, signToken, requireAuth } from '../auth.js'

const router = Router()

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const username = String(req.body.username || '').trim()
  const password = String(req.body.password || '')
  if (!username) return res.status(400).json({ error: 'Username is required' })
  if (!password) return res.status(400).json({ error: 'Password is required' })

  const exists = await pool.query('select 1 from users where lower(username) = lower($1)', [username])
  if (exists.rowCount) return res.status(409).json({ error: 'That username is already taken' })

  const hash = await hashPassword(password)
  const { rows } = await pool.query(
    `insert into users (username, password_hash) values ($1, $2)
     returning id, username, created_at as "createdAt"`,
    [username, hash],
  )
  const user = rows[0]
  res.json({ token: signToken(user), user })
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const username = String(req.body.username || '').trim()
  const password = String(req.body.password || '')

  const { rows } = await pool.query('select * from users where lower(username) = lower($1)', [username])
  const u = rows[0]
  if (!u || !(await verifyPassword(password, u.password_hash))) {
    return res.status(401).json({ error: 'Wrong username or password' })
  }
  const user = { id: u.id, username: u.username, createdAt: u.created_at }
  res.json({ token: signToken(user), user })
})

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  const { rows } = await pool.query(
    'select id, username, created_at as "createdAt" from users where id = $1',
    [req.user.id],
  )
  res.json({ user: rows[0] || null })
})

export default router
