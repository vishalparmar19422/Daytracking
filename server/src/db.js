import pg from 'pg'
import 'dotenv/config'

const { Pool } = pg

// Neon requires TLS. rejectUnauthorized:false keeps the connection encrypted
// while skipping CA-chain verification — the standard setting for managed
// Postgres providers.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

export const query = (text, params) => pool.query(text, params)
