import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, getSession } from '../api.js';
import MoodCheckIn from '../components/MoodCheckIn.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useTTS } from '../hooks/useTTS.js';
import Layout from '../components/Layout.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import BadgeCard from '../components/BadgeCard.jsx';
import SpeakButton from '../components/SpeakButton.jsx';
import { lessonPath, CATEGORY_META } from '../lib/lessons.js';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const { speak } = useTTS();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [error, setError] = useState('');
  // Start-of-session mood check-in: once per session.
  const session = getSession();
  const moodKey = session?.id ? `mood_start_${session.id}` : null;
  const [showMoodStart, setShowMoodStart] = useState(
    () => !!moodKey && !localStorage.getItem(moodKey)
  );

  async function handleMoodStart(value) {
    try {
      await api.logEvent({ event_type: 'mood', activity_type: 'mood', metric_name: 'mood_start', metric_value: value });
    } catch {
      /* best effort */
    }
    if (moodKey) localStorage.setItem(moodKey, '1');
    setShowMoodStart(false);
  }

  useEffect(() => {
    let greeted = false;
    api
      .dashboard(user.id)
      .then((d) => {
        setData(d);
        if (!greeted) {
          const greeting =
            lang === 'si' ? `ආයුබෝවන් ${user.name}` : `Welcome ${user.name}`;
          // Small delay so voices have loaded.
          setTimeout(() => speak(greeting, lang, { log: false }), 400);
          greeted = true;
        }
      })
      .catch((e) => setError(e.message));
    // Load lessons + progress to power the per-skill cards.
    Promise.all([api.lessons(), api.progress(user.id)])
      .then(([ls, prog]) => {
        setLessons(ls);
        setCompletedIds(new Set(prog.filter((p) => p.completed).map((p) => p.lesson_id)));
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  function startNext() {
    if (data?.next_lesson) navigate(lessonPath(data.next_lesson));
  }

  // First not-yet-completed lesson in a category (by difficulty).
  function nextInCategory(category) {
    return lessons.find((l) => l.category === category && !completedIds.has(l.id)) || null;
  }
  function startCategory(category) {
    const lesson = nextInCategory(category);
    if (lesson) navigate(lessonPath(lesson));
  }

  if (error) return <Layout><p className="card text-center">{error}</p></Layout>;
  if (!data) return <Layout><p className="text-center text-xl">{t('loading')}</p></Layout>;

  const greeting = lang === 'si' ? `ආයුබෝවන්, ${user.name}!` : `Welcome, ${user.name}!`;

  return (
    <Layout>
      {showMoodStart && <MoodCheckIn phase="start" onPick={handleMoodStart} />}
      <div className="space-y-6">
        {/* Greeting */}
        <div className="card flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold sm:text-3xl">{greeting} 👋</h1>
          <SpeakButton text={greeting} lang={lang} />
        </div>

        {/* Weekly goal */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">🎯 {t('weeklyGoal')}</h2>
            <span className="font-semibold">
              {data.weekly_completed} / {data.weekly_goal}
            </span>
          </div>
          <ProgressBar value={data.weekly_completed} max={data.weekly_goal} />
          <div className="flex flex-wrap gap-4 pt-1 text-base">
            <span>🔥 {data.streak_days} {t('streak')}</span>
            <span>✅ {data.total_completed} {t('lessonsDone')}</span>
          </div>
        </div>

        {/* Continue learning */}
        <button onClick={startNext} disabled={!data.next_lesson} className="btn-primary w-full text-2xl">
          ▶️ {t('continueLearning')}
        </button>
        {data.next_lesson && (
          <p className="text-center text-base text-ink/70">
            {lang === 'si' ? data.next_lesson.title_si : data.next_lesson.title_en}
          </p>
        )}

        {/* Choose a skill to practise (3 disability areas) */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold">🌈 {t('chooseSkill')}</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {Object.entries(CATEGORY_META).map(([cat, meta]) => {
              const next = nextInCategory(cat);
              const total = lessons.filter((l) => l.category === cat).length;
              const doneCount = lessons.filter((l) => l.category === cat && completedIds.has(l.id)).length;
              return (
                <button
                  key={cat}
                  onClick={() => startCategory(cat)}
                  disabled={!next}
                  className={`card flex flex-col items-center gap-2 text-center ${meta.color} disabled:opacity-50`}
                >
                  <span className="text-5xl" aria-hidden="true">{meta.emoji}</span>
                  <span className="text-lg font-bold">{lang === 'si' ? meta.si : meta.en}</span>
                  <span className="text-sm text-ink/70">{doneCount}/{total} ✅</span>
                  <span className="text-sm font-semibold">{next ? `▶️ ${t('play')}` : `🎉 ${t('allDone')}`}</span>
                </button>
              );
            })}
          </div>
          <button onClick={() => navigate('/writing')} className="card mt-3 flex w-full items-center justify-center gap-2 bg-pastel-pink text-lg font-bold">
            ✍️ {t('writing')}
          </button>
        </div>

        {/* Badges */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">🏆 {t('myBadges')}</h2>
            <Link to="/badges" className="font-semibold text-blue-600 underline">
              {t('badges')}
            </Link>
          </div>
          {data.badges.length === 0 ? (
            <p className="text-base text-ink/70">{t('noBadges')}</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {data.badges.map((b) => (
                <BadgeCard key={b.id} badge={b} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
