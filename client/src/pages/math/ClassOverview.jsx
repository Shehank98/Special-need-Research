import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api.js';
import { useLanguage } from '../../context/LanguageContext.jsx';
import Layout from '../../components/Layout.jsx';
import { MATH_MODULES } from '../../lib/mathSyllabus.js';
import { starsFor } from '../../lib/mathLevels.js';

// Flat list of maths topics (activity ids) with their module emoji.
const TOPICS = MATH_MODULES.flatMap((m) =>
  m.topics.filter((t) => t.activity && t.activity !== 'assessment').map((t) => ({ activity: t.activity, en: t.en, si: t.si, emoji: m.emoji }))
);

function cellColor(stars) {
  if (stars === 0) return 'bg-slate-100 text-slate-300';
  if (stars < 3) return 'bg-rose-200 text-rose-800';
  if (stars < 7) return 'bg-amber-200 text-amber-800';
  return 'bg-emerald-300 text-emerald-900';
}

// Class-wide heatmap: students (rows) × topics (columns), cell = stars (0–9).
export default function ClassOverview() {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [matrix, setMatrix] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.teacherMatrix().then(setMatrix).catch((e) => setError(e.message));
  }, []);

  // students -> { name, stars: { activity: totalStars } }
  const students = useMemo(() => {
    if (!matrix) return [];
    const byStudent = {};
    matrix.forEach((r) => {
      byStudent[r.student_id] = byStudent[r.student_id] || { id: r.student_id, name: r.name, stars: {} };
      byStudent[r.student_id].stars[r.activity] = (byStudent[r.student_id].stars[r.activity] || 0) + starsFor(r.score);
    });
    return Object.values(byStudent).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [matrix]);

  if (error) return <Layout><p className="card text-center">{error}</p></Layout>;
  if (!matrix) return <Layout><p className="text-center text-xl">{lang === 'si' ? 'පූරණය…' : 'Loading…'}</p></Layout>;

  return (
    <Layout>
      <div className="space-y-4">
        <button onClick={() => navigate('/teacher')} className="font-semibold text-sky-600">⬅️ {lang === 'si' ? 'පුවරුව' : 'Dashboard'}</button>
        <h1 className="text-3xl font-bold">🗺️ {lang === 'si' ? 'පන්ති දළ විශ්ලේෂණය' : 'Class overview'}</h1>
        <p className="text-sm text-slate-500">{lang === 'si' ? 'සෛලයක් තට්ටු කිරීමෙන් සිසුවා බලන්න · තරු 0–9' : 'Tap a name to open the child · stars 0–9 per topic'}</p>

        {students.length === 0 ? (
          <p className="card">{lang === 'si' ? 'තවම දත්ත නැත' : 'No activity data yet.'}</p>
        ) : (
          <div className="card overflow-x-auto">
            <table className="border-collapse text-sm">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-white p-2 text-left">{lang === 'si' ? 'සිසුවා' : 'Student'}</th>
                  {TOPICS.map((t) => (
                    <th key={t.activity} className="p-1" title={lang === 'si' ? t.si : t.en}>
                      <span className="text-lg">{t.emoji}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id}>
                    <td
                      onClick={() => navigate(`/teacher/student/${s.id}`)}
                      className="sticky left-0 z-10 cursor-pointer bg-white p-2 font-semibold text-sky-700 underline"
                    >
                      {s.name}
                    </td>
                    {TOPICS.map((t) => {
                      const stars = s.stars[t.activity] || 0;
                      return (
                        <td key={t.activity} className="p-0.5">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold ${cellColor(stars)}`} title={`${lang === 'si' ? t.si : t.en}: ${stars}/9`}>
                            {stars || ''}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1"><span className="h-4 w-4 rounded bg-slate-100" /> {lang === 'si' ? 'නැත' : 'none'}</span>
          <span className="flex items-center gap-1"><span className="h-4 w-4 rounded bg-rose-200" /> 1–2</span>
          <span className="flex items-center gap-1"><span className="h-4 w-4 rounded bg-amber-200" /> 3–6</span>
          <span className="flex items-center gap-1"><span className="h-4 w-4 rounded bg-emerald-300" /> 7–9</span>
        </div>
      </div>
    </Layout>
  );
}
