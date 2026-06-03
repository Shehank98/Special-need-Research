import express from 'express';
import { query } from '../db/pool.js';
import { requireAuth, requireSelfOrTeacher } from '../middleware/auth.js';
import { BADGE_DEFS } from '../utils/badges.js';

const router = express.Router();

// Weekly goal: number of lessons we hope a student completes per week.
const WEEKLY_GOAL = 5;

// GET /api/students/:id/dashboard -> aggregated dashboard data for a student
router.get('/:id/dashboard', requireAuth, requireSelfOrTeacher('id'), async (req, res) => {
  try {
    const studentId = req.params.id;

    const userRes = await query('SELECT id, name, role, language, grade FROM users WHERE id = $1', [
      studentId,
    ]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const [completedRes, badgesRes, weekRes, streakRes, nextRes] = await Promise.all([
      query(
        'SELECT COUNT(*)::int AS c FROM progress WHERE student_id = $1 AND completed = TRUE',
        [studentId]
      ),
      query('SELECT * FROM badges WHERE student_id = $1 ORDER BY earned_at DESC', [studentId]),
      query(
        `SELECT COUNT(*)::int AS c FROM progress
         WHERE student_id = $1 AND completed = TRUE
           AND completed_at >= date_trunc('week', NOW())`,
        [studentId]
      ),
      query(
        'SELECT COUNT(DISTINCT session_date)::int AS days FROM study_sessions WHERE student_id = $1',
        [studentId]
      ),
      // Next lesson = lowest-difficulty lesson not yet completed.
      query(
        `SELECT l.* FROM lessons l
         WHERE l.id NOT IN (
           SELECT lesson_id FROM progress WHERE student_id = $1 AND completed = TRUE
         )
         ORDER BY l.difficulty, l.created_at LIMIT 1`,
        [studentId]
      ),
    ]);

    const badges = badgesRes.rows.map((b) => ({
      ...b,
      ...(BADGE_DEFS[b.badge_type] || { label_en: b.badge_type, label_si: b.badge_type, emoji: '🏅' }),
    }));

    res.json({
      student: userRes.rows[0],
      total_completed: completedRes.rows[0].c,
      weekly_goal: WEEKLY_GOAL,
      weekly_completed: weekRes.rows[0].c,
      streak_days: streakRes.rows[0].days,
      badges,
      next_lesson: nextRes.rows[0] || null,
    });
  } catch (err) {
    console.error('dashboard error:', err.message);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

export default router;
