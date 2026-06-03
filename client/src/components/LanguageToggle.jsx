import { useLanguage } from '../context/LanguageContext.jsx';

// Bilingual toggle: 🇱🇰 Sinhala / 🇬🇧 English
export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  const options = [
    { code: 'en', flag: '🇬🇧', label: 'English' },
    { code: 'si', flag: '🇱🇰', label: 'සිංහල' },
  ];
  return (
    <div className="inline-flex rounded-full bg-white/70 p-1 shadow" role="group" aria-label="Language">
      {options.map((o) => (
        <button
          key={o.code}
          onClick={() => setLang(o.code)}
          className={`flex items-center gap-1 rounded-full px-3 py-2 text-base font-semibold transition
            ${lang === o.code ? 'bg-pastel-green text-ink shadow' : 'text-ink/60 hover:text-ink'}`}
          aria-pressed={lang === o.code}
        >
          <span aria-hidden="true">{o.flag}</span>
          <span className="hidden sm:inline">{o.label}</span>
        </button>
      ))}
    </div>
  );
}
