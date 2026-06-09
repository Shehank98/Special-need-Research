import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';

export const LEVELS = [1, 2, 3];
export const PASS_SCORE = 70; // % needed to pass a level and unlock the next

export const LEVEL_LABEL = {
  1: { en: 'Easy', si: 'පහසු' },
  2: { en: 'Medium', si: 'මධ්‍යම' },
  3: { en: 'Hard', si: 'අමාරු' },
};

// Stars for a score: 1 (pass), 2 (>=80), 3 (>=95).
export function starsFor(score) {
  if (score >= 95) return 3;
  if (score >= 80) return 2;
  if (score >= PASS_SCORE) return 1;
  return 0;
}

// Build per-level status for an activity from the progress map.
// Returns [{ level, score, stars, passed, unlocked }] for levels 1..3.
export function levelStatus(map, activity) {
  let prevPassed = true; // level 1 always unlocked
  return LEVELS.map((level) => {
    const entry = map[`${activity}:${level}`];
    const score = entry?.score ?? null;
    const passed = score != null && score >= PASS_SCORE;
    const status = { level, score, stars: score == null ? 0 : starsFor(score), passed, unlocked: prevPassed };
    prevPassed = passed;
    return status;
  });
}

// Total stars earned across all 3 levels of an activity (0..9).
export function activityStars(map, activity) {
  return levelStatus(map, activity).reduce((sum, s) => sum + s.stars, 0);
}

// Fetches the student's maths progress and returns a keyed map + reload.
export function useMathProgress() {
  const [map, setMap] = useState({});
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(() => {
    api
      .mathProgress()
      .then((rows) => {
        const m = {};
        rows.forEach((row) => {
          const key = `${row.activity}:${row.level}`;
          // keep the best score seen
          if (!m[key] || row.score > m[key].score) m[key] = { score: row.score, completed: row.completed };
        });
        setMap(m);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => { reload(); }, [reload]);
  return { map, loaded, reload };
}
