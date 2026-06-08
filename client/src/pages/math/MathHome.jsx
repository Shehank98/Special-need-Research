import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import Layout from '../../components/Layout.jsx';
import { MATH_MODULES } from '../../lib/mathSyllabus.js';

// Professional, child-friendly Grade 4 Maths hub.
export default function MathHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, lang } = useLanguage();

  const name = user?.name || user?.anon_code || '';
  const greeting = lang === 'si' ? `ආයුබෝවන්${name ? ', ' + name : ''}!` : `Hello${name ? ', ' + name : ''}!`;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Hero */}
        <div className="rounded-3xl bg-gradient-to-r from-sky-500 to-indigo-500 p-6 text-white shadow-lg">
          <p className="text-lg opacity-90">{greeting} 👋</p>
          <h1 className="text-3xl font-bold sm:text-4xl">
            {lang === 'si' ? '4 ශ්‍රේණිය ගණිතය' : 'Grade 4 Maths'}
          </h1>
          <p className="mt-1 opacity-90">
            {lang === 'si' ? 'ඉගෙන ගැනීමට මොඩියුලයක් තෝරන්න' : 'Pick a module to start learning'}
          </p>
        </div>

        {/* Module grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MATH_MODULES.map((m) => {
            const ready = m.topics.filter((tp) => tp.activity).length;
            return (
              <button
                key={m.id}
                onClick={() => navigate(`/math/${m.id}`)}
                className={`flex items-center gap-4 rounded-3xl ${m.color} p-5 text-left shadow-md transition hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.99]`}
              >
                <span className="text-5xl" aria-hidden="true">{m.emoji}</span>
                <span className="min-w-0">
                  <span className={`block text-xl font-bold ${m.accent}`}>{lang === 'si' ? m.si : m.en}</span>
                  <span className="block text-sm text-slate-500">
                    {m.topics.length} {lang === 'si' ? 'මාතෘකා' : 'topics'}
                    {ready > 0 && ` · ${ready} ${lang === 'si' ? 'සෙල්ලම්' : 'playable'}`}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer links to existing features */}
        <div className="flex flex-wrap gap-3 pt-2">
          <Link to="/progress" className="rounded-full bg-white px-5 py-2 font-semibold text-slate-700 shadow">
            📈 {lang === 'si' ? 'මගේ ප්‍රගතිය' : 'My Progress'}
          </Link>
          <Link to="/badges" className="rounded-full bg-white px-5 py-2 font-semibold text-slate-700 shadow">
            🏆 {t('myBadges')}
          </Link>
        </div>
      </div>
    </Layout>
  );
}
