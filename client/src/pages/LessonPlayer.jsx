import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useLanguage } from '../context/LanguageContext.jsx';
import { useTTS } from '../hooks/useTTS.js';
import Layout from '../components/Layout.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import SpeakButton from '../components/SpeakButton.jsx';
import Confetti from '../components/Confetti.jsx';
import BadgeCard from '../components/BadgeCard.jsx';

// Handles both 'reading' and 'picture_match' lesson types.
export default function LessonPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { speak } = useTTS();

  const [lesson, setLesson] = useState(null);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState(null);
  const [matched, setMatched] = useState({}); // picture_match: word -> matched bool
  const [selectedWord, setSelectedWord] = useState(null);
  const startRef = useRef(Date.now());

  useEffect(() => {
    api.lesson(id).then(setLesson).catch(() => {});
    api.logEvent({ event_type: 'lesson_started', metadata: { lesson_id: id } }).catch(() => {});
    startRef.current = Date.now();
  }, [id]);

  if (!lesson) return <Layout><p className="text-center text-xl">{t('loading')}</p></Layout>;

  const content = lesson.content || {};
  const title = lang === 'si' ? lesson.title_si : lesson.title_en;
  const instructions = lang === 'si' ? content.instructions_si : content.instructions_en;

  async function complete(score) {
    const timeSpent = Math.round((Date.now() - startRef.current) / 1000);
    try {
      const res = await api.saveProgress({
        lesson_id: id,
        score,
        time_spent_seconds: timeSpent,
        completed: true,
      });
      setResult(res);
    } catch {
      setResult({ progress: { score }, new_badges: [] });
    }
    setDone(true);
  }

  // ---- Completion screen ----
  if (done) {
    const newBadges = result?.new_badges || [];
    return (
      <Layout>
        <Confetti show />
        <div className="card animate-pop-in space-y-5 text-center">
          <div className="text-6xl" aria-hidden="true">🎉</div>
          <h1 className="text-3xl font-bold">{t('lessonComplete')}</h1>
          <p className="text-2xl">
            {t('yourScore')}: <strong>{result?.progress?.score ?? 100}</strong>
          </p>
          {newBadges.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3">
              {newBadges.map((b) => (
                <BadgeCard key={b.id} badge={{ ...b }} />
              ))}
            </div>
          )}
          <button onClick={() => navigate('/home')} className="btn-primary w-full text-xl">
            🏠 {t('backToHome')}
          </button>
        </div>
      </Layout>
    );
  }

  // ---- Reading lesson ----
  if (content.type === 'reading') {
    const sentences = content.sentences || [];
    const current = sentences[step];
    const text = current ? current[lang] || current.en : '';
    return (
      <Layout>
        <div className="space-y-5">
          <h1 className="text-2xl font-bold">{title}</h1>
          {instructions && (
            <div className="card flex items-center justify-between gap-3">
              <p>{instructions}</p>
              <SpeakButton text={instructions} lang={lang} />
            </div>
          )}
          <ProgressBar value={step + 1} max={sentences.length} />
          <div className="card space-y-5 text-center">
            <p className="text-3xl leading-relaxed">{text}</p>
            <SpeakButton text={text} lang={lang} label={t('listen')} className="mx-auto" />
          </div>
          <div className="flex gap-3">
            {step > 0 && (
              <button onClick={() => setStep((s) => s - 1)} className="btn-soft flex-1">
                ⬅️ {t('back')}
              </button>
            )}
            {step < sentences.length - 1 ? (
              <button onClick={() => setStep((s) => s + 1)} className="btn-primary flex-1">
                {t('next')} ➡️
              </button>
            ) : (
              <button onClick={() => complete(100)} className="btn-primary flex-1">
                {t('finish')} ✅
              </button>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  // ---- Picture match lesson ----
  const items = content.items || [];
  const allMatched = items.length > 0 && items.every((it) => matched[it.word_en]);

  function handleWordTap(item) {
    setSelectedWord(item.word_en);
    speak(lang === 'si' ? item.word_si : item.word_en, lang);
  }
  function handlePicTap(item) {
    if (selectedWord === item.word_en) {
      setMatched((m) => ({ ...m, [item.word_en]: true }));
      setSelectedWord(null);
      speak(t('greatJob'), lang, { log: false });
    } else {
      speak(t('tryAgain'), lang, { log: false });
    }
  }

  return (
    <Layout>
      <div className="space-y-5">
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="card flex items-center justify-between gap-3">
          <p>{instructions || t('matchInstruction')}</p>
          <SpeakButton text={instructions || t('matchInstruction')} lang={lang} />
        </div>
        <ProgressBar value={Object.values(matched).filter(Boolean).length} max={items.length} />

        <div className="grid grid-cols-2 gap-6">
          {/* Words column */}
          <div className="space-y-3">
            {items.map((it) => (
              <button
                key={`w-${it.word_en}`}
                onClick={() => handleWordTap(it)}
                disabled={matched[it.word_en]}
                className={`btn w-full text-xl ${
                  matched[it.word_en]
                    ? 'bg-pastel-green opacity-60'
                    : selectedWord === it.word_en
                      ? 'bg-pastel-yellow ring-4 ring-yellow-300'
                      : 'bg-white/70'
                }`}
              >
                {matched[it.word_en] && '✅ '}
                {lang === 'si' ? it.word_si : it.word_en}
              </button>
            ))}
          </div>
          {/* Pictures column (shuffled order via reverse for a little challenge) */}
          <div className="space-y-3">
            {[...items].reverse().map((it) => (
              <button
                key={`p-${it.word_en}`}
                onClick={() => handlePicTap(it)}
                disabled={matched[it.word_en]}
                className={`btn w-full text-5xl ${
                  matched[it.word_en] ? 'bg-pastel-green opacity-60' : 'bg-white/70'
                }`}
                aria-label={lang === 'si' ? it.word_si : it.word_en}
              >
                {it.emoji || '🖼️'}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => complete(100)}
          disabled={!allMatched}
          className="btn-primary w-full text-xl disabled:opacity-50"
        >
          {t('finish')} ✅
        </button>
      </div>
    </Layout>
  );
}
