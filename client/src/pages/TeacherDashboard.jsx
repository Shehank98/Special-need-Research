import { useEffect, useState } from 'react';
import { api, getToken, BASE } from '../api.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import Layout from '../components/Layout.jsx';

export default function TeacherDashboard() {
  const { t } = useLanguage();
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.teacherReport().then(setReport).catch((e) => setError(e.message));
  }, []);

  // CSV endpoint needs the auth header, so fetch as a blob and trigger download.
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

  return (
    <Layout>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">👩‍🏫 {t('teacherDashboard')}</h1>
          <button onClick={downloadCsv} className="btn-primary">
            ⬇️ {t('exportCsv')}
          </button>
        </div>

        <p className="text-base text-ink/70">
          {report.length} {t('students')}
        </p>

        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left text-base">
            <thead>
              <tr className="border-b-2 border-pastel-purple">
                <th className="p-2">{t('name')}</th>
                <th className="p-2">{t('grade')}</th>
                <th className="p-2">{t('completed')}</th>
                <th className="p-2">{t('avgScore')}</th>
                <th className="p-2">{t('timeMin')}</th>
                <th className="p-2">{t('ttsUsed')}</th>
                <th className="p-2">{t('hintsUsed')}</th>
                <th className="p-2">{t('badges')}</th>
                <th className="p-2">{t('loginDays')}</th>
              </tr>
            </thead>
            <tbody>
              {report.map((r) => (
                <tr key={r.student_id} className="border-b border-pastel-purple/40">
                  <td className="p-2 font-semibold">{r.name}</td>
                  <td className="p-2">{r.grade ?? '—'}</td>
                  <td className="p-2">{r.lessons_completed}</td>
                  <td className="p-2">{r.avg_score}</td>
                  <td className="p-2">{Math.round((r.total_time_seconds || 0) / 60)}</td>
                  <td className="p-2">{r.tts_used}</td>
                  <td className="p-2">{r.hint_used}</td>
                  <td className="p-2">{r.badge_count}</td>
                  <td className="p-2">{r.login_days}</td>
                </tr>
              ))}
              {report.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-4 text-center text-ink/60">
                    No student data yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
