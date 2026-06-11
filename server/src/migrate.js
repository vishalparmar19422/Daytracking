// Applies schema.sql to the database. Idempotent. Run with: npm run migrate
import { pool } from './db.js'
import { applySchema } from './schema.js'

try {
  await applySchema()
  console.log('✓ Migration applied')
} catch (err) {
  console.error('✗ Migration failed:', err.message)
  process.exitCode = 1
} finally {
  await pool.end()
}
