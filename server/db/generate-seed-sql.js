// Generates a pure-SQL seed file (db/seed.sql) from lessons.data.js so the
// content stays in sync with the app. Run with: npm run db:gen-sql
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { lessons, students } from './lessons.data.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Escape a JS string for a single-quoted SQL literal.
const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
// Escape JSON for a single-quoted ::jsonb literal.
const j = (obj) => `'${JSON.stringify(obj).replace(/'/g, "''")}'::jsonb`;

let out = `-- =====================================================================
-- seed.sql — sample data for the dyslexia learning app.
-- AUTO-GENERATED from db/lessons.data.js (npm run db:gen-sql). Do not edit by hand.
--
-- Run AFTER schema.sql, e.g.:   psql "$DATABASE_URL" -f db/schema.sql -f db/seed.sql
--
-- Notes:
--  * Re-runnable: clears lessons and re-inserts; users use guards.
--  * The teacher 'Ms. Perera' is inserted with NULL password_hash. On first
--    login the app accepts the invite code (TEACHER_PASSWORD env) and stores a
--    bcrypt hash automatically. To set a hash here instead, generate one with
--    bcrypt and replace NULL below.
-- =====================================================================

BEGIN;

-- Reset lessons so this script is repeatable.
DELETE FROM lessons;

-- ---- Lessons (${lessons.length}) ----
INSERT INTO lessons (title_en, title_si, type, difficulty, content) VALUES
`;

const lessonRows = lessons.map(
  (l) => `  (${q(l.title_en)}, ${q(l.title_si)}, ${q(l.type)}, ${l.difficulty}, ${j(l.content)})`
);
out += lessonRows.join(',\n') + ';\n\n';

out += `-- ---- Demo teacher (password set on first login via invite code) ----
INSERT INTO users (name, role, language, password_hash)
SELECT 'Ms. Perera', 'teacher', 'en', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE LOWER(name) = LOWER('Ms. Perera') AND role = 'teacher'
);

-- ---- Demo students ----
`;

const studentRows = students.map(
  ([name, language, grade]) =>
    `INSERT INTO users (name, role, language, grade)
SELECT ${q(name)}, 'student', ${q(language)}, ${grade}
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE LOWER(name) = LOWER(${q(name)}) AND role = 'student'
);`
);
out += studentRows.join('\n') + '\n\nCOMMIT;\n';

const target = path.join(__dirname, 'seed.sql');
fs.writeFileSync(target, out, 'utf8');
console.log(`✅ Wrote ${target} (${lessons.length} lessons, ${students.length} students).`);
