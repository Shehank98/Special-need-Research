-- =====================================================================
-- 001_research.sql  —  Phase 1: research instrument (ADDITIVE ONLY)
-- Extends the existing schema for the two-group engagement study.
-- Safe & idempotent: IF NOT EXISTS everywhere. No data is dropped or rewritten.
-- Rollback: 001_research.rollback.sql
--
-- Naming notes:
--   * SQL reserves GROUP, so the column is `study_group` ('intervention'|'control').
--   * `events`  is the existing `engagement_events` table (extended below).
--   * `sessions` is the existing `study_sessions` table; login_time/logout_time
--     serve as started_at/ended_at (week_number + study_group added).
-- =====================================================================

-- ---- users: research attributes + anonymous code ----
ALTER TABLE users ADD COLUMN IF NOT EXISTS study_group VARCHAR(20)
  CHECK (study_group IN ('intervention', 'control'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS age INT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS difficulty_type VARCHAR(30);
ALTER TABLE users ADD COLUMN IF NOT EXISTS anon_code VARCHAR(20);
-- anon_code must be unique when present (used for login & reports).
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_anon_code
  ON users (anon_code) WHERE anon_code IS NOT NULL;

-- ---- study_sessions == research "sessions" ----
ALTER TABLE study_sessions ADD COLUMN IF NOT EXISTS week_number INT;
ALTER TABLE study_sessions ADD COLUMN IF NOT EXISTS study_group VARCHAR(20);

-- ---- engagement_events == research "events" (flexible metric store) ----
ALTER TABLE engagement_events ADD COLUMN IF NOT EXISTS session_id UUID
  REFERENCES study_sessions(id) ON DELETE SET NULL;
ALTER TABLE engagement_events ADD COLUMN IF NOT EXISTS activity_type VARCHAR(40);
ALTER TABLE engagement_events ADD COLUMN IF NOT EXISTS metric_name VARCHAR(50);
ALTER TABLE engagement_events ADD COLUMN IF NOT EXISTS metric_value NUMERIC;
ALTER TABLE engagement_events ADD COLUMN IF NOT EXISTS week_number INT;
CREATE INDEX IF NOT EXISTS idx_events_session ON engagement_events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_created ON engagement_events(created_at);
CREATE INDEX IF NOT EXISTS idx_events_metric ON engagement_events(metric_name);

-- ---- teacher_ratings: shared rubric, filled for BOTH groups ----
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

-- ---- tracing_attempts: intervention group only ----
CREATE TABLE IF NOT EXISTS tracing_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES study_sessions(id) ON DELETE SET NULL,
  target_word TEXT,
  accuracy_pct NUMERIC,        -- 0..100, closeness to the dashed path
  completed BOOLEAN DEFAULT FALSE,
  time_ms INT,
  retries INT DEFAULT 0,
  guide_level INT DEFAULT 1,   -- 1 = full dashes ... higher = fewer dashes
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tracing_student ON tracing_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_tracing_session ON tracing_attempts(session_id);
CREATE INDEX IF NOT EXISTS idx_tracing_created ON tracing_attempts(created_at);
