import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import Layout from '../components/Layout.jsx';
import BadgeCard from '../components/BadgeCard.jsx';

// Catalogue of every badge so students can see what's left to earn.
const ALL = [
  { badge_type: 'first_lesson', label_en: 'First Lesson', label_si: 'පළමු පාඩම', emoji: '🌟' },
  { badge_type: 'streak_3', label_en: '3-Day Streak', label_si: 'දින 3 අඛණ්ඩව', emoji: '🔥' },
  { badge_type: 'perfect_score', label_en: 'Perfect Score', label_si: 'පරිපූර්ණ ලකුණු', emoji: '💯' },
  { badge_type: 'speed_star', label_en: 'Speed Star', label_si: 'වේග තරුව', emoji: '⚡' },
  { badge_type: 'helper', label_en: 'Helper', label_si: 'උපකාරකයා', emoji: '🤝' },
];

export default function Badges() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [earned, setEarned] = useState([]);

  useEffect(() => {
    api.badges(user.id).then(setEarned).catch(() => {});
  }, [user.id]);

  const earnedTypes = new Set(earned.map((b) => b.badge_type));

  return (
    <Layout>
      <h1 className="mb-5 text-3xl font-bold">🏆 {t('myBadges')}</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {ALL.map((b) => {
          const isEarned = earnedTypes.has(b.badge_type);
          return (
            <div
              key={b.badge_type}
              className={isEarned ? '' : 'opacity-40 grayscale'}
              title={isEarned ? 'Earned' : 'Locked'}
            >
              <BadgeCard badge={b} />
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
