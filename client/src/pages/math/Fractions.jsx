import { useMemo, useRef, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import MathResult from '../../components/math/MathResult.jsx';

const TOTAL = 6;
const shuffle = (a) => a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map((p) => p[1]);

// A horizontal bar split into `parts`, with `shaded` parts coloured.
function FractionBar({ parts, shaded }) {
  const w = 300;
  const seg = w / parts;
  return (
    <svg viewBox={`0 0 ${w} 70`} className="mx-auto h-20 w-full max-w-sm">
      {Array.from({ length: parts }).map((_, i) => (
        <rect
          key={i}
          x={i * seg}
          y={5}
          width={seg}
          height={60}
          fill={i < shaded ? '#38bdf8' : '#f1f5f9'}
          stroke="#0f172a"
          strokeWidth="2"
        />
      ))}
    </svg>
  );
}

export default function Fractions({ onHome, activityId, level = 1, onFinish, onNextLevel }) {
  const { lang } = useLanguage();
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [done, setDone] = useState(false);
  const startRef = useRef(Date.now());

  const q = useMemo(() => {
    const POOL = level >= 3 ? [2, 3, 4, 5, 6, 8] : level === 2 ? [2, 3, 4, 5, 6] : [2, 3, 4];
    const parts = POOL[Math.floor(Math.random() * POOL.length)];
    const shaded = 1 + Math.floor(Math.random() * (parts - 1));
    const ans = `${shaded}/${parts}`;
    const opts = new Set([ans]);
    while (opts.size < 3) {
      const p = POOL[Math.floor(Math.random() * POOL.length)];
      const s = 1 + Math.floor(Math.random() * (p - 1));
      opts.add(`${s}/${p}`);
    }
    return { parts, shaded, ans, options: shuffle([...opts]) };
  }, [round, level]);

  function pick(v) {
    if (feedback) return;
    const ok = v === q.ans;
    setFeedback(ok ? v : `wrong:${v}`);
    if (ok) setCorrect((c) => c + 1);
    setTimeout(() => {
      setFeedback(null);
      if (round + 1 >= TOTAL) setDone(true);
      else setRound((r) => r + 1);
    }, 900);
  }
  function restart() {
    setRound(0); setCorrect(0); setDone(false); setFeedback(null);
    startRef.current = Date.now();
  }

  if (done) {
    return <MathResult activity={activityId} level={level} score={Math.round((correct / TOTAL) * 100)} correct={correct} total={TOTAL} timeSpentSeconds={Math.round((Date.now() - startRef.current) / 1000)} onAgain={restart} onHome={onHome} onNext={onNextLevel} onSaved={onFinish} />;
  }

  return (
    <div className="space-y-6 text-center">
      <p className="text-xl font-semibold">{lang === 'si' ? 'වර්ණ ගැන්වූ භාගය කුමක්ද?' : 'What fraction is shaded?'}</p>
      <div className="rounded-2xl bg-white p-6 shadow">
        <FractionBar parts={q.parts} shaded={q.shaded} />
      </div>
      <div className="mx-auto grid max-w-md grid-cols-3 gap-3">
        {q.options.map((opt) => {
          const isWrong = feedback === `wrong:${opt}`;
          const isRight = feedback && opt === q.ans;
          return (
            <button
              key={opt}
              onClick={() => pick(opt)}
              className={`rounded-2xl py-6 text-3xl font-bold shadow transition active:scale-95 ${
                isRight ? 'bg-emerald-300' : isWrong ? 'bg-rose-300' : 'bg-white hover:bg-sky-50'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      <p className="text-slate-400">{round + 1} / {TOTAL}</p>
    </div>
  );
}
