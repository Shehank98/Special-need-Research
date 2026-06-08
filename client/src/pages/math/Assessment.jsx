import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api.js';
import { useLanguage } from '../../context/LanguageContext.jsx';

const r = (n) => Math.floor(Math.random() * n);
const shuffle = (a) => a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map((p) => p[1]);

// Labels for each assessed area (key also = activity id to practise).
const AREAS = {
  place_value: { en: 'Place Value', si: 'ස්ථානීය අගය' },
  addition: { en: 'Addition', si: 'එකතු කිරීම' },
  subtraction: { en: 'Subtraction', si: 'අඩු කිරීම' },
  times_tables: { en: 'Times Tables', si: 'ගුණන වගු' },
  division: { en: 'Division', si: 'බෙදීම' },
  fractions: { en: 'Fractions', si: 'භාග' },
  clock: { en: 'Time', si: 'වේලාව' },
  shop: { en: 'Money', si: 'මුදල්' },
  shapes: { en: 'Shapes', si: 'හැඩතල' },
  bar_chart: { en: 'Data', si: 'දත්ත' },
};

// Build 3 numeric options including the correct answer.
function numOpts(correct, spread = 5) {
  const set = new Set([correct]);
  while (set.size < 3) {
    const d = correct + (r(2) ? 1 : -1) * (1 + r(spread));
    if (d >= 0) set.add(d);
  }
  return shuffle([...set]).map((v) => ({ text: String(v), correct: v === correct }));
}

// One MCQ generator per area: returns { area, prompt_en, prompt_si, options }.
const GEN = {
  place_value() {
    const n = 1000 + r(9000);
    const places = ['thousands', 'hundreds', 'tens', 'ones'];
    const placesSi = ['දහස්', 'සිය', 'දස', 'එක'];
    const idx = r(4);
    const digit = Number(String(n)[idx]);
    return { area: 'place_value', prompt_en: `In ${n}, which digit is in the ${places[idx]} place?`, prompt_si: `${n} හි ${placesSi[idx]} ස්ථානයේ ඉලක්කම කුමක්ද?`, options: numOpts(digit, 4) };
  },
  addition() {
    const a = 100 + r(800); const b = 100 + r(800);
    return { area: 'addition', prompt_en: `${a} + ${b} = ?`, prompt_si: `${a} + ${b} = ?`, options: numOpts(a + b, 9) };
  },
  subtraction() {
    const a = 300 + r(600); const b = 100 + r(a - 100);
    return { area: 'subtraction', prompt_en: `${a} − ${b} = ?`, prompt_si: `${a} − ${b} = ?`, options: numOpts(a - b, 9) };
  },
  times_tables() {
    const a = [2, 3, 4, 5, 6, 8, 10][r(7)]; const b = 1 + r(10);
    return { area: 'times_tables', prompt_en: `${a} × ${b} = ?`, prompt_si: `${a} × ${b} = ?`, options: numOpts(a * b, 6) };
  },
  division() {
    const div = [2, 3, 4, 5][r(4)]; const q = 2 + r(8);
    return { area: 'division', prompt_en: `${div * q} ÷ ${div} = ?`, prompt_si: `${div * q} ÷ ${div} = ?`, options: numOpts(q, 4) };
  },
  fractions() {
    const pairs = [['1/2', '1/4'], ['1/2', '1/3'], ['3/4', '1/4'], ['2/3', '1/3']];
    const [big, small] = pairs[r(pairs.length)];
    return { area: 'fractions', prompt_en: 'Which fraction is bigger?', prompt_si: 'වැඩි භාගය කුමක්ද?', options: shuffle([{ text: big, correct: true }, { text: small, correct: false }]) };
  },
  clock() {
    const facts = [['How many minutes in one hour?', 'පැයක මිනිත්තු කීයද?', 60], ['How many hours in one day?', 'දිනක පැය කීයද?', 24], ['How many days in a week?', 'සතියක දින කීයද?', 7]];
    const [en, si, ans] = facts[r(facts.length)];
    return { area: 'clock', prompt_en: en, prompt_si: si, options: numOpts(ans, 6) };
  },
  shop() {
    const paid = [50, 100, 200][r(3)]; const price = 10 + r(paid - 10);
    return { area: 'shop', prompt_en: `Pay Rs.${paid} for an item costing Rs.${price}. Change?`, prompt_si: `Rs.${price} වටිනා දෙයකට Rs.${paid} ගෙවයි. ඉතිරිය?`, options: numOpts(paid - price, 10).map((o) => ({ ...o, text: `Rs. ${o.text}` })) };
  },
  shapes() {
    const facts = [['How many sides does a triangle have?', 'ත්‍රිකෝණයකට පැති කීයද?', 3], ['How many sides does a square have?', 'චතුරස්‍රයකට පැති කීයද?', 4], ['How many corners does a rectangle have?', 'සෘජුකෝණාස්‍රයකට කොන් කීයද?', 4]];
    const [en, si, ans] = facts[r(facts.length)];
    return { area: 'shapes', prompt_en: en, prompt_si: si, options: numOpts(ans, 3) };
  },
  bar_chart() {
    const apples = 3 + r(6); const bananas = 1 + r(apples - 1);
    return { area: 'bar_chart', prompt_en: `Apples: ${apples}, Bananas: ${bananas}. How many more apples?`, prompt_si: `ඇපල්: ${apples}, කෙසෙල්: ${bananas}. ඇපල් කීයක් වැඩිද?`, options: numOpts(apples - bananas, 4) };
  },
};

const buildTest = () => shuffle(Object.keys(GEN)).slice(0, 8).map((a) => GEN[a]());

export default function Assessment({ onHome, activityId }) {
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState(buildTest);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [done, setDone] = useState(false);
  const startRef = useRef(Date.now());
  const sentRef = useRef(false);

  const q = questions[step];
  const correctCount = answers.filter(Boolean).length;
  const score = Math.round((correctCount / questions.length) * 100);

  const breakdown = useMemo(() => {
    const byArea = {};
    questions.forEach((qq, i) => {
      byArea[qq.area] = byArea[qq.area] || { correct: 0, total: 0 };
      byArea[qq.area].total += 1;
      if (answers[i]) byArea[qq.area].correct += 1;
    });
    return byArea;
  }, [questions, answers]);

  // Persist overall result + per-area scores once, when finished.
  useEffect(() => {
    if (!done || sentRef.current) return;
    sentRef.current = true;
    api.mathResult({ activity: activityId, score, correct: correctCount, total: questions.length, time_spent_seconds: Math.round((Date.now() - startRef.current) / 1000) }).catch(() => {});
    Object.entries(breakdown).forEach(([area, v]) => {
      api.logEvent({ event_type: 'completion', activity_type: area, metric_name: 'assess_score', metric_value: Math.round((v.correct / v.total) * 100) }).catch(() => {});
    });
  }, [done, activityId, score, correctCount, questions.length, breakdown]);

  function answer(opt) {
    const next = [...answers];
    next[step] = !!opt.correct;
    setAnswers(next);
    if (step < questions.length - 1) setStep((s) => s + 1);
    else setDone(true);
  }

  function restart() {
    setQuestions(buildTest());
    setStep(0); setAnswers([]); setDone(false);
    sentRef.current = false;
    startRef.current = Date.now();
  }

  if (done) {
    const stars = score >= 85 ? 3 : score >= 60 ? 2 : 1;
    const weak = Object.entries(breakdown).filter(([, v]) => v.correct / v.total < 0.6).map(([a]) => a);
    return (
      <div className="mx-auto max-w-md space-y-4 rounded-3xl bg-white p-6 text-center shadow-lg">
        <div className="text-2xl">{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</div>
        <h2 className="text-3xl font-bold">{lang === 'si' ? 'තක්සේරුව අවසන්' : 'Assessment done'}</h2>
        <p className="text-xl">{lang === 'si' ? 'ලකුණු' : 'Score'}: <strong>{score}</strong> ({correctCount}/{questions.length})</p>

        <div className="space-y-2 text-left">
          {Object.entries(breakdown).map(([area, v]) => {
            const pct = Math.round((v.correct / v.total) * 100);
            const low = pct < 60;
            return (
              <div key={area} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">{lang === 'si' ? AREAS[area]?.si : AREAS[area]?.en}</span>
                  <span className={low ? 'font-bold text-rose-600' : 'text-emerald-600'}>{v.correct}/{v.total}</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${low ? 'bg-rose-400' : 'bg-emerald-400'}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        {weak.length > 0 ? (
          <div className="space-y-2 text-left">
            <p className="font-semibold text-rose-700">⚠️ {lang === 'si' ? 'පුහුණු විය යුතු' : 'Practise these'}:</p>
            <div className="flex flex-wrap gap-2">
              {weak.map((area) => (
                <button key={area} onClick={() => navigate(`/math/play/${area}`)} className="rounded-full bg-rose-100 px-4 py-2 text-sm font-bold text-rose-700">
                  {lang === 'si' ? AREAS[area]?.si : AREAS[area]?.en} →
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="font-semibold text-emerald-700">🌟 {lang === 'si' ? 'සියලු මාතෘකා හොඳයි!' : 'Strong across all topics!'}</p>
        )}

        <div className="flex gap-3">
          <button onClick={restart} className="btn-soft flex-1">🔄 {lang === 'si' ? 'නැවත' : 'Again'}</button>
          <button onClick={onHome} className="btn-primary flex-1">🏠 {lang === 'si' ? 'ආපසු' : 'Done'}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-rose-400 transition-all" style={{ width: `${(step / questions.length) * 100}%` }} />
      </div>
      <p className="text-center text-sm font-semibold text-slate-400">
        {lang === 'si' ? 'ප්‍රශ්නය' : 'Question'} {step + 1} / {questions.length}
      </p>
      <div className="rounded-2xl bg-rose-50 p-6 text-center">
        <p className="text-2xl font-bold">{lang === 'si' ? q.prompt_si : q.prompt_en}</p>
      </div>
      <div className="mx-auto grid max-w-md grid-cols-1 gap-3">
        {q.options.map((opt, i) => (
          <button key={i} onClick={() => answer(opt)} className="rounded-2xl bg-white py-5 text-2xl font-bold shadow transition hover:bg-rose-50 active:scale-95">
            {opt.text}
          </button>
        ))}
      </div>
      <p className="text-center text-xs text-slate-400">{lang === 'si' ? 'පරීක්ෂණය අතරතුර ප්‍රතිචාර නැත — ප්‍රතිඵල අවසානයේ' : 'No feedback during the test — results at the end'}</p>
    </div>
  );
}
