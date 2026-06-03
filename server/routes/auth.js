import express from 'express';
import { query } from '../db/pool.js';
import { signToken } from '../middleware/auth.js';

const router = express.Router();

const TEACHER_PASSWORD = process.env.TEACHER_PASSWORD || 'teacher123';

// POST /api/auth/login
// Body: { name, role, language?, grade?, password? }
// Students log in by name (auto-registered on first login - common for young
// children in a supervised classroom study). Teachers must supply the shared
// TEACHER_PASSWORD.
router.post('/login', async (req, res) => {
  try {
    const { name, role, language = 'en', grade = null, password } = req.body || {};

    if (!name || !role || !['teacher', 'student'].includes(role)) {
      return res.status(400).json({ error: 'name and a valid role are required' });
    }

    if (role === 'teacher' && password !== TEACHER_PASSWORD) {
      return res.status(401).json({ error: 'Incorrect teacher password' });
    }

    // Find existing user (case-insensitive name match within role).
    const existing = await query(
      'SELECT * FROM users WHERE LOWER(name) = LOWER($1) AND role = $2 LIMIT 1',
      [name.trim(), role]
    );

    let user;
    if (existing.rows.length > 0) {
      user = existing.rows[0];
    } else {
      const inserted = await query(
        `INSERT INTO users (name, role, language, grade)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [name.trim(), role, language, grade]
      );
      user = inserted.rows[0];
    }

    // Record a study session login for students (research metric).
    if (user.role === 'student') {
      await query(
        `INSERT INTO study_sessions (student_id, session_date, login_time)
         VALUES ($1, CURRENT_DATE, NOW())`,
        [user.id]
      );
    }

    const token = signToken(user);
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        language: user.language,
        grade: user.grade,
      },
    });
  } catch (err) {
    console.error('login error:', err.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
