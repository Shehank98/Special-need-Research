import express from 'express';
import { query } from '../db/pool.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { buildSummary as buildResponseSummary } from './responses.js';

const router = express.Router();

// All teacher routes require a teacher token.
router.use(requireAuth, requireRole('teacher'));

// GET /api/teacher/students -> list all students with quick stats
router.get('/students', async (_req, res) => {
  try {
    const result = await query(
      `SELECT u.id, u.name, u.language, u.grade, u.created_at,
              COUNT(DISTINCT p.id) FILTER (WHERE p.completed) AS lessons_completed,
              COALESCE(ROUND(AVG(p.score) FILTER (WHERE p.completed)), 0) AS avg_score
       FROM users u
       LEFT JOIN progress p ON p.student_id = u.id
       WHERE u.role = 'student'
       GROUP BY u.id
       ORDER BY u.name`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('teacher students error:', err.message);
    res.status(500).json({ error: 'Failed to list students' });
  }
});

// Builds the aggregated research report rows (one per student).
async function buildReport() {
  const result = await query(`
    SELECT
      u.id AS student_id,
      u.name,
      u.anon_code,
      u.grade,
      u.language,
      u.study_group,
      COALESCE(p.lessons_completed, 0) AS lessons_completed,
      COALESCE(p.avg_score, 0) AS avg_score,
      COALESCE(p.total_time_seconds, 0) AS total_time_seconds,
      COALESCE(e.tts_used, 0) AS tts_used,
      COALESCE(e.hint_used, 0) AS hint_used,
      COALESCE(e.quiz_answered, 0) AS quiz_answered,
      COALESCE(b.badge_count, 0) AS badge_count,
      COALESCE(s.login_days, 0) AS login_days,
      COALESCE(s.total_session_minutes, 0) AS total_session_minutes,
      s.last_session_date
    FROM users u
    LEFT JOIN (
      SELECT student_id,
             COUNT(*) FILTER (WHERE completed) AS lessons_completed,
             ROUND(AVG(score) FILTER (WHERE completed)) AS avg_score,
             SUM(time_spent_seconds) AS total_time_seconds
      FROM progress GROUP BY student_id
    ) p ON p.student_id = u.id
    LEFT JOIN (
      SELECT student_id,
             COUNT(*) FILTER (WHERE event_type = 'tts_used') AS tts_used,
             COUNT(*) FILTER (WHERE event_type = 'hint_used') AS hint_used,
             COUNT(*) FILTER (WHERE event_type = 'quiz_answered') AS quiz_answered
      FROM engagement_events GROUP BY student_id
    ) e ON e.student_id = u.id
    LEFT JOIN (
      SELECT student_id, COUNT(*) AS badge_count FROM badges GROUP BY student_id
    ) b ON b.student_id = u.id
    LEFT JOIN (
      SELECT student_id,
             COUNT(DISTINCT session_date) AS login_days,
             MAX(session_date) AS last_session_date,
             ROUND(SUM(EXTRACT(EPOCH FROM (COALESCE(logout_time, login_time) - login_time))) / 60) AS total_session_minutes
      FROM study_sessions GROUP BY student_id
    ) s ON s.student_id = u.id
    WHERE u.role = 'student'
    ORDER BY u.name
  `);
  const rows = result.rows;

  // Per-category breakdown (one row per student per disability area).
  // Resilient: if the lessons.category column hasn't been migrated yet, skip the
  // breakdown instead of failing the whole report.
  const CATEGORIES = ['dyslexia', 'dyscalculia', 'dysorthographia'];
  const byStudent = {};
  try {
    const catRes = await query(`
      SELECT p.student_id, l.category,
             COUNT(*) FILTER (WHERE p.completed) AS done,
             COALESCE(ROUND(AVG(p.score) FILTER (WHERE p.completed)), 0) AS avg_score
      FROM progress p
      JOIN lessons l ON l.id = p.lesson_id
      GROUP BY p.student_id, l.category
    `);
    for (const r of catRes.rows) {
      const cat = r.category || 'dyslexia';
      byStudent[r.student_id] = byStudent[r.student_id] || {};
      byStudent[r.student_id][cat] = {
        done: Number(r.done),
        avg_score: Number(r.avg_score),
      };
    }
  } catch (err) {
    console.warn('category breakdown unavailable (run migrations to enable):', err.message);
  }

  // Average per-question response time (ms), for spotting students who take much
  // longer to answer than the class. Resilient: skip if the table isn't migrated yet.
  const avgResponseMs = {};
  try {
    const respRes = await query(`
      SELECT student_id, ROUND(AVG(response_time_ms))::int AS avg_ms, COUNT(*)::int AS n
      FROM question_responses GROUP BY student_id
    `);
    for (const r of respRes.rows) avgResponseMs[r.student_id] = { avg_ms: r.avg_ms, n: r.n };
  } catch (err) {
    console.warn('response-time breakdown unavailable (run migrations to enable):', err.message);
  }
  const classAvgMs = (() => {
    const vals = Object.values(avgResponseMs).filter((v) => v.n >= 3).map((v) => v.avg_ms);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  })();

  // Attach category stats + compute fast-action attention flags per student.
  for (const row of rows) {
    const cats = {};
    for (const c of CATEGORIES) {
      cats[c] = byStudent[row.student_id]?.[c] || { done: 0, avg_score: 0 };
    }
    row.categories = cats;

    const resp = avgResponseMs[row.student_id] || { avg_ms: null, n: 0 };
    row.avg_response_ms = resp.avg_ms;
    row.response_count = resp.n;

    const flags = [];
    // Struggling: completed work in an area but averaging below 60%.
    for (const c of CATEGORIES) {
      if (cats[c].done >= 1 && cats[c].avg_score < 60) {
        flags.push({ type: 'struggling', area: c, value: cats[c].avg_score });
      }
    }
    // Not started at all.
    if (Number(row.lessons_completed) === 0) {
      flags.push({ type: 'not_started' });
    }
    // Over-relying on hints (used a hint on most answered questions).
    const answered = Number(row.quiz_answered);
    const hints = Number(row.hint_used);
    if (answered >= 3 && hints >= answered) {
      flags.push({ type: 'hint_reliant' });
    }
    // Taking noticeably longer per question than the class average.
    if (resp.n >= 3 && classAvgMs && resp.avg_ms > classAvgMs * 1.5) {
      flags.push({ type: 'slow_responder', value: resp.avg_ms });
    }
    // Inactive: no login in 3+ days (or never).
    let daysInactive = null;
    if (row.last_session_date) {
      const last = new Date(row.last_session_date);
      daysInactive = Math.floor((Date.now() - last.getTime()) / 86400000);
      if (daysInactive >= 3) flags.push({ type: 'inactive', days: daysInactive });
    }
    row.days_inactive = daysInactive;
    row.flags = flags;
    row.needs_attention = flags.length > 0;
  }

  return rows;
}

// GET /api/teacher/report -> aggregated research report (JSON, or CSV if ?format=csv)
router.get('/report', async (req, res) => {
  try {
    const rows = await buildReport();

    if (req.query.format === 'csv') {
      const headers = [
        'student_id',
        'name',
        'grade',
        'language',
        'study_group',
        'lessons_completed',
        'avg_score',
        'total_time_seconds',
        'tts_used',
        'hint_used',
        'quiz_answered',
        'badge_count',
        'login_days',
        'total_session_minutes',
        'avg_response_ms',
        'response_count',
        'days_inactive',
        'dyslexia_done',
        'dyslexia_avg',
        'dyscalculia_done',
        'dyscalculia_avg',
        'dysorthographia_done',
        'dysorthographia_avg',
        'needs_attention',
        'flags',
      ];
      const escape = (v) => {
        const s = v === null || v === undefined ? '' : String(v);
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      };
      const flatten = (r) => ({
        ...r,
        dyslexia_done: r.categories.dyslexia.done,
        dyslexia_avg: r.categories.dyslexia.avg_score,
        dyscalculia_done: r.categories.dyscalculia.done,
        dyscalculia_avg: r.categories.dyscalculia.avg_score,
        dysorthographia_done: r.categories.dysorthographia.done,
        dysorthographia_avg: r.categories.dysorthographia.avg_score,
        flags: r.flags.map((f) => (f.area ? `${f.type}:${f.area}` : f.type)).join('; '),
      });
      const csv = [
        headers.join(','),
        ...rows.map(flatten).map((r) => headers.map((h) => escape(r[h])).join(',')),
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="research_report.csv"');
      return res.send(csv);
    }

    res.json(rows);
  } catch (err) {
    console.error('report error:', err.message);
    res.status(500).json({ error: 'Failed to build report' });
  }
});

// POST /api/teacher/assign -> manually award/seed progress at a difficulty for a student
// Body: { student_id, lesson_id }  (creates a not-completed progress row to surface the lesson)
router.post('/assign', async (req, res) => {
  try {
    const { student_id, lesson_id } = req.body || {};
    if (!student_id || !lesson_id) {
      return res.status(400).json({ error: 'student_id and lesson_id are required' });
    }
    const existing = await query(
      'SELECT id FROM progress WHERE student_id = $1 AND lesson_id = $2',
      [student_id, lesson_id]
    );
    if (existing.rows.length === 0) {
      await query(
        `INSERT INTO progress (student_id, lesson_id, score, time_spent_seconds, completed, attempts)
         VALUES ($1, $2, 0, 0, FALSE, 0)`,
        [student_id, lesson_id]
      );
    }
    res.json({ assigned: true });
  } catch (err) {
    console.error('assign error:', err.message);
    res.status(500).json({ error: 'Failed to assign lesson' });
  }
});

// POST /api/teacher/group -> assign/move a student to a research group ("path").
// Body: { student_id, study_group }  where study_group is 'intervention',
// 'control', or null/'' to unassign. This is how a teacher sends each child
// down one of the two paths.
router.post('/group', async (req, res) => {
  try {
    const { student_id } = req.body || {};
    if (!student_id) return res.status(400).json({ error: 'student_id required' });
    const grp = req.body.study_group === '' ? null : req.body.study_group ?? null;
    if (![null, 'intervention', 'control'].includes(grp)) {
      return res.status(400).json({ error: "study_group must be 'intervention', 'control', or empty" });
    }
    const result = await query(
      `UPDATE users SET study_group = $1
       WHERE id = $2 AND role = 'student'
       RETURNING id, name, anon_code, study_group`,
      [grp, student_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Student not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('set group error:', err.message);
    res.status(500).json({ error: 'Failed to set group' });
  }
});

// GET /api/teacher/student/:id -> full per-child detail (maths levels, engagement,
// mood trend, badges, sessions, teacher ratings).
router.get('/student/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const userRes = await query(
      `SELECT id, name, anon_code, role, language, grade, age, study_group, difficulty_type, created_at
       FROM users WHERE id = $1 AND role = 'student'`,
      [id]
    );
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'Student not found' });

    const [mathRes, totalsRes, engRes, moodRes, badgeRes, sessRes, ratingRes, responseTimes] = await Promise.all([
      query(
        `SELECT l.content->>'activity' AS activity,
                COALESCE((l.content->>'level')::int, 1) AS level,
                l.content->>'module' AS module,
                p.score, p.completed, p.attempts, p.time_spent_seconds, p.completed_at
         FROM progress p JOIN lessons l ON l.id = p.lesson_id
         WHERE p.student_id = $1 AND l.type = 'math'`,
        [id]
      ),
      query(
        `SELECT COUNT(*) FILTER (WHERE completed)::int AS completed,
                COALESCE(ROUND(AVG(score) FILTER (WHERE completed)), 0)::int AS avg_score,
                COALESCE(SUM(time_spent_seconds), 0)::int AS total_time
         FROM progress WHERE student_id = $1`,
        [id]
      ),
      query(
        `SELECT event_type, COUNT(*)::int AS n FROM engagement_events
         WHERE student_id = $1 GROUP BY event_type`,
        [id]
      ),
      query(
        `SELECT metric_name, metric_value, created_at FROM engagement_events
         WHERE student_id = $1 AND metric_name IN ('mood_start','mood_end')
         ORDER BY created_at DESC LIMIT 14`,
        [id]
      ),
      query('SELECT badge_type, earned_at FROM badges WHERE student_id = $1 ORDER BY earned_at DESC', [id]),
      query(
        `SELECT COUNT(DISTINCT session_date)::int AS login_days,
                MAX(session_date) AS last_active,
                COALESCE(ROUND(SUM(EXTRACT(EPOCH FROM (COALESCE(logout_time, login_time) - login_time))) / 60), 0)::int AS minutes
         FROM study_sessions WHERE student_id = $1`,
        [id]
      ),
      query(
        `SELECT attention_1to5, participation_1to5, frustration_1to5, notes, created_at
         FROM teacher_ratings WHERE student_id = $1 ORDER BY created_at DESC LIMIT 20`,
        [id]
      ),
      buildResponseSummary(id),
    ]);

    const eng = {};
    engRes.rows.forEach((r) => { eng[r.event_type] = r.n; });

    res.json({
      student: userRes.rows[0],
      math: mathRes.rows,
      totals: totalsRes.rows[0],
      engagement: eng,
      mood: moodRes.rows,
      badges: badgeRes.rows,
      sessions: sessRes.rows[0],
      ratings: ratingRes.rows,
      response_times: responseTimes,
    });
  } catch (err) {
    console.error('student detail error:', err.message);
    res.status(500).json({ error: 'Failed to load student detail' });
  }
});

// POST /api/teacher/rating -> save a rubric rating for a student (both groups).
router.post('/rating', async (req, res) => {
  try {
    const { student_id, attention_1to5, participation_1to5, frustration_1to5, notes = '', session_id = null } = req.body || {};
    if (!student_id) return res.status(400).json({ error: 'student_id required' });
    const clamp = (v) => (v == null ? null : Math.max(1, Math.min(5, Math.round(Number(v)))));
    const result = await query(
      `INSERT INTO teacher_ratings (student_id, session_id, attention_1to5, participation_1to5, frustration_1to5, notes, rated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [student_id, session_id, clamp(attention_1to5), clamp(participation_1to5), clamp(frustration_1to5), String(notes).slice(0, 1000), req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('rating error:', err.message);
    res.status(500).json({ error: 'Failed to save rating' });
  }
});

// GET /api/teacher/matrix -> every student's maths score per activity/level,
// for the class-wide heatmap overview.
router.get('/matrix', async (_req, res) => {
  try {
    const rows = await query(
      `SELECT u.id AS student_id,
              COALESCE(u.anon_code, u.name) AS name,
              l.content->>'activity' AS activity,
              COALESCE((l.content->>'level')::int, 1) AS level,
              p.score
       FROM users u
       JOIN progress p ON p.student_id = u.id
       JOIN lessons l ON l.id = p.lesson_id
       WHERE u.role = 'student' AND l.type = 'math'`
    );
    res.json(rows.rows);
  } catch (err) {
    console.error('matrix error:', err.message);
    res.status(500).json({ error: 'Failed to load matrix' });
  }
});

export default router;
