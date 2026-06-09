import { useLanguage } from '../../context/LanguageContext.jsx';
import { LEVEL_LABEL, levelStatus } from '../../lib/mathLevels.js';

const COLORS = {
  1: 'from-emerald-400 to-emerald-500',
  2: 'from-amber-400 to-amber-500',
  3: 'from-rose-400 to-rose-500',
};

// Shows the 3 difficulty levels for an activity with stars + locks.
export default function LevelSelect({ activity, map, onPick }) {
  const { lang } = useLanguage();
  const statuses = levelStatus(map, activity);

  return (
    <div className="space-y-5">
      <p className="text-center text-lg font-bold text-slate-600">
        {lang === 'si' ? 'මට්ටම තෝරන්න' : 'Choose your level'}
      </p>
      <div className="space-y-4">
        {statuses.map((s) => {
          const label = LEVEL_LABEL[s.level][lang === 'si' ? 'si' : 'en'];
          const locked = !s.unlocked;
          return (
            <button
              key={s.level}
              disabled={locked}
              onClick={() => onPick(s.level)}
              style={{ animationDelay: `${s.level * 0.08}s` }}
              className={`animate-fade-up flex w-full items-center gap-4 rounded-3xl p-5 text-left shadow-md transition ${
                locked
                  ? 'cursor-not-allowed bg-slate-100'
                  : `bg-gradient-to-r ${COLORS[s.level]} text-white hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.99]`
              }`}
            >
              <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-2xl font-bold ${locked ? 'bg-slate-200 text-slate-400' : 'bg-white/30'}`}>
                {locked ? '🔒' : s.level}
              </span>
              <span className="min-w-0 flex-1">
                <span className={`block text-xl font-bold ${locked ? 'text-slate-400' : ''}`}>
                  {lang === 'si' ? `මට්ටම ${s.level}` : `Level ${s.level}`} · {label}
                </span>
                <span className={`text-sm ${locked ? 'text-slate-400' : 'text-white/90'}`}>
                  {locked
                    ? (lang === 'si' ? 'පෙර මට්ටම සම්පූර්ණ කරන්න' : 'Pass the level before')
                    : s.score != null
                      ? `${lang === 'si' ? 'හොඳම' : 'Best'}: ${s.score}%`
                      : (lang === 'si' ? 'අලුත්!' : 'New!')}
                </span>
              </span>
              {!locked && (
                <span className="shrink-0 text-xl tracking-tight">
                  {'⭐'.repeat(s.stars)}{'☆'.repeat(3 - s.stars)}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
