import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext.jsx';
import Layout from '../../components/Layout.jsx';
import { getModule } from '../../lib/mathSyllabus.js';

export default function MathModule() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const m = getModule(moduleId);
  if (!m) return <Navigate to="/home" replace />;

  return (
    <Layout>
      <div className="space-y-5">
        <button onClick={() => navigate('/home')} className="font-semibold text-sky-600">
          ⬅️ {lang === 'si' ? 'මොඩියුල' : 'All modules'}
        </button>

        <div className={`flex items-center gap-4 rounded-3xl ${m.color} p-5 shadow`}>
          <span className="text-5xl" aria-hidden="true">{m.emoji}</span>
          <h1 className={`text-3xl font-bold ${m.accent}`}>{lang === 'si' ? m.si : m.en}</h1>
        </div>

        <div className="space-y-3">
          {m.topics.map((tp) => {
            const playable = !!tp.activity;
            return (
              <button
                key={tp.id}
                onClick={() => playable && navigate(`/math/play/${tp.activity}`)}
                disabled={!playable}
                className={`flex w-full items-center justify-between gap-3 rounded-2xl border-2 p-4 text-left shadow-sm transition ${
                  playable
                    ? 'border-sky-200 bg-white hover:border-sky-400 hover:shadow active:scale-[0.99]'
                    : 'cursor-default border-slate-100 bg-slate-50'
                }`}
              >
                <span className={`text-lg font-semibold ${playable ? 'text-slate-800' : 'text-slate-400'}`}>
                  {lang === 'si' ? tp.si : tp.en}
                </span>
                {playable ? (
                  <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700">
                    ▶ {lang === 'si' ? 'සෙල්ලම්' : 'Play'}
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full bg-slate-200 px-3 py-1 text-sm font-semibold text-slate-500">
                    {lang === 'si' ? 'ඉක්මනින්' : 'Coming soon'}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
