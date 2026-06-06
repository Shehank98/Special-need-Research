import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { experienceFor } from '../lib/experience.js';
import { useTTS } from '../hooks/useTTS.js';
import Layout from '../components/Layout.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import SpeakButton from '../components/SpeakButton.jsx';
import Confetti from '../components/Confetti.jsx';
import Picture from '../components/Picture.jsx';
import TracingCanvas from '../components/TracingCanvas.jsx';

// A short set of words to trace/write. Kept simple and concrete.
const WORDS = [
  { word: 'cat', si: 'පූසා', emoji: '🐱' },
  { word: 'sun', si: 'හිරු', emoji: '☀️' },
  { word: 'dog', si: 'බල්ලා', emoji: '🐶' },
];

export default function WritingActivity() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const exp = experienceFor(user);
  const { speak } = useTTS();

  const [index, setIndex] = useState(0);
  const [guideLevel, setGuideLevel] = useState(1);
  const [done, setDone] = useState(false);
  const startRef = useRef(Date.now());

  // Intervention: fetch the faded guide level (rises as the child improves).
  useEffect(() => {
    startRef.current = Date.now();
    if (exp.tracing) {
      api.guideLevel(user.id).then((r) => setGuideLevel(r.guide_level || 1)).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const item = WORDS[index];

  async function handleComplete({ accuracy_pct, time_ms, retries }) {
    if (exp.tracing) {
      // Intervention only: rich tracing record (accuracy, guide level, retries).
      api
        .logTracing({
          target_word: item.word,
          accuracy_pct: accuracy_pct ?? 0,
          completed: true,
          time_ms,
          retries,
          guide_level: guideLevel,
        })
        .catch(() => {});
    } else {
      // Control: plain writing — log a generic completion (no tracing_attempts).
      api
        .logEvent({ event_type: 'completion', activity_type: 'writing', metric_name: 'writing_done', metric_value: 1, metadata: { word: item.word } })
        .catch(() => {});
    }
    api.logEvent({ event_type: 'time_on_task', activity_type: 'writing', metric_name: 'time_on_task', metric_value: Math.round(time_ms / 1000) }).catch(() => {});

    if (index < WORDS.length - 1) {
      setIndex((i) => i + 1);
    } else {
      // Save a writing "lesson" completion for engagement scoring parity.
      setDone(true);
    }
  }

  if (done) {
    return (
      <Layout>
        {exp.gamified && <Confetti show />}
        <div className="card animate-pop-in space-y-5 text-center">
          <div className="text-6xl" aria-hidden="true">{exp.gamified ? '🎉' : '✅'}</div>
          <h1 className="text-3xl font-bold">{t('lessonComplete')}</h1>
          <button onClick={() => navigate('/home')} className="btn-primary w-full text-xl">🏠 {t('backToHome')}</button>
        </div>
      </Layout>
    );
  }

  const support = lang === 'si' ? item.si : item.word;

  return (
    <Layout>
      <div className="space-y-5">
        <h1 className="text-2xl font-bold">✍️ {exp.tracing ? t('traceTitle') : t('writeTitle')}</h1>
        <div className="card flex items-center justify-between gap-3">
          <p>{exp.tracing ? t('traceHelp') : t('writeHelp')}</p>
          <SpeakButton text={exp.tracing ? t('traceHelp') : t('writeHelp')} lang={lang} />
        </div>
        <ProgressBar value={index + 1} max={WORDS.length} color="bg-amber-400" />

        <div className="card flex flex-col items-center gap-3 text-center">
          <Picture emoji={item.emoji} alt={support} size={90} />
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{support}</span>
            <SpeakButton text={item.word} lang="en" />
          </div>
          {exp.tracing && (
            <p className="text-sm text-ink/60">{t('guideLevel')}: {guideLevel}</p>
          )}
          <TracingCanvas
            key={`${item.word}-${guideLevel}`}
            word={item.word}
            guided={exp.tracing}
            guideLevel={guideLevel}
            onComplete={handleComplete}
          />
        </div>
      </div>
    </Layout>
  );
}
