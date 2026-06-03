// Seeds the database with sample users and bilingual lessons.
// Run with: npm run db:seed  (idempotent-ish: clears lessons/demo users first)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './pool.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const lessons = [
  {
    title_en: 'Animals Around Us',
    title_si: 'අප වටා සිටින සතුන්',
    type: 'picture_match',
    difficulty: 1,
    content: {
      type: 'picture_match',
      instructions_en: 'Match the word to the picture',
      instructions_si: 'වචනය පින්තූරයට ගලපන්න',
      items: [
        { word_en: 'cat', word_si: 'පූසා', emoji: '🐱' },
        { word_en: 'dog', word_si: 'බල්ලා', emoji: '🐶' },
        { word_en: 'fish', word_si: 'මාළුවා', emoji: '🐟' },
        { word_en: 'bird', word_si: 'කුරුල්ලා', emoji: '🐦' },
      ],
    },
  },
  {
    title_en: 'Fruits We Eat',
    title_si: 'අප කන පලතුරු',
    type: 'picture_match',
    difficulty: 1,
    content: {
      type: 'picture_match',
      instructions_en: 'Match the word to the picture',
      instructions_si: 'වචනය පින්තූරයට ගලපන්න',
      items: [
        { word_en: 'apple', word_si: 'ඇපල්', emoji: '🍎' },
        { word_en: 'banana', word_si: 'කෙසෙල්', emoji: '🍌' },
        { word_en: 'mango', word_si: 'අඹ', emoji: '🥭' },
        { word_en: 'grapes', word_si: 'මිදි', emoji: '🍇' },
      ],
    },
  },
  {
    title_en: 'My First Reading',
    title_si: 'මගේ පළමු කියවීම',
    type: 'reading',
    difficulty: 2,
    content: {
      type: 'reading',
      instructions_en: 'Tap the speaker to hear each sentence, then read it aloud.',
      instructions_si: 'එක් එක් වාක්‍යය ඇසීමට ස්පීකරය තට්ටු කරන්න, පසුව එය හඬ නඟා කියවන්න.',
      sentences: [
        { en: 'The sun is big and yellow.', si: 'හිරු විශාල හා කහ පැහැයි.' },
        { en: 'A small dog runs in the park.', si: 'කුඩා බල්ලෙක් උද්‍යානයේ දුවයි.' },
        { en: 'I like to read my book.', si: 'මම මගේ පොත කියවීමට කැමතියි.' },
      ],
    },
  },
  {
    title_en: 'Colours Quiz',
    title_si: 'වර්ණ ප්‍රශ්නාවලිය',
    type: 'quiz',
    difficulty: 2,
    content: {
      type: 'quiz',
      instructions_en: 'Choose the correct picture for each word.',
      instructions_si: 'සෑම වචනයක් සඳහාම නිවැරදි පින්තූරය තෝරන්න.',
      questions: [
        {
          prompt_en: 'Which one is red?',
          prompt_si: 'රතු පාට කුමක්ද?',
          options: [
            { label_en: 'apple', label_si: 'ඇපල්', emoji: '🍎', correct: true },
            { label_en: 'leaf', label_si: 'කොළය', emoji: '🍃', correct: false },
            { label_en: 'sky', label_si: 'අහස', emoji: '🌌', correct: false },
          ],
          hint_en: 'It is a fruit you can eat.',
          hint_si: 'එය ඔබට කන්න පුළුවන් පලතුරකි.',
        },
        {
          prompt_en: 'Which one is yellow?',
          prompt_si: 'කහ පාට කුමක්ද?',
          options: [
            { label_en: 'sun', label_si: 'හිරු', emoji: '☀️', correct: true },
            { label_en: 'grapes', label_si: 'මිදි', emoji: '🍇', correct: false },
            { label_en: 'fish', label_si: 'මාළුවා', emoji: '🐟', correct: false },
          ],
          hint_en: 'You see it in the sky in the day.',
          hint_si: 'ඔබ එය දිවා කාලයේ අහසේ දකියි.',
        },
      ],
    },
  },
  {
    title_en: 'Action Words Quiz',
    title_si: 'ක්‍රියා වචන ප්‍රශ්නාවලිය',
    type: 'quiz',
    difficulty: 3,
    content: {
      type: 'quiz',
      instructions_en: 'Pick the picture that matches the action word.',
      instructions_si: 'ක්‍රියා වචනයට ගැළපෙන පින්තූරය තෝරන්න.',
      questions: [
        {
          prompt_en: 'run',
          prompt_si: 'දුවනවා',
          options: [
            { label_en: 'running', label_si: 'දුවනවා', emoji: '🏃', correct: true },
            { label_en: 'sleeping', label_si: 'නිදනවා', emoji: '😴', correct: false },
            { label_en: 'eating', label_si: 'කනවා', emoji: '🍽️', correct: false },
          ],
          hint_en: 'You move your legs fast.',
          hint_si: 'ඔබ ඔබේ කකුල් වේගයෙන් චලනය කරයි.',
        },
        {
          prompt_en: 'eat',
          prompt_si: 'කනවා',
          options: [
            { label_en: 'eating', label_si: 'කනවා', emoji: '🍽️', correct: true },
            { label_en: 'jumping', label_si: 'පනිනවා', emoji: '🤸', correct: false },
            { label_en: 'reading', label_si: 'කියවනවා', emoji: '📖', correct: false },
          ],
          hint_en: 'You do this when you are hungry.',
          hint_si: 'ඔබ බඩගිනි වූ විට මෙය කරයි.',
        },
      ],
    },
  },
];

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
        `INSERT INTO lessons (title_en, title_si, type, difficulty, content)
         VALUES ($1, $2, $3, $4, $5)`,
        [l.title_en, l.title_si, l.type, l.difficulty, JSON.stringify(l.content)]
      );
    }

    // Demo teacher
    await client.query(
      `INSERT INTO users (name, role, language, grade)
       SELECT 'Ms. Perera', 'teacher', 'en', NULL
       WHERE NOT EXISTS (SELECT 1 FROM users WHERE name = 'Ms. Perera' AND role = 'teacher')`
    );

    // Demo students
    const students = [
      ['Nimal', 'si', 3],
      ['Amara', 'en', 4],
      ['Kavya', 'si', 2],
    ];
    for (const [name, language, grade] of students) {
      await client.query(
        `INSERT INTO users (name, role, language, grade)
         SELECT $1, 'student', $2, $3
         WHERE NOT EXISTS (SELECT 1 FROM users WHERE name = $1 AND role = 'student')`,
        [name, language, grade]
      );
    }

    await client.query('COMMIT');
    console.log(`✅ Seeded ${lessons.length} lessons, 1 teacher and ${students.length} students.`);
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
