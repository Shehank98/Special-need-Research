import { useMemo, useRef, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import MathResult from '../../components/math/MathResult.jsx';

const TOTAL = 5;
const DIVISORS = [2, 3, 4, 5];

export default function Division({ onHome, activityId }) {
  const { lang } = useLanguage();
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const [qIn, setQIn] = useState('');
  const [rIn, setRIn] = useState('');
  const [checked, setChecked] = useState(false);
  const startRef = useRef(Date.now());

  const q = useMemo(() => {
    const divisor = DIVISORS[Math.floor(Math.random() * DIVISORS.length)];
    const quotient = 2 + Math.floor(Math.random() * 8);
    const remainder = Math.floor(Math.random() * divisor); // 0..divisor-1
    const dividend = divisor * quotient + remainder;
    return { divisor, quotient, remainder, dividend };
  }, [round]);

  function check() {
    const ok = Number(qIn) === q.quotient && Number(rIn || 0) === q.remainder;
    setChecked(true);
    if (ok) setCorrect((c) => c + 1);
    setTimeout(() => {
      setChecked(false);
      setQIn(''); setRIn('');
      if (round + 1 >= TOTAL) setDone(true);
      else setRound((r) => r + 1);
    }, 1200);
  }
  function restart() {
    setRound(0); setCorrect(0); setDone(false); setQIn(''); setRIn(''); setChecked(false);
    startRef.current = Date.now();
  }

  if (done) {
    return <MathResult activity={activityId} score={Math.round((correct / TOTAL) * 100)} correct={correct} total={TOTAL} timeSpentSeconds={Math.round((Date.now() - startRef.current) / 1000)} onAgain={restart} onHome={onHome} />;
  }

  const ok = checked && Number(qIn) === q.quotient && Number(rIn || 0) === q.remainder;
  const box = 'h-16 w-20 rounded-xl border-2 text-center text-3xl font-bold focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-300';

  return (
    <div className="space-y-6 text-center">
      <div className="rounded-2xl bg-emerald-50 p-6">
        <p className="text-5xl font-bold">{q.dividend} ÷ {q.divisor} = ?</p>
      </div>
      <div className="flex flex-wrap items-end justify-center gap-4">
        <label className="space-y-1">
          <span className="block text-sm font-semibold text-slate-500">{lang === 'si' ? 'පිළිතුර' : 'Answer'}</span>
          <input inputMode="numeric" value={qIn} onChange={(e) => setQIn(e.target.value.replace(/[^0-9]/g, ''))} className={`${box} ${checked ? (ok ? 'border-emerald-400 bg-emerald-50' : 'border-rose-400 bg-rose-50') : 'border-sky-300'}`} />
        </label>
        <label className="space-y-1">
          <span className="block text-sm font-semibold text-slate-500">{lang === 'si' ? 'ඉතිරිය' : 'Remainder'}</span>
          <input inputMode="numeric" value={rIn} onChange={(e) => setRIn(e.target.value.replace(/[^0-9]/g, ''))} className={`${box} ${checked ? (ok ? 'border-emerald-400 bg-emerald-50' : 'border-rose-400 bg-rose-50') : 'border-sky-300'}`} placeholder="0" />
        </label>
      </div>
      <p className="text-sm text-slate-400">{lang === 'si' ? 'ඉතිරියක් නැත්නම් 0 ලියන්න.' : 'Write 0 if there is no remainder.'}</p>
      <button onClick={check} disabled={qIn === '' || checked} className="btn-primary mx-auto block w-full max-w-xs text-lg disabled:opacity-50">✅ {lang === 'si' ? 'පරීක්ෂා කරන්න' : 'Check'}</button>
      <p className="text-slate-400">{round + 1} / {TOTAL}</p>
    </div>
  );
}
