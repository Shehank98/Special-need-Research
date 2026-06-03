import express from 'express';
import { query } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/lessons  -> list all lessons ordered by difficulty
// Optional ?difficulty=1..5 filter
router.get('/', requireAuth, async (req, res) => {
  try {
    const { difficulty } = req.query;
    let result;
    if (difficulty) {
      result = await query(
        'SELECT * FROM lessons WHERE difficulty = $1 ORDER BY difficulty, created_at',
        [Number(difficulty)]
      );
    } else {
      result = await query('SELECT * FROM lessons ORDER BY difficulty, created_at');
    }
    res.json(result.rows);
  } catch (err) {
    console.error('list lessons error:', err.message);
    res.status(500).json({ error: 'Failed to list lessons' });
  }
});

// GET /api/lessons/:id -> single lesson content
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const result = await query('SELECT * FROM lessons WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('get lesson error:', err.message);
    res.status(500).json({ error: 'Failed to get lesson' });
  }
});

export default router;
