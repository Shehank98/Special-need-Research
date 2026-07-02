import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext.jsx';
import LanguageToggle from '../components/LanguageToggle.jsx';
import { api } from '../api.js';

// Guardian progress-tracking view. A parent or guardian enters the child's login
// code and sees a read-only summary of progress and engagement, so they can
// follow the child's development outside the classroom (see proposal Purpose and
// Section 3.5.4). No account is required, consistent with the code-based access
// used for the children's own login.
export default function GuardianView() {
  const { lang } = useLanguage();
  const [code, setCode] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const MOODS = ['😢', '🙁', '😐', '🙂', '😄'];
  const moodFace = (v) => (v == null ? '—' : MOODS[Math.max(0, Math.min(4, Math.round(v) - 1))]);

  async function lookup(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    setData(null);
    try {
      const res = await api.guardianSummary(code.trim());
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const s = data?.summary;

  return (
    <div className="min-h-screen bg-cream font-dyslexic text-ink">
      <div className="flex items-center justify-between p-4">
        <Link to="/" className="font-semibold text-sky-600">⬅️ {lang === 'si' ? 'ප්‍රවේශය' : 'Sign in'}</Link>
        <LanguageToggle />
      </div>

      <div className="mx-auto max-w-lg space-y-6 px-4 pb-10">
        <div className="text-center">
          <div className="text-5xl" aria-hidden="true">👨‍👩‍👧</div>
          <h1 className="mt-2 text-2xl font-bold">
            {lang === 'si' ? 'දෙමාපිය ප්‍රගති නිරීක්ෂණය' : 'Guardian Progress Tracker'}
          </h1>
          <p className="mt-1 text-slate-500">
            {lang === 'si'
              ? 'ඔබේ දරුවාගේ ප්‍රගතිය බැලීමට ඔවුන්ගේ කේතය ඇතුළත් කරන්න.'
              : 'Enter your child’s code to see their progress.'}
          </p>
        </div>

        <form onSubmit={lookup} className="card flex gap-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            className="min-w-0 flex-1 rounded-2xl border-2 border-pastel-blue bg-white/80 px-4 py-3 text-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
            placeholder={lang === 'si' ? 'දරුවාගේ කේතය' : 'Child code'}
          />
          <button type="submit" disabled={busy} className="btn-primary shrink-0 px-5 text-lg">
            {busy ? '…' : lang === 'si' ? 'බලන්න' : 'View'}
          </button>
        </form>

        {error && <p className="rounded-xl bg-pastel-pink px-4 py-2 font-semibold">{error}</p>}

        {data && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">
              {data.student.name || (lang === 'si' ? 'දරුවා' : 'Learner')}
              {data.student.grade ? <span className="ml-2 text-base text-slate-400">{lang === 'si' ? `${data.student.grade} ශ්‍රේණිය` : `Grade ${data.student.grade}`}</span> : null}
            </h2>

            {/* Summary cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Stat label={lang === 'si' ? 'සම්පූර්ණ කළ' : 'Activities done'} value={s.activities_completed} />
              <Stat label={lang === 'si' ? 'ජය ගත් මට්ටම්' : 'Levels mastered'} value={s.levels_mastered} />
              <Stat label={lang === 'si' ? 'සාමාන්‍ය ලකුණු' : 'Average score'} value={`${s.average_score}%`} />
              <Stat label={lang === 'si' ? 'ඉගෙනුම් මිනිත්තු' : 'Minutes learning'} value={s.total_minutes} />
              <Stat label={lang === 'si' ? 'ක්‍රියාකාරී දින' : 'Active days'} value={s.active_days} />
              <Stat label={lang === 'si' ? 'ලාංඡන' : 'Badges'} value={s.badges} />
            </div>

            {/* Mood trend */}
            <div className="card flex items-center justify-between">
              <span className="font-semibold">{lang === 'si' ? 'හැඟීම් (ආරම්භය → අවසානය)' : 'Mood (start → end)'}</span>
              <span className="text-2xl">{moodFace(data.mood.start)} → {moodFace(data.mood.end)}</span>
            </div>

            {/* Recent activity */}
            {data.recent.length > 0 && (
              <div className="card space-y-2">
                <h3 className="font-bold">{lang === 'si' ? 'මෑත ක්‍රියාකාරකම්' : 'Recent activities'}</h3>
                <ul className="space-y-1">
                  {data.recent.map((r, i) => (
                    <li key={i} className="flex justify-between text-sm">
                      <span>{lang === 'si' ? r.title_si || r.title_en : r.title_en}</span>
                      <span className="font-semibold text-emerald-600">{r.score}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-center text-xs text-slate-400">
              {lang === 'si'
                ? 'මෙය කියවීමට පමණි. විස්තර සඳහා ගුරුතුමිය හමුවන්න.'
                : 'This view is read-only. Please contact the teacher for more detail.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl bg-white p-4 text-center shadow-sm">
      <div className="text-2xl font-bold text-sky-700">{value}</div>
      <div className="mt-1 text-xs font-semibold text-slate-500">{label}</div>
    </div>
  );
}
