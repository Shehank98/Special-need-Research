import { useLanguage } from '../context/LanguageContext.jsx';

// Emotional-engagement check-in: 5 emoji faces (1=sad … 5=great).
// Shown identically for BOTH groups at session start and end.
const FACES = [
  { value: 1, emoji: '😢', en: 'Sad', si: 'දුකයි' },
  { value: 2, emoji: '🙁', en: 'Not great', si: 'හරි නෑ' },
  { value: 3, emoji: '😐', en: 'Okay', si: 'සාමාන්‍යයි' },
  { value: 4, emoji: '🙂', en: 'Good', si: 'හොඳයි' },
  { value: 5, emoji: '😄', en: 'Great', si: 'ඉතා හොඳයි' },
];

export default function MoodCheckIn({ phase = 'start', onPick }) {
  const { t, lang } = useLanguage();
  const prompt =
    phase === 'end'
      ? lang === 'si'
        ? 'දැන් ඔබට කොහොමද දැනෙන්නේ?'
        : 'How do you feel now?'
      : lang === 'si'
        ? 'අද ඔබට කොහොමද දැනෙන්නේ?'
        : 'How do you feel today?';

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/40 p-4" role="dialog" aria-modal="true">
      <div className="card animate-pop-in w-full max-w-md space-y-5 text-center">
        <h2 className="text-2xl font-bold">{prompt}</h2>
        <div className="flex justify-center gap-2">
          {FACES.map((f) => (
            <button
              key={f.value}
              onClick={() => onPick(f.value)}
              className="flex flex-col items-center gap-1 rounded-2xl bg-white/70 p-3 shadow transition hover:brightness-95 active:scale-95"
              aria-label={lang === 'si' ? f.si : f.en}
            >
              <span className="text-4xl" aria-hidden="true">{f.emoji}</span>
              <span className="text-xs font-semibold">{lang === 'si' ? f.si : f.en}</span>
            </button>
          ))}
        </div>
        <p className="text-sm text-ink/60">{t('appName')}</p>
      </div>
    </div>
  );
}
