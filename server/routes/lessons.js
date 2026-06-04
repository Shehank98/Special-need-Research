import express from 'express';
import { query } from '../db/pool.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

const LESSON_TYPES = ['reading', 'quiz', 'picture_match'];

// Validates and normalises a lesson payload. Returns { error } or { value }.
function validateLesson(body) {
  const { title_en, title_si, type, difficulty, content } = body || {};

  if (!title_en || typeof title_en !== 'string' || title_en.trim().length === 0) {
    return { error: 'title_en is required' };
  }
  if (!LESSON_TYPES.includes(type)) {
    return { error: `type must be one of: ${LESSON_TYPES.join(', ')}` };
  }
  const diff = Number(difficulty);
  if (!Number.isInteger(diff) || diff < 1 || diff > 5) {
    return { error: 'difficulty must be an integer from 1 to 5' };
  }
  if (!content || typeof content !== 'object' || Array.isArray(content)) {
    return { error: 'content must be an object' };
  }

  // Type-specific structure checks (light but catches empty/malformed lessons).
  if (type === 'picture_match') {
    if (!Array.isArray(content.items) || content.items.length === 0) {
      return { error: 'picture_match content needs a non-empty items array' };
    }
    for (const it of content.items) {
      if (!it.word_en || !it.word_si) {
        return { error: 'each picture_match item needs word_en and word_si' };
      }
    }
  } else if (type === 'reading') {
    if (!Array.isArray(content.sentences) || content.sentences.length === 0) {
      return { error: 'reading content needs a non-empty sentences array' };
    }
    for (const s of content.sentences) {
      if (!s.en && !s.si) {
        return { error: 'each reading sentence needs en or si text' };
      }
    }
  } else if (type === 'quiz') {
    if (!Array.isArray(content.questions) || content.questions.length === 0) {
      return { error: 'quiz content needs a non-empty questions array' };
    }
    for (const q of content.questions) {
      if (!q.prompt_en && !q.prompt_si) {
        return { error: 'each quiz question needs a prompt' };
      }
      if (!Array.isArray(q.options) || q.options.length < 2) {
        return { error: 'each quiz question needs at least 2 options' };
      }
      if (!q.options.some((o) => o.correct)) {
        return { error: 'each quiz question needs at least one correct option' };
      }
    }
  }

  // Ensure content carries its type for the client renderer.
  const normalisedContent = { ...content, type };

  return {
    value: {
      title_en: title_en.trim(),
      title_si: (title_si || '').trim(),
      type,
      difficulty: diff,
      content: normalisedContent,
    },
  };
}

// GET /api/lessons  -> list all lessons ordered by difficulty
// Optional ?difficulty=1..5 filter
router.get('/', requireAuth, async (req, res) => {
  try {
    const { difficulty } = req.query;
    let result;
    if (difficulty) {
      result = await query(
        'SELECT * FROM lessons WHERE difficulty = $1 ORDER BY difficulty, created_at',
        [Number(difficulty)]
      );
    } else {
      result = await query('SELECT * FROM lessons ORDER BY difficulty, created_at');
    }
    res.json(result.rows);
  } catch (err) {
    console.error('list lessons error:', err.message);
    res.status(500).json({ error: 'Failed to list lessons' });
  }
});

// GET /api/lessons/:id -> single lesson content
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const result = await query('SELECT * FROM lessons WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('get lesson error:', err.message);
    res.status(500).json({ error: 'Failed to get lesson' });
  }
});

// POST /api/lessons -> create a lesson (teacher only)
router.post('/', requireAuth, requireRole('teacher'), async (req, res) => {
  const { error, value } = validateLesson(req.body);
  if (error) return res.status(400).json({ error });
  try {
    const result = await query(
      `INSERT INTO lessons (title_en, title_si, type, difficulty, content)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [value.title_en, value.title_si, value.type, value.difficulty, JSON.stringify(value.content)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('create lesson error:', err.message);
    res.status(500).json({ error: 'Failed to create lesson' });
  }
});

// PUT /api/lessons/:id -> update a lesson (teacher only)
router.put('/:id', requireAuth, requireRole('teacher'), async (req, res) => {
  const { error, value } = validateLesson(req.body);
  if (error) return res.status(400).json({ error });
  try {
    const result = await query(
      `UPDATE lessons
       SET title_en = $1, title_si = $2, type = $3, difficulty = $4, content = $5
       WHERE id = $6 RETURNING *`,
      [
        value.title_en,
        value.title_si,
        value.type,
        value.difficulty,
        JSON.stringify(value.content),
        req.params.id,
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('update lesson error:', err.message);
    res.status(500).json({ error: 'Failed to update lesson' });
  }
});

// DELETE /api/lessons/:id -> delete a lesson (teacher only)
router.delete('/:id', requireAuth, requireRole('teacher'), async (req, res) => {
  try {
    const result = await query('DELETE FROM lessons WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    res.json({ deleted: true, id: result.rows[0].id });
  } catch (err) {
    console.error('delete lesson error:', err.message);
    res.status(500).json({ error: 'Failed to delete lesson' });
  }
});

export default router;
