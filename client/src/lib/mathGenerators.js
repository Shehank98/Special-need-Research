// Question generators for the MCQ-based maths topics. Each takes a difficulty
// `level` (1=easy, 2=medium, 3=hard) and returns
// { prompt_en, prompt_si, visual?, options:[{ text?|en?|si?, correct }] }.

const r = (n) => Math.floor(Math.random() * n);
const shuffle = (a) => a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map((p) => p[1]);
const numOpts = (correct, spread = 5, fmt = (v) => String(v)) => {
  const set = new Set([correct]);
  while (set.size < 3) {
    const d = correct + (r(2) ? 1 : -1) * (1 + r(spread));
    if (d >= 0) set.add(d);
  }
  return shuffle([...set]).map((v) => ({ text: fmt(v), correct: v === correct }));
};
const pickOne = (arr) => arr[r(arr.length)];

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
const DIRS = {
  N: { en: 'North', si: 'උතුර', opp: 'S' },
  S: { en: 'South', si: 'දකුණ', opp: 'N' },
  E: { en: 'East', si: 'නැගෙනහිර', opp: 'W' },
  W: { en: 'West', si: 'බටහිර', opp: 'E' },
};

// Number words 0–20 (used by the Dyscalculia Foundations activities, which teach
// the link between a quantity, its numeral, and its spoken/written word).
const NUM_EN = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];
const NUM_SI = ['බිංදුව', 'එක', 'දෙක', 'තුන', 'හතර', 'පහ', 'හය', 'හත', 'අට', 'නවය', 'දහය', 'එකොළහ', 'දොළහ', 'දහතුන', 'දහහතර', 'පහළොව', 'දහසය', 'දහහත', 'දහඅට', 'දහනවය', 'විස්ස'];
const wordEn = (n) => NUM_EN[n] ?? String(n);
const wordSi = (n) => NUM_SI[n] ?? String(n);
// Friendly countable pictures for quantity work.
const COUNT_EMOJI = ['🍎', '⭐', '🐟', '🎈', '🍓', '🐝', '🌸', '🚗'];

export const GENERATORS = {
  // ---- Foundations (Dyscalculia pre-mathematics) ----
  // These build the prerequisites many Dyscalculia learners lack BEFORE
  // arithmetic: counting/quantity (number sense), numeral recognition, the
  // numeral↔word link, comparison (more/less), sequence (before/after) and the
  // meaning of the maths signs. Distractors sit closer together at higher levels.
  count_objects(level = 1) {
    const max = [5, 10, 20][level - 1] || 10;
    const n = 1 + r(max);
    const spread = [3, 2, 1][level - 1] || 2;
    return {
      prompt_en: 'How many do you see?',
      prompt_si: 'ඔබ දකින්නේ කීයද?',
      visual: { type: 'count', value: pickOne(COUNT_EMOJI), count: n },
      options: numOpts(n, spread),
    };
  },
  number_recognition(level = 1) {
    const max = [5, 10, 20][level - 1] || 10;
    const n = 1 + r(max);
    const spread = [3, 2, 1][level - 1] || 2;
    // spoken/written word -> tap the matching numeral
    return {
      prompt_en: `Tap the number "${wordEn(n)}"`,
      prompt_si: `"${wordSi(n)}" අංකය තට්ටු කරන්න`,
      options: numOpts(n, spread),
    };
  },
  number_words(level = 1) {
    const max = [5, 10, 20][level - 1] || 10;
    const n = 1 + r(max);
    // numeral -> pick the word that names it
    const opts = new Set([n]);
    while (opts.size < 3) opts.add(1 + r(max));
    return {
      prompt_en: `Which word means ${n}?`,
      prompt_si: `${n} යන්නෙහි වචනය කුමක්ද?`,
      visual: { type: 'expr', value: String(n) },
      options: shuffle([...opts]).map((v) => ({ en: wordEn(v), si: wordSi(v), correct: v === n })),
    };
  },
  compare_quantity(level = 1) {
    const max = [5, 10, 20][level - 1] || 10;
    let a = 1 + r(max);
    let b = 1 + r(max);
    while (b === a) b = 1 + r(max);
    const askMore = r(2) === 0;
    const target = askMore ? Math.max(a, b) : Math.min(a, b);
    return {
      prompt_en: askMore ? 'Which group has MORE?' : 'Which group has FEWER?',
      prompt_si: askMore ? 'වැඩිපුර ඇත්තේ කුමන කණ්ඩායමේද?' : 'අඩුවෙන් ඇත්තේ කුමන කණ්ඩායමේද?',
      visual: { type: 'compare', a, b },
      options: shuffle([{ text: String(a), correct: a === target }, { text: String(b), correct: b === target }]),
    };
  },
  number_order(level = 1) {
    const max = [10, 20, 50][level - 1] || 20;
    const n = 1 + r(max - 1);
    const askAfter = r(2) === 0;
    const correct = askAfter ? n + 1 : Math.max(0, n - 1);
    return {
      prompt_en: askAfter ? `What comes AFTER ${n}?` : `What comes BEFORE ${n}?`,
      prompt_si: askAfter ? `${n} ට පසු කුමක්ද?` : `${n} ට පෙර කුමක්ද?`,
      visual: { type: 'expr', value: askAfter ? `${n}, ?` : `?, ${n}` },
      options: numOpts(correct, 2),
    };
  },
  symbols(level = 1) {
    const base = [
      { sym: '+', en: 'add (plus)', si: 'එකතු කිරීම' },
      { sym: '−', en: 'take away (minus)', si: 'අඩු කිරීම' },
      { sym: '=', en: 'equals (same as)', si: 'සමානයි' },
    ];
    const more = [
      { sym: '×', en: 'times (multiply)', si: 'ගුණ කිරීම' },
      { sym: '÷', en: 'share (divide)', si: 'බෙදීම' },
      { sym: '>', en: 'greater than', si: 'වැඩි' },
      { sym: '<', en: 'less than', si: 'අඩු' },
    ];
    const pool = level >= 2 ? [...base, ...more] : base;
    const target = pickOne(pool);
    const opts = new Set([target.sym]);
    while (opts.size < 3) opts.add(pickOne(pool).sym);
    return {
      prompt_en: `Which sign means "${target.en}"?`,
      prompt_si: `"${target.si}" යන්නෙහි ලකුණ කුමක්ද?`,
      options: shuffle([...opts]).map((s) => ({ text: s, correct: s === target.sym })),
    };
  },

  // ---- Numbers ----
  read_write(level = 1) {
    const th = 1 + r(9); const h = r(10); const t = r(10); const o = r(10);
    const n = th * 1000 + h * 100 + t * 10 + o;
    const expanded = `${th * 1000} + ${h * 100} + ${t * 10} + ${o}`;
    // harder = closer distractors
    const near = level >= 3 ? [n + 1, n - 1] : level === 2 ? [n + 10, n - 10] : [n + 100, n - 100];
    return { prompt_en: `Which number is this?  ${expanded}`, prompt_si: `මෙය කුමන සංඛ්‍යාවද?  ${expanded}`, options: shuffle([{ text: String(n), correct: true }, { text: String(near[0]), correct: false }, { text: String(near[1]), correct: false }]) };
  },
  order(level = 1) {
    const max = [999, 4999, 9999][level - 1] || 9999;
    const nums = shuffle([1, 2, 3].map(() => 100 + r(max)));
    const askBig = r(2) === 0;
    const target = askBig ? Math.max(...nums) : Math.min(...nums);
    return { prompt_en: askBig ? 'Which is the biggest?' : 'Which is the smallest?', prompt_si: askBig ? 'විශාලම කුමක්ද?' : 'කුඩාම කුමක්ද?', options: nums.map((v) => ({ text: String(v), correct: v === target })) };
  },
  patterns(level = 1) {
    const start = 1 + r(6); const step = [2, 5, 25][level - 1] || pickOne([2, 3, 5]);
    const seq = [start, start + step, start + 2 * step, start + 3 * step];
    return { prompt_en: `What comes next?  ${seq.join(', ')}, ?`, prompt_si: `ඊළඟට කුමක්ද?  ${seq.join(', ')}, ?`, options: numOpts(start + 4 * step, step) };
  },
  multiples(level = 1) {
    const base = [2, 4, 8][level - 1] || pickOne([2, 3, 4, 5]);
    const correct = base * (2 + r(8));
    const opts = new Set([correct]);
    while (opts.size < 3) {
      const cand = correct + pickOne([1, -1, 2, -2]);
      if (cand > 0 && cand % base !== 0) opts.add(cand);
    }
    return { prompt_en: `Which is a multiple of ${base}?`, prompt_si: `${base} හි ගුණාකාරය කුමක්ද?`, options: shuffle([...opts]).map((v) => ({ text: String(v), correct: v === correct })) };
  },
  roman(level = 1) {
    const max = [5, 10, 12][level - 1] || 12;
    const n = 1 + r(max);
    if (r(2) === 0) {
      const correct = ROMAN[n - 1];
      const opts = new Set([correct]);
      while (opts.size < 3) opts.add(ROMAN[r(12)]);
      return { prompt_en: `What is ${n} in Roman numerals?`, prompt_si: `${n} රෝම ඉලක්කමින් කුමක්ද?`, options: shuffle([...opts]).map((v) => ({ text: v, correct: v === correct })) };
    }
    return { prompt_en: `What is ${ROMAN[n - 1]} in numbers?`, prompt_si: `${ROMAN[n - 1]} සංඛ්‍යාවෙන් කුමක්ද?`, options: numOpts(n, 3) };
  },

  // ---- Measurement ----
  capacity() {
    if (r(2) === 0) return { prompt_en: '1 litre = ? millilitres', prompt_si: 'ලීටර් 1 = ? මිලිලීටර්', options: shuffle([{ text: '1000', correct: true }, { text: '100', correct: false }, { text: '10', correct: false }]) };
    return { prompt_en: 'Which holds more?', prompt_si: 'වැඩියෙන් රඳවන්නේ කුමක්ද?', options: shuffle([{ text: '2 L', correct: true }, { text: '1500 ml', correct: false }]) };
  },
  length() {
    if (r(2) === 0) return { prompt_en: '1 metre = ? centimetres', prompt_si: 'මීටර් 1 = ? සෙන්ටිමීටර්', options: shuffle([{ text: '100', correct: true }, { text: '10', correct: false }, { text: '1000', correct: false }]) };
    return { prompt_en: 'Which is longer?', prompt_si: 'දිගම කුමක්ද?', options: shuffle([{ text: '1 m', correct: true }, { text: '50 cm', correct: false }]) };
  },
  weight() {
    if (r(2) === 0) return { prompt_en: '1 kilogram = ? grams', prompt_si: 'කිලෝග්‍රෑම් 1 = ? ග්‍රෑම්', options: shuffle([{ text: '1000', correct: true }, { text: '100', correct: false }, { text: '500', correct: false }]) };
    return { prompt_en: 'Which is heavier?', prompt_si: 'බරම කුමක්ද?', options: shuffle([{ text: '2 kg', correct: true }, { text: '1500 g', correct: false }]) };
  },
  area(level = 1) {
    const span = [3, 5, 7][level - 1] || 4;
    const rows = 2 + r(span); const cols = 2 + r(span);
    return { prompt_en: 'How many squares? (the area)', prompt_si: 'චතුරස්‍ර කීයද? (වර්ගඵලය)', visual: { type: 'grid', rows, cols }, options: numOpts(rows * cols, 4) };
  },

  // ---- Money ----
  currency(level = 1) {
    if (r(2) === 0) {
      const notes = level >= 3 ? [20, 50, 100] : level === 2 ? [10, 20, 50] : [5, 10, 20];
      const a = pickOne(notes); const b = pickOne(notes);
      return { prompt_en: `Rs.${a} + Rs.${b} = ?`, prompt_si: `රු.${a} + රු.${b} = ?`, options: numOpts(a + b, 20, (v) => `Rs. ${v}`) };
    }
    const coin = pickOne([5, 10]); const total = coin * (3 + r(5));
    return { prompt_en: `How many Rs.${coin} coins make Rs.${total}?`, prompt_si: `රු.${total} සෑදීමට රු.${coin} කාසි කීයද?`, options: numOpts(total / coin, 3) };
  },
  calc(level = 1) {
    const mag = [40, 90, 200][level - 1] || 60;
    const a = 20 + r(mag); const b = 20 + r(mag);
    return { prompt_en: `Rs.${a} + Rs.${b} = ?`, prompt_si: `රු.${a} + රු.${b} = ?`, options: numOpts(a + b, 15, (v) => `Rs. ${v}`) };
  },
  receipts(level = 1) {
    const mag = [30, 60, 100][level - 1] || 40;
    const x = 20 + r(mag); const y = 20 + r(mag);
    return { prompt_en: `Apple Rs.${x} + Bread Rs.${y}. Total bill?`, prompt_si: `ඇපල් රු.${x} + පාන් රු.${y}. මුළු බිල?`, options: numOpts(x + y, 15, (v) => `Rs. ${v}`) };
  },

  // ---- Geometry ----
  faces() {
    const facts = [['How many faces does a cube have?', 'ඝනකයකට මුහුණත් කීයද?', 6], ['How many corners does a cube have?', 'ඝනකයකට කොන් කීයද?', 8], ['How many edges does a cube have?', 'ඝනකයකට දාර කීයද?', 12]];
    const f = pickOne(facts);
    return { prompt_en: f[0], prompt_si: f[1], options: numOpts(f[2], 4) };
  },
  angles() {
    if (r(2) === 0) return { prompt_en: 'A right angle is how many degrees?', prompt_si: 'සෘජු කෝණයක් අංශක කීයද?', visual: { type: 'angle', deg: 90 }, options: shuffle([{ text: '90', correct: true }, { text: '45', correct: false }, { text: '180', correct: false }]) };
    return { prompt_en: 'How many right angles in a rectangle?', prompt_si: 'සෘජුකෝණාස්‍රයක සෘජු කෝණ කීයද?', options: numOpts(4, 3) };
  },
  directions() {
    const d = pickOne(Object.keys(DIRS));
    const opp = DIRS[d].opp;
    const opts = shuffle(Object.keys(DIRS)).slice(0, 3);
    if (!opts.includes(opp)) opts[0] = opp;
    return { prompt_en: `What is opposite to ${DIRS[d].en}?`, prompt_si: `${DIRS[d].si} ට විරුද්ධ දිශාව කුමක්ද?`, visual: { type: 'compass', dir: d }, options: shuffle(opts).map((k) => ({ en: DIRS[k].en, si: DIRS[k].si, correct: k === opp })) };
  },

  // ---- Data handling ----
  tables(level = 1) {
    const mag = [7, 12, 20][level - 1] || 7;
    const cats = 2 + r(mag); const dogs = 2 + r(mag); const birds = 2 + r(mag);
    const which = pickOne([['dogs', 'බල්ලන්', dogs], ['cats', 'පූසන්', cats], ['birds', 'කුරුල්ලන්', birds]]);
    return { prompt_en: `Cats: ${cats}, Dogs: ${dogs}, Birds: ${birds}. How many ${which[0]}?`, prompt_si: `පූසන්: ${cats}, බල්ලන්: ${dogs}, කුරුල්ලන්: ${birds}. ${which[1]} කීයද?`, options: numOpts(which[2], 3) };
  },
  picto(level = 1) {
    const each = [2, 5, 10][level - 1] || 2; const count = 2 + r(4);
    const sym = '⭐';
    return { prompt_en: `Each ${sym} = ${each}. There are ${count} ${sym}. How many in total?`, prompt_si: `එක් ${sym} = ${each}. ${sym} ${count}ක් ඇත. මුළු කීයද?`, options: numOpts(each * count, 4) };
  },
};
