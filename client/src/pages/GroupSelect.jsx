import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import Layout from '../components/Layout.jsx';
import { GROUP_KEYS, GROUP_META, groupKeyOf } from '../lib/groups.js';

// Teacher landing: pick a research group ("path"). Each card shows how many
// students are in it; clicking opens that group's student list, where the
// teacher can move students between the two paths.
export default function GroupSelect() {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.teacherReport().then(setReport).catch((e) => setError(e.message));
  }, []);

  const counts = useMemo(() => {
    const c = { intervention: 0, control: 0, unassigned: 0 };
    (report || []).forEach((r) => { c[groupKeyOf(r.study_group)] += 1; });
    return c;
  }, [report]);

  if (error) return <Layout><p className="card text-center">{error}</p></Layout>;
  if (!report) return <Layout><p className="text-center text-xl">{t('loading')}</p></Layout>;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">👩‍🏫 {t('chooseGroup')}</h1>
            <p className="text-ink/70">{t('groupsIntro')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => navigate('/teacher/dashboard')} className="btn-soft">
              📊 {t('fullReport')}
            </button>
            <button onClick={() => navigate('/teacher/overview')} className="btn-soft">
              🗺️ {lang === 'si' ? 'පන්ති දළ විශ්ලේෂණය' : 'Class overview'}
            </button>
            <button onClick={() => navigate('/teacher/lessons')} className="btn-soft">
              📚 {t('manageLessons')}
            </button>
          </div>
        </div>

        {/* Big group cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          {GROUP_KEYS.map((key) => {
            const meta = GROUP_META[key];
            const count = counts[key];
            return (
              <button
                key={key}
                onClick={() => navigate(`/teacher/group/${key}`)}
                className={`group flex flex-col items-start gap-3 rounded-3xl bg-gradient-to-br ${meta.gradient}
                            p-6 text-left text-white shadow-lg transition hover:scale-[1.03] active:scale-95
                            focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300`}
              >
                <span className="text-5xl" aria-hidden="true">{meta.emoji}</span>
                <span className="text-2xl font-bold">{t(meta.labelKey)}</span>
                <span className="text-sm opacity-90">{t(meta.descKey)}</span>
                <span className="mt-2 rounded-full bg-white/25 px-4 py-1 text-lg font-bold">
                  {count} {t('studentsCount')}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
