import { useLanguage } from '../context/LanguageContext.jsx';

// Displays a single earned badge.
export default function BadgeCard({ badge }) {
  const { lang } = useLanguage();
  const label = lang === 'si' ? badge.label_si : badge.label_en;
  return (
    <div className="flex w-28 flex-col items-center gap-1 rounded-2xl bg-pastel-yellow p-3 text-center shadow">
      <span className="text-4xl" aria-hidden="true">{badge.emoji || '🏅'}</span>
      <span className="text-sm font-semibold leading-tight">{label}</span>
    </div>
  );
}
