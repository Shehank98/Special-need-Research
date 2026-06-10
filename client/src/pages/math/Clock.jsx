import { useMemo, useRef, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import MathResult from '../../components/math/MathResult.jsx';

const TOTAL = 5;
const MINUTES = [0, 15, 30, 45];
const fmt = (h, m) => `${h}:${String(m).padStart(2, '0')}`;
const shuffle = (a) => a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map((p) => p[1]);

function AnalogClock({ hour, minute }) {
  const minuteAngle = minute * 6; // 360/60
  const hourAngle = (hour % 12) * 30 + minute * 0.5; // 360/12 + drift
  const hand = (angle, len, width, color) => {
    const rad = (angle - 90) * (Math.PI / 180);
    return (
      <line
        x1="100" y1="100"
        x2={100 + len * Math.cos(rad)} y2={100 + len * Math.sin(rad)}
        stroke={color} strokeWidth={width} strokeLinecap="round"
      />
    );
  };
  return (
    <svg viewBox="0 0 200 200" className="mx-auto h-56 w-56">
      <circle cx="100" cy="100" r="95" fill="#fff" stroke="#1e293b" strokeWidth="5" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * 30 - 90) * (Math.PI / 180);
        const x = 100 + 78 * Math.cos(a);
        const y = 100 + 78 * Math.sin(a);
        return (
          <text key={i} x={x} y={y + 7} textAnchor="middle" fontSize="18" fontWeight="bold" fill="#334155">
            {i === 0 ? 12 : i}
          </text>
        );
      })}
      {hand(hourAngle, 50, 7, '#0f172a')}
      {hand(minuteAngle, 72, 5, '#0284c7')}
      <circle cx="100" cy="100" r="6" fill="#0f172a" />
    </svg>
  );
}

export default function Clock({ onHome, activityId, level = 1, onFinish, onNextLevel }) {
  const { lang } = useLanguage();
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [done, setDone] = useState(false);
  const startRef = useRef(Date.now());

  const q = useMemo(() => {
    // Level scales minute precision: o'clock/half -> quarters -> 5-minutes.
    const mins = level >= 3 ? [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55] : level === 2 ? [0, 15, 30, 45] : [0, 30];
    const hour = 1 + Math.floor(Math.random() * 12);
    const minute = mins[Math.floor(Math.random() * mins.length)];
    const ans = fmt(hour, minute);
    const opts = new Set([ans]);
    while (opts.size < 3) {
      const h = 1 + Math.floor(Math.random() * 12);
      const m = mins[Math.floor(Math.random() * mins.length)];
      opts.add(fmt(h, m));
    }
    return { hour, minute, ans, options: shuffle([...opts]) };
  }, [round, level]);

  function pick(v) {
    if (feedback) return;
    const ok = v === q.ans;
    setFeedback(ok ? 'correct' : `wrong:${v}`);
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
      <p className="text-xl font-semibold">{lang === 'si' ? 'වේලාව කියවන්න' : 'What time is it?'}</p>
      <AnalogClock hour={q.hour} minute={q.minute} />
      <div className="mx-auto grid max-w-md grid-cols-3 gap-3">
        {q.options.map((opt) => {
          const isWrong = feedback === `wrong:${opt}`;
          const isRight = feedback === 'correct' && opt === q.ans;
          return (
            <button
              key={opt}
              onClick={() => pick(opt)}
              className={`rounded-2xl py-6 text-2xl font-bold shadow transition active:scale-95 ${
                isRight ? 'bg-emerald-300' : isWrong ? 'bg-rose-300' : 'bg-white hover:bg-amber-50'
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
