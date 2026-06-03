import { query } from '../db/pool.js';

// All badge types the app can award, with bilingual labels for the UI.
export const BADGE_DEFS = {
  first_lesson: { label_en: 'First Lesson', label_si: 'පළමු පාඩම', emoji: '🌟' },
  streak_3: { label_en: '3-Day Streak', label_si: 'දින 3 අඛණ්ඩව', emoji: '🔥' },
  perfect_score: { label_en: 'Perfect Score', label_si: 'පරිපූර්ණ ලකුණු', emoji: '💯' },
  speed_star: { label_en: 'Speed Star', label_si: 'වේග තරුව', emoji: '⚡' },
  helper: { label_en: 'Helper', label_si: 'උපකාරකයා', emoji: '🤝' },
};

// Inserts a badge if the student doesn't already have it. Returns the badge row
// if newly awarded, or null if it already existed.
export async function awardBadge(studentId, badgeType) {
  if (!BADGE_DEFS[badgeType]) return null;
  const result = await query(
    `INSERT INTO badges (student_id, badge_type)
     VALUES ($1, $2)
     ON CONFLICT (student_id, badge_type) DO NOTHING
     RETURNING *`,
    [studentId, badgeType]
  );
  if (result.rows.length > 0) {
    // Log the badge as an engagement event too.
    await query(
      `INSERT INTO engagement_events (student_id, event_type, metadata)
       VALUES ($1, 'badge_earned', $2)`,
      [studentId, JSON.stringify({ badge_type: badgeType })]
    );
    return result.rows[0];
  }
  return null;
}

// Evaluates which badges a student has just earned given a completed lesson.
// Returns an array of newly-awarded badge rows.
export async function evaluateBadges(studentId, { score, timeSpent, usedHint } = {}) {
  const newlyEarned = [];

  // first_lesson: any completed lesson
  const completedCount = await query(
    'SELECT COUNT(*)::int AS c FROM progress WHERE student_id = $1 AND completed = TRUE',
    [studentId]
  );
  if (completedCount.rows[0].c >= 1) {
    const b = await awardBadge(studentId, 'first_lesson');
    if (b) newlyEarned.push(b);
  }

  // perfect_score: a lesson finished at 100%
  if (score === 100) {
    const b = await awardBadge(studentId, 'perfect_score');
    if (b) newlyEarned.push(b);
  }

  // speed_star: finished a lesson in under 60 seconds
  if (typeof timeSpent === 'number' && timeSpent > 0 && timeSpent < 60) {
    const b = await awardBadge(studentId, 'speed_star');
    if (b) newlyEarned.push(b);
  }

  // helper: used a hint but still completed the lesson
  if (usedHint) {
    const b = await awardBadge(studentId, 'helper');
    if (b) newlyEarned.push(b);
  }

  // streak_3: logged in on 3 or more distinct days
  const streak = await query(
    'SELECT COUNT(DISTINCT session_date)::int AS days FROM study_sessions WHERE student_id = $1',
    [studentId]
  );
  if (streak.rows[0].days >= 3) {
    const b = await awardBadge(studentId, 'streak_3');
    if (b) newlyEarned.push(b);
  }

  return newlyEarned;
}
