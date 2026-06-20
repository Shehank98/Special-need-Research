import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { api } from '../api.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import Layout from '../components/Layout.jsx';
import { GROUP_KEYS, GROUP_META, groupKeyOf } from '../lib/groups.js';

// Score colour: red < 60, amber 60-84, green 85+.
function scoreColor(score, done) {
  if (!done) return 'text-ink/30';
  if (score < 60) return 'text-red-600 font-bold';
  if (score < 85) return 'text-amber-600 font-semibold';
  return 'text-emerald-600 font-semibold';
}

// Students within one research group ("path"). The teacher can open a child's
// detail or move them to another path with one tap.
export default function GroupStudents() {
  const { group } = useParams();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  function load() {
    api.teacherReport().then(setReport).catch((e) => setError(e.message));
  }
  useEffect(() => { load(); }, []);

  // Guard against an unknown group in the URL.
  const validGroup = GROUP_KEYS.includes(group);
  const rows = useMemo(
    () => (report || []).filter((r) => groupKeyOf(r.study_group) === group),
    [report, group]
  );

  if (!validGroup) return <Navigate to="/teacher" replace />;

  async function move(studentId, targetKey) {
    setBusyId(studentId);
    try {
      await api.teacherSetGroup({
        student_id: studentId,
        study_group: targetKey === 'unassigned' ? null : targetKey,
      });
      // Reflect the move immediately, then refresh totals.
      setReport((prev) =>
        (prev || []).map((r) =>
          r.student_id === studentId
            ? { ...r, study_group: targetKey === 'unassigned' ? null : targetKey }
            : r
        )
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusyId(null);
    }
  }

  if (error) return <Layout><p className="card text-center">{error}</p></Layout>;
  if (!report) return <Layout><p className="text-center text-xl">{t('loading')}</p></Layout>;

  const meta = GROUP_META[group];
  // Where this student can be moved to (the other paths).
  const targets = GROUP_KEYS.filter((k) => k !== group);

  return (
    <Layout>
      <div className="space-y-5">
        <button onClick={() => navigate('/teacher')} className="font-semibold text-sky-600">
          ⬅️ {t('backToGroups')}
        </button>

        <div className={`rounded-3xl bg-gradient-to-r ${meta.gradient} p-5 text-white shadow`}>
          <h1 className="text-3xl font-bold">{meta.emoji} {t(meta.labelKey)}</h1>
          <p className="mt-1 text-sm opacity-90">{t(meta.descKey)} · {rows.length} {t('studentsCount')}</p>
        </div>

        {rows.length === 0 ? (
          <p className="card text-center text-ink/60">{t('noStudentsInGroup')}</p>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-base">
              <thead>
                <tr className="border-b-2 border-pastel-purple">
                  <th className="p-2">{t('name')}</th>
                  <th className="p-2">{t('grade')}</th>
                  <th className="p-2 text-center">{t('completed')}</th>
                  <th className="p-2 text-center">{t('avgScore')}</th>
                  <th className="p-2">{t('needsAttention')}</th>
                  <th className="p-2">{t('moveTo')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.student_id}
                    onClick={() => navigate(`/teacher/student/${r.student_id}`)}
                    className={`cursor-pointer border-b border-pastel-purple/40 hover:bg-sky-50 ${r.needs_attention ? 'bg-pastel-pink/40' : ''}`}
                  >
                    <td className="p-2 font-semibold text-sky-700 underline">
                      {r.anon_code || r.name || '—'}
                    </td>
                    <td className="p-2">{r.grade ?? '—'}</td>
                    <td className="p-2 text-center">{r.lessons_completed}</td>
                    <td className={`p-2 text-center ${scoreColor(r.avg_score, r.lessons_completed)}`}>
                      {r.lessons_completed ? `${r.avg_score}%` : '—'}
                    </td>
                    <td className="p-2">
                      {r.needs_attention ? (
                        <span className="rounded-full bg-red-200 px-2 py-0.5 text-xs font-semibold text-red-800">
                          ⚠️ {t('needsAttention')}
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-200 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                          ✓ {t('allGood')}
                        </span>
                      )}
                    </td>
                    <td className="p-2" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-wrap gap-1">
                        {targets.map((k) => (
                          <button
                            key={k}
                            onClick={() => move(r.student_id, k)}
                            disabled={busyId === r.student_id}
                            className={`rounded-full px-3 py-1 text-xs font-semibold shadow-sm transition
                                        hover:brightness-95 active:scale-95 disabled:opacity-50 ${GROUP_META[k].soft}`}
                          >
                            {GROUP_META[k].emoji} {t(GROUP_META[k].labelKey)}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
