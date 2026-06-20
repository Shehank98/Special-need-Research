-- Schema for the bilingual dyslexia learning app.
-- Safe to run repeatedly: uses IF NOT EXISTS / pgcrypto for gen_random_uuid().

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users (teachers and students)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('teacher', 'student')),
  language VARCHAR(10) DEFAULT 'en', -- 'en' or 'si'
  grade INT,
  password_hash TEXT, -- only set for teacher accounts
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add password_hash if upgrading an existing database created before this column.
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- A teacher name must be unique so password login is unambiguous.
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_teacher_name
  ON users (LOWER(name)) WHERE role = 'teacher';

-- Lessons / Content modules
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT,
  title_si TEXT,
  type VARCHAR(30), -- 'reading', 'quiz', 'picture_match', 'numbers', 'spelling'
  category VARCHAR(20) DEFAULT 'dyslexia', -- 'dyslexia', 'dyscalculia', 'dysorthographia'
  difficulty INT CHECK (difficulty BETWEEN 1 AND 5),
  content JSONB, -- flexible content structure
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add category if upgrading a database created before this column.
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS category VARCHAR(20) DEFAULT 'dyslexia';
CREATE INDEX IF NOT EXISTS idx_lessons_category ON lessons(category);

-- Student progress per lesson
CREATE TABLE IF NOT EXISTS progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  score INT,
  time_spent_seconds INT,
  completed BOOLEAN DEFAULT FALSE,
  attempts INT DEFAULT 0,
  completed_at TIMESTAMP
);

-- Engagement events (for research metrics)
CREATE TABLE IF NOT EXISTS engagement_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(50), -- 'tts_used', 'hint_used', 'badge_earned', 'quiz_answered'
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Badges earned
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_type VARCHAR(50), -- 'first_lesson', 'streak_3', 'perfect_score', etc.
  earned_at TIMESTAMP DEFAULT NOW()
);

-- Research sessions (2-week study tracking)
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_date DATE,
  login_time TIMESTAMP,
  logout_time TIMESTAMP,
  total_lessons_done INT DEFAULT 0
);

-- Helpful indexes for reporting
CREATE INDEX IF NOT EXISTS idx_progress_student ON progress(student_id);
CREATE INDEX IF NOT EXISTS idx_events_student ON engagement_events(student_id);
CREATE INDEX IF NOT EXISTS idx_badges_student ON badges(student_id);
CREATE INDEX IF NOT EXISTS idx_sessions_student ON study_sessions(student_id);
-- A student earns each badge type only once
CREATE UNIQUE INDEX IF NOT EXISTS idx_badges_unique ON badges(student_id, badge_type);

-- =====================================================================
-- Research instrument (engagement study) — additive, see migrations/001_research.sql
-- SQL reserves GROUP, so the column is `study_group` ('intervention'|'control').
-- `engagement_events` == research "events"; `study_sessions` == "sessions".
-- =====================================================================

-- users: research attributes + anonymous code (no names used for research)
ALTER TABLE users ADD COLUMN IF NOT EXISTS study_group VARCHAR(20)
  CHECK (study_group IN ('intervention', 'control'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS age INT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS difficulty_type VARCHAR(30);
ALTER TABLE users ADD COLUMN IF NOT EXISTS anon_code VARCHAR(20);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_anon_code
  ON users (anon_code) WHERE anon_code IS NOT NULL;
-- Research students are anonymous (identified by anon_code, no name).
ALTER TABLE users ALTER COLUMN name DROP NOT NULL;

-- study_sessions == research "sessions"
ALTER TABLE study_sessions ADD COLUMN IF NOT EXISTS week_number INT;
ALTER TABLE study_sessions ADD COLUMN IF NOT EXISTS study_group VARCHAR(20);

-- engagement_events == research "events" (flexible metric store)
ALTER TABLE engagement_events ADD COLUMN IF NOT EXISTS session_id UUID
  REFERENCES study_sessions(id) ON DELETE SET NULL;
ALTER TABLE engagement_events ADD COLUMN IF NOT EXISTS activity_type VARCHAR(40);
ALTER TABLE engagement_events ADD COLUMN IF NOT EXISTS metric_name VARCHAR(50);
ALTER TABLE engagement_events ADD COLUMN IF NOT EXISTS metric_value NUMERIC;
ALTER TABLE engagement_events ADD COLUMN IF NOT EXISTS week_number INT;
CREATE INDEX IF NOT EXISTS idx_events_session ON engagement_events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_created ON engagement_events(created_at);
CREATE INDEX IF NOT EXISTS idx_events_metric ON engagement_events(metric_name);

-- teacher_ratings: shared rubric, filled for BOTH groups
CREATE TABLE IF NOT EXISTS teacher_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES study_sessions(id) ON DELETE SET NULL,
  attention_1to5 INT CHECK (attention_1to5 BETWEEN 1 AND 5),
  participation_1to5 INT CHECK (participation_1to5 BETWEEN 1 AND 5),
  frustration_1to5 INT CHECK (frustration_1to5 BETWEEN 1 AND 5),
  notes TEXT,
  rated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ratings_student ON teacher_ratings(student_id);
CREATE INDEX IF NOT EXISTS idx_ratings_session ON teacher_ratings(session_id);
CREATE INDEX IF NOT EXISTS idx_ratings_created ON teacher_ratings(created_at);

-- tracing_attempts: intervention group only
CREATE TABLE IF NOT EXISTS tracing_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES study_sessions(id) ON DELETE SET NULL,
  target_word TEXT,
  accuracy_pct NUMERIC,
  completed BOOLEAN DEFAULT FALSE,
  time_ms INT,
  retries INT DEFAULT 0,
  guide_level INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tracing_student ON tracing_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_tracing_session ON tracing_attempts(session_id);
CREATE INDEX IF NOT EXISTS idx_tracing_created ON tracing_attempts(created_at);

-- question_responses: one row per answered question, for per-student response-time
-- analytics (how long a specific child takes to answer, by activity/topic).
CREATE TABLE IF NOT EXISTS question_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES study_sessions(id) ON DELETE SET NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL,
  activity_type VARCHAR(40),
  question_index INT,
  correct BOOLEAN,
  used_hint BOOLEAN DEFAULT FALSE,
  response_time_ms INT,
  week_number INT,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_qresp_student ON question_responses(student_id);
CREATE INDEX IF NOT EXISTS idx_qresp_session ON question_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_qresp_activity ON question_responses(activity_type);
CREATE INDEX IF NOT EXISTS idx_qresp_created ON question_responses(created_at);
