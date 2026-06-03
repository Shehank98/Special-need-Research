import express from 'express';
import { query } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

const VALID_EVENTS = ['tts_used', 'hint_used', 'badge_earned', 'quiz_answered', 'lesson_started'];

// POST /api/events -> log an engagement event
// Body: { event_type, metadata? }   (student_id comes from the token)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { event_type, metadata = {} } = req.body || {};
    if (!event_type) {
      return res.status(400).json({ error: 'event_type is required' });
    }
    // Students log for themselves; teachers may pass a student_id explicitly.
    const studentId =
      req.user.role === 'student' ? req.user.id : req.body.student_id || req.user.id;

    const result = await query(
      `INSERT INTO engagement_events (student_id, event_type, metadata)
       VALUES ($1, $2, $3) RETURNING *`,
      [studentId, event_type, JSON.stringify(metadata)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('log event error:', err.message);
    res.status(500).json({ error: 'Failed to log event' });
  }
});

export { VALID_EVENTS };
export default router;
