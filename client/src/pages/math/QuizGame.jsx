import { useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useTTS } from '../../hooks/useTTS.js';
import { api } from '../../api.js';
import TeachVisual from '../../components/math/TeachVisual.jsx';
import MathResult from '../../components/math/MathResult.jsx';
import Encouragement from '../../components/Encouragement.jsx';
import {
  randomPraise,
  randomRetry,
  randomCelebrateEmoji,
  randomBuddyHappy,
  randomBuddyCheer,
} from '../../lib/encouragement.js';

// Generic MCQ activity engine. `generate()` returns:
//   { prompt_en, prompt_si, visual?, options:[{ text?|en?|si?, correct }] }
export default function QuizGame({ activityId, generate, level = 1, rounds = 6, onFinish, onHome, onNextLevel }) {
  const { lang } = useLanguage();
  const { speak } = useTTS();
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [cheer, setCheer] = useState(null); // animated answer reaction
  const [done, setDone] = useState(false);
  const startRef = useRef(Date.now());
  const roundStartRef = useRef(Date.now());

  const q = useMemo(() => generate(level), [round, generate, level]);
  const prompt = lang === 'si' ? q.prompt_si : q.prompt_en;
  const label = (o) => (lang === 'si' && o.si ? o.si : o.text ?? o.en);

  // Reset the per-question timer whenever a new round is shown.
  useEffect(() => {
    roundStartRef.current = Date.now();
  }, [round]);

  function pick(o, i) {
    if (feedback) return;
    const ok = !!o.correct;
    api
      .logResponse({
        activity_type: activityId,
        question_index: round,
        correct: ok,
        response_time_ms: Date.now() - roundStartRef.current,
      })
      .catch(() => {});
    setFeedback(ok ? `ok:${i}` : `no:${i}`);
    // Fresh, varied, spoken encouragement on every answer.
    if (ok) {
      setCorrect((c) => c + 1);
      const msg = randomPraise(lang);
      setCheer({ type: 'correct', message: msg, emoji: randomCelebrateEmoji(), buddy: randomBuddyHappy() });
      speak(msg, lang, { log: false });
    } else {
      const msg = randomRetry(lang);
      setCheer({ type: 'retry', message: msg, buddy: randomBuddyCheer() });
      speak(msg, lang, { log: false });
    }
    // Linger a little longer so the reaction is enjoyable.
    setTimeout(() => {
      setFeedback(null);
      setCheer(null);
      if (round + 1 >= rounds) setDone(true);
      else setRound((r) => r + 1);
    }, 1200);
  }

  function restart() {
    setRound(0); setCorrect(0); setDone(false); setFeedback(null); setCheer(null);
    startRef.current = Date.now();
  }

  if (done) {
    return (
      <MathResult
        activity={activityId}
        level={level}
        score={Math.round((correct / rounds) * 100)}
        correct={correct}
        total={rounds}
        timeSpentSeconds={Math.round((Date.now() - startRef.current) / 1000)}
        onAgain={restart}
        onHome={onHome || (() => {})}
        onNext={onNextLevel}
        onSaved={onFinish}
      />
    );
  }

  return (
    <div className="space-y-6 text-center">
      {cheer && (
        <Encouragement show type={cheer.type} message={cheer.message} emoji={cheer.emoji} buddy={cheer.buddy} />
      )}
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
              disabled={!!feedback}
              className={`rounded-2xl py-5 text-xl font-bold shadow transition active:scale-95 ${
                isOk
                  ? 'bg-emerald-300 ring-4 ring-emerald-400 animate-correct-pop'
                  : isNo
                    ? 'bg-rose-300 ring-4 ring-rose-400 animate-jiggle'
                    : 'bg-white hover:scale-105 hover:bg-sky-50'
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
