import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getToken, BASE } from '../api.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { CATEGORY_META } from '../lib/lessons.js';
import Layout from '../components/Layout.jsx';

const FLAG_LABELS = {
  struggling: 'flagStruggling',
  not_started: 'flagNotStarted',
  hint_reliant: 'flagHintReliant',
  inactive: 'flagInactive',
};

// Colour a score cell: red < 60, amber 60-84, green 85+.
function scoreColor(score, done) {
  if (!done) return 'text-ink/30';
  if (score < 60) return 'text-red-600 font-bold';
  if (score < 85) return 'text-amber-600 font-semibold';
  return 'text-emerald-600 font-semibold';
}

export default function TeacherDashboard() {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.teacherReport().then(setReport).catch((e) => setError(e.message));
  }, []);

  // Sort students so those needing attention float to the top.
  const sorted = useMemo(() => {
    if (!report) return [];
    return [...report].sort((a, b) => {
      if (a.needs_attention !== b.needs_attention) return a.needs_attention ? -1 : 1;
      return (a.avg_score || 0) - (b.avg_score || 0);
    });
  }, [report]);

  const summary = useMemo(() => {
    if (!report || report.length === 0) return null;
    const active = report.filter((r) => Number(r.lessons_completed) > 0).length;
    const needHelp = report.filter((r) => r.needs_attention).length;
    const scored = report.filter((r) => Number(r.lessons_completed) > 0);
    const avg = scored.length
      ? Math.round(scored.reduce((s, r) => s + Number(r.avg_score || 0), 0) / scored.length)
      : 0;
    return { total: report.length, active, needHelp, avg };
  }, [report]);

  async function downloadCsv() {
    try {
      const res = await fetch(`${BASE}/api/teacher/report?format=csv`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'research_report.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message);
    }
  }

  if (error) return <Layout><p className="card text-center">{error}</p></Layout>;
  if (!report) return <Layout><p className="text-center text-xl">{t('loading')}</p></Layout>;

  const cats = ['dyslexia', 'dyscalculia', 'dysorthographia'];

  return (
    <Layout>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">👩‍🏫 {t('teacherDashboard')}</h1>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => navigate('/teacher/lessons')} className="btn-soft">
              📚 {t('manageLessons')}
            </button>
            <button onClick={downloadCsv} className="btn-primary">
              ⬇️ {t('exportCsv')}
            </button>
          </div>
        </div>

        {/* Overview cards */}
        {summary && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="card text-center">
              <p className="text-3xl font-bold">{summary.total}</p>
              <p className="text-sm text-ink/70">{t('students')}</p>
            </div>
            <div className="card text-center">
              <p className="text-3xl font-bold">{summary.active}</p>
              <p className="text-sm text-ink/70">{t('activeStudents')}</p>
            </div>
            <div className="card text-center">
              <p className="text-3xl font-bold">{summary.avg}</p>
              <p className="text-sm text-ink/70">{t('avgScoreAll')}</p>
            </div>
            <div className={`card text-center ${summary.needHelp > 0 ? 'bg-pastel-pink' : ''}`}>
              <p className="text-3xl font-bold">{summary.needHelp}</p>
              <p className="text-sm text-ink/70">{t('needHelp')}</p>
            </div>
          </div>
        )}

        {/* Per-student table with per-skill scores + attention flags */}
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-base">
            <thead>
              <tr className="border-b-2 border-pastel-purple">
                <th className="p-2">{t('name')}</th>
                <th className="p-2">{t('grade')}</th>
                {cats.map((c) => (
                  <th key={c} className="p-2 text-center" title={CATEGORY_META[c][lang] || CATEGORY_META[c].en}>
                    {CATEGORY_META[c].emoji}
                  </th>
                ))}
                <th className="p-2">{t('timeMin')}</th>
                <th className="p-2">{t('hintsUsed')}</th>
                <th className="p-2">{t('badges')}</th>
                <th className="p-2">{t('needsAttention')}</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => (
                <tr
                  key={r.student_id}
                  onClick={() => navigate(`/teacher/student/${r.student_id}`)}
                  className={`cursor-pointer border-b border-pastel-purple/40 hover:bg-sky-50 ${r.needs_attention ? 'bg-pastel-pink/40' : ''}`}
                >
                  <td className="p-2 font-semibold text-sky-700 underline">{r.name}</td>
                  <td className="p-2">{r.grade ?? '—'}</td>
                  {cats.map((c) => {
                    const cat = r.categories?.[c] || { done: 0, avg_score: 0 };
                    return (
                      <td key={c} className={`p-2 text-center ${scoreColor(cat.avg_score, cat.done)}`}>
                        {cat.done ? `${cat.avg_score}%` : '—'}
                        <span className="block text-xs text-ink/50">{cat.done}✅</span>
                      </td>
                    );
                  })}
                  <td className="p-2">{Math.round((r.total_time_seconds || 0) / 60)}</td>
                  <td className="p-2">{r.hint_used}</td>
                  <td className="p-2">{r.badge_count}</td>
                  <td className="p-2">
                    {r.needs_attention ? (
                      <div className="flex flex-wrap gap-1">
                        {r.flags.map((f, i) => (
                          <span key={i} className="rounded-full bg-red-200 px-2 py-0.5 text-xs font-semibold text-red-800">
                            {f.area ? `${CATEGORY_META[f.area]?.emoji || ''} ` : ''}
                            {t(FLAG_LABELS[f.type] || 'needsAttention')}
                            {f.type === 'inactive' && f.days != null ? ` ${f.days}d` : ''}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="rounded-full bg-emerald-200 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                        ✓ {t('allGood')}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {report.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-4 text-center text-ink/60">No student data yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <p className="text-sm text-ink/60">
          {cats.map((c) => `${CATEGORY_META[c].emoji} ${CATEGORY_META[c][lang] || CATEGORY_META[c].en}`).join('   ·   ')}
        </p>
      </div>
    </Layout>
  );
}
