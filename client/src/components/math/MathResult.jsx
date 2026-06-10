import { useEffect, useRef } from 'react';
import { api } from '../../api.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { PASS_SCORE, starsFor } from '../../lib/mathLevels.js';
import Confetti from '../Confetti.jsx';

// End-of-activity screen. Shows "Level N complete!" with a clear next step:
// pass (>=70%) -> Next Level (or Mastered at L3); fail -> Try again.
// Persists the result once (progress + events) when given an `activity`.
export default function MathResult({ activity, level = 1, score, correct, total, timeSpentSeconds = 0, onAgain, onHome, onNext, onSaved }) {
  const { t, lang } = useLanguage();
  const passed = score >= PASS_SCORE;
  const stars = starsFor(score);
  const hasNext = !!onNext && level < 3;
  const sent = useRef(false);

  useEffect(() => {
    if (activity && !sent.current) {
      sent.current = true;
      api
        .mathResult({ activity, level, score, correct, total, time_spent_seconds: timeSpentSeconds })
        .then(() => onSaved && onSaved())
        .catch(() => {});
    }
  }, [activity, level, score, correct, total, timeSpentSeconds, onSaved]);

  const heading = !passed
    ? (lang === 'si' ? 'තව ටිකක් උත්සාහ කරමු!' : 'Almost there!')
    : level >= 3
      ? (lang === 'si' ? 'මාතෘකාව ජය ගත්තා!' : 'Topic mastered!')
      : (lang === 'si' ? `මට්ටම ${level} සම්පූර්ණයි!` : `Level ${level} complete!`);

  return (
    <div className="relative mx-auto max-w-md space-y-5 rounded-3xl bg-white p-8 text-center shadow-lg">
      {passed && <Confetti show />}
      <div className="animate-bounce-in text-3xl" aria-hidden="true">
        {passed && level >= 3 ? '🏆' : '⭐'.repeat(stars) + '☆'.repeat(3 - stars)}
      </div>
      <h2 className="text-3xl font-bold">{heading}</h2>
      <p className="text-xl">
        {lang === 'si' ? 'ලකුණු' : 'Score'}: <strong>{score}</strong>
        <span className="ml-2 text-base text-slate-400">({correct}/{total})</span>
      </p>

      {!passed && (
        <p className="rounded-xl bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
          {lang === 'si' ? `ඊළඟ මට්ටමට යාමට ${PASS_SCORE}% අවශ්‍යයි` : `Score ${PASS_SCORE}% to unlock the next level`}
        </p>
      )}

      <div className="space-y-2">
        {passed && hasNext && (
          <button onClick={onNext} className="btn-primary w-full animate-wiggle text-xl">
            {lang === 'si' ? `ඊළඟ: මට්ටම ${level + 1}` : `Next: Level ${level + 1}`} ▶️
          </button>
        )}
        <div className="flex gap-3">
          <button onClick={onAgain} className="btn-soft flex-1">🔄 {lang === 'si' ? 'නැවත' : 'Play again'}</button>
          <button onClick={onHome} className={`flex-1 ${passed && hasNext ? 'btn-soft' : 'btn-primary'}`}>
            🗺️ {lang === 'si' ? 'සිතියම' : 'Map'}
          </button>
        </div>
      </div>
    </div>
  );
}
