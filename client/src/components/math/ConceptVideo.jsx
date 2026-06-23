import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useTTS } from '../../hooks/useTTS.js';
import { api } from '../../api.js';
import TeachVisual from './TeachVisual.jsx';
import InteractiveTry from './InteractiveTry.jsx';

// An animated, narrated "explainer video" for a Foundations concept. It plays a
// sequence of scenes like a short video — each scene shows an animated visual
// (visual) and is read aloud (audio), auto-advancing when narration ends. The
// last scene is usually a tap-to-answer "you try" (interactive). Children can
// pause, replay a line, step back/forward, or re-watch the whole thing.
export default function ConceptVideo({ activityId, lesson, onStart }) {
  const { lang } = useLanguage();
  const { speak, stop } = useTTS();
  const scenes = lesson.scenes || [];
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);

  const scene = scenes[i];
  const isTry = !!scene?.try;
  const last = i === scenes.length - 1;
  const text = isTry
    ? (lang === 'si' ? scene.try.prompt_si : scene.try.prompt_en)
    : (lang === 'si' ? scene?.si : scene?.en);

  // Log that the lesson was opened (engagement: lesson_started).
  useEffect(() => {
    api.logEvent({ event_type: 'lesson_started', activity_type: activityId, metadata: { kind: 'foundation_video' } }).catch(() => {});
    return () => stop();
  }, [activityId, stop]);

  // Stop any narration the moment playback is paused.
  useEffect(() => {
    if (!playing) stop();
  }, [playing, stop]);

  // Drive autoplay: narrate the current scene, then advance when speech ends
  // (with a length-based fallback timer in case onend never fires).
  useEffect(() => {
    if (!playing) return;
    // Interactive scenes wait for the child — pause autoplay here.
    if (isTry) {
      setPlaying(false);
      return;
    }
    let cancelled = false;
    const advance = () => {
      if (cancelled) return;
      setI((x) => (x < scenes.length - 1 ? x + 1 : x));
    };
    speak(text, lang, { log: false, onend: advance });
    const words = (text || '').split(/\s+/).filter(Boolean).length;
    const fallbackMs = Math.max(2800, words * 420);
    const timer = setTimeout(advance, fallbackMs);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, playing, lang]);

  // Autoplay naturally stops on the final scene.
  useEffect(() => {
    if (last) setPlaying(false);
  }, [last]);

  function begin() {
    stop();
    onStart();
  }
  function replayAll() {
    setI(0);
    setPlaying(true);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-center gap-2 text-sm font-semibold text-lime-700">
        <span className="text-xl">🎬</span>
        {lang === 'si' ? 'බලා ඉගෙන ගමු' : 'Watch &amp; learn'}
        <span className="text-slate-400">· {lang === 'si' ? lesson.si : lesson.en}</span>
      </div>

      {/* Stage */}
      <div className="flex min-h-[220px] items-center justify-center rounded-3xl bg-gradient-to-b from-sky-50 to-white p-4 shadow-inner">
        {isTry ? (
          <div key={i} className="w-full animate-fade-up">
            <InteractiveTry spec={scene.try} />
          </div>
        ) : (
          <div key={i} className="animate-fade-up">
            <TeachVisual v={scene.visual} />
          </div>
        )}
      </div>

      {/* Caption / narration (with re-listen) */}
      <div key={`cap-${i}`} className="animate-fade-up mx-auto flex max-w-lg items-center gap-3 rounded-2xl bg-lime-50 p-4">
        <span className="text-4xl" aria-hidden="true">🦉</span>
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
        {scenes.map((_, k) => (
          <span key={k} className={`h-2.5 w-2.5 rounded-full transition ${k === i ? 'scale-125 bg-lime-500' : k < i ? 'bg-lime-300' : 'bg-slate-300'}`} />
        ))}
      </div>

      {/* Player controls */}
      <div className="flex items-center justify-center gap-2">
        <button onClick={replayAll} aria-label="restart" className="rounded-full bg-white px-3 py-2 text-lg shadow disabled:opacity-40">⏮️</button>
        <button onClick={() => setI((x) => Math.max(0, x - 1))} disabled={i === 0} aria-label="previous" className="rounded-full bg-white px-3 py-2 text-lg shadow disabled:opacity-40">⬅️</button>
        <button
          onClick={() => setPlaying((p) => !p)}
          disabled={last && !playing && isTry}
          aria-label={playing ? 'pause' : 'play'}
          className="rounded-full bg-lime-500 px-5 py-2 text-lg text-white shadow disabled:opacity-40"
        >
          {playing ? '⏸️' : '▶️'}
        </button>
        <button onClick={() => setI((x) => Math.min(scenes.length - 1, x + 1))} disabled={last} aria-label="next" className="rounded-full bg-white px-3 py-2 text-lg shadow disabled:opacity-40">➡️</button>
      </div>

      {/* Finish / re-watch */}
      <div className="space-y-2 pt-1">
        {last && (
          <button onClick={begin} className="btn-primary w-full animate-wiggle text-xl">
            ▶️ {lang === 'si' ? 'සෙල්ලම් කරමු!' : 'Let’s practise!'}
          </button>
        )}
        <div className="flex items-center justify-center gap-4">
          {last && (
            <button onClick={replayAll} className="text-sm font-semibold text-lime-700 underline">
              🔁 {lang === 'si' ? 'නැවත බලන්න' : 'Watch again'}
            </button>
          )}
          <button onClick={begin} className="text-sm font-semibold text-slate-400 underline">
            {lang === 'si' ? 'සෙල්ලමට යන්න' : 'Skip to practice'}
          </button>
        </div>
      </div>
    </div>
  );
}
