import { useTTS } from '../hooks/useTTS.js';
import { useLanguage } from '../context/LanguageContext.jsx';

// A round speaker button that reads the given text aloud.
export default function SpeakButton({ text, lang, label, className = '' }) {
  const { speak } = useTTS();
  const { lang: uiLang, t } = useLanguage();
  const speakLang = lang || uiLang;

  return (
    <button
      type="button"
      onClick={() => speak(text, speakLang)}
      aria-label={`${t('listen')}: ${text}`}
      className={`inline-flex items-center gap-2 rounded-full bg-pastel-blue px-4 py-2
                  font-semibold text-ink shadow hover:brightness-95 active:scale-95
                  focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300 ${className}`}
    >
      <span className="text-2xl" aria-hidden="true">🔊</span>
      {label && <span>{label}</span>}
    </button>
  );
}
