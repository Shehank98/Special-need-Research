import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext.jsx';
import Layout from '../../components/Layout.jsx';
import { getModule } from '../../lib/mathSyllabus.js';
import { useMathProgress, activityStars } from '../../lib/mathLevels.js';

// A playful "learning road map": each topic is a stop on a winding path.
// Stops unlock in order; stars show progress (0–9 across the 3 levels).
export default function MathModule() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const { map } = useMathProgress();
  const m = getModule(moduleId);
  if (!m) return <Navigate to="/home" replace />;

  // Compute unlock + stars for each topic in order.
  let prevDone = true;
  const stops = m.topics.map((tp, i) => {
    const stars = tp.activity ? activityStars(map, tp.activity) : 0;
    const unlocked = i === 0 || prevDone;
    const done = stars >= 9;
    prevDone = stars > 0; // next unlocks once this one is started
    return { ...tp, stars, unlocked, done, index: i };
  });
  const currentIndex = stops.findIndex((s) => s.unlocked && !s.done);

  return (
    <Layout>
      <div className="space-y-5">
        <button onClick={() => navigate('/home')} className="font-semibold text-sky-600">
          ⬅️ {lang === 'si' ? 'මොඩියුල' : 'All modules'}
        </button>

        {/* Header with floating decorations */}
        <div className={`relative overflow-hidden rounded-3xl ${m.color} p-5 shadow`}>
          <span className="absolute right-4 top-2 animate-float text-3xl" style={{ animationDelay: '0.2s' }}>☁️</span>
          <span className="absolute right-16 top-6 animate-float text-2xl">☁️</span>
          <div className="flex items-center gap-4">
            <span className="animate-wiggle text-5xl" aria-hidden="true">{m.emoji}</span>
            <div>
              <h1 className={`text-2xl font-bold ${m.accent}`}>{lang === 'si' ? m.si : m.en}</h1>
              <p className="text-sm text-slate-500">{lang === 'si' ? 'ඔබේ ඉගෙනුම් මාවත' : 'Your learning road map'}</p>
            </div>
          </div>
        </div>

        {/* The winding path of stops */}
        <div className="relative py-2">
          {/* central dashed spine */}
          <div className="absolute inset-y-0 left-1/2 -ml-px w-0.5 border-l-4 border-dashed border-slate-200" aria-hidden="true" />
          <div className="relative space-y-4">
            {stops.map((s) => {
              const isLeft = s.index % 2 === 0;
              const isCurrent = s.index === currentIndex;
              return (
                <div key={s.id} className={`flex ${isLeft ? 'justify-start' : 'justify-end'}`}>
                  <button
                    onClick={() => s.unlocked && navigate(`/math/play/${s.activity}`)}
                    disabled={!s.unlocked}
                    style={{ animationDelay: `${s.index * 0.06}s` }}
                    className={`animate-fade-up flex w-[48%] items-center gap-3 rounded-2xl border-2 p-3 text-left shadow-sm transition ${
                      !s.unlocked
                        ? 'cursor-not-allowed border-slate-100 bg-slate-50'
                        : isCurrent
                          ? 'border-sky-400 bg-white shadow-lg ring-4 ring-sky-200'
                          : 'border-emerald-200 bg-white hover:-translate-y-0.5 hover:shadow'
                    }`}
                  >
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl font-bold ${
                        !s.unlocked ? 'bg-slate-200 text-slate-400' : s.done ? 'bg-emerald-400 text-white' : 'bg-sky-400 text-white'
                      } ${isCurrent ? 'animate-bounce-in' : ''}`}
                    >
                      {!s.unlocked ? '🔒' : s.done ? '✓' : s.index + 1}
                    </span>
                    <span className="min-w-0">
                      <span className={`block truncate text-sm font-bold ${s.unlocked ? 'text-slate-800' : 'text-slate-400'}`}>
                        {lang === 'si' ? s.si : s.en}
                      </span>
                      {s.unlocked ? (
                        <span className="text-xs text-amber-500">
                          {'⭐'.repeat(Math.min(3, Math.round(s.stars / 3)))}
                          <span className="text-slate-400"> {s.stars}/9</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">{lang === 'si' ? 'අගුළු දමා' : 'Locked'}</span>
                      )}
                    </span>
                    {isCurrent && <span className="ml-auto animate-float text-2xl">🦉</span>}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
