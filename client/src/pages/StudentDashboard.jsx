import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useTTS } from '../hooks/useTTS.js';
import Layout from '../components/Layout.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import BadgeCard from '../components/BadgeCard.jsx';
import SpeakButton from '../components/SpeakButton.jsx';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const { speak } = useTTS();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  function startNext() {
    const lesson = data?.next_lesson;
    if (!lesson) return;
    navigate(lesson.type === 'quiz' ? `/quiz/${lesson.id}` : `/lesson/${lesson.id}`);
  }

  if (error) return <Layout><p className="card text-center">{error}</p></Layout>;
  if (!data) return <Layout><p className="text-center text-xl">{t('loading')}</p></Layout>;

  const greeting = lang === 'si' ? `ආයුබෝවන්, ${user.name}!` : `Welcome, ${user.name}!`;

  return (
    <Layout>
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
