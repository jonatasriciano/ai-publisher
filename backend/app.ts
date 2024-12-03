// /Users/jonatas/Documents/Projects/ai-publisher/backend/app.ts
import express from 'express';
import { query } from './database';

const app = express();
const port = 3000;

app.get('/', async (req, res) => {
  const result = await query('SELECT NOW()');
  res.json({ time: result.rows[0] });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});