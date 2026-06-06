import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { query } from '../db/pool.js';
import { signToken } from '../middleware/auth.js';

const router = express.Router();

// Acts as an invite code for creating teacher accounts.
const TEACHER_INVITE_CODE = process.env.TEACHER_PASSWORD || 'teacher123';

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: errors.array()[0].msg });
    return false;
  }
  return true;
}

function publicUser(u) {
  return {
    id: u.id,
    name: u.name,
    role: u.role,
    language: u.language,
    grade: u.grade,
    study_group: u.study_group || null,
    anon_code: u.anon_code || null,
    difficulty_type: u.difficulty_type || null,
    age: u.age ?? null,
  };
}

// POST /api/auth/register  (teacher accounts only)
// Body: { name, password, invite_code }
router.post(
  '/register',
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('password').isLength({ min: 6, max: 100 }).withMessage('Password must be at least 6 characters'),
  body('invite_code').notEmpty().withMessage('Invite code is required'),
  async (req, res) => {
    if (!handleValidation(req, res)) return;
    try {
      const { name, password, invite_code } = req.body;
      if (invite_code !== TEACHER_INVITE_CODE) {
        return res.status(401).json({ error: 'Invalid invite code' });
      }
      const existing = await query(
        "SELECT id FROM users WHERE LOWER(name) = LOWER($1) AND role = 'teacher'",
        [name.trim()]
      );
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'A teacher with that name already exists' });
      }
      const password_hash = await bcrypt.hash(password, 12);
      const inserted = await query(
        `INSERT INTO users (name, role, language, password_hash)
         VALUES ($1, 'teacher', 'en', $2) RETURNING *`,
        [name.trim(), password_hash]
      );
      const user = inserted.rows[0];
      res.status(201).json({ token: signToken(user), user: publicUser(user) });
    } catch (err) {
      console.error('register error:', err.message);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
);

// POST /api/auth/login
// Students: { role: 'student', anon_code } (research) OR { name } (legacy/auto-create).
// Teachers: { name, role: 'teacher', password }.
// On student login a study session is opened and returned as `session`.
router.post(
  '/login',
  body('name').optional({ nullable: true }).trim().isLength({ max: 100 }),
  body('anon_code').optional({ nullable: true }).trim().isLength({ max: 20 }),
  body('role').isIn(['teacher', 'student']).withMessage('A valid role is required'),
  body('grade').optional({ nullable: true }).isInt({ min: 1, max: 12 }).withMessage('Grade must be 1-12'),
  async (req, res) => {
    if (!handleValidation(req, res)) return;
    try {
      const { name, role, language = 'en', grade = null, password } = req.body;
      const cleanName = (name || '').trim();
      const lang = ['en', 'si'].includes(language) ? language : 'en';

      if (role === 'teacher') {
        const result = await query(
          "SELECT * FROM users WHERE LOWER(name) = LOWER($1) AND role = 'teacher' LIMIT 1",
          [cleanName]
        );
        const teacher = result.rows[0];
        if (!teacher) {
          return res.status(401).json({ error: 'Teacher not found. Please create an account first.' });
        }

        if (teacher.password_hash) {
          const ok = await bcrypt.compare(password || '', teacher.password_hash);
          if (!ok) return res.status(401).json({ error: 'Incorrect password' });
        } else {
          // Legacy/bootstrap account with no hash: accept the invite code once,
          // then set a hash so future logins are password-based.
          if (password !== TEACHER_INVITE_CODE) {
            return res.status(401).json({ error: 'Incorrect password' });
          }
          const hash = await bcrypt.hash(password, 12);
          await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, teacher.id]);
        }
        return res.json({ token: signToken(teacher), user: publicUser(teacher) });
      }

      // Student: by anon_code (research, pre-created) or by name (legacy/auto-create).
      const anonCode = (req.body.anon_code || '').trim();
      let user;
      if (anonCode) {
        const r = await query(
          "SELECT * FROM users WHERE anon_code = $1 AND role = 'student' LIMIT 1",
          [anonCode]
        );
        if (r.rows.length === 0) {
          return res.status(401).json({ error: 'Student code not found' });
        }
        user = r.rows[0];
      } else {
        if (!cleanName) {
          return res.status(400).json({ error: 'A name or student code is required' });
        }
        const existing = await query(
          "SELECT * FROM users WHERE LOWER(name) = LOWER($1) AND role = 'student' LIMIT 1",
          [cleanName]
        );
        if (existing.rows.length > 0) {
          user = existing.rows[0];
        } else {
          const inserted = await query(
            `INSERT INTO users (name, role, language, grade)
             VALUES ($1, 'student', $2, $3) RETURNING *`,
            [cleanName, lang, grade]
          );
          user = inserted.rows[0];
        }
      }

      // Open a study session, stamping the research week_number + group.
      const firstRes = await query(
        'SELECT MIN(login_time) AS first FROM study_sessions WHERE student_id = $1',
        [user.id]
      );
      const first = firstRes.rows[0].first;
      const week = first
        ? Math.floor((Date.now() - new Date(first).getTime()) / (7 * 86400000)) + 1
        : 1;
      const sess = await query(
        `INSERT INTO study_sessions (student_id, session_date, login_time, week_number, study_group)
         VALUES ($1, CURRENT_DATE, NOW(), $2, $3) RETURNING id, week_number`,
        [user.id, week, user.study_group || null]
      );

      res.json({
        token: signToken(user),
        user: publicUser(user),
        session: { id: sess.rows[0].id, week_number: sess.rows[0].week_number },
      });
    } catch (err) {
      console.error('login error:', err.message);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

export default router;
