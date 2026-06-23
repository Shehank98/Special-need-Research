import { useCallback } from 'react';
import { api } from '../api.js';

// Web Speech API wrapper. Speaks text in English or Sinhala and (optionally)
// logs a 'tts_used' engagement event for research metrics.
export function useTTS() {
  const speak = useCallback((text, lang = 'en', { log = true, onend } = {}) => {
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = lang === 'si' ? 'si-LK' : 'en-US';
    utter.rate = 0.85; // slower pace helps young/dyslexic readers
    utter.pitch = 1;

    // Try to pick a matching voice if the browser exposes one.
    const voices = window.speechSynthesis.getVoices();
    const match = voices.find((v) => v.lang?.toLowerCase().startsWith(utter.lang.toLowerCase().slice(0, 2)));
    if (match) utter.voice = match;

    // Let callers chain steps (e.g. an autoplay lesson) when narration finishes.
    if (typeof onend === 'function') utter.onend = onend;

    window.speechSynthesis.speak(utter);

    if (log) {
      api.logEvent({ event_type: 'tts_used', metadata: { lang, length: text.length } }).catch(() => {});
    }
  }, []);

  const stop = useCallback(() => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }, []);

  return { speak, stop };
}
