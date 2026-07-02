import express from 'express';
import { query } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Behavioral / emotional / cognitive engagement signals. Each event maps to one
// of the three research dimensions via its activity_type/metric_name.
const VALID_EVENTS = [
  'tts_used',
  'hint_used',
  'badge_earned',
  'quiz_answered',
  'lesson_started',
  'lesson_completed',
  'attempt',
  'completion',
  'retry',
  'time_on_task',
  'mood',
  'level_select',
  'self_correction',
  'tracing_attempt',
  'chatbot_used',
];

// POST /api/events -> log an engagement event (silent background logging)
// Body: { event_type, metadata?, session_id?, activity_type?, metric_name?,
//         metric_value?, week_number? }   (student_id comes from the token)
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      event_type,
      metadata = {},
      session_id = null,
      activity_type = null,
      metric_name = null,
      metric_value = null,
      week_number = null,
    } = req.body || {};

    if (!event_type || !VALID_EVENTS.includes(event_type)) {
      return res.status(400).json({ error: `event_type must be one of: ${VALID_EVENTS.join(', ')}` });
    }
    if (typeof metadata !== 'object' || Array.isArray(metadata)) {
      return res.status(400).json({ error: 'metadata must be an object' });
    }
    const numericValue =
      metric_value === null || metric_value === '' ? null : Number(metric_value);
    if (numericValue !== null && Number.isNaN(numericValue)) {
      return res.status(400).json({ error: 'metric_value must be numeric' });
    }

    // Students log for themselves; teachers may pass a student_id explicitly.
    const studentId =
      req.user.role === 'student' ? req.user.id : req.body.student_id || req.user.id;

    const result = await query(
      `INSERT INTO engagement_events
         (student_id, session_id, event_type, activity_type, metric_name, metric_value, week_number, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        studentId,
        session_id,
        event_type,
        activity_type,
        metric_name,
        numericValue,
        week_number,
        JSON.stringify(metadata),
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('log event error:', err.message);
    res.status(500).json({ error: 'Failed to log event' });
  }
});

export { VALID_EVENTS };
export default router;
