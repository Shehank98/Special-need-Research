import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useTTS } from '../../hooks/useTTS.js';
import TeachVisual from './TeachVisual.jsx';

// A "you try" mini-step inside a lesson: a visual + one tap-the-answer question
// with friendly feedback, before the real game starts.
// spec: { prompt_en, prompt_si, visual?, options:[{ text?|en?|si?, correct }] }
export default function InteractiveTry({ spec }) {
  const { lang } = useLanguage();
  const { speak } = useTTS();
  const [picked, setPicked] = useState(null);

  const prompt = lang === 'si' ? spec.prompt_si : spec.prompt_en;
  const label = (o) => (lang === 'si' && o.si ? o.si : o.text ?? o.en);

  function pick(o, i) {
    if (picked?.ok) return; // already solved
    const ok = !!o.correct;
    setPicked({ i, ok });
    speak(ok ? (lang === 'si' ? 'හරි!' : 'Yes!') : (lang === 'si' ? 'නැවත උත්සාහ කරන්න' : 'Try again'), lang, { log: false });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-2 text-sm font-semibold text-emerald-600">
        <span className="text-xl">✋</span>
        {lang === 'si' ? 'ඔබ උත්සාහ කරන්න' : 'You try'}
      </div>

      {spec.visual && (
        <div className="flex min-h-[140px] items-center justify-center">
          <TeachVisual v={spec.visual} />
        </div>
      )}

      <p className="text-center text-lg font-semibold text-slate-700">{prompt}</p>

      <div className="mx-auto grid max-w-md grid-cols-3 gap-3">
        {spec.options.map((o, i) => {
          const isPicked = picked?.i === i;
          const cls = isPicked
            ? picked.ok
              ? 'bg-emerald-300'
              : 'bg-rose-300'
            : 'bg-white hover:bg-sky-50';
          return (
            <button
              key={i}
              onClick={() => pick(o, i)}
              className={`rounded-2xl py-5 text-2xl font-bold shadow transition active:scale-95 ${cls}`}
            >
              {label(o)}
            </button>
          );
        })}
      </div>

      {picked?.ok && (
        <p className="animate-bounce-in text-center text-xl font-bold text-emerald-600">
          🎉 {lang === 'si' ? 'හරියටම හරි!' : 'Well done!'}
        </p>
      )}
    </div>
  );
}
