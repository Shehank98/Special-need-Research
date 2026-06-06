-- =====================================================================
-- 001_research.rollback.sql  —  reverses 001_research.sql
-- Drops ONLY the objects/columns added by that migration. Existing app
-- tables and their original columns are untouched.
-- WARNING: dropping columns/tables discards any research data stored in them.
-- =====================================================================

DROP TABLE IF EXISTS tracing_attempts;
DROP TABLE IF EXISTS teacher_ratings;

DROP INDEX IF EXISTS idx_events_metric;
DROP INDEX IF EXISTS idx_events_created;
DROP INDEX IF EXISTS idx_events_session;
ALTER TABLE engagement_events DROP COLUMN IF EXISTS week_number;
ALTER TABLE engagement_events DROP COLUMN IF EXISTS metric_value;
ALTER TABLE engagement_events DROP COLUMN IF EXISTS metric_name;
ALTER TABLE engagement_events DROP COLUMN IF EXISTS activity_type;
ALTER TABLE engagement_events DROP COLUMN IF EXISTS session_id;

ALTER TABLE study_sessions DROP COLUMN IF EXISTS study_group;
ALTER TABLE study_sessions DROP COLUMN IF EXISTS week_number;

DROP INDEX IF EXISTS idx_users_anon_code;
-- NOTE: name's NOT NULL is intentionally NOT restored here — re-adding it would
-- fail if any anonymous (name IS NULL) research students exist. Restore manually
-- with `ALTER TABLE users ALTER COLUMN name SET NOT NULL;` only after backfilling.
ALTER TABLE users DROP COLUMN IF EXISTS anon_code;
ALTER TABLE users DROP COLUMN IF EXISTS difficulty_type;
ALTER TABLE users DROP COLUMN IF EXISTS age;
ALTER TABLE users DROP COLUMN IF EXISTS study_group;
