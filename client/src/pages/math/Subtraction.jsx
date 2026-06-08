import { useMemo, useRef, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import MathResult from '../../components/math/MathResult.jsx';

const TOTAL = 5;
function needsBorrow(a, b) {
  while (b > 0) {
    if (a % 10 < b % 10) return true;
    a = Math.floor(a / 10);
    b = Math.floor(b / 10);
  }
  return false;
}
function makeDiff() {
  let a;
  let b;
  do {
    a = 200 + Math.floor(Math.random() * 799);
    b = 100 + Math.floor(Math.random() * (a - 100));
  } while (!needsBorrow(a, b));
  return { a, b, diff: a - b };
}
const cells = (n, cols) => String(n).padStart(cols, ' ').split('');

export default function Subtraction({ onHome, activityId }) {
  const { lang } = useLanguage();
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const [entries, setEntries] = useState([]);
  const [checked, setChecked] = useState(false);
  const startRef = useRef(Date.now());

  const q = useMemo(() => makeDiff(), [round]);
  const cols = String(q.a).length;
  const answer = String(q.diff).padStart(cols, '0');

  const setDigit = (i, v) => {
    if (checked) return;
    const next = [...entries];
    next[i] = v.replace(/[^0-9]/g, '').slice(-1);
    setEntries(next);
  };
  const filled = Array.from({ length: cols }).every((_, i) => entries[i] !== undefined && entries[i] !== '');

  function check() {
    const ok = Array.from({ length: cols }).every((_, i) => (entries[i] || '') === answer[i]);
    setChecked(true);
    if (ok) setCorrect((c) => c + 1);
    setTimeout(() => {
      setChecked(false);
      setEntries([]);
      if (round + 1 >= TOTAL) setDone(true);
      else setRound((r) => r + 1);
    }, 1200);
  }
  function restart() {
    setRound(0); setCorrect(0); setDone(false); setEntries([]); setChecked(false);
    startRef.current = Date.now();
  }

  if (done) {
    return <MathResult activity={activityId} score={Math.round((correct / TOTAL) * 100)} correct={correct} total={TOTAL} timeSpentSeconds={Math.round((Date.now() - startRef.current) / 1000)} onAgain={restart} onHome={onHome} />;
  }

  const aCells = cells(q.a, cols);
  const bCells = cells(q.b, cols);

  return (
    <div className="space-y-6">
      <p className="text-center text-xl font-semibold">{lang === 'si' ? 'වෙනස ලියන්න' : 'Write the difference'}</p>
      <div className="mx-auto w-fit rounded-2xl bg-white p-6 font-mono shadow">
        <table className="border-collapse">
          <tbody>
            <tr>
              <td className="w-12" />
              {aCells.map((d, i) => <td key={i} className="h-14 w-14 text-center text-4xl font-bold">{d.trim()}</td>)}
            </tr>
            <tr>
              <td className="text-center text-4xl font-bold text-rose-600">−</td>
              {bCells.map((d, i) => <td key={i} className="h-14 w-14 text-center text-4xl font-bold">{d.trim()}</td>)}
            </tr>
            <tr><td colSpan={cols + 1}><div className="my-1 h-1 rounded bg-slate-800" /></td></tr>
            <tr>
              <td />
              {Array.from({ length: cols }).map((_, i) => {
                const wrong = checked && (entries[i] || '') !== answer[i];
                const right = checked && (entries[i] || '') === answer[i];
                return (
                  <td key={i} className="p-1">
                    <input
                      inputMode="numeric"
                      value={entries[i] || ''}
                      onChange={(e) => setDigit(i, e.target.value)}
                      className={`h-14 w-14 rounded-xl border-2 text-center text-4xl font-bold focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 ${
                        right ? 'border-emerald-400 bg-emerald-50' : wrong ? 'border-rose-400 bg-rose-50' : 'border-sky-300 bg-white'
                      }`}
                    />
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-center text-sm text-slate-400">{lang === 'si' ? 'දකුණේ සිට අඩු කරන්න. අවශ්‍ය විට ණයට ගන්න!' : 'Subtract from the right. Borrow when you need to!'}</p>
      <button onClick={check} disabled={!filled || checked} className="btn-primary mx-auto block w-full max-w-xs text-lg disabled:opacity-50">✅ {lang === 'si' ? 'පරීක්ෂා කරන්න' : 'Check'}</button>
      <p className="text-center text-slate-400">{round + 1} / {TOTAL}</p>
    </div>
  );
}
