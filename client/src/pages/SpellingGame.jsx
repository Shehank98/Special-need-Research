import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { experienceFor } from '../lib/experience.js';
import { useTTS } from '../hooks/useTTS.js';
import Layout from '../components/Layout.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import SpeakButton from '../components/SpeakButton.jsx';
import Confetti from '../components/Confetti.jsx';
import BadgeCard from '../components/BadgeCard.jsx';
import Picture from '../components/Picture.jsx';

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Dysorthographia game: tap scrambled letter tiles in order to spell the word.
export default function SpellingGame() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const exp = experienceFor(user);
  const { speak } = useTTS();

  const [lesson, setLesson] = useState(null);
  const [index, setIndex] = useState(0);
  const [tiles, setTiles] = useState([]); // {id, char, used}
  const [built, setBuilt] = useState([]); // {char, tileId}
  const [solved, setSolved] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState(null);
  const startRef = useRef(Date.now());

  useEffect(() => {
    api.lesson(id).then(setLesson).catch(() => {});
    startRef.current = Date.now();
  }, [id]);

  const items = lesson?.content?.items || [];
  const item = items[index];
  const word = (item?.word_en || '').toLowerCase();

  // Build fresh scrambled tiles whenever the word changes.
  useEffect(() => {
    if (!word) return;
    const letters = word.split('').map((ch, i) => ({ id: `${i}-${ch}`, char: ch, used: false }));
    setTiles(shuffle(letters));
    setBuilt([]);
    setFeedback(null);
  }, [word]);

  if (!lesson) return <Layout><p className="text-center text-xl">{t('loading')}</p></Layout>;

  const content = lesson.content || {};
  const instructions = lang === 'si' ? content.instructions_si : content.instructions_en;
  const supportWord = lang === 'si' ? item?.word_si : item?.word_en;

  async function finish(finalSolved, finalHints) {
    const base = Math.round((finalSolved / items.length) * 100);
    const score = Math.max(0, base - finalHints * 5);
    const timeSpent = Math.round((Date.now() - startRef.current) / 1000);
    try {
      const res = await api.saveProgress({
        lesson_id: id,
        score,
        time_spent_seconds: timeSpent,
        completed: true,
        used_hint: finalHints > 0,
      });
      setResult({ ...res, score });
    } catch {
      setResult({ progress: { score }, new_badges: [], score });
    }
    api.logEvent({ event_type: 'lesson_completed', activity_type: lesson.category, metric_name: 'score', metric_value: score }).catch(() => {});
    api.logEvent({ event_type: 'time_on_task', activity_type: lesson.category, metric_name: 'time_on_task', metric_value: timeSpent }).catch(() => {});
    setDone(true);
  }

  function tapTile(tile) {
    if (tile.used || feedback) return;
    const nextBuilt = [...built, { char: tile.char, tileId: tile.id }];
    setBuilt(nextBuilt);
    setTiles((ts) => ts.map((x) => (x.id === tile.id ? { ...x, used: true } : x)));

    if (nextBuilt.length === word.length) {
      const attempt = nextBuilt.map((b) => b.char).join('');
      const correct = attempt === word;
      api.logEvent({ event_type: 'quiz_answered', activity_type: lesson.category, metric_name: 'attempt', metric_value: correct ? 1 : 0, metadata: { lesson_id: id, word, correct } }).catch(() => {});
      if (correct) {
        if (exp.instantFeedback) {
          setFeedback('correct');
          speak(item.word_en, 'en', { log: false });
        }
        const nextSolved = solved + 1;
        setSolved(nextSolved);
        setTimeout(() => {
          setFeedback(null);
          if (index < items.length - 1) setIndex((i) => i + 1);
          else finish(nextSolved, hintsUsed);
        }, exp.instantFeedback ? 1000 : 200);
      } else {
        if (exp.instantFeedback) {
          setFeedback('wrong');
          speak(t('tryAgain'), lang, { log: false });
        }
        setTimeout(() => {
          // reset the word for another try
          setBuilt([]);
          setTiles((ts) => ts.map((x) => ({ ...x, used: false })));
          setFeedback(null);
        }, exp.instantFeedback ? 900 : 200);
      }
    }
  }

  function backspace() {
    if (feedback || built.length === 0) return;
    const last = built[built.length - 1];
    setBuilt((b) => b.slice(0, -1));
    setTiles((ts) => ts.map((x) => (x.id === last.tileId ? { ...x, used: false } : x)));
  }

  function useHint() {
    // Speak the word and auto-place the next correct letter.
    setHintsUsed((h) => h + 1);
    api.logEvent({ event_type: 'hint_used', metadata: { lesson_id: id, word } }).catch(() => {});
    speak(item.word_en, 'en');
    const nextChar = word[built.length];
    if (!nextChar) return;
    const tile = tiles.find((x) => !x.used && x.char === nextChar);
    if (tile) tapTile(tile);
  }

  if (done) {
    const newBadges = exp.gamified ? result?.new_badges || [] : [];
    return (
      <Layout>
        {exp.gamified && <Confetti show />}
        <div className="card animate-pop-in space-y-5 text-center">
          <div className="text-6xl" aria-hidden="true">🎉</div>
          <h1 className="text-3xl font-bold">{t('lessonComplete')}</h1>
          <p className="text-2xl">{t('yourScore')}: <strong>{result?.score ?? 0}</strong></p>
          {newBadges.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3">
              {newBadges.map((b) => <BadgeCard key={b.id} badge={{ ...b }} />)}
            </div>
          )}
          <button onClick={() => navigate('/home')} className="btn-primary w-full text-xl">🏠 {t('backToHome')}</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-5">
        <h1 className="text-2xl font-bold">✏️ {lang === 'si' ? lesson.title_si : lesson.title_en}</h1>
        {instructions && (
          <div className="card flex items-center justify-between gap-3">
            <p>{instructions}</p>
            <SpeakButton text={instructions} lang={lang} />
          </div>
        )}
        <ProgressBar value={index + 1} max={items.length} color="bg-purple-400" />

        <div className="card flex flex-col items-center space-y-5 text-center">
          <Picture emoji={item?.emoji} alt={supportWord} size={120} />
          <div className="flex items-center gap-2">
            <span className="text-xl text-ink/70">{supportWord}</span>
            <SpeakButton text={item?.word_en} lang="en" />
          </div>

          {/* Letter slots */}
          <div className="flex flex-wrap justify-center gap-2">
            {Array.from({ length: word.length }).map((_, i) => (
              <div
                key={i}
                className={`flex h-14 w-12 items-center justify-center rounded-xl border-2 text-3xl font-bold uppercase ${
                  built[i] ? 'border-purple-400 bg-pastel-purple' : 'border-dashed border-ink/30 bg-white/50'
                }`}
              >
                {built[i]?.char || ''}
              </div>
            ))}
          </div>

          {feedback && (
            <p className={`w-fit rounded-full px-5 py-2 text-xl font-bold ${feedback === 'correct' ? 'bg-pastel-green' : 'bg-pastel-pink'}`}>
              {feedback === 'correct' ? `✅ ${t('correct')}` : `🔄 ${t('tryAgain')}`}
            </p>
          )}

          {/* Scrambled letter tiles */}
          <div className="flex flex-wrap justify-center gap-2">
            {tiles.map((tile) => (
              <button
                key={tile.id}
                onClick={() => tapTile(tile)}
                disabled={tile.used || !!feedback}
                className={`h-14 w-12 rounded-xl text-3xl font-bold uppercase shadow transition active:scale-95 ${
                  tile.used ? 'bg-white/30 text-ink/30' : 'bg-pastel-yellow'
                }`}
              >
                {tile.char}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={backspace} className="btn-soft flex-1">⬅️ {t('back')}</button>
          <button onClick={useHint} className="btn-soft flex-1">💡 {t('hint')}</button>
        </div>
      </div>
    </Layout>
  );
}
