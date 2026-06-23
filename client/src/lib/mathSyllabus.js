// Grade 4 Mathematics syllabus — module + topic structure (frontend content).
// `activity` points at a built interactive; null topics render a "Coming soon"
// card so the full syllabus is visible and navigable.

export const MATH_MODULES = [
  {
    id: 'foundations',
    en: 'Number Foundations',
    si: 'සංඛ්‍යා පදනම',
    emoji: '🌱',
    color: 'bg-lime-100',
    accent: 'text-lime-700',
    // Pre-mathematics building blocks for Dyscalculia learners. Start here:
    // a readiness check, then counting, numeral recognition, words, comparing,
    // ordering and the meaning of the maths signs — before any arithmetic.
    topics: [
      { id: 'readiness', en: 'Readiness Check', si: 'සූදානම් පරීක්ෂාව', activity: 'foundations_check' },
      { id: 'count-objects', en: 'Count the Objects', si: 'වස්තූන් ගණන් කිරීම', activity: 'count_objects' },
      { id: 'number-recognition', en: 'Find the Number', si: 'අංකය හඳුනා ගැනීම', activity: 'number_recognition' },
      { id: 'number-words', en: 'Number Words', si: 'අංක වචන', activity: 'number_words' },
      { id: 'compare-quantity', en: 'More or Fewer', si: 'වැඩි හෝ අඩු', activity: 'compare_quantity' },
      { id: 'number-order', en: 'Before & After', si: 'පෙර හා පසු', activity: 'number_order' },
      { id: 'maths-signs', en: 'Maths Signs', si: 'ගණිත ලකුණු', activity: 'symbols' },
    ],
  },
  {
    id: 'numbers',
    en: 'Numbers',
    si: 'සංඛ්‍යා',
    emoji: '🔢',
    color: 'bg-sky-100',
    accent: 'text-sky-700',
    topics: [
      { id: 'read-write', en: 'Read & Write Numbers to 10,000', si: 'සංඛ්‍යා කියවීම හා ලිවීම', activity: 'read_write' },
      { id: 'place-value', en: 'Place Value', si: 'ස්ථානීය අගය', activity: 'place_value' },
      { id: 'order', en: 'Order Numbers', si: 'සංඛ්‍යා පිළිවෙළට සැකසීම', activity: 'order' },
      { id: 'patterns', en: 'Number Patterns', si: 'සංඛ්‍යා රටා', activity: 'patterns' },
      { id: 'multiples', en: 'Multiples & Counting', si: 'ගුණාකාර හා ගණන් කිරීම', activity: 'multiples' },
      { id: 'fractions', en: 'Fractions', si: 'භාග', activity: 'fractions' },
      { id: 'roman', en: 'Roman Numerals', si: 'රෝම ඉලක්කම්', activity: 'roman' },
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
      { id: 'set-time', en: 'Set the Clock', si: 'ඔරලෝසුව සකසන්න', activity: 'set_clock' },
      { id: 'capacity', en: 'Capacity (L & ml)', si: 'ධාරිතාව', activity: 'capacity' },
      { id: 'length', en: 'Length (cm & m)', si: 'දිග', activity: 'length' },
      { id: 'weight', en: 'Weight (g & kg)', si: 'බර', activity: 'weight' },
      { id: 'area', en: 'Area', si: 'වර්ගඵලය', activity: 'area' },
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
      { id: 'currency', en: 'Notes & Coins', si: 'නෝට්ටු සහ කාසි', activity: 'currency' },
      { id: 'calc', en: 'Money Calculations', si: 'මුදල් ගණනය', activity: 'calc' },
      { id: 'shop', en: 'Virtual Shop', si: 'අතථ්‍ය වෙළඳසැල', activity: 'shop' },
      { id: 'receipts', en: 'Bills & Receipts', si: 'බිල්පත්', activity: 'receipts' },
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
      { id: 'faces', en: 'Faces, Edges & Corners', si: 'මුහුණත්, දාර', activity: 'faces' },
      { id: 'angles', en: 'Right Angles', si: 'සෘජු කෝණ', activity: 'angles' },
      { id: 'directions', en: 'Directions (N/S/E/W)', si: 'දිශාවන්', activity: 'directions' },
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
      { id: 'tables', en: 'Read Tables', si: 'වගු කියවීම', activity: 'tables' },
      { id: 'bar', en: 'Bar Charts', si: 'තීරු සටහන්', activity: 'bar_chart' },
      { id: 'picto', en: 'Picture Graphs', si: 'පින්තූර ප්‍රස්තාර', activity: 'picto' },
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
      { id: 'topic-quiz', en: 'Mixed Quiz', si: 'මිශ්‍ර ප්‍රශ්නාවලිය', activity: 'assessment' },
      { id: 'unit-test', en: 'End-of-Unit Test', si: 'ඒකක අවසන් පරීක්ෂණය', activity: 'assessment' },
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
