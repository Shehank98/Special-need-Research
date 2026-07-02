import express from 'express';
import { query } from '../db/pool.js';

const router = express.Router();

// Guardian progress tracking (RO2 / purpose): a read-only summary of a child's
// learning, retrieved with the child's login code. It exposes only aggregated
// progress and engagement (no raw answers), consistent with the code-based
// access already used for student login, so a parent or guardian can follow
// their child's development outside the classroom.
router.get('/:code', async (req, res) => {
  try {
    const code = (req.params.code || '').trim();
    if (!code || code.length > 20) {
      return res.status(400).json({ error: 'A valid child code is required' });
    }

    const userRes = await query(
      "SELECT id, name, grade, language FROM users WHERE anon_code = $1 AND role = 'student' LIMIT 1",
      [code]
    );
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'No child found for that code' });
    }
    const student = userRes.rows[0];
    const id = student.id;

    const [completedRes, aggRes, masteredRes, daysRes, badgesRes, recentRes, moodRes] =
      await Promise.all([
        query('SELECT COUNT(*)::int AS c FROM progress WHERE student_id = $1 AND completed = TRUE', [id]),
        query(
          `SELECT COALESCE(ROUND(AVG(score)), 0)::int AS avg_score,
                  COALESCE(SUM(time_spent_seconds), 0)::int AS total_time
           FROM progress WHERE student_id = $1 AND completed = TRUE`,
          [id]
        ),
        query(
          `SELECT COUNT(*)::int AS c
           FROM progress p JOIN lessons l ON l.id = p.lesson_id
           WHERE p.student_id = $1 AND l.type = 'math' AND p.score >= 70`,
          [id]
        ),
        query('SELECT COUNT(DISTINCT session_date)::int AS days FROM study_sessions WHERE student_id = $1', [id]),
        query('SELECT COUNT(*)::int AS c FROM badges WHERE student_id = $1', [id]),
        query(
          `SELECT l.title_en, l.title_si, p.score, p.completed_at
           FROM progress p JOIN lessons l ON l.id = p.lesson_id
           WHERE p.student_id = $1 AND p.completed = TRUE
           ORDER BY p.completed_at DESC NULLS LAST LIMIT 5`,
          [id]
        ),
        query(
          `SELECT ROUND(AVG(metric_value) FILTER (WHERE metric_name = 'mood_start'), 1) AS mood_start,
                  ROUND(AVG(metric_value) FILTER (WHERE metric_name = 'mood_end'), 1)   AS mood_end
           FROM engagement_events WHERE student_id = $1 AND event_type = 'mood'`,
          [id]
        ),
      ]);

    res.json({
      student: { name: student.name, grade: student.grade, language: student.language },
      summary: {
        activities_completed: completedRes.rows[0].c,
        average_score: aggRes.rows[0].avg_score,
        total_minutes: Math.round(aggRes.rows[0].total_time / 60),
        active_days: daysRes.rows[0].days,
        levels_mastered: masteredRes.rows[0].c,
        badges: badgesRes.rows[0].c,
      },
      recent: recentRes.rows.map((r) => ({
        title_en: r.title_en,
        title_si: r.title_si,
        score: r.score,
        completed_at: r.completed_at,
      })),
      mood: {
        start: moodRes.rows[0].mood_start !== null ? Number(moodRes.rows[0].mood_start) : null,
        end: moodRes.rows[0].mood_end !== null ? Number(moodRes.rows[0].mood_end) : null,
      },
    });
  } catch (err) {
    console.error('guardian summary error:', err.message);
    res.status(500).json({ error: 'Failed to load progress' });
  }
});

export default router;
