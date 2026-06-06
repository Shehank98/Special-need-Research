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

export default function Quiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const exp = experienceFor(user);
  const { speak } = useTTS();

  const [lesson, setLesson] = useState(null);
  const [step, setStep] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'
  const [done, setDone] = useState(false);
  const [result, setResult] = useState(null);
  const startRef = useRef(Date.now());

  useEffect(() => {
    api.lesson(id).then(setLesson).catch(() => {});
    startRef.current = Date.now();
  }, [id]);

  if (!lesson) return <Layout><p className="text-center text-xl">{t('loading')}</p></Layout>;

  const content = lesson.content || {};
  const questions = content.questions || [];
  const q = questions[step];
  const prompt = q ? (lang === 'si' ? q.prompt_si : q.prompt_en) : '';
  const hint = q ? (lang === 'si' ? q.hint_si : q.hint_en) : '';
  const instructions = lang === 'si' ? content.instructions_si : content.instructions_en;

  async function finish(finalCorrect, finalHints) {
    // Hints reduce score slightly: -5 each, floor 0.
    const base = Math.round((finalCorrect / questions.length) * 100);
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
    // Silent engagement logging (same for both groups).
    api.logEvent({ event_type: 'lesson_completed', activity_type: lesson.category, metric_name: 'score', metric_value: score }).catch(() => {});
    api.logEvent({ event_type: 'time_on_task', activity_type: lesson.category, metric_name: 'time_on_task', metric_value: timeSpent }).catch(() => {});
    setDone(true);
  }

  function answer(option) {
    if (feedback) return;
    api
      .logEvent({
        event_type: 'quiz_answered',
        activity_type: lesson.category,
        metric_name: 'attempt',
        metric_value: option.correct ? 1 : 0,
        metadata: { lesson_id: id, correct: !!option.correct, step },
      })
      .catch(() => {});

    const advance = (newCorrect) => {
      setShowHint(false);
      if (step < questions.length - 1) setStep((s) => s + 1);
      else finish(newCorrect, hintsUsed);
    };

    // Control group: no instant feedback — record and move on (no retry loop).
    if (!exp.instantFeedback) {
      const newCorrect = option.correct ? correctCount + 1 : correctCount;
      if (option.correct) setCorrectCount(newCorrect);
      advance(newCorrect);
      return;
    }

    if (option.correct) {
      setFeedback('correct');
      speak(t('greatJob'), lang, { log: false });
      const newCorrect = correctCount + 1;
      setCorrectCount(newCorrect);
      setTimeout(() => {
        setFeedback(null);
        advance(newCorrect);
      }, 900);
    } else {
      setFeedback('wrong');
      speak(t('tryAgain'), lang, { log: false });
      setTimeout(() => setFeedback(null), 900);
    }
  }

  function useHint() {
    if (showHint) return;
    setShowHint(true);
    setHintsUsed((h) => h + 1);
    api.logEvent({ event_type: 'hint_used', metadata: { lesson_id: id, step } }).catch(() => {});
    if (hint) speak(hint, lang);
  }

  if (done) {
    const newBadges = exp.gamified ? result?.new_badges || [] : [];
    return (
      <Layout>
        {exp.gamified && <Confetti show />}
        <div className="card animate-pop-in space-y-5 text-center">
          <div className="text-6xl" aria-hidden="true">{exp.gamified ? '🎉' : '✅'}</div>
          <h1 className="text-3xl font-bold">{t('lessonComplete')}</h1>
          <p className="text-2xl">
            {t('yourScore')}: <strong>{result?.score ?? 0}</strong>
          </p>
          {newBadges.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3">
              {newBadges.map((b) => (
                <BadgeCard key={b.id} badge={{ ...b }} />
              ))}
            </div>
          )}
          <button onClick={() => navigate('/home')} className="btn-primary w-full text-xl">
            🏠 {t('backToHome')}
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-5">
        <h1 className="text-2xl font-bold">{lang === 'si' ? lesson.title_si : lesson.title_en}</h1>
        {instructions && (
          <div className="card flex items-center justify-between gap-3">
            <p>{instructions}</p>
            <SpeakButton text={instructions} lang={lang} />
          </div>
        )}
        <ProgressBar value={step + 1} max={questions.length} />

        <div className="card space-y-4 text-center">
          <div className="flex items-center justify-center gap-3">
            <p className="text-3xl font-bold">{prompt}</p>
            <SpeakButton text={prompt} lang={lang} />
          </div>

          {feedback && (
            <p
              className={`mx-auto w-fit rounded-full px-5 py-2 text-xl font-bold ${
                feedback === 'correct' ? 'bg-pastel-green' : 'bg-pastel-pink'
              }`}
            >
              {feedback === 'correct' ? `✅ ${t('correct')}` : `🔄 ${t('tryAgain')}`}
            </p>
          )}

          {/* Picture answers */}
          <div className="grid grid-cols-3 gap-4">
            {(q.options || []).map((opt, i) => (
              <button
                key={i}
                onClick={() => answer(opt)}
                className="btn h-auto flex-col gap-2 bg-white/70 py-5"
                aria-label={lang === 'si' ? opt.label_si : opt.label_en}
              >
                <Picture emoji={opt.emoji} imageUrl={opt.image_url} alt={lang === 'si' ? opt.label_si : opt.label_en} size={80} />
                <span className="text-base font-semibold">
                  {lang === 'si' ? opt.label_si : opt.label_en}
                </span>
              </button>
            ))}
          </div>

          {showHint && hint && (
            <p className="rounded-2xl bg-pastel-yellow px-4 py-3 text-lg">💡 {hint}</p>
          )}
        </div>

        <button onClick={useHint} disabled={showHint} className="btn-soft w-full">
          💡 {t('hint')}
        </button>
      </div>
    </Layout>
  );
}
