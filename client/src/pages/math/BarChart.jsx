import { useMemo, useRef, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import MathResult from '../../components/math/MathResult.jsx';

const TOTAL = 5;
const shuffle = (a) => a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map((p) => p[1]);
const CATS = [
  { emoji: '🍎', en: 'apples', si: 'ඇපල්' },
  { emoji: '🍌', en: 'bananas', si: 'කෙසෙල්' },
  { emoji: '🍇', en: 'grapes', si: 'මිදි' },
  { emoji: '🍊', en: 'oranges', si: 'දොඩම්' },
];
const COLORS = ['#38bdf8', '#34d399', '#fbbf24', '#f472b6'];

export default function BarChart({ onHome, activityId }) {
  const { lang } = useLanguage();
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [done, setDone] = useState(false);
  const startRef = useRef(Date.now());

  const q = useMemo(() => {
    const data = CATS.map((c) => ({ ...c, value: 1 + Math.floor(Math.random() * 10) }));
    // Ask either "how many X" or "which has the most".
    const askMost = Math.random() < 0.4;
    let prompt;
    let ans;
    let options;
    if (askMost) {
      const max = Math.max(...data.map((d) => d.value));
      const top = data.find((d) => d.value === max);
      prompt = lang === 'si' ? 'වැඩිම ඇත්තේ කුමක්ද?' : 'Which has the most?';
      ans = top.en;
      options = shuffle(data.map((d) => d.en)).slice(0, Math.min(4, data.length));
      if (!options.includes(ans)) options[0] = ans;
      options = shuffle(options);
    } else {
      const pick = data[Math.floor(Math.random() * data.length)];
      prompt = lang === 'si' ? `${pick.si} කීයද?` : `How many ${pick.en}?`;
      ans = String(pick.value);
      const opts = new Set([pick.value]);
      while (opts.size < 3) opts.add(1 + Math.floor(Math.random() * 10));
      options = shuffle([...opts]).map(String);
    }
    return { data, prompt, ans, options, askMost };
  }, [round]); // eslint-disable-line react-hooks/exhaustive-deps

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
    return <MathResult activity={activityId} score={Math.round((correct / TOTAL) * 100)} correct={correct} total={TOTAL} timeSpentSeconds={Math.round((Date.now() - startRef.current) / 1000)} onAgain={restart} onHome={onHome} />;
  }

  const maxV = Math.max(...q.data.map((d) => d.value));
  const H = 140;

  return (
    <div className="space-y-6 text-center">
      <p className="text-xl font-semibold">{q.prompt}</p>
      <div className="rounded-2xl bg-white p-5 shadow">
        <svg viewBox="0 0 320 190" className="mx-auto w-full max-w-md">
          {/* axis */}
          <line x1="30" y1="10" x2="30" y2={H + 10} stroke="#94a3b8" strokeWidth="2" />
          <line x1="30" y1={H + 10} x2="310" y2={H + 10} stroke="#94a3b8" strokeWidth="2" />
          {q.data.map((d, i) => {
            const bw = 50;
            const gap = 18;
            const x = 45 + i * (bw + gap);
            const h = (d.value / maxV) * H;
            return (
              <g key={d.en}>
                <rect x={x} y={H + 10 - h} width={bw} height={h} fill={COLORS[i % COLORS.length]} rx="4" />
                <text x={x + bw / 2} y={H + 10 - h - 5} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#334155">{d.value}</text>
                <text x={x + bw / 2} y={H + 30} textAnchor="middle" fontSize="20">{d.emoji}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="mx-auto grid max-w-md grid-cols-3 gap-3">
        {q.options.map((opt) => {
          const isWrong = feedback === `wrong:${opt}`;
          const isRight = feedback && opt === q.ans;
          const label = q.askMost ? (lang === 'si' ? CATS.find((c) => c.en === opt)?.si : opt) : opt;
          return (
            <button
              key={opt}
              onClick={() => pick(opt)}
              className={`rounded-2xl py-5 text-xl font-bold shadow transition active:scale-95 ${
                isRight ? 'bg-emerald-300' : isWrong ? 'bg-rose-300' : 'bg-white hover:bg-teal-50'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
      <p className="text-slate-400">{round + 1} / {TOTAL}</p>
    </div>
  );
}
