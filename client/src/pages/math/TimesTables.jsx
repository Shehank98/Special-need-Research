import { useMemo, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useTTS } from '../../hooks/useTTS.js';
import MathResult from '../../components/math/MathResult.jsx';

const TABLES = [2, 3, 4, 5, 6, 8, 10];
const TOTAL = 8;
const shuffle = (a) => a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map((p) => p[1]);

export default function TimesTables({ onHome }) {
  const { lang } = useLanguage();
  const { speak } = useTTS();
  const [table, setTable] = useState(null); // null = pick screen; 'mixed' or a number
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [done, setDone] = useState(false);

  const q = useMemo(() => {
    if (table == null) return null;
    const base = table === 'mixed' ? TABLES[Math.floor(Math.random() * TABLES.length)] : table;
    const other = 1 + Math.floor(Math.random() * 10);
    const ans = base * other;
    const opts = new Set([ans]);
    while (opts.size < 3) {
      const delta = [base, -base, 1, -1, other][Math.floor(Math.random() * 5)] || 1;
      const cand = ans + delta;
      if (cand > 0) opts.add(cand);
    }
    return { base, other, ans, options: shuffle([...opts]) };
  }, [table, round]);

  function pick(v) {
    if (feedback) return;
    const ok = v === q.ans;
    setFeedback(ok ? v : `wrong:${v}`);
    if (ok) {
      setCorrect((c) => c + 1);
      speak(lang === 'si' ? 'හරි' : 'Correct', lang, { log: false });
    }
    setTimeout(() => {
      setFeedback(null);
      if (round + 1 >= TOTAL) setDone(true);
      else setRound((r) => r + 1);
    }, 800);
  }

  function restart() {
    setTable(null); setRound(0); setCorrect(0); setDone(false); setFeedback(null);
  }

  if (table == null) {
    return (
      <div className="space-y-5 text-center">
        <p className="text-xl font-semibold">{lang === 'si' ? 'ගුණන වගුව තෝරන්න' : 'Choose a times table'}</p>
        <div className="mx-auto grid max-w-md grid-cols-4 gap-3">
          {TABLES.map((n) => (
            <button key={n} onClick={() => setTable(n)} className="rounded-2xl bg-emerald-100 py-5 text-2xl font-bold text-emerald-800 shadow hover:brightness-95 active:scale-95">
              ×{n}
            </button>
          ))}
          <button onClick={() => setTable('mixed')} className="col-span-4 rounded-2xl bg-emerald-500 py-4 text-xl font-bold text-white shadow active:scale-95">
            🎲 {lang === 'si' ? 'මිශ්‍ර' : 'Mixed'}
          </button>
        </div>
      </div>
    );
  }

  if (done) {
    return <MathResult score={Math.round((correct / TOTAL) * 100)} correct={correct} total={TOTAL} onAgain={restart} onHome={onHome} />;
  }

  return (
    <div className="space-y-6 text-center">
      <div className="rounded-2xl bg-emerald-50 p-6">
        <p className="text-5xl font-bold">{q.base} × {q.other} = ?</p>
      </div>
      <div className="mx-auto grid max-w-md grid-cols-3 gap-3">
        {q.options.map((opt) => {
          const isWrong = feedback === `wrong:${opt}`;
          const isRight = feedback === opt || (feedback && opt === q.ans);
          return (
            <button
              key={opt}
              onClick={() => pick(opt)}
              className={`rounded-2xl py-8 text-4xl font-bold shadow transition active:scale-95 ${
                isRight ? 'bg-emerald-300' : isWrong ? 'bg-rose-300' : 'bg-white hover:bg-emerald-50'
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
