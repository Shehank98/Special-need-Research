import express from 'express';
import { query } from '../db/pool.js';
import { requireAuth, requireSelfOrTeacher } from '../middleware/auth.js';

const router = express.Router();

// Sane bounds: nothing answered instantly, nothing left "open" for a day.
const MIN_RESPONSE_MS = 0;
const MAX_RESPONSE_MS = 10 * 60 * 1000; // 10 minutes

// POST /api/responses -> log how long a student took to answer one question.
// Body: { lesson_id?, activity_type?, question_index?, correct, response_time_ms,
//         used_hint?, session_id?, week_number? }  (student_id comes from the token,
//         unless a teacher supplies one explicitly)
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      lesson_id = null,
      activity_type = null,
      question_index = null,
      correct = null,
      response_time_ms,
      used_hint = false,
      session_id = null,
      week_number = null,
    } = req.body || {};

    if (response_time_ms === undefined || response_time_ms === null) {
      return res.status(400).json({ error: 'response_time_ms is required' });
    }
    const safeTimeMs = Math.max(
      MIN_RESPONSE_MS,
      Math.min(MAX_RESPONSE_MS, Math.round(Number(response_time_ms) || 0))
    );
    const studentId = req.user.role === 'student' ? req.user.id : req.body.student_id;
    if (!studentId) return res.status(400).json({ error: 'student_id is required for teachers' });

    const result = await query(
      `INSERT INTO question_responses
         (student_id, session_id, lesson_id, activity_type, question_index, correct, used_hint, response_time_ms, week_number)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        studentId,
        session_id,
        lesson_id,
        activity_type,
        question_index == null ? null : Math.round(Number(question_index)),
        correct == null ? null : !!correct,
        !!used_hint,
        safeTimeMs,
        week_number,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('log response error:', err.message);
    res.status(500).json({ error: 'Failed to log response' });
  }
});

// Shared aggregation: per-student response-time analytics.
async function buildSummary(studentId) {
  const overallRes = await query(
    `SELECT COUNT(*)::int AS n,
            ROUND(AVG(response_time_ms))::int AS avg_ms,
            (PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY response_time_ms))::int AS median_ms,
            MIN(response_time_ms)::int AS min_ms,
            MAX(response_time_ms)::int AS max_ms,
            COUNT(*) FILTER (WHERE correct)::int AS correct_n
     FROM question_responses WHERE student_id = $1`,
    [studentId]
  );

  const byActivityRes = await query(
    `SELECT COALESCE(activity_type, 'unknown') AS activity_type,
            COUNT(*)::int AS n,
            ROUND(AVG(response_time_ms))::int AS avg_ms,
            COUNT(*) FILTER (WHERE correct)::int AS correct_n
     FROM question_responses WHERE student_id = $1
     GROUP BY activity_type
     ORDER BY avg_ms DESC`,
    [studentId]
  );

  // Slowest individual questions answered, most recent first among the slowest.
  const slowestRes = await query(
    `SELECT activity_type, question_index, correct, used_hint, response_time_ms, created_at
     FROM question_responses WHERE student_id = $1
     ORDER BY response_time_ms DESC LIMIT 10`,
    [studentId]
  );

  // Trend: average response time for the student's first vs most recent 20 answers,
  // so a teacher can see whether the child is speeding up or slowing down over time.
  const trendRes = await query(
    `WITH ordered AS (
       SELECT response_time_ms, created_at,
              ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn_asc,
              ROW_NUMBER() OVER (ORDER BY created_at DESC) AS rn_desc
       FROM question_responses WHERE student_id = $1
     )
     SELECT
       ROUND(AVG(response_time_ms) FILTER (WHERE rn_asc <= 20))::int AS first_avg_ms,
       ROUND(AVG(response_time_ms) FILTER (WHERE rn_desc <= 20))::int AS recent_avg_ms
     FROM ordered`,
    [studentId]
  );

  const overall = overallRes.rows[0];
  return {
    overall: {
      n: overall.n,
      avg_ms: overall.avg_ms,
      median_ms: overall.median_ms,
      min_ms: overall.min_ms,
      max_ms: overall.max_ms,
      accuracy_pct: overall.n > 0 ? Math.round((overall.correct_n / overall.n) * 100) : null,
    },
    by_activity: byActivityRes.rows.map((r) => ({
      activity_type: r.activity_type,
      n: r.n,
      avg_ms: r.avg_ms,
      accuracy_pct: r.n > 0 ? Math.round((r.correct_n / r.n) * 100) : null,
    })),
    slowest_questions: slowestRes.rows,
    trend: trendRes.rows[0],
  };
}

// GET /api/responses/:studentId -> raw response log (paginated by recency)
router.get('/:studentId', requireAuth, requireSelfOrTeacher('studentId'), async (req, res) => {
  try {
    const limit = Math.max(1, Math.min(500, Number(req.query.limit) || 100));
    const result = await query(
      `SELECT * FROM question_responses WHERE student_id = $1
       ORDER BY created_at DESC LIMIT $2`,
      [req.params.studentId, limit]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('get responses error:', err.message);
    res.status(500).json({ error: 'Failed to get responses' });
  }
});

// GET /api/responses/:studentId/summary -> aggregated response-time analytics
router.get('/:studentId/summary', requireAuth, requireSelfOrTeacher('studentId'), async (req, res) => {
  try {
    const summary = await buildSummary(req.params.studentId);
    res.json(summary);
  } catch (err) {
    console.error('response summary error:', err.message);
    res.status(500).json({ error: 'Failed to build response summary' });
  }
});

export { buildSummary };
export default router;
