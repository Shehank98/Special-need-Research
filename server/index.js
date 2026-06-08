import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
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
import sessionRoutes from './routes/sessions.js';
import tracingRoutes from './routes/tracing.js';
import mathRoutes from './routes/math.js';
import { requireAuth } from './middleware/auth.js';
import { query } from './db/pool.js';
import { runMigrations } from './db/migrate.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Behind Railway's proxy: trust it so rate-limit/IP detection works correctly.
app.set('trust proxy', 1);

// Security headers + a Content-Security-Policy that allows our CDNs
// (OpenDyslexic + Google Fonts + OpenMoji images).
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'default-src': ["'self'"],
        'script-src': ["'self'"],
        // React inline styles + injected font <style> tags need 'unsafe-inline'.
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdn.jsdelivr.net'],
        'font-src': ["'self'", 'https://fonts.gstatic.com', 'https://cdn.jsdelivr.net', 'data:'],
        'img-src': ["'self'", 'data:', 'https://openmoji.org'],
        // jsdelivr is allowed for the OpenDyslexic font's source map fetch.
        'connect-src': ["'self'", 'https://cdn.jsdelivr.net'],
        'object-src': ["'none'"],
        'frame-ancestors': ["'self'"],
        'upgrade-insecure-requests': process.env.NODE_ENV === 'production' ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false,
    // Allow images/fonts to be loaded from the CDNs above.
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Restrict CORS to the known frontend origin in production.
const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: process.env.NODE_ENV === 'production' && allowedOrigins.length ? allowedOrigins : true,
    credentials: true,
  })
);

// Cap request body size to limit abuse.
app.use(express.json({ limit: '100kb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Global rate limit on the API; stricter limit on auth to slow brute force.
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again later.' },
});
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);

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
app.use('/api/sessions', sessionRoutes);
app.use('/api/tracing', tracingRoutes);
app.use('/api/math', mathRoutes);

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
  // Hashed build assets are content-addressed, so cache them aggressively.
  app.use(
    '/assets',
    express.static(path.join(clientDist, 'assets'), {
      immutable: true,
      maxAge: '1y',
      fallthrough: true, // missing asset -> 404 (handled below), never index.html
    })
  );

  // Other static files (favicon, etc.). index.html must NOT be cached, so the
  // browser always picks up the latest asset hashes after a redeploy.
  app.use(
    express.static(clientDist, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('index.html')) {
          res.setHeader('Cache-Control', 'no-cache, must-revalidate');
        }
      },
    })
  );

  // A missing file with an extension (e.g. an old .css/.js hash) should 404 —
  // never fall back to index.html, which would break MIME-type checking.
  app.get(/^\/(?!api).*/, (req, res, next) => {
    if (path.extname(req.path)) return next(); // -> default 404
    res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Generic error handler.
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Optional: run the idempotent schema on boot (RUN_MIGRATIONS=true), so a fresh
// or upgraded deploy needs no manual SQL. Failure is logged but non-fatal so the
// /api/health endpoint can still report a disconnected DB.
async function start() {
  // Apply the idempotent schema on boot by default. Opt out with
  // RUN_MIGRATIONS=false. Safe to run every boot (CREATE/ALTER ... IF NOT EXISTS).
  if (process.env.RUN_MIGRATIONS !== 'false') {
    try {
      console.log('⏳ Applying schema (set RUN_MIGRATIONS=false to skip)…');
      await runMigrations();
      console.log('✅ Database schema is up to date.');
    } catch (err) {
      console.error('❌ Auto-migration failed:', err.message);
    }
  }
  app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  });
}

start();
