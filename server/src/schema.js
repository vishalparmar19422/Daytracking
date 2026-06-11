// Applies schema.sql using the shared pool. Idempotent (everything is
// IF NOT EXISTS). Called by migrate.js (CLI) and on server startup.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { pool } from './db.js'

const here = dirname(fileURLToPath(import.meta.url))

export async function applySchema() {
  const sql = readFileSync(join(here, 'schema.sql'), 'utf8')
  await pool.query(sql)
}
