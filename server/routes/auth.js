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
  return { id: u.id, name: u.name, role: u.role, language: u.language, grade: u.grade };
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
// Students: { name, role: 'student', language?, grade? } (auto-registered).
// Teachers: { name, role: 'teacher', password }.
router.post(
  '/login',
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required'),
  body('role').isIn(['teacher', 'student']).withMessage('A valid role is required'),
  body('grade').optional({ nullable: true }).isInt({ min: 1, max: 12 }).withMessage('Grade must be 1-12'),
  async (req, res) => {
    if (!handleValidation(req, res)) return;
    try {
      const { name, role, language = 'en', grade = null, password } = req.body;
      const cleanName = name.trim();
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

      // Student: find or auto-create.
      const existing = await query(
        "SELECT * FROM users WHERE LOWER(name) = LOWER($1) AND role = 'student' LIMIT 1",
        [cleanName]
      );
      let user;
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

      // Record a study-session login (research metric).
      await query(
        `INSERT INTO study_sessions (student_id, session_date, login_time)
         VALUES ($1, CURRENT_DATE, NOW())`,
        [user.id]
      );

      res.json({ token: signToken(user), user: publicUser(user) });
    } catch (err) {
      console.error('login error:', err.message);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

export default router;
