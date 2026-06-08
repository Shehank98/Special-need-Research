import { useLanguage } from '../../context/LanguageContext.jsx';

// Friendly end-of-activity screen with a star rating (1–3) by score.
export default function MathResult({ score, correct, total, onAgain, onHome }) {
  const { t, lang } = useLanguage();
  const stars = score >= 85 ? 3 : score >= 60 ? 2 : 1;
  return (
    <div className="mx-auto max-w-md space-y-5 rounded-3xl bg-white p-8 text-center shadow-lg">
      <div className="text-2xl" aria-hidden="true">
        {'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}
      </div>
      <h2 className="text-3xl font-bold">{lang === 'si' ? 'ඉවරයි!' : 'Great work!'}</h2>
      <p className="text-xl">
        {lang === 'si' ? 'ලකුණු' : 'Score'}: <strong>{score}</strong>
      </p>
      <p className="text-base text-slate-500">
        {correct} / {total} {lang === 'si' ? 'නිවැරදියි' : 'correct'}
      </p>
      <div className="flex gap-3">
        <button onClick={onAgain} className="btn-soft flex-1">🔄 {lang === 'si' ? 'නැවත' : 'Play again'}</button>
        <button onClick={onHome} className="btn-primary flex-1">🏠 {t('backToHome')}</button>
      </div>
    </div>
  );
}
