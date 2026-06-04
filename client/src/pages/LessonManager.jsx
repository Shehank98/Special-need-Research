import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import Layout from '../components/Layout.jsx';
import Picture from '../components/Picture.jsx';
import { CATEGORY_META } from '../lib/lessons.js';

const TYPE_LABELS = {
  picture_match: { en: 'Picture match', si: 'පින්තූර ගැලපීම', emoji: '🖼️' },
  reading: { en: 'Reading', si: 'කියවීම', emoji: '📖' },
  quiz: { en: 'Quiz', si: 'ප්‍රශ්නාවලිය', emoji: '❓' },
  numbers: { en: 'Numbers / counting', si: 'අංක / ගණන් කිරීම', emoji: '🔢' },
  spelling: { en: 'Spelling', si: 'අක්ෂර වින්‍යාසය', emoji: '✏️' },
};

// Default disability category for each lesson type.
const DEFAULT_CATEGORY = {
  picture_match: 'dyslexia',
  reading: 'dyslexia',
  quiz: 'dyslexia',
  numbers: 'dyscalculia',
  spelling: 'dysorthographia',
};

// Blank templates so a new lesson of each type starts valid-ish.
const blankItem = () => ({ word_en: '', word_si: '', emoji: '' });
const blankSentence = () => ({ en: '', si: '', emoji: '' });
const blankOption = (correct = false) => ({ label_en: '', label_si: '', emoji: '', correct });
const blankQuestion = () => ({
  prompt_en: '',
  prompt_si: '',
  hint_en: '',
  hint_si: '',
  options: [blankOption(true), blankOption(false)],
});
const blankGroup = () => ({ emoji: '', count: 1 });
const blankNumberQ = () => ({
  prompt_en: '',
  prompt_si: '',
  hint_en: '',
  hint_si: '',
  groups: [blankGroup()],
  operator: '+',
  answer: 1,
  options: [1, 2, 3],
});
const blankSpellItem = () => ({ word_en: '', word_si: '', emoji: '' });

function blankContent(type) {
  const base = { instructions_en: '', instructions_si: '' };
  if (type === 'picture_match') return { ...base, items: [blankItem(), blankItem()] };
  if (type === 'reading') return { ...base, sentences: [blankSentence()] };
  if (type === 'numbers') return { ...base, questions: [blankNumberQ()] };
  if (type === 'spelling') return { ...base, items: [blankSpellItem()] };
  return { ...base, questions: [blankQuestion()] };
}

function blankDraft() {
  return {
    title_en: '',
    title_si: '',
    type: 'picture_match',
    category: 'dyslexia',
    difficulty: 1,
    content: blankContent('picture_match'),
  };
}

// Small labelled text input.
function Field({ label, value, onChange, type = 'text', ...rest }) {
  return (
    <label className="block space-y-1">
      <span className="text-base font-semibold">{label}</span>
      <input
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border-2 border-pastel-blue bg-white/80 px-3 py-2 text-base focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
        {...rest}
      />
    </label>
  );
}

export default function LessonManager() {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  const [lessons, setLessons] = useState(null);
  const [draft, setDraft] = useState(null); // null = list view; object = editing
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      setLessons(await api.lessons());
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => {
    load();
  }, []);

  function startNew() {
    setError('');
    setDraft(blankDraft());
  }

  function startEdit(lesson) {
    setError('');
    // Clone so edits don't mutate the list until saved.
    setDraft({
      id: lesson.id,
      title_en: lesson.title_en || '',
      title_si: lesson.title_si || '',
      type: lesson.type,
      category: lesson.category || DEFAULT_CATEGORY[lesson.type] || 'dyslexia',
      difficulty: lesson.difficulty || 1,
      content: { instructions_en: '', instructions_si: '', ...(lesson.content || {}) },
    });
  }

  async function remove(lesson) {
    if (!window.confirm(t('confirmDelete'))) return;
    try {
      await api.deleteLesson(lesson.id);
      await load();
    } catch (e) {
      setError(e.message);
    }
  }

  // --- draft mutation helpers ---
  const setField = (key, val) => setDraft((d) => ({ ...d, [key]: val }));
  const setContentField = (key, val) =>
    setDraft((d) => ({ ...d, content: { ...d.content, [key]: val } }));

  function changeType(type) {
    setDraft((d) => ({ ...d, type, category: DEFAULT_CATEGORY[type] || d.category, content: blankContent(type) }));
  }

  async function save() {
    setError('');
    setBusy(true);
    try {
      const payload = {
        title_en: draft.title_en,
        title_si: draft.title_si,
        type: draft.type,
        category: draft.category,
        difficulty: Number(draft.difficulty),
        content: draft.content,
      };
      if (draft.id) {
        await api.updateLesson(draft.id, payload);
      } else {
        await api.createLesson(payload);
      }
      setNotice(t('lessonSaved'));
      setTimeout(() => setNotice(''), 2500);
      setDraft(null);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  // ---------------- LIST VIEW ----------------
  if (!draft) {
    return (
      <Layout>
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-bold">📚 {t('manageLessons')}</h1>
            <div className="flex gap-2">
              <button onClick={() => navigate('/teacher')} className="rounded-full bg-white/70 px-4 py-2 font-semibold shadow">
                ⬅️ {t('backToDashboard')}
              </button>
              <button onClick={startNew} className="btn-primary">➕ {t('newLesson')}</button>
            </div>
          </div>

          {notice && <p className="rounded-xl bg-pastel-green px-4 py-2 font-semibold">{notice}</p>}
          {error && <p className="rounded-xl bg-pastel-pink px-4 py-2 font-semibold">{error}</p>}

          {!lessons ? (
            <p className="text-xl">{t('loading')}</p>
          ) : lessons.length === 0 ? (
            <p className="card">{t('noLessons')}</p>
          ) : (
            <div className="space-y-3">
              {lessons.map((l) => (
                <div key={l.id} className="card flex items-center justify-between gap-3 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-lg font-bold">
                      {lang === 'si' ? l.title_si || l.title_en : l.title_en}
                    </p>
                    <p className="text-sm text-ink/70">
                      {CATEGORY_META[l.category]?.emoji} {CATEGORY_META[l.category]?.[lang] || l.category} · {TYPE_LABELS[l.type]?.[lang] || l.type} · {t('difficulty')} {l.difficulty}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button onClick={() => startEdit(l)} className="rounded-full bg-pastel-yellow px-4 py-2 font-semibold shadow">
                      ✏️ {t('edit')}
                    </button>
                    <button onClick={() => remove(l)} className="rounded-full bg-pastel-pink px-4 py-2 font-semibold shadow">
                      🗑️ {t('delete')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Layout>
    );
  }

  // ---------------- EDITOR VIEW ----------------
  return (
    <Layout>
      <div className="space-y-5">
        <h1 className="text-3xl font-bold">{draft.id ? `✏️ ${t('editLesson')}` : `➕ ${t('newLesson')}`}</h1>
        {error && <p className="rounded-xl bg-pastel-pink px-4 py-2 font-semibold">{error}</p>}

        {/* Basic fields */}
        <div className="card grid gap-4 sm:grid-cols-2">
          <Field label={t('titleEn')} value={draft.title_en} onChange={(v) => setField('title_en', v)} />
          <Field label={t('titleSi')} value={draft.title_si} onChange={(v) => setField('title_si', v)} />
          <label className="block space-y-1">
            <span className="text-base font-semibold">{t('lessonType')}</span>
            <select
              value={draft.type}
              onChange={(e) => changeType(e.target.value)}
              className="w-full rounded-xl border-2 border-pastel-blue bg-white/80 px-3 py-2 text-base"
            >
              {Object.keys(TYPE_LABELS).map((tp) => (
                <option key={tp} value={tp}>
                  {TYPE_LABELS[tp].emoji} {TYPE_LABELS[tp][lang] || TYPE_LABELS[tp].en}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-base font-semibold">{t('difficulty')} (1–5)</span>
            <select
              value={draft.difficulty}
              onChange={(e) => setField('difficulty', Number(e.target.value))}
              className="w-full rounded-xl border-2 border-pastel-blue bg-white/80 px-3 py-2 text-base"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-base font-semibold">{t('category')}</span>
            <select
              value={draft.category}
              onChange={(e) => setField('category', e.target.value)}
              className="w-full rounded-xl border-2 border-pastel-blue bg-white/80 px-3 py-2 text-base"
            >
              {Object.entries(CATEGORY_META).map(([cat, meta]) => (
                <option key={cat} value={cat}>{meta.emoji} {meta[lang] || meta.en}</option>
              ))}
            </select>
          </label>
          <Field label={t('instructionsEn')} value={draft.content.instructions_en} onChange={(v) => setContentField('instructions_en', v)} />
          <Field label={t('instructionsSi')} value={draft.content.instructions_si} onChange={(v) => setContentField('instructions_si', v)} />
        </div>

        {/* Type-specific editors */}
        {draft.type === 'picture_match' && (
          <PictureMatchEditor draft={draft} setDraft={setDraft} t={t} />
        )}
        {draft.type === 'reading' && <ReadingEditor draft={draft} setDraft={setDraft} t={t} />}
        {draft.type === 'quiz' && <QuizEditor draft={draft} setDraft={setDraft} t={t} />}
        {draft.type === 'numbers' && <NumbersEditor draft={draft} setDraft={setDraft} t={t} />}
        {draft.type === 'spelling' && <SpellingEditor draft={draft} setDraft={setDraft} t={t} />}

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={() => setDraft(null)} className="btn-soft flex-1">{t('cancel')}</button>
          <button onClick={save} disabled={busy} className="btn-primary flex-1">
            {busy ? t('loading') : `💾 ${t('save')}`}
          </button>
        </div>
      </div>
    </Layout>
  );
}

// ---- picture_match items editor ----
function PictureMatchEditor({ draft, setDraft, t }) {
  const items = draft.content.items || [];
  const update = (i, key, val) =>
    setDraft((d) => {
      const next = d.content.items.map((it, idx) => (idx === i ? { ...it, [key]: val } : it));
      return { ...d, content: { ...d.content, items: next } };
    });
  const add = () => setDraft((d) => ({ ...d, content: { ...d.content, items: [...d.content.items, blankItem()] } }));
  const remove = (i) =>
    setDraft((d) => ({ ...d, content: { ...d.content, items: d.content.items.filter((_, idx) => idx !== i) } }));

  return (
    <div className="card space-y-3">
      {items.map((it, i) => (
        <div key={i} className="grid items-end gap-2 rounded-xl bg-white/50 p-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
          <Field label={t('wordEn')} value={it.word_en} onChange={(v) => update(i, 'word_en', v)} />
          <Field label={t('wordSi')} value={it.word_si} onChange={(v) => update(i, 'word_si', v)} />
          <div className="flex items-end gap-2">
            <Field label={t('emoji')} value={it.emoji} onChange={(v) => update(i, 'emoji', v)} />
            {it.emoji && <Picture emoji={it.emoji} size={40} />}
          </div>
          <button onClick={() => remove(i)} className="rounded-full bg-pastel-pink px-3 py-2 font-semibold">✕</button>
        </div>
      ))}
      <button onClick={add} className="btn-soft w-full">➕ {t('addItem')}</button>
    </div>
  );
}

// ---- reading sentences editor ----
function ReadingEditor({ draft, setDraft, t }) {
  const sentences = draft.content.sentences || [];
  const update = (i, key, val) =>
    setDraft((d) => {
      const next = d.content.sentences.map((s, idx) => (idx === i ? { ...s, [key]: val } : s));
      return { ...d, content: { ...d.content, sentences: next } };
    });
  const add = () => setDraft((d) => ({ ...d, content: { ...d.content, sentences: [...d.content.sentences, blankSentence()] } }));
  const remove = (i) =>
    setDraft((d) => ({ ...d, content: { ...d.content, sentences: d.content.sentences.filter((_, idx) => idx !== i) } }));

  return (
    <div className="card space-y-3">
      {sentences.map((s, i) => (
        <div key={i} className="grid items-end gap-2 rounded-xl bg-white/50 p-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
          <Field label={t('sentenceEn')} value={s.en} onChange={(v) => update(i, 'en', v)} />
          <Field label={t('sentenceSi')} value={s.si} onChange={(v) => update(i, 'si', v)} />
          <div className="flex items-end gap-2">
            <Field label={t('emoji')} value={s.emoji} onChange={(v) => update(i, 'emoji', v)} />
            {s.emoji && <Picture emoji={s.emoji} size={40} />}
          </div>
          <button onClick={() => remove(i)} className="rounded-full bg-pastel-pink px-3 py-2 font-semibold">✕</button>
        </div>
      ))}
      <button onClick={add} className="btn-soft w-full">➕ {t('addSentence')}</button>
    </div>
  );
}

// ---- quiz questions editor ----
function QuizEditor({ draft, setDraft, t }) {
  const questions = draft.content.questions || [];

  const updateQ = (qi, key, val) =>
    setDraft((d) => {
      const next = d.content.questions.map((q, idx) => (idx === qi ? { ...q, [key]: val } : q));
      return { ...d, content: { ...d.content, questions: next } };
    });
  const addQ = () => setDraft((d) => ({ ...d, content: { ...d.content, questions: [...d.content.questions, blankQuestion()] } }));
  const removeQ = (qi) =>
    setDraft((d) => ({ ...d, content: { ...d.content, questions: d.content.questions.filter((_, idx) => idx !== qi) } }));

  const updateOpt = (qi, oi, key, val) =>
    setDraft((d) => {
      const next = d.content.questions.map((q, idx) => {
        if (idx !== qi) return q;
        const opts = q.options.map((o, j) => (j === oi ? { ...o, [key]: val } : o));
        return { ...q, options: opts };
      });
      return { ...d, content: { ...d.content, questions: next } };
    });
  const setCorrect = (qi, oi) =>
    setDraft((d) => {
      const next = d.content.questions.map((q, idx) => {
        if (idx !== qi) return q;
        return { ...q, options: q.options.map((o, j) => ({ ...o, correct: j === oi })) };
      });
      return { ...d, content: { ...d.content, questions: next } };
    });
  const addOpt = (qi) =>
    setDraft((d) => {
      const next = d.content.questions.map((q, idx) =>
        idx === qi ? { ...q, options: [...q.options, blankOption(false)] } : q
      );
      return { ...d, content: { ...d.content, questions: next } };
    });
  const removeOpt = (qi, oi) =>
    setDraft((d) => {
      const next = d.content.questions.map((q, idx) =>
        idx === qi ? { ...q, options: q.options.filter((_, j) => j !== oi) } : q
      );
      return { ...d, content: { ...d.content, questions: next } };
    });

  return (
    <div className="space-y-4">
      {questions.map((q, qi) => (
        <div key={qi} className="card space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">{t('question')} {qi + 1}</h3>
            <button onClick={() => removeQ(qi)} className="rounded-full bg-pastel-pink px-3 py-1 font-semibold">🗑️</button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t('promptEn')} value={q.prompt_en} onChange={(v) => updateQ(qi, 'prompt_en', v)} />
            <Field label={t('promptSi')} value={q.prompt_si} onChange={(v) => updateQ(qi, 'prompt_si', v)} />
            <Field label={t('hintEn')} value={q.hint_en} onChange={(v) => updateQ(qi, 'hint_en', v)} />
            <Field label={t('hintSi')} value={q.hint_si} onChange={(v) => updateQ(qi, 'hint_si', v)} />
          </div>

          <p className="font-semibold">{t('correctAnswer')}: ● {t('addOption')}</p>
          <div className="space-y-2">
            {q.options.map((o, oi) => (
              <div key={oi} className="grid items-end gap-2 rounded-xl bg-white/50 p-2 sm:grid-cols-[auto_1fr_1fr_1fr_auto]">
                <label className="flex items-center gap-1 pb-2" title={t('correctAnswer')}>
                  <input
                    type="radio"
                    name={`correct-${qi}`}
                    checked={!!o.correct}
                    onChange={() => setCorrect(qi, oi)}
                    className="h-5 w-5"
                  />
                  <span aria-hidden="true">✅</span>
                </label>
                <Field label={t('optionEn')} value={o.label_en} onChange={(v) => updateOpt(qi, oi, 'label_en', v)} />
                <Field label={t('optionSi')} value={o.label_si} onChange={(v) => updateOpt(qi, oi, 'label_si', v)} />
                <div className="flex items-end gap-2">
                  <Field label={t('emoji')} value={o.emoji} onChange={(v) => updateOpt(qi, oi, 'emoji', v)} />
                  {o.emoji && <Picture emoji={o.emoji} size={36} />}
                </div>
                <button onClick={() => removeOpt(qi, oi)} className="rounded-full bg-pastel-pink px-3 py-2 font-semibold">✕</button>
              </div>
            ))}
          </div>
          <button onClick={() => addOpt(qi)} className="btn-soft w-full">➕ {t('addOption')}</button>
        </div>
      ))}
      <button onClick={addQ} className="btn-primary w-full">➕ {t('addQuestion')}</button>
    </div>
  );
}

// ---- numbers (counting / addition) editor ----
function NumbersEditor({ draft, setDraft, t }) {
  const questions = draft.content.questions || [];

  const setQ = (qi, mutate) =>
    setDraft((d) => ({
      ...d,
      content: { ...d.content, questions: d.content.questions.map((q, i) => (i === qi ? mutate(q) : q)) },
    }));
  const addQ = () => setDraft((d) => ({ ...d, content: { ...d.content, questions: [...d.content.questions, blankNumberQ()] } }));
  const removeQ = (qi) => setDraft((d) => ({ ...d, content: { ...d.content, questions: d.content.questions.filter((_, i) => i !== qi) } }));

  return (
    <div className="space-y-4">
      {questions.map((q, qi) => (
        <div key={qi} className="card space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">{t('question')} {qi + 1}</h3>
            <button onClick={() => removeQ(qi)} className="rounded-full bg-pastel-pink px-3 py-1 font-semibold">🗑️</button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t('promptEn')} value={q.prompt_en} onChange={(v) => setQ(qi, (x) => ({ ...x, prompt_en: v }))} />
            <Field label={t('promptSi')} value={q.prompt_si} onChange={(v) => setQ(qi, (x) => ({ ...x, prompt_si: v }))} />
          </div>

          {/* Object groups */}
          <div className="space-y-2">
            {(q.groups || []).map((g, gi) => (
              <div key={gi} className="grid items-end gap-2 rounded-xl bg-white/50 p-2 sm:grid-cols-[1fr_1fr_auto_auto]">
                <Field label={t('emoji')} value={g.emoji} onChange={(v) => setQ(qi, (x) => ({ ...x, groups: x.groups.map((gg, j) => (j === gi ? { ...gg, emoji: v } : gg)) }))} />
                <Field label={t('count')} type="number" min="1" value={g.count} onChange={(v) => setQ(qi, (x) => ({ ...x, groups: x.groups.map((gg, j) => (j === gi ? { ...gg, count: Number(v) || 1 } : gg)) }))} />
                {g.emoji && <Picture emoji={g.emoji} size={40} />}
                <button onClick={() => setQ(qi, (x) => ({ ...x, groups: x.groups.filter((_, j) => j !== gi) }))} className="rounded-full bg-pastel-pink px-3 py-2 font-semibold">✕</button>
              </div>
            ))}
            <button onClick={() => setQ(qi, (x) => ({ ...x, groups: [...x.groups, blankGroup()] }))} className="btn-soft w-full">➕ {t('addGroup')}</button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Field label={t('operator')} value={q.operator} onChange={(v) => setQ(qi, (x) => ({ ...x, operator: v || '+' }))} />
            <Field label={t('answer')} type="number" value={q.answer} onChange={(v) => setQ(qi, (x) => ({ ...x, answer: Number(v) || 0 }))} />
            <Field
              label={t('numberOptions')}
              value={(q.options || []).join(', ')}
              onChange={(v) =>
                setQ(qi, (x) => ({ ...x, options: v.split(',').map((s) => Number(s.trim())).filter((n) => !Number.isNaN(n)) }))
              }
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={t('hintEn')} value={q.hint_en} onChange={(v) => setQ(qi, (x) => ({ ...x, hint_en: v }))} />
            <Field label={t('hintSi')} value={q.hint_si} onChange={(v) => setQ(qi, (x) => ({ ...x, hint_si: v }))} />
          </div>
        </div>
      ))}
      <button onClick={addQ} className="btn-primary w-full">➕ {t('addQuestion')}</button>
    </div>
  );
}

// ---- spelling words editor ----
function SpellingEditor({ draft, setDraft, t }) {
  const items = draft.content.items || [];
  const update = (i, key, val) =>
    setDraft((d) => ({
      ...d,
      content: { ...d.content, items: d.content.items.map((it, idx) => (idx === i ? { ...it, [key]: val } : it)) },
    }));
  const add = () => setDraft((d) => ({ ...d, content: { ...d.content, items: [...d.content.items, blankSpellItem()] } }));
  const remove = (i) => setDraft((d) => ({ ...d, content: { ...d.content, items: d.content.items.filter((_, idx) => idx !== i) } }));

  return (
    <div className="card space-y-3">
      {items.map((it, i) => (
        <div key={i} className="grid items-end gap-2 rounded-xl bg-white/50 p-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
          <Field label={t('spellingWord')} value={it.word_en} onChange={(v) => update(i, 'word_en', v)} />
          <Field label={t('wordSi')} value={it.word_si} onChange={(v) => update(i, 'word_si', v)} />
          <div className="flex items-end gap-2">
            <Field label={t('emoji')} value={it.emoji} onChange={(v) => update(i, 'emoji', v)} />
            {it.emoji && <Picture emoji={it.emoji} size={40} />}
          </div>
          <button onClick={() => remove(i)} className="rounded-full bg-pastel-pink px-3 py-2 font-semibold">✕</button>
        </div>
      ))}
      <button onClick={add} className="btn-soft w-full">➕ {t('addItem')}</button>
    </div>
  );
}
