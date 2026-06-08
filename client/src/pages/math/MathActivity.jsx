import { useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext.jsx';
import Layout from '../../components/Layout.jsx';
import TeachIntro from '../../components/math/TeachIntro.jsx';
import { findActivity } from '../../lib/mathSyllabus.js';
import { TEACH } from '../../lib/mathTeach.js';
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
  const { lang } = useLanguage();
  const Activity = REGISTRY[activityId];
  const generator = GENERATORS[activityId];
  const info = findActivity(activityId);
  const teachSteps = TEACH[activityId];
  // Show the teaching intro first; the game starts when the child is ready.
  const [phase, setPhase] = useState(teachSteps ? 'learn' : 'play');

  if (!Activity && !generator) return <Navigate to="/home" replace />;

  const title = info ? (lang === 'si' ? info.topic.si : info.topic.en) : '';
  const onHome = () => navigate(info ? `/math/${info.module.id}` : '/home');

  return (
    <Layout>
      <div className="space-y-4">
        <button onClick={onHome} className="font-semibold text-sky-600">⬅️ {lang === 'si' ? 'ආපසු' : 'Back'}</button>
        <h1 className="text-2xl font-bold">{title}</h1>
        {phase === 'learn' ? (
          <TeachIntro steps={teachSteps} onStart={() => setPhase('play')} />
        ) : Activity ? (
          <Activity onHome={onHome} activityId={activityId} />
        ) : (
          <QuizGame activityId={activityId} generate={generator} />
        )}
      </div>
    </Layout>
  );
}
