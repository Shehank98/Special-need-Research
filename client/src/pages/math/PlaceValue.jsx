import { useMemo, useRef, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useTTS } from '../../hooks/useTTS.js';
import MathResult from '../../components/math/MathResult.jsx';

const PLACES = [
  { en: 'thousands', si: 'දහස්' },
  { en: 'hundreds', si: 'සිය' },
  { en: 'tens', si: 'දස' },
  { en: 'ones', si: 'එක' },
];
const PLACES5 = [{ en: 'ten-thousands', si: 'දස දහස්' }, ...PLACES];
const TOTAL = 5;

// Drag-and-drop (or tap) place-value builder: drag digit tiles into the place
// boxes to build the target number.
export default function PlaceValue({ onHome, activityId, level = 1, onFinish, onNextLevel }) {
  const { lang } = useLanguage();
  const { speak } = useTTS();
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [slots, setSlots] = useState([]); // placed digit per box (string|null)
  const [selected, setSelected] = useState(null); // tap-to-place selection
  const startRef = useRef(Date.now());

  const target = useMemo(() => {
    const n = level >= 3 ? 10000 + Math.floor(Math.random() * 89999) : 1000 + Math.floor(Math.random() * 9000);
    return String(n);
  }, [round, level]);
  const digits = target.split('');
  const places = digits.length === 5 ? PLACES5 : PLACES;

  function place(i, digit) {
    if (feedback) return;
    const next = slots.length ? [...slots] : Array(digits.length).fill(null);
    next[i] = digit;
    setSelected(null);
    setSlots(next);
    if (next.every((d, k) => d === digits[k])) {
      setFeedback('correct');
      speak(lang === 'si' ? 'හරි!' : 'Yes!', lang, { log: false });
      const c = correct + 1;
      setCorrect(c);
      setTimeout(() => {
        setFeedback(null);
        setSlots([]);
        if (round + 1 >= TOTAL) setDone(true);
        else setRound((r) => r + 1);
      }, 1000);
    } else if (next.every((d) => d !== null)) {
      // all filled but wrong
      setFeedback('wrong');
      speak(lang === 'si' ? 'නැවත උත්සාහ කරන්න' : 'Try again', lang, { log: false });
      setTimeout(() => { setFeedback(null); setSlots(Array(digits.length).fill(null)); }, 900);
    }
  }

  function restart() {
    setRound(0); setCorrect(0); setDone(false); setFeedback(null); setSlots([]); setSelected(null);
    startRef.current = Date.now();
  }

  if (done) {
    return (
      <MathResult activity={activityId} level={level} score={Math.round((correct / TOTAL) * 100)} correct={correct} total={TOTAL} timeSpentSeconds={Math.round((Date.now() - startRef.current) / 1000)} onAgain={restart} onHome={onHome} onNext={onNextLevel} onSaved={onFinish} />
    );
  }

  const slot = (i) => (slots.length ? slots[i] : null);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-sky-50 p-4 text-center">
        <p className="text-lg font-semibold">{lang === 'si' ? 'මෙම සංඛ්‍යාව සාදන්න' : 'Build this number'}</p>
        <p className="text-5xl font-bold tracking-widest text-sky-700">{Number(target).toLocaleString()}</p>
      </div>

      {/* Place boxes (drop targets) */}
      <div className="flex justify-center gap-3">
        {digits.map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              onClick={() => (slot(i) ? place(i, null) : selected != null && place(i, selected))}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); place(i, e.dataTransfer.getData('text/plain')); }}
              className={`flex h-20 w-16 items-center justify-center rounded-2xl border-4 border-dashed text-4xl font-bold transition ${
                slot(i) != null ? 'border-sky-400 bg-white' : 'border-slate-300 bg-slate-50'
              } ${feedback === 'correct' ? 'border-emerald-400 bg-emerald-50' : feedback === 'wrong' ? 'border-rose-400 bg-rose-50' : ''}`}
            >
              {slot(i) ?? ''}
            </div>
            {level === 1 && <span className="w-16 text-center text-[10px] text-slate-400">{lang === 'si' ? places[i].si : places[i].en}</span>}
          </div>
        ))}
      </div>

      {feedback && (
        <p className={`mx-auto w-fit rounded-full px-5 py-2 text-lg font-bold ${feedback === 'correct' ? 'bg-emerald-200' : 'bg-rose-200'}`}>
          {feedback === 'correct' ? (lang === 'si' ? '✅ හරි!' : '✅ Correct!') : (lang === 'si' ? '🔄 නැවත' : '🔄 Try again')}
        </p>
      )}

      {/* Digit tiles (draggable / tappable) */}
      <div>
        <p className="mb-2 text-center text-sm text-slate-400">{lang === 'si' ? 'ඉලක්කම් ඇද දමන්න හෝ තට්ටු කරන්න' : 'Drag a digit into a box (or tap a digit then a box)'}</p>
        <div className="mx-auto grid max-w-md grid-cols-5 gap-2">
          {Array.from({ length: 10 }).map((_, d) => (
            <button
              key={d}
              draggable
              onDragStart={(e) => e.dataTransfer.setData('text/plain', String(d))}
              onClick={() => setSelected(String(d))}
              className={`h-14 rounded-xl text-2xl font-bold shadow transition active:scale-95 ${
                selected === String(d) ? 'bg-sky-500 text-white ring-4 ring-sky-300' : 'bg-pastel-yellow'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <p className="text-center text-slate-400">{round + 1} / {TOTAL}</p>
    </div>
  );
}
