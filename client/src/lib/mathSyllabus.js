// Grade 4 Mathematics syllabus — module + topic structure (frontend content).
// `activity` points at a built interactive; null topics render a "Coming soon"
// card so the full syllabus is visible and navigable.

export const MATH_MODULES = [
  {
    id: 'numbers',
    en: 'Numbers',
    si: 'සංඛ්‍යා',
    emoji: '🔢',
    color: 'bg-sky-100',
    accent: 'text-sky-700',
    topics: [
      { id: 'read-write', en: 'Read & Write Numbers to 10,000', si: 'සංඛ්‍යා කියවීම හා ලිවීම', activity: null },
      { id: 'place-value', en: 'Place Value', si: 'ස්ථානීය අගය', activity: 'place_value' },
      { id: 'order', en: 'Order Numbers', si: 'සංඛ්‍යා පිළිවෙළට සැකසීම', activity: null },
      { id: 'patterns', en: 'Number Patterns', si: 'සංඛ්‍යා රටා', activity: null },
      { id: 'multiples', en: 'Multiples & Counting', si: 'ගුණාකාර හා ගණන් කිරීම', activity: null },
      { id: 'fractions', en: 'Fractions', si: 'භාග', activity: 'fractions' },
      { id: 'roman', en: 'Roman Numerals', si: 'රෝම ඉලක්කම්', activity: null },
    ],
  },
  {
    id: 'arithmetic',
    en: 'Arithmetic',
    si: 'අංක ගණිතය',
    emoji: '➕',
    color: 'bg-emerald-100',
    accent: 'text-emerald-700',
    topics: [
      { id: 'addition', en: 'Addition with Carrying', si: 'එකතු කිරීම (රැගෙන යාම)', activity: 'addition' },
      { id: 'subtraction', en: 'Subtraction with Borrowing', si: 'අඩු කිරීම (ණයට ගැනීම)', activity: 'subtraction' },
      { id: 'times-tables', en: 'Multiplication Tables', si: 'ගුණන වගු', activity: 'times_tables' },
      { id: 'division', en: 'Division', si: 'බෙදීම', activity: 'division' },
    ],
  },
  {
    id: 'measurement',
    en: 'Measurement',
    si: 'මිනුම්',
    emoji: '📏',
    color: 'bg-amber-100',
    accent: 'text-amber-700',
    topics: [
      { id: 'time', en: 'Telling the Time', si: 'වේලාව කීම', activity: 'clock' },
      { id: 'capacity', en: 'Capacity (L & ml)', si: 'ධාරිතාව', activity: null },
      { id: 'length', en: 'Length (cm & m)', si: 'දිග', activity: null },
      { id: 'weight', en: 'Weight (g & kg)', si: 'බර', activity: null },
      { id: 'area', en: 'Area', si: 'වර්ගඵලය', activity: null },
    ],
  },
  {
    id: 'money',
    en: 'Money',
    si: 'මුදල්',
    emoji: '💰',
    color: 'bg-pink-100',
    accent: 'text-pink-700',
    topics: [
      { id: 'currency', en: 'Notes & Coins', si: 'නෝට්ටු සහ කාසි', activity: null },
      { id: 'calc', en: 'Money Calculations', si: 'මුදල් ගණනය', activity: null },
      { id: 'shop', en: 'Virtual Shop', si: 'අතථ්‍ය වෙළඳසැල', activity: 'shop' },
      { id: 'receipts', en: 'Bills & Receipts', si: 'බිල්පත්', activity: null },
    ],
  },
  {
    id: 'geometry',
    en: 'Geometry',
    si: 'ජ්‍යාමිතිය',
    emoji: '🔷',
    color: 'bg-violet-100',
    accent: 'text-violet-700',
    topics: [
      { id: 'shapes', en: '2D & 3D Shapes', si: 'හැඩතල', activity: 'shapes' },
      { id: 'faces', en: 'Faces, Edges & Corners', si: 'මුහුණත්, දාර', activity: null },
      { id: 'angles', en: 'Right Angles', si: 'සෘජු කෝණ', activity: null },
      { id: 'directions', en: 'Directions (N/S/E/W)', si: 'දිශාවන්', activity: null },
    ],
  },
  {
    id: 'data',
    en: 'Data Handling',
    si: 'දත්ත හැසිරවීම',
    emoji: '📊',
    color: 'bg-teal-100',
    accent: 'text-teal-700',
    topics: [
      { id: 'tables', en: 'Read Tables', si: 'වගු කියවීම', activity: null },
      { id: 'bar', en: 'Bar Charts', si: 'තීරු සටහන්', activity: 'bar_chart' },
      { id: 'picto', en: 'Picture Graphs', si: 'පින්තූර ප්‍රස්තාර', activity: null },
    ],
  },
  {
    id: 'assessment',
    en: 'Assessment',
    si: 'තක්සේරුව',
    emoji: '📝',
    color: 'bg-rose-100',
    accent: 'text-rose-700',
    topics: [
      { id: 'topic-quiz', en: 'Topic Quizzes', si: 'මාතෘකා ප්‍රශ්නාවලි', activity: null },
      { id: 'unit-test', en: 'End-of-Unit Tests', si: 'ඒකක අවසන් පරීක්ෂණ', activity: null },
    ],
  },
];

export function getModule(id) {
  return MATH_MODULES.find((m) => m.id === id) || null;
}

// Activity id -> the module/topic it belongs to (for back navigation).
export function findActivity(activityId) {
  for (const m of MATH_MODULES) {
    const topic = m.topics.find((tp) => tp.activity === activityId);
    if (topic) return { module: m, topic };
  }
  return null;
}
