import { useMemo, useRef, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useTTS } from '../../hooks/useTTS.js';
import TeachVisual from '../../components/math/TeachVisual.jsx';
import MathResult from '../../components/math/MathResult.jsx';

// Generic MCQ activity engine. `generate()` returns:
//   { prompt_en, prompt_si, visual?, options:[{ text?|en?|si?, correct }] }
export default function QuizGame({ activityId, generate, rounds = 6 }) {
  const { lang } = useLanguage();
  const { speak } = useTTS();
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [done, setDone] = useState(false);
  const startRef = useRef(Date.now());

  const q = useMemo(() => generate(), [round, generate]);
  const prompt = lang === 'si' ? q.prompt_si : q.prompt_en;
  const label = (o) => (lang === 'si' && o.si ? o.si : o.text ?? o.en);

  function pick(o, i) {
    if (feedback) return;
    const ok = !!o.correct;
    setFeedback(ok ? `ok:${i}` : `no:${i}`);
    if (ok) {
      setCorrect((c) => c + 1);
      speak(lang === 'si' ? 'හරි' : 'Correct', lang, { log: false });
    }
    setTimeout(() => {
      setFeedback(null);
      if (round + 1 >= rounds) setDone(true);
      else setRound((r) => r + 1);
    }, 850);
  }

  function restart() {
    setRound(0); setCorrect(0); setDone(false); setFeedback(null);
    startRef.current = Date.now();
  }

  if (done) {
    return (
      <MathResult
        activity={activityId}
        score={Math.round((correct / rounds) * 100)}
        correct={correct}
        total={rounds}
        timeSpentSeconds={Math.round((Date.now() - startRef.current) / 1000)}
        onAgain={restart}
        onHome={() => {}}
      />
    );
  }

  return (
    <div className="space-y-6 text-center">
      {q.visual && (
        <div className="flex min-h-[120px] items-center justify-center rounded-2xl bg-white p-4 shadow">
          <TeachVisual v={q.visual} />
        </div>
      )}
      <div className="rounded-2xl bg-sky-50 p-5">
        <p className="text-2xl font-bold">{prompt}</p>
      </div>
      <div className="mx-auto grid max-w-md grid-cols-3 gap-3">
        {q.options.map((o, i) => {
          const isOk = feedback === `ok:${i}` || (feedback && o.correct);
          const isNo = feedback === `no:${i}`;
          return (
            <button
              key={i}
              onClick={() => pick(o, i)}
              className={`rounded-2xl py-5 text-xl font-bold shadow transition active:scale-95 ${
                isOk ? 'bg-emerald-300' : isNo ? 'bg-rose-300' : 'bg-white hover:bg-sky-50'
              }`}
            >
              {label(o)}
            </button>
          );
        })}
      </div>
      <p className="text-slate-400">{round + 1} / {rounds}</p>
    </div>
  );
}
