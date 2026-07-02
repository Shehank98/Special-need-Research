import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { useTTS } from '../../hooks/useTTS.js';
import { useSpeechInput } from '../../hooks/useSpeechInput.js';
import { api } from '../../api.js';
import { answer, answerById, greeting, SUGGESTIONS } from '../../lib/assistant.js';

// A voice-based study assistant for self-study support (operationalises IV4 and
// the ZPD "more knowledgeable other"). The child can speak a question (voice in
// via SpeechRecognition) or tap a suggestion, and the assistant replies in
// simple bilingual language and reads it aloud (voice out via TTS). Each use is
// logged as a `chatbot_used` engagement event for the research metrics.
export default function StudyBuddy() {
  const { lang } = useLanguage();
  const { speak, stop } = useTTS();
  const { supported, listening, listen } = useSpeechInput(lang);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ from: 'buddy', text: greeting(lang) }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  function respond(reply, question) {
    setMessages((m) => [...m, { from: 'buddy', text: reply.text }]);
    speak(reply.text, lang, { log: false });
    api.logEvent({
      event_type: 'chatbot_used',
      activity_type: 'assistant',
      metadata: { intent: reply.id, question: (question || '').slice(0, 120), voice: !!question },
    }).catch(() => {});
  }

  function ask(question) {
    const q = (question || '').trim();
    if (!q) return;
    setMessages((m) => [...m, { from: 'child', text: q }]);
    setText('');
    respond(answer(q, lang), q);
  }

  function askSuggestion(s) {
    setMessages((m) => [...m, { from: 'child', text: lang === 'si' ? s.si : s.en }]);
    respond(answerById(s.id, lang), lang === 'si' ? s.si : s.en);
  }

  function micTap() {
    if (listening) return;
    listen((said) => ask(said));
  }

  function close() {
    stop();
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-full bg-lime-500 px-4 py-3 font-bold text-white shadow-lg transition hover:brightness-105 active:scale-95"
        aria-label={lang === 'si' ? 'අධ්‍යයන මිතුරාගෙන් අහන්න' : 'Ask the study buddy'}
      >
        <span className="text-2xl" aria-hidden="true">🦉</span>
        <span className="hidden sm:inline">{lang === 'si' ? 'උදව්' : 'Ask'}</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-30 flex w-[92vw] max-w-sm flex-col rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between rounded-t-3xl bg-lime-500 px-4 py-3 text-white">
        <span className="flex items-center gap-2 font-bold">
          <span className="text-xl" aria-hidden="true">🦉</span>
          {lang === 'si' ? 'අධ්‍යයන මිතුරා' : 'Study Buddy'}
        </span>
        <button onClick={close} aria-label="close" className="rounded-full bg-white/20 px-2 py-1 text-sm">✕</button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="max-h-72 space-y-2 overflow-y-auto p-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.from === 'child' ? 'justify-end' : 'justify-start'}`}>
            <p
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                m.from === 'child' ? 'bg-sky-100 text-slate-800' : 'bg-lime-50 text-slate-700'
              }`}
            >
              {m.from === 'buddy' && <span className="mr-1" aria-hidden="true">🦉</span>}
              {m.text}
            </p>
          </div>
        ))}
      </div>

      {/* Suggestions */}
      <div className="flex flex-wrap gap-2 px-3 pb-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => askSuggestion(s)}
            className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
          >
            {lang === 'si' ? s.si : s.en}
          </button>
        ))}
      </div>

      {/* Input row */}
      <div className="flex items-center gap-2 border-t border-slate-100 p-3">
        {supported && (
          <button
            onClick={micTap}
            aria-label={lang === 'si' ? 'කතා කරන්න' : 'Speak'}
            className={`shrink-0 rounded-full px-3 py-2 text-xl shadow ${listening ? 'animate-pulse bg-rose-400 text-white' : 'bg-lime-100'}`}
          >
            🎤
          </button>
        )}
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && ask(text)}
          placeholder={lang === 'si' ? 'ප්‍රශ්නයක් ටයිප් කරන්න' : 'Type a question'}
          className="min-w-0 flex-1 rounded-full border border-slate-200 px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-lime-300"
        />
        <button onClick={() => ask(text)} aria-label="send" className="shrink-0 rounded-full bg-lime-500 px-3 py-2 text-white shadow">➤</button>
      </div>
    </div>
  );
}
