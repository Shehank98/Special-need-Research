import { useMemo, useRef, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import MathResult from '../../components/math/MathResult.jsx';

const TOTAL = 5;
const fmt = (h, m) => `${h}:${String(m).padStart(2, '0')}`;

// Set-the-clock-hands: drag the minute hand around the dial and tap a number
// for the hour to match the target time.
export default function SetClock({ onHome, activityId, level = 1, onFinish, onNextLevel }) {
  const { lang } = useLanguage();
  const svgRef = useRef(null);
  const dragRef = useRef(false);
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [done, setDone] = useState(false);
  const startRef = useRef(Date.now());

  const target = useMemo(() => {
    const mins = level >= 3 ? [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55] : level === 2 ? [0, 15, 30, 45] : [0, 30];
    return { h: 1 + Math.floor(Math.random() * 12), m: mins[Math.floor(Math.random() * mins.length)] };
  }, [round, level]);

  function setFromPointer(e) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const p = e.touches ? e.touches[0] : e;
    const x = ((p.clientX - rect.left) / rect.width) * 200;
    const y = ((p.clientY - rect.top) / rect.height) * 200;
    const ang = (Math.atan2(y - 100, x - 100) * 180) / Math.PI;
    const clock = (ang + 90 + 360) % 360;
    setMinute((Math.round(clock / 30) * 5) % 60); // snap to 5 minutes
  }

  function check() {
    if (feedback) return;
    const ok = hour === target.h && minute === target.m;
    setFeedback(ok ? 'correct' : 'wrong');
    if (ok) setCorrect((c) => c + 1);
    setTimeout(() => {
      setFeedback(null);
      if (ok) {
        setHour(12); setMinute(0);
        if (round + 1 >= TOTAL) setDone(true);
        else setRound((r) => r + 1);
      }
    }, ok ? 900 : 800);
  }

  function restart() {
    setRound(0); setCorrect(0); setDone(false); setFeedback(null); setHour(12); setMinute(0);
    startRef.current = Date.now();
  }

  if (done) {
    return <MathResult activity={activityId} level={level} score={Math.round((correct / TOTAL) * 100)} correct={correct} total={TOTAL} timeSpentSeconds={Math.round((Date.now() - startRef.current) / 1000)} onAgain={restart} onHome={onHome} onNext={onNextLevel} onSaved={onFinish} />;
  }

  const minA = minute * 6;
  const hourA = (hour % 12) * 30 + minute * 0.5;
  const hand = (a, len, w, color) => {
    const rad = (a - 90) * (Math.PI / 180);
    return <line x1="100" y1="100" x2={100 + len * Math.cos(rad)} y2={100 + len * Math.sin(rad)} stroke={color} strokeWidth={w} strokeLinecap="round" />;
  };

  return (
    <div className="space-y-5 text-center">
      <div className="rounded-2xl bg-amber-50 p-4">
        <p className="text-lg font-semibold">{lang === 'si' ? 'මෙම වේලාවට ඔරලෝසුව සකසන්න' : 'Set the clock to this time'}</p>
        <p className="text-4xl font-bold text-amber-700">{fmt(target.h, target.m)}</p>
      </div>

      <svg
        ref={svgRef}
        viewBox="0 0 200 200"
        className="mx-auto h-64 w-64 touch-none select-none"
        onMouseDown={(e) => { dragRef.current = true; setFromPointer(e); }}
        onMouseMove={(e) => dragRef.current && setFromPointer(e)}
        onMouseUp={() => { dragRef.current = false; }}
        onMouseLeave={() => { dragRef.current = false; }}
        onTouchStart={(e) => { dragRef.current = true; setFromPointer(e); }}
        onTouchMove={(e) => { e.preventDefault(); setFromPointer(e); }}
        onTouchEnd={() => { dragRef.current = false; }}
      >
        <circle cx="100" cy="100" r="95" fill="#fff" stroke="#1e293b" strokeWidth="5" />
        {Array.from({ length: 12 }).map((_, i) => {
          const num = i === 0 ? 12 : i;
          const a = (i * 30 - 90) * (Math.PI / 180);
          const x = 100 + 76 * Math.cos(a);
          const y = 100 + 76 * Math.sin(a);
          return (
            <g key={i} onMouseDown={(e) => { e.stopPropagation(); setHour(num); }} onTouchStart={(e) => { e.stopPropagation(); setHour(num); }} style={{ cursor: 'pointer' }}>
              <circle cx={x} cy={y} r="15" fill={hour === num ? '#fcd34d' : 'transparent'} />
              <text x={x} y={y + 6} textAnchor="middle" fontSize="18" fontWeight="bold" fill="#334155">{num}</text>
            </g>
          );
        })}
        {hand(hourA, 48, 7, '#0f172a')}
        {hand(minA, 72, 5, '#0284c7')}
        <circle cx="100" cy="100" r="7" fill="#0f172a" />
      </svg>

      <p className="text-sm text-slate-400">
        {lang === 'si' ? 'මිනිත්තු කටුව ඇද දමන්න · පැය සඳහා අංකයක් තට්ටු කරන්න' : 'Drag the blue minute hand · tap a number for the hour'}
      </p>
      <p className="text-2xl font-bold text-slate-700">{fmt(hour, minute)}</p>

      {feedback && (
        <p className={`mx-auto w-fit rounded-full px-5 py-2 text-lg font-bold ${feedback === 'correct' ? 'bg-emerald-200' : 'bg-rose-200'}`}>
          {feedback === 'correct' ? (lang === 'si' ? '✅ හරි!' : '✅ Correct!') : (lang === 'si' ? '🔄 නැවත' : '🔄 Try again')}
        </p>
      )}

      <button onClick={check} className="btn-primary mx-auto block w-full max-w-xs text-lg">✅ {lang === 'si' ? 'පරීක්ෂා කරන්න' : 'Check'}</button>
      <p className="text-slate-400">{round + 1} / {TOTAL}</p>
    </div>
  );
}
