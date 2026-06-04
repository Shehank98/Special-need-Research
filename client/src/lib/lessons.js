// Maps a lesson to the route that plays it, based on its type.
export function lessonPath(lesson) {
  if (!lesson) return '/home';
  switch (lesson.type) {
    case 'quiz':
      return `/quiz/${lesson.id}`;
    case 'numbers':
      return `/numbers/${lesson.id}`;
    case 'spelling':
      return `/spelling/${lesson.id}`;
    case 'reading':
    case 'picture_match':
    default:
      return `/lesson/${lesson.id}`;
  }
}

// Display metadata for each disability category.
export const CATEGORY_META = {
  dyslexia: { en: 'Reading', si: 'කියවීම', emoji: '📖', color: 'bg-pastel-blue' },
  dyscalculia: { en: 'Numbers', si: 'ගණිතය', emoji: '🔢', color: 'bg-pastel-green' },
  dysorthographia: { en: 'Spelling', si: 'අක්ෂර වින්‍යාසය', emoji: '✏️', color: 'bg-pastel-purple' },
};
