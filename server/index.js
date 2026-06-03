import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import studentRoutes from './routes/students.js';
import lessonRoutes from './routes/lessons.js';
import progressRoutes from './routes/progress.js';
import eventRoutes from './routes/events.js';
import badgeRoutes from './routes/badges.js';
import teacherRoutes from './routes/teacher.js';
import { requireAuth } from './middleware/auth.js';
import { query } from './db/pool.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: process.env.FRONTEND_URL || true, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Health check (used by Railway healthcheckPath).
app.get('/api/health', async (_req, res) => {
  let db = 'unknown';
  try {
    await query('SELECT 1');
    db = 'connected';
  } catch {
    db = 'disconnected';
  }
  res.json({ status: 'ok', db, time: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/teacher', teacherRoutes);

// Record a logout time for the most recent open study session.
app.post('/api/auth/logout', requireAuth, async (req, res) => {
  try {
    if (req.user.role === 'student') {
      await query(
        `UPDATE study_sessions SET logout_time = NOW()
         WHERE id = (
           SELECT id FROM study_sessions
           WHERE student_id = $1 AND session_date = CURRENT_DATE AND logout_time IS NULL
           ORDER BY login_time DESC LIMIT 1
         )`,
        [req.user.id]
      );
    }
    res.json({ ok: true });
  } catch {
    res.json({ ok: true });
  }
});

// Serve the built React client in production (single-service deploy).
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  // SPA fallback for any non-API route.
  app.get(/^\/(?!api).*/, (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Generic error handler.
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
});
