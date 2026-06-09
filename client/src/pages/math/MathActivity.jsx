import { useState } from 'react';
import { useParams, useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext.jsx';
import Layout from '../../components/Layout.jsx';
import TeachIntro from '../../components/math/TeachIntro.jsx';
import LevelSelect from '../../components/math/LevelSelect.jsx';
import { findActivity } from '../../lib/mathSyllabus.js';
import { TEACH } from '../../lib/mathTeach.js';
import { useMathProgress } from '../../lib/mathLevels.js';
import PlaceValue from './PlaceValue.jsx';
import Addition from './Addition.jsx';
import Subtraction from './Subtraction.jsx';
import TimesTables from './TimesTables.jsx';
import Division from './Division.jsx';
import Clock from './Clock.jsx';
import Fractions from './Fractions.jsx';
import Shapes from './Shapes.jsx';
import Shop from './Shop.jsx';
import BarChart from './BarChart.jsx';
import Assessment from './Assessment.jsx';
import QuizGame from './QuizGame.jsx';
import { GENERATORS } from '../../lib/mathGenerators.js';

const REGISTRY = {
  place_value: PlaceValue,
  addition: Addition,
  subtraction: Subtraction,
  times_tables: TimesTables,
  division: Division,
  clock: Clock,
  fractions: Fractions,
  shapes: Shapes,
  shop: Shop,
  bar_chart: BarChart,
  assessment: Assessment,
};

export default function MathActivity() {
  const { activityId } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { lang } = useLanguage();
  const Activity = REGISTRY[activityId];
  const generator = GENERATORS[activityId];
  const info = findActivity(activityId);
  const teachSteps = TEACH[activityId];
  const { map, reload } = useMathProgress();

  // Flow: learn -> choose level -> play. (Assessment has no levels.)
  const hasLevels = activityId !== 'assessment';
  const [phase, setPhase] = useState(teachSteps ? 'learn' : hasLevels ? 'levels' : 'play');
  const [level, setLevel] = useState(Number(params.get('level')) || 1);

  if (!Activity && !generator) return <Navigate to="/home" replace />;

  const title = info ? (lang === 'si' ? info.topic.si : info.topic.en) : '';
  const onHome = () => navigate(info ? `/math/${info.module.id}` : '/home');
  // After a game finishes, refresh progress so stars/unlocks update.
  const onFinish = () => reload();

  function afterLearn() {
    setPhase(hasLevels ? 'levels' : 'play');
  }
  function startLevel(lvl) {
    setLevel(lvl);
    setPhase('play');
  }

  return (
    <Layout>
      <div className="space-y-4">
        <button onClick={onHome} className="font-semibold text-sky-600">⬅️ {lang === 'si' ? 'ආපසු' : 'Back'}</button>
        <h1 className="text-2xl font-bold">
          {title}
          {phase === 'play' && hasLevels && (
            <span className="ml-2 align-middle text-base font-semibold text-slate-400">
              · {lang === 'si' ? `මට්ටම ${level}` : `Level ${level}`}
            </span>
          )}
        </h1>

        {phase === 'learn' && (
          <TeachIntro steps={teachSteps} onStart={afterLearn} />
        )}

        {phase === 'levels' && (
          <LevelSelect activity={activityId} map={map} onPick={startLevel} />
        )}

        {phase === 'play' && (
          Activity ? (
            <Activity onHome={onHome} activityId={activityId} level={level} onFinish={onFinish} />
          ) : (
            <QuizGame activityId={activityId} generate={generator} level={level} onFinish={onFinish} />
          )
        )}
      </div>
    </Layout>
  );
}
