import { useEffect, useMemo, useState, Fragment } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { api } from '../api.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import Layout from '../components/Layout.jsx';
import { MATH_MODULES } from '../lib/mathSyllabus.js';
import { starsFor } from '../lib/mathLevels.js';

const MOOD_FACE = ['', '😢', '🙁', '😐', '🙂', '😄'];

// Score → cell colour.
function cell(score) {
  if (score == null) return 'text-slate-300';
  if (score < 60) return 'text-rose-600 font-bold';
  if (score < 85) return 'text-amber-600 font-semibold';
  return 'text-emerald-600 font-semibold';
}

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [rating, setRating] = useState({ attention_1to5: 3, participation_1to5: 3, frustration_1to5: 2, notes: '' });
  const [saved, setSaved] = useState(false);
  const [codeBusy, setCodeBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  function load() {
    api.teacherStudent(id).then(setData).catch((e) => setError(e.message));
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  async function generateCode(hasCode) {
    if (hasCode && !window.confirm(
      lang === 'si'
        ? 'නව කේතයක් සෑදුවහොත් පැරණි කේතය තවදුරටත් ක්‍රියා නොකරයි (දරුවාගේ පිවිසුම ද වෙනස් වේ). දිගටම කරන්නද?'
        : 'Making a new code will stop the old one working (it is also the child’s login). Continue?'
    )) return;
    setCodeBusy(true);
    try {
      const res = await api.teacherSetCode({ student_id: id });
      setData((d) => ({ ...d, student: { ...d.student, anon_code: res.anon_code } }));
    } catch (e) {
      setError(e.message);
    } finally {
      setCodeBusy(false);
    }
  }

  function copyCode(code) {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => {});
  }

  // Map activity -> { 1:score, 2:score, 3:score } for the level grid.
  const byActivity = useMemo(() => {
    const m = {};
    (data?.math || []).forEach((r) => {
      m[r.activity] = m[r.activity] || {};
      m[r.activity][r.level] = r.score;
    });
    return m;
  }, [data]);

  // All maths topics from the syllabus (activity ids) grouped by module.
  const moduleTopics = useMemo(
    () => MATH_MODULES.map((mod) => ({
      ...mod,
      topics: mod.topics.filter((t) => t.activity && t.activity !== 'assessment'),
    })).filter((mod) => mod.topics.length),
    []
  );

  async function submitRating(e) {
    e.preventDefault();
    try {
      await api.teacherRate({ student_id: id, ...rating });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      setRating({ attention_1to5: 3, participation_1to5: 3, frustration_1to5: 2, notes: '' });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  function exportCsv() {
    const esc = (v) => {
      const x = v == null ? '' : String(v);
      return /[",\n]/.test(x) ? `"${x.replace(/"/g, '""')}"` : x;
    };
    const lines = [];
    const sn = data.student.anon_code || data.student.name || id;
    lines.push(`Student,${esc(sn)}`);
    lines.push(`Group,${esc(data.student.study_group || '')}`);
    lines.push(`Difficulty,${esc(data.student.difficulty_type || '')}`);
    lines.push(`Completed,${data.totals.completed},Avg score,${data.totals.avg_score},Total time (s),${data.totals.total_time}`);
    lines.push('');
    lines.push('activity,level,score,attempts,time_spent_seconds');
    data.math.forEach((m) => lines.push(`${esc(m.activity)},${m.level},${m.score},${m.attempts},${m.time_spent_seconds}`));
    lines.push('');
    lines.push('rating_date,attention,participation,frustration,notes');
    data.ratings.forEach((r) => lines.push(`${esc(new Date(r.created_at).toISOString())},${r.attention_1to5},${r.participation_1to5},${r.frustration_1to5},${esc(r.notes)}`));
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student_${sn}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (error) return <Layout><p className="card text-center">{error}</p></Layout>;
  if (!data) return <Layout><p className="text-center text-xl">{lang === 'si' ? 'පූරණය…' : 'Loading…'}</p></Layout>;

  const s = data.student;
  const name = s.anon_code || s.name || '—';
  const totalStars = Object.values(byActivity).reduce(
    (sum, lv) => sum + [1, 2, 3].reduce((a, l) => a + (lv[l] != null ? starsFor(lv[l]) : 0), 0),
    0
  );

  return (
    <Layout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/teacher')} className="font-semibold text-sky-600">⬅️ {lang === 'si' ? 'සිසුන්' : 'All students'}</button>
          <button onClick={exportCsv} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow">⬇️ {lang === 'si' ? 'CSV බාගන්න' : 'Export CSV'}</button>
        </div>

        {/* Header */}
        <div className="rounded-3xl bg-gradient-to-r from-indigo-500 to-sky-500 p-5 text-white shadow">
          <h1 className="text-3xl font-bold">🧒 {name}</h1>
          <p className="mt-1 text-sm opacity-90">
            {s.study_group ? `${s.study_group} · ` : ''}{s.difficulty_type || '—'}{s.grade ? ` · Grade ${s.grade}` : ''}{s.age ? ` · age ${s.age}` : ''}
          </p>
        </div>

        {/* Child code — the code the student logs in with and a guardian enters at /guardian. */}
        <div className="card space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-500">
                🔑 {lang === 'si' ? 'දරුවාගේ කේතය (පිවිසුම හා දෙමාපිය ප්‍රවේශය)' : 'Child code (login & guardian access)'}
              </p>
              {s.anon_code ? (
                <p className="text-2xl font-bold tracking-widest text-indigo-700">{s.anon_code}</p>
              ) : (
                <p className="text-slate-400">{lang === 'si' ? 'තවම කේතයක් නැත' : 'No code yet'}</p>
              )}
            </div>
            <div className="flex gap-2">
              {s.anon_code && (
                <button onClick={() => copyCode(s.anon_code)} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow">
                  {copied ? '✓ ' + (lang === 'si' ? 'පිටපත් විය' : 'Copied') : '📋 ' + (lang === 'si' ? 'පිටපත්' : 'Copy')}
                </button>
              )}
              <button onClick={() => generateCode(!!s.anon_code)} disabled={codeBusy} className="btn-primary px-4 py-2 text-sm disabled:opacity-50">
                {codeBusy ? '…' : s.anon_code ? (lang === 'si' ? '🔄 නැවත සාදන්න' : '🔄 Regenerate') : (lang === 'si' ? '➕ කේතය සාදන්න' : '➕ Generate code')}
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            {lang === 'si'
              ? 'දෙමාපියන්ට මෙම කේතය දී, පිවිසුම් තිරයේ "දෙමාපියෙක්ද?" හරහා ප්‍රගතිය බැලිය හැක.'
              : 'Give this code to the guardian; they can view progress from the sign-in screen via “A guardian?”.'}
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ['✅', data.totals.completed, lang === 'si' ? 'සම්පූර්ණ' : 'Completed'],
            ['📊', `${data.totals.avg_score}%`, lang === 'si' ? 'සාමාන්‍යය' : 'Avg score'],
            ['⭐', totalStars, lang === 'si' ? 'තරු' : 'Stars'],
            ['⏱️', `${Math.round((data.totals.total_time || 0) / 60)}m`, lang === 'si' ? 'කාලය' : 'Time'],
          ].map(([icon, val, label]) => (
            <div key={label} className="card text-center">
              <div className="text-2xl">{icon}</div>
              <p className="text-2xl font-bold">{val}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Per-topic level grid */}
        <div className="card overflow-x-auto">
          <h2 className="mb-3 text-xl font-bold">{lang === 'si' ? 'මාතෘකා අනුව මට්ටම්' : 'Levels by topic'}</h2>
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b-2 border-slate-200 text-slate-500">
                <th className="p-2">{lang === 'si' ? 'මාතෘකාව' : 'Topic'}</th>
                <th className="p-2 text-center">L1</th>
                <th className="p-2 text-center">L2</th>
                <th className="p-2 text-center">L3</th>
                <th className="p-2 text-center">⭐</th>
              </tr>
            </thead>
            <tbody>
              {moduleTopics.map((mod) => (
                <Fragment key={mod.id}>
                  <tr className={`${mod.color}`}>
                    <td colSpan={5} className={`p-1 px-2 text-xs font-bold ${mod.accent}`}>{mod.emoji} {lang === 'si' ? mod.si : mod.en}</td>
                  </tr>
                  {mod.topics.map((t) => {
                    const lv = byActivity[t.activity] || {};
                    const stars = [1, 2, 3].reduce((a, l) => a + (lv[l] != null ? starsFor(lv[l]) : 0), 0);
                    return (
                      <tr key={t.activity} className="border-b border-slate-100">
                        <td className="p-2 font-semibold text-slate-700">{lang === 'si' ? t.si : t.en}</td>
                        {[1, 2, 3].map((l) => (
                          <td key={l} className={`p-2 text-center ${cell(lv[l] ?? null)}`}>{lv[l] != null ? `${lv[l]}%` : '–'}</td>
                        ))}
                        <td className="p-2 text-center text-amber-500">{stars}/9</td>
                      </tr>
                    );
                  })}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Response-time analytics: how long this student takes to answer */}
        <div className="card">
          <h2 className="mb-2 text-lg font-bold">⏱️ {lang === 'si' ? 'පිළිතුරු කාලය' : 'Response time'}</h2>
          {!data.response_times || data.response_times.overall.n === 0 ? (
            <p className="text-sm text-slate-400">{lang === 'si' ? 'දත්ත නැත' : 'No data yet'}</p>
          ) : (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xl font-bold">{(data.response_times.overall.avg_ms / 1000).toFixed(1)}s</p>
                  <p className="text-xs text-slate-500">{lang === 'si' ? 'සාමාන්‍ය' : 'Average'}</p>
                </div>
                <div>
                  <p className="text-xl font-bold">{(data.response_times.overall.median_ms / 1000).toFixed(1)}s</p>
                  <p className="text-xs text-slate-500">{lang === 'si' ? 'මධ්‍යස්ථ' : 'Median'}</p>
                </div>
                <div>
                  <p className="text-xl font-bold">{data.response_times.overall.n}</p>
                  <p className="text-xs text-slate-500">{lang === 'si' ? 'පිළිතුරු' : 'Answers'}</p>
                </div>
              </div>
              {data.response_times.trend?.first_avg_ms != null && data.response_times.trend?.recent_avg_ms != null && (
                <p className="text-xs text-slate-500">
                  {lang === 'si' ? 'මුල් 20' : 'First 20'}: {(data.response_times.trend.first_avg_ms / 1000).toFixed(1)}s →{' '}
                  {lang === 'si' ? 'මෑත 20' : 'Recent 20'}: {(data.response_times.trend.recent_avg_ms / 1000).toFixed(1)}s
                </p>
              )}
              {data.response_times.by_activity.length > 0 && (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="p-1">{lang === 'si' ? 'ක්‍රියාකාරකම' : 'Activity'}</th>
                      <th className="p-1 text-center">{lang === 'si' ? 'සාමාන්‍ය' : 'Avg'}</th>
                      <th className="p-1 text-center">{lang === 'si' ? 'නිවැරදි' : 'Accuracy'}</th>
                      <th className="p-1 text-center">n</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.response_times.by_activity.map((a) => (
                      <tr key={a.activity_type} className="border-b border-slate-100">
                        <td className="p-1 font-semibold text-slate-700">{a.activity_type}</td>
                        <td className="p-1 text-center">{(a.avg_ms / 1000).toFixed(1)}s</td>
                        <td className="p-1 text-center">{a.accuracy_pct != null ? `${a.accuracy_pct}%` : '–'}</td>
                        <td className="p-1 text-center">{a.n}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* Mood trend + engagement */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="card">
            <h2 className="mb-2 text-lg font-bold">🙂 {lang === 'si' ? 'මනෝභාවය' : 'Mood trend'}</h2>
            {data.mood.length === 0 ? (
              <p className="text-sm text-slate-400">{lang === 'si' ? 'දත්ත නැත' : 'No data yet'}</p>
            ) : (
              <div className="flex flex-wrap gap-1 text-2xl">
                {data.mood.slice().reverse().map((m, i) => <span key={i} title={m.metric_name}>{MOOD_FACE[m.metric_value] || '·'}</span>)}
              </div>
            )}
          </div>
          <div className="card">
            <h2 className="mb-2 text-lg font-bold">⚡ {lang === 'si' ? 'සහභාගීත්වය' : 'Engagement'}</h2>
            <ul className="space-y-1 text-sm text-slate-600">
              <li>🔊 TTS: {data.engagement.tts_used || 0}</li>
              <li>💡 {lang === 'si' ? 'ඉඟි' : 'Hints'}: {data.engagement.hint_used || 0}</li>
              <li>📝 {lang === 'si' ? 'පිළිතුරු' : 'Answers'}: {data.engagement.quiz_answered || 0}</li>
              <li>📅 {lang === 'si' ? 'පිවිසුම් දින' : 'Login days'}: {data.sessions.login_days || 0} · {data.sessions.minutes || 0}m</li>
              <li>🏆 {lang === 'si' ? 'ලාංඡන' : 'Badges'}: {data.badges.length}</li>
            </ul>
          </div>
        </div>

        {/* Teacher rubric (same for both groups) */}
        <div className="card space-y-3">
          <h2 className="text-lg font-bold">👩‍🏫 {lang === 'si' ? 'ගුරු ඇගයීම' : 'Teacher rating'}</h2>
          <form onSubmit={submitRating} className="space-y-3">
            {[
              ['attention_1to5', lang === 'si' ? 'අවධානය' : 'Attention'],
              ['participation_1to5', lang === 'si' ? 'සහභාගීත්වය' : 'Participation'],
              ['frustration_1to5', lang === 'si' ? 'කලකිරීම' : 'Frustration'],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center justify-between gap-3">
                <span className="font-semibold text-slate-600">{label}</span>
                <span className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setRating((r) => ({ ...r, [key]: n }))}
                      className={`h-9 w-9 rounded-full font-bold ${rating[key] === n ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {n}
                    </button>
                  ))}
                </span>
              </label>
            ))}
            <textarea value={rating.notes} onChange={(e) => setRating((r) => ({ ...r, notes: e.target.value }))}
              placeholder={lang === 'si' ? 'සටහන්…' : 'Notes…'} rows={2}
              className="w-full rounded-xl border-2 border-slate-200 p-2 text-sm" />
            <button type="submit" className="btn-primary">{saved ? '✅' : ''} {lang === 'si' ? 'ඇගයීම සුරකින්න' : 'Save rating'}</button>
          </form>

          {data.ratings.length > 0 && (
            <div className="space-y-1 border-t pt-2 text-sm text-slate-600">
              {data.ratings.slice(0, 5).map((r, i) => (
                <div key={i} className="flex flex-wrap gap-3">
                  <span>📅 {new Date(r.created_at).toLocaleDateString()}</span>
                  <span>👁️ {r.attention_1to5}</span>
                  <span>🙋 {r.participation_1to5}</span>
                  <span>😤 {r.frustration_1to5}</span>
                  {r.notes && <span className="italic">“{r.notes}”</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
