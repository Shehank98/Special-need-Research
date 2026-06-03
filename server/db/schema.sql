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
  created_at TIMESTAMP DEFAULT NOW()
);

-- Lessons / Content modules
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en TEXT,
  title_si TEXT,
  type VARCHAR(30), -- 'reading', 'quiz', 'picture_match'
  difficulty INT CHECK (difficulty BETWEEN 1 AND 5),
  content JSONB, -- flexible content structure
  created_at TIMESTAMP DEFAULT NOW()
);

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
