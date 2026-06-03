import express from 'express';
import { query } from '../db/pool.js';
import { requireAuth, requireSelfOrTeacher } from '../middleware/auth.js';
import { evaluateBadges } from '../utils/badges.js';

const router = express.Router();

// POST /api/progress -> save lesson progress (and run badge/adaptive logic)
// Body: { lesson_id, score, time_spent_seconds, completed, used_hint? }
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      lesson_id,
      score = 0,
      time_spent_seconds = 0,
      completed = false,
      used_hint = false,
    } = req.body || {};

    if (!lesson_id) {
      return res.status(400).json({ error: 'lesson_id is required' });
    }
    const studentId = req.user.role === 'student' ? req.user.id : req.body.student_id;
    if (!studentId) {
      return res.status(400).json({ error: 'student_id is required for teachers' });
    }

    // Upsert-ish: one progress row per (student, lesson). Increment attempts.
    const existing = await query(
      'SELECT * FROM progress WHERE student_id = $1 AND lesson_id = $2 LIMIT 1',
      [studentId, lesson_id]
    );

    let progressRow;
    if (existing.rows.length > 0) {
      const prev = existing.rows[0];
      const result = await query(
        `UPDATE progress
         SET score = $1,
             time_spent_seconds = COALESCE(time_spent_seconds, 0) + $2,
             completed = $3,
             attempts = attempts + 1,
             completed_at = CASE WHEN $3 THEN NOW() ELSE completed_at END
         WHERE id = $4 RETURNING *`,
        [score, time_spent_seconds, completed, prev.id]
      );
      progressRow = result.rows[0];
    } else {
      const result = await query(
        `INSERT INTO progress
           (student_id, lesson_id, score, time_spent_seconds, completed, attempts, completed_at)
         VALUES ($1, $2, $3, $4, $5, 1, CASE WHEN $5 THEN NOW() ELSE NULL END)
         RETURNING *`,
        [studentId, lesson_id, score, time_spent_seconds, completed]
      );
      progressRow = result.rows[0];
    }

    // Update today's study session lesson count if completed.
    if (completed) {
      await query(
        `UPDATE study_sessions
         SET total_lessons_done = total_lessons_done + 1
         WHERE id = (
           SELECT id FROM study_sessions
           WHERE student_id = $1 AND session_date = CURRENT_DATE
           ORDER BY login_time DESC LIMIT 1
         )`,
        [studentId]
      );
    }

    // Evaluate badges only when the lesson is completed.
    let newBadges = [];
    if (completed) {
      newBadges = await evaluateBadges(studentId, {
        score,
        timeSpent: time_spent_seconds,
        usedHint: used_hint,
      });
    }

    // Adaptive difficulty recommendation for the next lesson.
    const current = await query('SELECT difficulty, type FROM lessons WHERE id = $1', [lesson_id]);
    const currentDifficulty = current.rows[0]?.difficulty ?? 1;
    let nextDifficulty = currentDifficulty;
    if (score < 60) nextDifficulty = Math.max(1, currentDifficulty - 1);
    else if (score > 85) nextDifficulty = Math.min(5, currentDifficulty + 1);

    // Suggest a not-yet-completed lesson at the target difficulty.
    const nextLesson = await query(
      `SELECT l.* FROM lessons l
       WHERE l.difficulty = $1
         AND l.id NOT IN (
           SELECT lesson_id FROM progress WHERE student_id = $2 AND completed = TRUE
         )
       ORDER BY l.created_at LIMIT 1`,
      [nextDifficulty, studentId]
    );

    res.status(201).json({
      progress: progressRow,
      new_badges: newBadges,
      next_difficulty: nextDifficulty,
      next_lesson: nextLesson.rows[0] || null,
    });
  } catch (err) {
    console.error('save progress error:', err.message);
    res.status(500).json({ error: 'Failed to save progress' });
  }
});

// GET /api/progress/:studentId -> all progress for a student
router.get('/:studentId', requireAuth, requireSelfOrTeacher('studentId'), async (req, res) => {
  try {
    const result = await query(
      `SELECT p.*, l.title_en, l.title_si, l.type, l.difficulty
       FROM progress p
       JOIN lessons l ON l.id = p.lesson_id
       WHERE p.student_id = $1
       ORDER BY p.completed_at DESC NULLS LAST`,
      [req.params.studentId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('get progress error:', err.message);
    res.status(500).json({ error: 'Failed to get progress' });
  }
});

export default router;
