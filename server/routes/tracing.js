import express from 'express';
import { query } from '../db/pool.js';
import { requireAuth, requireSelfOrTeacher } from '../middleware/auth.js';

const router = express.Router();

// Prompt-fading thresholds: once a student averages >= this accuracy over a few
// completed attempts at their current guide level, recommend fewer dashes.
const FADE_ACCURACY = 80;
const FADE_MIN_ATTEMPTS = 2;
const MAX_GUIDE_LEVEL = 4;

// POST /api/tracing -> record a tracing attempt (intervention group)
// Body: { session_id?, target_word, accuracy_pct, completed, time_ms, retries, guide_level }
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      session_id = null,
      target_word = '',
      accuracy_pct = 0,
      completed = false,
      time_ms = 0,
      retries = 0,
      guide_level = 1,
    } = req.body || {};

    const studentId = req.user.role === 'student' ? req.user.id : req.body.student_id;
    if (!studentId) return res.status(400).json({ error: 'student_id required' });

    const acc = Math.max(0, Math.min(100, Number(accuracy_pct) || 0));
    const row = await query(
      `INSERT INTO tracing_attempts
         (student_id, session_id, target_word, accuracy_pct, completed, time_ms, retries, guide_level)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [studentId, session_id, target_word, acc, !!completed, Math.round(Number(time_ms) || 0), Math.round(Number(retries) || 0), Math.round(Number(guide_level) || 1)]
    );

    // Mirror as an engagement event (behavioral/cognitive) for unified analysis.
    await query(
      `INSERT INTO engagement_events
         (student_id, session_id, event_type, activity_type, metric_name, metric_value, metadata)
       VALUES ($1, $2, 'tracing_attempt', 'writing', 'tracing_accuracy', $3, $4)`,
      [studentId, session_id, acc, JSON.stringify({ target_word, completed: !!completed, guide_level })]
    );

    res.status(201).json(row.rows[0]);
  } catch (err) {
    console.error('tracing attempt error:', err.message);
    res.status(500).json({ error: 'Failed to record tracing attempt' });
  }
});

// GET /api/tracing/:studentId/guide-level -> recommended guide level (prompt fading)
router.get('/:studentId/guide-level', requireAuth, requireSelfOrTeacher('studentId'), async (req, res) => {
  try {
    const cur = await query(
      'SELECT COALESCE(MAX(guide_level), 1) AS level FROM tracing_attempts WHERE student_id = $1',
      [req.params.studentId]
    );
    const currentLevel = Number(cur.rows[0].level) || 1;

    const stats = await query(
      `SELECT COUNT(*)::int AS n, COALESCE(AVG(accuracy_pct), 0) AS avg
       FROM tracing_attempts
       WHERE student_id = $1 AND guide_level = $2 AND completed = TRUE`,
      [req.params.studentId, currentLevel]
    );
    const { n, avg } = stats.rows[0];
    let recommended = currentLevel;
    if (Number(n) >= FADE_MIN_ATTEMPTS && Number(avg) >= FADE_ACCURACY) {
      recommended = Math.min(MAX_GUIDE_LEVEL, currentLevel + 1);
    }
    res.json({ guide_level: recommended, current_level: currentLevel, attempts: Number(n), avg_accuracy: Math.round(Number(avg)) });
  } catch (err) {
    console.error('guide-level error:', err.message);
    res.status(500).json({ error: 'Failed to compute guide level' });
  }
});

export default router;
