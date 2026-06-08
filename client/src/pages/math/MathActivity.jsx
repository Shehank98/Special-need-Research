import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext.jsx';
import Layout from '../../components/Layout.jsx';
import { findActivity } from '../../lib/mathSyllabus.js';
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
};

export default function MathActivity() {
  const { activityId } = useParams();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const Activity = REGISTRY[activityId];
  const info = findActivity(activityId);

  if (!Activity) return <Navigate to="/home" replace />;

  const title = info ? (lang === 'si' ? info.topic.si : info.topic.en) : '';
  const onHome = () => navigate(info ? `/math/${info.module.id}` : '/home');

  return (
    <Layout>
      <div className="space-y-4">
        <button onClick={onHome} className="font-semibold text-sky-600">⬅️ {lang === 'si' ? 'ආපසු' : 'Back'}</button>
        <h1 className="text-2xl font-bold">{title}</h1>
        <Activity onHome={onHome} activityId={activityId} />
      </div>
    </Layout>
  );
}
