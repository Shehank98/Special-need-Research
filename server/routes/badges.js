import express from 'express';
import { query } from '../db/pool.js';
import { requireAuth, requireSelfOrTeacher } from '../middleware/auth.js';
import { awardBadge, BADGE_DEFS } from '../utils/badges.js';

const router = express.Router();

// GET /api/badges/:studentId -> badges earned by a student
router.get('/:studentId', requireAuth, requireSelfOrTeacher('studentId'), async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM badges WHERE student_id = $1 ORDER BY earned_at DESC',
      [req.params.studentId]
    );
    const enriched = result.rows.map((b) => ({
      ...b,
      ...(BADGE_DEFS[b.badge_type] || { label_en: b.badge_type, label_si: b.badge_type, emoji: '🏅' }),
    }));
    res.json(enriched);
  } catch (err) {
    console.error('get badges error:', err.message);
    res.status(500).json({ error: 'Failed to get badges' });
  }
});

// POST /api/badges -> manually award a badge
// Body: { student_id, badge_type }
router.post('/', requireAuth, async (req, res) => {
  try {
    const { student_id, badge_type } = req.body || {};
    if (!student_id || !badge_type) {
      return res.status(400).json({ error: 'student_id and badge_type are required' });
    }
    // Students may only award badges to themselves.
    if (req.user.role === 'student' && req.user.id !== student_id) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const badge = await awardBadge(student_id, badge_type);
    if (!badge) {
      return res.status(200).json({ awarded: false, message: 'Badge already earned or unknown type' });
    }
    res.status(201).json({ awarded: true, badge: { ...badge, ...BADGE_DEFS[badge_type] } });
  } catch (err) {
    console.error('award badge error:', err.message);
    res.status(500).json({ error: 'Failed to award badge' });
  }
});

export default router;
