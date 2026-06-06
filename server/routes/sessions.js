import express from 'express';
import { query } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// A student session is opened at login (see auth.js) and closed here. This
// keeps one session row per login while exposing an explicit end for the client
// to call on logout / app close (used for time-on-task).

// POST /api/sessions/:id/end -> mark a session finished
router.post('/:id/end', requireAuth, async (req, res) => {
  try {
    // Students may only end their own sessions.
    const ownerClause = req.user.role === 'student' ? ' AND student_id = $2' : '';
    const params = req.user.role === 'student' ? [req.params.id, req.user.id] : [req.params.id];
    const result = await query(
      `UPDATE study_sessions SET logout_time = NOW()
       WHERE id = $1${ownerClause} AND logout_time IS NULL
       RETURNING id, login_time, logout_time, week_number, study_group`,
      params
    );
    res.json({ ended: result.rows.length > 0, session: result.rows[0] || null });
  } catch (err) {
    console.error('end session error:', err.message);
    res.status(500).json({ error: 'Failed to end session' });
  }
});

export default router;
