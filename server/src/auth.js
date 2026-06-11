// Auth helpers: password hashing, JWT signing/verification, and the Express
// middleware that protects routes.
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import 'dotenv/config'

const SECRET = process.env.JWT_SECRET
if (!SECRET) {
  console.warn('⚠ JWT_SECRET is not set — tokens cannot be signed. Set it in server/.env')
}

const TOKEN_TTL = '7d'

export function hashPassword(plain) {
  return bcrypt.hash(plain, 10)
}

export function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash)
}

export function signToken(user) {
  return jwt.sign({ sub: user.id, username: user.username }, SECRET, { expiresIn: TOKEN_TTL })
}

// Express middleware. Reads "Authorization: Bearer <token>", verifies it, and
// attaches { id, username } to req.user. Responds 401 if missing/invalid.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'Not authenticated' })
  try {
    const payload = jwt.verify(token, SECRET)
    req.user = { id: payload.sub, username: payload.username }
    next()
  } catch {
    res.status(401).json({ error: 'Invalid or expired session' })
  }
}
