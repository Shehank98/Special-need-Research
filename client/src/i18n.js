// Minimal bilingual string table. Keys resolve to the active language.
export const STRINGS = {
  appName: { en: 'Read & Play', si: 'කියවමු සෙල්ලම් කරමු' },
  welcome: { en: 'Welcome', si: 'ආයුබෝවන්' },
  login: { en: 'Log in', si: 'ඇතුල් වන්න' },
  logout: { en: 'Log out', si: 'ඉවත් වන්න' },
  yourName: { en: 'Your name', si: 'ඔබේ නම' },
  iAmA: { en: 'I am a', si: 'මම' },
  student: { en: 'Student', si: 'සිසුවෙක්' },
  teacher: { en: 'Teacher', si: 'ගුරුවරයෙක්' },
  teacherPassword: { en: 'Teacher password', si: 'ගුරු මුරපදය' },
  grade: { en: 'Grade', si: 'ශ්‍රේණිය' },
  continueLearning: { en: 'Continue Learning', si: 'ඉගෙනීම දිගටම' },
  weeklyGoal: { en: 'Weekly Goal', si: 'සතිපතා ඉලක්කය' },
  myBadges: { en: 'My Badges', si: 'මගේ ලාංඡන' },
  noBadges: { en: 'No badges yet — finish a lesson to earn one!', si: 'තවම ලාංඡන නැත — එකක් ලබා ගැනීමට පාඩමක් අවසන් කරන්න!' },
  streak: { en: 'day streak', si: 'දින අඛණ්ඩව' },
  lessonsDone: { en: 'lessons done', si: 'පාඩම් අවසන්' },
  listen: { en: 'Listen', si: 'අහන්න' },
  next: { en: 'Next', si: 'ඊළඟ' },
  back: { en: 'Back', si: 'ආපසු' },
  finish: { en: 'Finish', si: 'අවසන් කරන්න' },
  hint: { en: 'Hint', si: 'ඉඟිය' },
  greatJob: { en: 'Great job!', si: 'ඉතා හොඳයි!' },
  tryAgain: { en: 'Try again!', si: 'නැවත උත්සාහ කරන්න!' },
  correct: { en: 'Correct!', si: 'නිවැරදියි!' },
  lessonComplete: { en: 'Lesson Complete!', si: 'පාඩම අවසන්!' },
  yourScore: { en: 'Your score', si: 'ඔබේ ලකුණු' },
  backToHome: { en: 'Back to Home', si: 'මුල් පිටුවට' },
  // Teacher dashboard
  teacherDashboard: { en: 'Teacher Dashboard', si: 'ගුරු පුවරුව' },
  students: { en: 'Students', si: 'සිසුන්' },
  exportCsv: { en: 'Export CSV Report', si: 'CSV වාර්තාව බාගන්න' },
  name: { en: 'Name', si: 'නම' },
  completed: { en: 'Completed', si: 'අවසන්' },
  avgScore: { en: 'Avg Score', si: 'සාමාන්‍ය ලකුණු' },
  timeMin: { en: 'Time (min)', si: 'කාලය (මිනි)' },
  badges: { en: 'Badges', si: 'ලාංඡන' },
  ttsUsed: { en: 'TTS', si: 'හඬ' },
  hintsUsed: { en: 'Hints', si: 'ඉඟි' },
  loginDays: { en: 'Login Days', si: 'පිවිසුම් දින' },
  loading: { en: 'Loading…', si: 'පූරණය වෙමින්…' },
  matchInstruction: { en: 'Match the word to the picture', si: 'වචනය පින්තූරයට ගලපන්න' },
};

export function t(key, lang) {
  const entry = STRINGS[key];
  if (!entry) return key;
  return entry[lang] || entry.en;
}
