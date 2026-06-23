import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import LanguageToggle from './LanguageToggle.jsx';
import MoodCheckIn from './MoodCheckIn.jsx';

// Page shell with a top bar (app name, language toggle, logout).
export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [showMoodEnd, setShowMoodEnd] = useState(false);

  async function finishLogout() {
    await logout();
    navigate('/');
  }

  function handleLogout() {
    // Students get an end-of-session mood check-in (emotional engagement);
    // teachers log out directly.
    if (user?.role === 'student') setShowMoodEnd(true);
    else finishLogout();
  }

  async function handleMoodEnd(value) {
    try {
      await api.logEvent({ event_type: 'mood', activity_type: 'mood', metric_name: 'mood_end', metric_value: value });
    } catch {
      /* best effort */
    }
    setShowMoodEnd(false);
    finishLogout();
  }

  // Children get the dyslexia-friendly font; teachers get a normal typeface.
  const fontClass = user?.role === 'teacher' ? 'ui-normal' : 'font-dyslexic';

  return (
    <div className={`min-h-screen bg-cream text-ink ${fontClass}`}>
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-pastel-purple/80 px-4 py-3 shadow backdrop-blur">
        <button
          onClick={() => navigate(user?.role === 'teacher' ? '/teacher' : '/home')}
          className="flex items-center gap-2 text-lg font-bold sm:text-xl"
        >
          <span aria-hidden="true">📚</span>
          <span>{t('appName')}</span>
        </button>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          {user && (
            <button onClick={handleLogout} className="rounded-full bg-white/70 px-4 py-2 font-semibold shadow hover:brightness-95">
              {t('logout')}
            </button>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
      {showMoodEnd && <MoodCheckIn phase="end" onPick={handleMoodEnd} />}
    </div>
  );
}
