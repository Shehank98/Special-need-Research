import { useMemo, useRef, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import MathResult from '../../components/math/MathResult.jsx';

const TOTAL = 5;
const shuffle = (a) => a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map((p) => p[1]);
const ITEMS = [
  { emoji: '🍎', en: 'apple', si: 'ඇපල්' },
  { emoji: '🍞', en: 'bread', si: 'පාන්' },
  { emoji: '🥛', en: 'milk', si: 'කිරි' },
  { emoji: '🍌', en: 'banana', si: 'කෙසෙල්' },
  { emoji: '✏️', en: 'pencil', si: 'පැන්සල' },
  { emoji: '📒', en: 'book', si: 'පොත' },
];
const PAID = [50, 100, 200];

export default function Shop({ onHome, activityId, level = 1, onFinish }) {
  const { lang } = useLanguage();
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [done, setDone] = useState(false);
  const startRef = useRef(Date.now());

  const q = useMemo(() => {
    const paidPool = level >= 3 ? [100, 200, 500] : level === 2 ? [50, 100, 200] : [20, 50, 100];
    const item = ITEMS[Math.floor(Math.random() * ITEMS.length)];
    const paid = paidPool[Math.floor(Math.random() * paidPool.length)];
    const price = 10 + Math.floor(Math.random() * (paid - 10)); // < paid
    const change = paid - price;
    const opts = new Set([change]);
    while (opts.size < 3) {
      const delta = [5, -5, 10, -10, 20][Math.floor(Math.random() * 5)];
      const cand = change + delta;
      if (cand >= 0 && cand <= paid) opts.add(cand);
    }
    return { item, paid, price, change, options: shuffle([...opts]) };
  }, [round, level]);

  function pick(v) {
    if (feedback) return;
    const ok = v === q.change;
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
    return <MathResult activity={activityId} level={level} score={Math.round((correct / TOTAL) * 100)} correct={correct} total={TOTAL} timeSpentSeconds={Math.round((Date.now() - startRef.current) / 1000)} onAgain={restart} onHome={onHome} onSaved={onFinish} />;
  }

  const itemName = lang === 'si' ? q.item.si : q.item.en;

  return (
    <div className="space-y-6 text-center">
      <div className="rounded-2xl bg-pink-50 p-6">
        <div className="text-6xl" aria-hidden="true">{q.item.emoji}</div>
        <p className="mt-2 text-2xl font-bold">Rs. {q.price}</p>
        <p className="mt-2 text-lg">
          {lang === 'si'
            ? `${itemName} ගන්න ඔබ Rs. ${q.paid} ගෙවයි. ඉතිරිය කීයද?`
            : `You buy the ${itemName} and pay Rs. ${q.paid}. How much change?`}
        </p>
      </div>
      <div className="mx-auto grid max-w-md grid-cols-3 gap-3">
        {q.options.map((opt) => {
          const isWrong = feedback === `wrong:${opt}`;
          const isRight = feedback && opt === q.change;
          return (
            <button
              key={opt}
              onClick={() => pick(opt)}
              className={`rounded-2xl py-6 text-2xl font-bold shadow transition active:scale-95 ${
                isRight ? 'bg-emerald-300' : isWrong ? 'bg-rose-300' : 'bg-white hover:bg-pink-50'
              }`}
            >
              Rs. {opt}
            </button>
          );
        })}
      </div>
      <p className="text-slate-400">{round + 1} / {TOTAL}</p>
    </div>
  );
}
