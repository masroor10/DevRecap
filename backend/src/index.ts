import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { ensureSchema } from './db/pool.js';
import { recapRouter } from './routes/recap.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({ origin: process.env.FRONTEND_ORIGIN ?? '*' }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/recap', recapRouter);

ensureSchema()
  .then(() => {
    app.listen(port, () => console.log(`DevRecap API listening on port ${port}`));
  })
  .catch((err) => {
    console.error('Failed to initialize database schema', err);
    process.exit(1);
  });
