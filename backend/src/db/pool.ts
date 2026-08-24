import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS recap_cache (
      username TEXT PRIMARY KEY,
      year INTEGER NOT NULL,
      data JSONB NOT NULL,
      fetched_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}
