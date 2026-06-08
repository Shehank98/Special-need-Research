import { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useTTS } from '../../hooks/useTTS.js';
import TeachVisual from './TeachVisual.jsx';

// Animated, narrated "learn first" intro. Walks through teaching steps, reads
// each aloud, then a big "Let's play!" button starts the game (onStart).
export default function TeachIntro({ steps, onStart }) {
  const { lang } = useLanguage();
  const { speak, stop } = useTTS();
  const [i, setI] = useState(0);

  const step = steps[i];
  const text = lang === 'si' ? step.si : step.en;
  const last = i === steps.length - 1;

  // Read each step aloud as it appears.
  useEffect(() => {
    const id = setTimeout(() => speak(text, lang, { log: false }), 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, lang]);

  function start() {
    stop();
    onStart();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-400">
        <span className="text-xl">📚</span>
        {lang === 'si' ? 'මුලින් ඉගෙන ගමු' : 'Let’s learn first'}
      </div>

      {/* Visual */}
      <div key={i} className="flex min-h-[200px] items-center justify-center">
        <TeachVisual v={step.visual} />
      </div>

      {/* Narration */}
      <div key={`t-${i}`} className="animate-fade-up mx-auto flex max-w-lg items-center gap-3 rounded-2xl bg-sky-50 p-4">
        <span className="text-4xl">🦉</span>
        <p className="text-left text-lg font-semibold text-slate-700">{text}</p>
        <button
          onClick={() => speak(text, lang, { log: false })}
          aria-label="listen"
          className="ml-auto shrink-0 rounded-full bg-white px-3 py-2 text-xl shadow"
        >
          🔊
        </button>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2">
        {steps.map((_, k) => (
          <span key={k} className={`h-3 w-3 rounded-full ${k === i ? 'bg-sky-500' : 'bg-slate-300'}`} />
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        {i > 0 && (
          <button onClick={() => setI((x) => x - 1)} className="btn-soft flex-1">⬅️ {lang === 'si' ? 'ආපසු' : 'Back'}</button>
        )}
        {!last ? (
          <button onClick={() => setI((x) => x + 1)} className="btn-primary flex-1 text-lg">{lang === 'si' ? 'ඊළඟ' : 'Next'} ➡️</button>
        ) : (
          <button onClick={start} className="btn-primary flex-1 animate-wiggle text-xl">▶️ {lang === 'si' ? 'සෙල්ලම් කරමු!' : 'Let’s play!'}</button>
        )}
      </div>

      <button onClick={start} className="mx-auto block text-sm font-semibold text-slate-400 underline">
        {lang === 'si' ? 'සෙල්ලමට යන්න' : 'Skip to game'}
      </button>
    </div>
  );
}
