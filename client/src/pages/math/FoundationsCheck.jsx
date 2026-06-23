import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useTTS } from '../../hooks/useTTS.js';
import { api } from '../../api.js';
import { GENERATORS } from '../../lib/mathGenerators.js';
import TeachVisual from '../../components/math/TeachVisual.jsx';
import Encouragement from '../../components/Encouragement.jsx';
import Confetti from '../../components/Confetti.jsx';
import {
  randomPraise,
  randomRetry,
  randomCelebrateEmoji,
  randomBuddyHappy,
  randomBuddyCheer,
} from '../../lib/encouragement.js';

// The skills the readiness check samples, in a gentle order. One question each.
const PROBE = ['count_objects', 'number_recognition', 'compare_quantity', 'number_words', 'number_order', 'symbols'];

// A short, friendly "number-sense readiness" pre-check for Dyscalculia learners.
// It samples the foundation skills, then RECOMMENDS where to start: the
// Foundations activities (if foundations are shaky) or the number modules (if
// they are solid). The score is persisted (activity 'foundations_check') so the
// teacher/researcher can see baseline readiness and track change over the study.
export default function FoundationsCheck({ onHome, onFinish }) {
  const { lang } = useLanguage();
  const { speak } = useTTS();
  const [step, setStep] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [cheer, setCheer] = useState(null);
  const [done, setDone] = useState(false);
  const startRef = useRef(Date.now());
  const stepStartRef = useRef(Date.now());

  const total = PROBE.length;
  const q = useMemo(() => GENERATORS[PROBE[step]](1), [step]);
  const prompt = lang === 'si' ? q.prompt_si : q.prompt_en;
  const label = (o) => (lang === 'si' && o.si ? o.si : o.text ?? o.en);

  useEffect(() => {
    stepStartRef.current = Date.now();
  }, [step]);

  function pick(o, i) {
    if (feedback) return;
    const ok = !!o.correct;
    api
      .logResponse({
        activity_type: 'foundations_check',
        question_index: step,
        correct: ok,
        response_time_ms: Date.now() - stepStartRef.current,
      })
      .catch(() => {});
    setFeedback(ok ? `ok:${i}` : `no:${i}`);
    if (ok) {
      setCorrect((c) => c + 1);
      const msg = randomPraise(lang);
      setCheer({ type: 'correct', message: msg, emoji: randomCelebrateEmoji(), buddy: randomBuddyHappy() });
      speak(msg, lang, { log: false });
    } else {
      const msg = randomRetry(lang);
      setCheer({ type: 'retry', message: msg, buddy: randomBuddyCheer() });
      speak(msg, lang, { log: false });
    }
    setTimeout(() => {
      setFeedback(null);
      setCheer(null);
      if (step + 1 >= total) setDone(true);
      else setStep((s) => s + 1);
    }, 1100);
  }

  if (done) {
    return (
      <FoundationsResult
        correct={correct}
        total={total}
        timeSpentSeconds={Math.round((Date.now() - startRef.current) / 1000)}
        onHome={onHome || (() => {})}
        onSaved={onFinish}
      />
    );
  }

  return (
    <div className="space-y-6 text-center">
      <p className="rounded-2xl bg-lime-50 px-4 py-2 text-sm font-semibold text-lime-700">
        🌱 {lang === 'si' ? 'සූදානම් පරීක්ෂාව — හරි වැරදි නැත, උත්සාහ කරන්න!' : 'Readiness check — no right or wrong, just try!'}
      </p>
      {cheer && <Encouragement show type={cheer.type} message={cheer.message} emoji={cheer.emoji} buddy={cheer.buddy} />}
      {q.visual && (
        <div className="flex min-h-[120px] items-center justify-center rounded-2xl bg-white p-4 shadow">
          <TeachVisual v={q.visual} />
        </div>
      )}
      <div className="rounded-2xl bg-sky-50 p-5">
        <p className="text-2xl font-bold">{prompt}</p>
      </div>
      <div className="mx-auto grid max-w-md grid-cols-3 gap-3">
        {q.options.map((o, i) => {
          const isOk = feedback === `ok:${i}` || (feedback && o.correct);
          const isNo = feedback === `no:${i}`;
          return (
            <button
              key={i}
              onClick={() => pick(o, i)}
              disabled={!!feedback}
              className={`rounded-2xl py-5 text-xl font-bold shadow transition active:scale-95 ${
                isOk
                  ? 'bg-emerald-300 ring-4 ring-emerald-400 animate-correct-pop'
                  : isNo
                    ? 'bg-rose-300 ring-4 ring-rose-400 animate-jiggle'
                    : 'bg-white hover:scale-105 hover:bg-sky-50'
              }`}
            >
              {label(o)}
            </button>
          );
        })}
      </div>
      <p className="text-slate-400">{step + 1} / {total}</p>
    </div>
  );
}

// Readiness result + a clear recommended next step. Persists the score once.
function FoundationsResult({ correct, total, timeSpentSeconds, onHome, onSaved }) {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const score = Math.round((correct / total) * 100);
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    api
      .mathResult({ activity: 'foundations_check', level: 1, score, correct, total, time_spent_seconds: timeSpentSeconds })
      .then(() => onSaved && onSaved())
      .catch(() => {});
  }, [score, correct, total, timeSpentSeconds, onSaved]);

  // Three readiness bands decide the recommendation.
  const band = score >= 80 ? 'ready' : score >= 50 ? 'building' : 'foundations';
  const COPY = {
    foundations: {
      emoji: '🌱',
      en: 'Let’s build strong number foundations first.',
      si: 'මුලින්ම ශක්තිමත් සංඛ්‍යා පදනමක් සාදා ගනිමු.',
      tip_en: 'Start with counting and finding numbers. Take your time — every step helps!',
      tip_si: 'ගණන් කිරීමෙන් සහ අංක සෙවීමෙන් පටන් ගන්න. හදිසි නැත — සෑම පියවරක්ම උපකාරී වේ!',
    },
    building: {
      emoji: '💪',
      en: 'Good start! A little more foundation practice will help.',
      si: 'හොඳ ආරම්භයක්! පදනම් අභ්‍යාස ටිකක් තවත් උපකාරී වේ.',
      tip_en: 'Practise comparing and ordering numbers, then try the Numbers module.',
      tip_si: 'සංඛ්‍යා සැසඳීම සහ පිළිවෙළට තැබීම පුරුදු වී, පසුව සංඛ්‍යා මොඩියුලය උත්සාහ කරන්න.',
    },
    ready: {
      emoji: '🎉',
      en: 'Great! You’re ready for the number activities.',
      si: 'සුපිරි! ඔබ සංඛ්‍යා ක්‍රියාකාරකම් සඳහා සූදානම්.',
      tip_en: 'You can still revisit Foundations any time you like.',
      tip_si: 'ඔබට ඕනෑම වේලාවක පදනම් වෙත නැවත යා හැක.',
    },
  };
  const c = COPY[band];

  return (
    <div className="relative mx-auto max-w-md space-y-5 rounded-3xl bg-white p-8 text-center shadow-lg">
      {band === 'ready' && <Confetti show />}
      <div className="animate-bounce-in text-5xl" aria-hidden="true">{c.emoji}</div>
      <h2 className="text-2xl font-bold">{lang === 'si' ? c.si : c.en}</h2>
      <p className="text-lg">
        {lang === 'si' ? 'ලකුණු' : 'Score'}: <strong>{score}</strong>
        <span className="ml-2 text-base text-slate-400">({correct}/{total})</span>
      </p>
      <p className="rounded-xl bg-lime-50 px-4 py-3 text-sm font-semibold text-lime-800">
        {lang === 'si' ? c.tip_si : c.tip_en}
      </p>

      <div className="space-y-2">
        {band !== 'ready' ? (
          <button onClick={() => navigate('/math/play/count_objects')} className="btn-primary w-full animate-wiggle text-lg">
            🌱 {lang === 'si' ? 'පදනමින් පටන් ගන්න' : 'Start with Foundations'} ▶️
          </button>
        ) : (
          <button onClick={() => navigate('/math/numbers')} className="btn-primary w-full animate-wiggle text-lg">
            🔢 {lang === 'si' ? 'සංඛ්‍යා වෙත යන්න' : 'Go to Numbers'} ▶️
          </button>
        )}
        <div className="flex gap-3">
          <button onClick={() => navigate('/math/foundations')} className="btn-soft flex-1">
            🌱 {lang === 'si' ? 'පදනම් මාවත' : 'Foundations map'}
          </button>
          <button onClick={onHome} className="btn-soft flex-1">
            🗺️ {lang === 'si' ? 'සියලු මොඩියුල' : 'All modules'}
          </button>
        </div>
      </div>
    </div>
  );
}
