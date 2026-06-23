import express from 'express';
import { query } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { evaluateBadges } from '../utils/badges.js';

const router = express.Router();

// Catalogue of maths activities. Each maps to a lazily-created `lessons` row
// (type 'math', category 'dyscalculia') so results flow into the existing
// progress / teacher-report aggregation with no schema changes.
const MATH_ACTIVITIES = {
  // Foundations (Dyscalculia pre-mathematics)
  foundations_check: { en: 'Readiness Check', si: 'සූදානම් පරීක්ෂාව', difficulty: 1, module: 'foundations' },
  count_objects: { en: 'Count the Objects', si: 'වස්තූන් ගණන් කිරීම', difficulty: 1, module: 'foundations' },
  number_recognition: { en: 'Find the Number', si: 'අංකය හඳුනා ගැනීම', difficulty: 1, module: 'foundations' },
  number_words: { en: 'Number Words', si: 'අංක වචන', difficulty: 1, module: 'foundations' },
  compare_quantity: { en: 'More or Fewer', si: 'වැඩි හෝ අඩු', difficulty: 1, module: 'foundations' },
  number_order: { en: 'Before & After', si: 'පෙර හා පසු', difficulty: 1, module: 'foundations' },
  symbols: { en: 'Maths Signs', si: 'ගණිත ලකුණු', difficulty: 1, module: 'foundations' },
  place_value: { en: 'Place Value', si: 'ස්ථානීය අගය', difficulty: 2, module: 'numbers' },
  addition: { en: 'Addition with Carrying', si: 'එකතු කිරීම', difficulty: 2, module: 'arithmetic' },
  subtraction: { en: 'Subtraction with Borrowing', si: 'අඩු කිරීම', difficulty: 3, module: 'arithmetic' },
  times_tables: { en: 'Multiplication Tables', si: 'ගුණන වගු', difficulty: 3, module: 'arithmetic' },
  division: { en: 'Division', si: 'බෙදීම', difficulty: 3, module: 'arithmetic' },
  clock: { en: 'Telling the Time', si: 'වේලාව කීම', difficulty: 2, module: 'measurement' },
  set_clock: { en: 'Set the Clock', si: 'ඔරලෝසුව සකසන්න', difficulty: 3, module: 'measurement' },
  fractions: { en: 'Fractions', si: 'භාග', difficulty: 3, module: 'numbers' },
  shapes: { en: 'Shapes', si: 'හැඩතල', difficulty: 2, module: 'geometry' },
  shop: { en: 'Virtual Shop', si: 'අතථ්‍ය වෙළඳසැල', difficulty: 3, module: 'money' },
  bar_chart: { en: 'Bar Charts', si: 'තීරු සටහන්', difficulty: 3, module: 'data' },
  assessment: { en: 'Maths Assessment', si: 'ගණිත තක්සේරුව', difficulty: 4, module: 'assessment' },
  // Generator-based topics
  read_write: { en: 'Read & Write Numbers', si: 'සංඛ්‍යා කියවීම', difficulty: 2, module: 'numbers' },
  order: { en: 'Order Numbers', si: 'සංඛ්‍යා පිළිවෙළට', difficulty: 2, module: 'numbers' },
  patterns: { en: 'Number Patterns', si: 'සංඛ්‍යා රටා', difficulty: 2, module: 'numbers' },
  multiples: { en: 'Multiples', si: 'ගුණාකාර', difficulty: 3, module: 'numbers' },
  roman: { en: 'Roman Numerals', si: 'රෝම ඉලක්කම්', difficulty: 3, module: 'numbers' },
  capacity: { en: 'Capacity', si: 'ධාරිතාව', difficulty: 2, module: 'measurement' },
  length: { en: 'Length', si: 'දිග', difficulty: 2, module: 'measurement' },
  weight: { en: 'Weight', si: 'බර', difficulty: 2, module: 'measurement' },
  area: { en: 'Area', si: 'වර්ගඵලය', difficulty: 3, module: 'measurement' },
  currency: { en: 'Notes & Coins', si: 'නෝට්ටු සහ කාසි', difficulty: 2, module: 'money' },
  calc: { en: 'Money Calculations', si: 'මුදල් ගණනය', difficulty: 3, module: 'money' },
  receipts: { en: 'Bills & Receipts', si: 'බිල්පත්', difficulty: 3, module: 'money' },
  faces: { en: 'Faces, Edges & Corners', si: 'මුහුණත්, දාර', difficulty: 2, module: 'geometry' },
  angles: { en: 'Right Angles', si: 'සෘජු කෝණ', difficulty: 2, module: 'geometry' },
  directions: { en: 'Directions', si: 'දිශාවන්', difficulty: 2, module: 'geometry' },
  tables: { en: 'Read Tables', si: 'වගු කියවීම', difficulty: 2, module: 'data' },
  picto: { en: 'Picture Graphs', si: 'පින්තූර ප්‍රස්තාර', difficulty: 3, module: 'data' },
};

export { MATH_ACTIVITIES };

// Find or create the lessons row backing a maths activity at a difficulty level.
async function ensureMathLesson(activity, level) {
  const meta = MATH_ACTIVITIES[activity];
  const found = await query(
    "SELECT id FROM lessons WHERE type = 'math' AND content->>'activity' = $1 AND content->>'level' = $2 LIMIT 1",
    [activity, String(level)]
  );
  if (found.rows.length > 0) return found.rows[0].id;
  const inserted = await query(
    `INSERT INTO lessons (title_en, title_si, type, category, difficulty, content)
     VALUES ($1, $2, 'math', 'dyscalculia', $3, $4) RETURNING id`,
    [`${meta.en} (Lv ${level})`, `${meta.si} (මට්ටම ${level})`, Math.min(5, level + 1), JSON.stringify({ activity, level, module: meta.module })]
  );
  return inserted.rows[0].id;
}

// POST /api/math/result -> record a completed maths activity level for the student.
// Body: { activity, level?, score, time_spent_seconds?, correct?, total?, session_id?, week_number? }
router.post('/result', requireAuth, async (req, res) => {
  try {
    const { activity, level = 1, score = 0, time_spent_seconds = 0, correct = null, total = null } = req.body || {};
    if (!MATH_ACTIVITIES[activity]) {
      return res.status(400).json({ error: 'Unknown maths activity' });
    }
    const studentId = req.user.role === 'student' ? req.user.id : req.body.student_id;
    if (!studentId) return res.status(400).json({ error: 'student_id required' });

    const safeLevel = Math.max(1, Math.min(3, Math.round(Number(level) || 1)));
    const safeScore = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
    const safeTime = Math.max(0, Math.min(86400, Math.round(Number(time_spent_seconds) || 0)));
    const lessonId = await ensureMathLesson(activity, safeLevel);

    // Upsert progress (one row per student+lesson).
    const existing = await query(
      'SELECT id FROM progress WHERE student_id = $1 AND lesson_id = $2 LIMIT 1',
      [studentId, lessonId]
    );
    let progress;
    if (existing.rows.length > 0) {
      const r = await query(
        `UPDATE progress
         SET score = $1,
             time_spent_seconds = COALESCE(time_spent_seconds, 0) + $2,
             completed = TRUE, attempts = attempts + 1, completed_at = NOW()
         WHERE id = $3 RETURNING *`,
        [safeScore, safeTime, existing.rows[0].id]
      );
      progress = r.rows[0];
    } else {
      const r = await query(
        `INSERT INTO progress (student_id, lesson_id, score, time_spent_seconds, completed, attempts, completed_at)
         VALUES ($1, $2, $3, $4, TRUE, 1, NOW()) RETURNING *`,
        [studentId, lessonId, safeScore, safeTime]
      );
      progress = r.rows[0];
    }

    // Engagement events (silent logging), tagged with the activity.
    const sessionId = req.body.session_id || null;
    const week = req.body.week_number || null;
    await query(
      `INSERT INTO engagement_events
         (student_id, session_id, event_type, activity_type, metric_name, metric_value, week_number, metadata)
       VALUES ($1, $2, 'lesson_completed', $3, 'score', $4, $5, $6)`,
      [studentId, sessionId, activity, safeScore, week, JSON.stringify({ correct, total, level: safeLevel, module: MATH_ACTIVITIES[activity].module })]
    );
    if (safeTime > 0) {
      await query(
        `INSERT INTO engagement_events
           (student_id, session_id, event_type, activity_type, metric_name, metric_value, week_number)
         VALUES ($1, $2, 'time_on_task', $3, 'time_on_task', $4, $5)`,
        [studentId, sessionId, activity, safeTime, week]
      );
    }

    const newBadges = await evaluateBadges(studentId, { score: safeScore, timeSpent: safeTime, usedHint: false });

    res.status(201).json({ ok: true, lesson_id: lessonId, level: safeLevel, progress, new_badges: newBadges });
  } catch (err) {
    console.error('math result error:', err.message);
    res.status(500).json({ error: 'Failed to record maths result' });
  }
});

// GET /api/math/progress -> the student's per-activity, per-level best scores.
// Powers the roadmap (stars/unlocks). Students see their own; teachers can pass
// ?student_id=.
router.get('/progress', requireAuth, async (req, res) => {
  try {
    const studentId = req.user.role === 'student' ? req.user.id : req.query.student_id;
    if (!studentId) return res.status(400).json({ error: 'student_id required' });
    const rows = await query(
      `SELECT l.content->>'activity' AS activity,
              COALESCE((l.content->>'level')::int, 1) AS level,
              p.score, p.completed, p.attempts
       FROM progress p
       JOIN lessons l ON l.id = p.lesson_id
       WHERE p.student_id = $1 AND l.type = 'math'`,
      [studentId]
    );
    res.json(rows.rows);
  } catch (err) {
    console.error('math progress error:', err.message);
    res.status(500).json({ error: 'Failed to load maths progress' });
  }
});

export default router;
