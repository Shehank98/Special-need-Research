import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import LanguageToggle from '../components/LanguageToggle.jsx';

export default function Login() {
  const { login, register } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  const [role, setRole] = useState('student');
  const [mode, setMode] = useState('login'); // 'login' | 'register' (teachers)
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const isTeacherRegister = role === 'teacher' && mode === 'register';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      let u;
      if (isTeacherRegister) {
        u = await register({ name, password, invite_code: inviteCode });
      } else {
        u = await login({
          name,
          role,
          language: lang,
          grade: grade ? Number(grade) : null,
          password: role === 'teacher' ? password : undefined,
        });
      }
      navigate(u.role === 'teacher' ? '/teacher' : '/home');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream font-dyslexic text-ink">
      <div className="flex justify-end p-4">
        <LanguageToggle />
      </div>
      <div className="mx-auto flex max-w-md flex-col items-center gap-6 px-4 pt-6">
        <div className="text-center">
          <div className="text-6xl" aria-hidden="true">📚</div>
          <h1 className="mt-2 text-3xl font-bold">{t('appName')}</h1>
        </div>

        <form onSubmit={handleSubmit} className="card w-full space-y-5">
          {/* Role selection as big friendly buttons */}
          <div className="grid grid-cols-2 gap-3">
            {['student', 'teacher'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setRole(r);
                  setMode('login');
                  setError('');
                }}
                className={`btn ${role === r ? 'bg-pastel-green' : 'bg-white/70'} text-ink`}
                aria-pressed={role === r}
              >
                <span aria-hidden="true">{r === 'student' ? '🧒' : '👩‍🏫'}</span>
                {t(r)}
              </button>
            ))}
          </div>

          <label className="block space-y-1">
            <span className="font-semibold">{t('yourName')}</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              className="w-full rounded-2xl border-2 border-pastel-blue bg-white/80 px-4 py-3 text-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
              placeholder={t('yourName')}
            />
          </label>

          {role === 'student' && (
            <label className="block space-y-1">
              <span className="font-semibold">{t('grade')}</span>
              <input
                type="number"
                min="1"
                max="6"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full rounded-2xl border-2 border-pastel-blue bg-white/80 px-4 py-3 text-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
                placeholder="1 - 6"
              />
            </label>
          )}

          {role === 'teacher' && (
            <label className="block space-y-1">
              <span className="font-semibold">
                {isTeacherRegister ? t('password') : t('teacherPassword')}
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={isTeacherRegister ? 'new-password' : 'current-password'}
                className="w-full rounded-2xl border-2 border-pastel-blue bg-white/80 px-4 py-3 text-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
                placeholder="••••••"
              />
            </label>
          )}

          {isTeacherRegister && (
            <label className="block space-y-1">
              <span className="font-semibold">{t('inviteCode')}</span>
              <input
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                required
                className="w-full rounded-2xl border-2 border-pastel-blue bg-white/80 px-4 py-3 text-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
                placeholder={t('inviteCode')}
              />
            </label>
          )}

          {error && <p className="rounded-xl bg-pastel-pink px-4 py-2 font-semibold">{error}</p>}

          <button type="submit" disabled={busy} className="btn-primary w-full text-xl">
            {busy ? t('loading') : isTeacherRegister ? t('register') : t('login')}
          </button>

          {role === 'teacher' && (
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
              }}
              className="w-full text-center font-semibold text-blue-600 underline"
            >
              {mode === 'login' ? t('createAccount') : t('haveAccount')}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
