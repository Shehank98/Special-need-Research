import { useMemo, useRef, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useTTS } from '../../hooks/useTTS.js';
import MathResult from '../../components/math/MathResult.jsx';

const PLACES = [
  { key: 'thousands', en: 'thousands', si: 'දහස්' },
  { key: 'hundreds', en: 'hundreds', si: 'සිය' },
  { key: 'tens', en: 'tens', si: 'දස' },
  { key: 'ones', en: 'ones', si: 'එක' },
];
const TOTAL = 6;
const randNum = () => 1000 + Math.floor(Math.random() * 9000); // 1000–9999

// Tap the digit that sits in the named place value.
export default function PlaceValue({ onHome, activityId, level = 1, onFinish }) {
  const { lang } = useLanguage();
  const { speak } = useTTS();
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [done, setDone] = useState(false);
  const startRef = useRef(Date.now());

  const q = useMemo(() => {
    const n = randNum();
    const placeIdx = Math.floor(Math.random() * 4);
    return { n, digits: String(n).split(''), placeIdx };
  }, [round]); // eslint-disable-line react-hooks/exhaustive-deps

  const place = PLACES[q.placeIdx];

  function pick(i) {
    if (feedback) return;
    const ok = i === q.placeIdx;
    setFeedback(ok ? 'correct' : 'wrong');
    if (ok) {
      setCorrect((c) => c + 1);
      speak(lang === 'si' ? 'නිවැරදියි' : 'Correct', lang, { log: false });
    }
    setTimeout(() => {
      setFeedback(null);
      if (round + 1 >= TOTAL) setDone(true);
      else setRound((r) => r + 1);
    }, 900);
  }

  function restart() {
    setRound(0);
    setCorrect(0);
    setDone(false);
    setFeedback(null);
    startRef.current = Date.now();
  }

  if (done) {
    return (
      <MathResult
        activity={activityId}
        level={level}
        score={Math.round((correct / TOTAL) * 100)}
        correct={correct}
        total={TOTAL}
        timeSpentSeconds={Math.round((Date.now() - startRef.current) / 1000)}
        onAgain={restart}
        onHome={onHome}
        onSaved={onFinish}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-sky-50 p-4 text-center">
        <p className="text-xl font-semibold">
          {lang === 'si'
            ? `${place.si} ස්ථානයේ ඉලක්කම තට්ටු කරන්න`
            : `Tap the digit in the ${place.en} place`}
        </p>
      </div>

      <div className="flex justify-center gap-3">
        {q.digits.map((d, i) => (
          <button
            key={i}
            onClick={() => pick(i)}
            className={`flex h-24 w-20 items-center justify-center rounded-2xl text-5xl font-bold shadow transition active:scale-95 ${
              feedback && i === q.placeIdx
                ? 'bg-emerald-200'
                : 'bg-white hover:bg-sky-50'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* place labels help at Level 1; removed at higher levels for challenge */}
      {level === 1 && (
        <div className="flex justify-center gap-3 text-center text-xs text-slate-400">
          {PLACES.map((p) => (
            <span key={p.key} className="w-20">{lang === 'si' ? p.si : p.en}</span>
          ))}
        </div>
      )}

      {feedback && (
        <p className={`mx-auto w-fit rounded-full px-5 py-2 text-lg font-bold ${feedback === 'correct' ? 'bg-emerald-200' : 'bg-rose-200'}`}>
          {feedback === 'correct' ? (lang === 'si' ? '✅ නිවැරදියි' : '✅ Correct') : (lang === 'si' ? '🔄 නැවත' : '🔄 Try again')}
        </p>
      )}

      <p className="text-center text-slate-400">{round + 1} / {TOTAL}</p>
    </div>
  );
}
