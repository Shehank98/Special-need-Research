// Seeds the database with sample users and bilingual lessons.
// Run with: npm run db:seed  (idempotent: resets lessons and demo users).
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { pool } from './pool.js';
import { lessons, students } from './lessons.data.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function seed() {
  const client = await pool.connect();
  try {
    // Make sure the schema exists first.
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await client.query(schema);

    await client.query('BEGIN');

    // Reset lessons so seeding is repeatable.
    await client.query('DELETE FROM lessons');
    for (const l of lessons) {
      await client.query(
        `INSERT INTO lessons (title_en, title_si, type, category, difficulty, content)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [l.title_en, l.title_si, l.type, l.category || 'dyslexia', l.difficulty, JSON.stringify(l.content)]
      );
    }

    // Demo teacher with a hashed password (invite/bootstrap password).
    const demoPassword = process.env.TEACHER_PASSWORD || 'teacher123';
    const hash = await bcrypt.hash(demoPassword, 12);
    await client.query(
      `INSERT INTO users (name, role, language, password_hash)
       VALUES ('Ms. Perera', 'teacher', 'en', $1)
       ON CONFLICT DO NOTHING`,
      [hash]
    );
    // Ensure the hash is set even if the row already existed.
    await client.query(
      `UPDATE users SET password_hash = $1
       WHERE LOWER(name) = LOWER('Ms. Perera') AND role = 'teacher' AND password_hash IS NULL`,
      [hash]
    );

    // Demo students.
    for (const [name, language, grade] of students) {
      await client.query(
        `INSERT INTO users (name, role, language, grade)
         SELECT $1::text, 'student', $2, $3
         WHERE NOT EXISTS (SELECT 1 FROM users WHERE LOWER(name) = LOWER($1::text) AND role = 'student')`,
        [name, language, grade]
      );
    }

    await client.query('COMMIT');
    console.log(
      `✅ Seeded ${lessons.length} lessons, 1 teacher (Ms. Perera) and ${students.length} students.`
    );
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
