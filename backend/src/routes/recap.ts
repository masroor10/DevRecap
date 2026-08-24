import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { pool } from '../db/pool.js';
import { fetchContributions, buildRecap } from '../services/github.js';

export const recapRouter = Router();

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const GITHUB_FOUNDED_YEAR = 2008;

const recapLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — try again in a few minutes.' },
});

recapRouter.use(recapLimiter);

recapRouter.get('/:username', async (req, res) => {
  const username = req.params.username.trim().toLowerCase();
  const currentYear = new Date().getFullYear();
  const year = req.query.year === undefined ? currentYear : Number(req.query.year);

  if (!/^[a-z0-9-]{1,39}$/.test(username)) {
    return res.status(400).json({ error: 'Invalid GitHub username' });
  }

  if (!Number.isInteger(year) || year < GITHUB_FOUNDED_YEAR || year > currentYear) {
    return res.status(400).json({ error: 'Invalid year' });
  }

  try {
    const cached = await pool.query(
      'SELECT data, fetched_at FROM recap_cache WHERE username = $1 AND year = $2',
      [username, year],
    );

    if (cached.rows.length > 0) {
      const age = Date.now() - new Date(cached.rows[0].fetched_at).getTime();
      if (age < CACHE_TTL_MS) {
        return res.json(cached.rows[0].data);
      }
    }

    const user = await fetchContributions(username, year);
    const recap = buildRecap(user, year);

    await pool.query(
      `INSERT INTO recap_cache (username, year, data, fetched_at)
       VALUES ($1, $2, $3, now())
       ON CONFLICT (username) DO UPDATE SET year = $2, data = $3, fetched_at = now()`,
      [username, year, recap],
    );

    res.json(recap);
  } catch (err: any) {
    if (err.message === 'User not found') {
      return res.status(404).json({ error: 'GitHub user not found' });
    }
    console.error(err);
    res.status(502).json({ error: 'Failed to fetch GitHub data' });
  }
});
