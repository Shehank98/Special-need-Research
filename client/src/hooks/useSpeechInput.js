import { useCallback, useEffect, useRef, useState } from 'react';

// Thin wrapper over the browser Web Speech API (SpeechRecognition) that captures
// a single spoken phrase. This is the voice-INPUT half of the study assistant
// (the voice-OUTPUT half is useTTS). It degrades gracefully: `supported` is false
// where the API is unavailable, so callers can fall back to tapping.
export function useSpeechInput(lang = 'en') {
  const Recognition =
    typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
  const supported = !!Recognition;
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const recRef = useRef(null);

  const stop = useCallback(() => {
    try {
      recRef.current && recRef.current.stop();
    } catch {
      /* ignore */
    }
    setListening(false);
  }, []);

  const listen = useCallback(
    (onResult) => {
      if (!supported) return;
      try {
        const rec = new Recognition();
        recRef.current = rec;
        rec.lang = lang === 'si' ? 'si-LK' : 'en-US';
        rec.interimResults = false;
        rec.maxAlternatives = 1;
        setError(null);
        setTranscript('');
        setListening(true);
        rec.onresult = (e) => {
          const said = e.results?.[0]?.[0]?.transcript || '';
          setTranscript(said);
          if (onResult) onResult(said);
        };
        rec.onerror = (e) => {
          setError(e.error || 'speech_error');
          setListening(false);
        };
        rec.onend = () => setListening(false);
        rec.start();
      } catch (e) {
        setError(e.message || 'speech_error');
        setListening(false);
      }
    },
    [Recognition, supported, lang]
  );

  useEffect(() => () => stop(), [stop]);

  return { supported, listening, transcript, error, listen, stop };
}
