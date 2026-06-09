import { useMemo, useRef, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import MathResult from '../../components/math/MathResult.jsx';

const TOTAL = 6;
const shuffle = (a) => a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map((p) => p[1]);

const SHAPES = [
  { id: 'circle', en: 'Circle', si: 'වෘත්තය' },
  { id: 'square', en: 'Square', si: 'චතුරස්‍රය' },
  { id: 'triangle', en: 'Triangle', si: 'ත්‍රිකෝණය' },
  { id: 'rectangle', en: 'Rectangle', si: 'සෘජුකෝණාස්‍රය' },
  { id: 'pentagon', en: 'Pentagon', si: 'පංචාස්‍රය' },
];

function ShapeSvg({ id }) {
  const fill = '#a78bfa';
  const stroke = '#4c1d95';
  const common = { fill, stroke, strokeWidth: 4 };
  return (
    <svg viewBox="0 0 120 120" className="mx-auto h-40 w-40">
      {id === 'circle' && <circle cx="60" cy="60" r="50" {...common} />}
      {id === 'square' && <rect x="15" y="15" width="90" height="90" {...common} />}
      {id === 'rectangle' && <rect x="10" y="35" width="100" height="50" {...common} />}
      {id === 'triangle' && <polygon points="60,12 108,104 12,104" {...common} />}
      {id === 'pentagon' && <polygon points="60,10 108,46 90,104 30,104 12,46" {...common} />}
    </svg>
  );
}

export default function Shapes({ onHome, activityId, level = 1, onFinish }) {
  const { lang } = useLanguage();
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [done, setDone] = useState(false);
  const startRef = useRef(Date.now());

  const q = useMemo(() => {
    // More shapes in the pool = harder to tell apart.
    const pool = SHAPES.slice(0, level >= 3 ? SHAPES.length : level === 2 ? 4 : 3);
    const target = pool[Math.floor(Math.random() * pool.length)];
    const opts = new Set([target.id]);
    while (opts.size < 3) opts.add(pool[Math.floor(Math.random() * pool.length)].id);
    const options = shuffle([...opts]).map((id) => SHAPES.find((s) => s.id === id));
    return { target, options };
  }, [round, level]);

  function pick(id) {
    if (feedback) return;
    const ok = id === q.target.id;
    setFeedback(ok ? id : `wrong:${id}`);
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
    return <MathResult activity={activityId} level={level} score={Math.round((correct / TOTAL) * 100)} correct={correct} total={TOTAL} timeSpentSeconds={Math.round((Date.now() - startRef.current) / 1000)} onAgain={restart} onHome={onHome} onSaved={onFinish} />;
  }

  return (
    <div className="space-y-6 text-center">
      <p className="text-xl font-semibold">{lang === 'si' ? 'මෙය කුමන හැඩයද?' : 'What shape is this?'}</p>
      <div className="rounded-2xl bg-white p-6 shadow">
        <ShapeSvg id={q.target.id} />
      </div>
      <div className="mx-auto grid max-w-md grid-cols-1 gap-3 sm:grid-cols-3">
        {q.options.map((opt) => {
          const isWrong = feedback === `wrong:${opt.id}`;
          const isRight = feedback && opt.id === q.target.id;
          return (
            <button
              key={opt.id}
              onClick={() => pick(opt.id)}
              className={`rounded-2xl py-5 text-xl font-bold shadow transition active:scale-95 ${
                isRight ? 'bg-emerald-300' : isWrong ? 'bg-rose-300' : 'bg-white hover:bg-violet-50'
              }`}
            >
              {lang === 'si' ? opt.si : opt.en}
            </button>
          );
        })}
      </div>
      <p className="text-slate-400">{round + 1} / {TOTAL}</p>
    </div>
  );
}
