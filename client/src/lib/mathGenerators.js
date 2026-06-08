// Question generators for the simpler MCQ-based maths topics. Each returns
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

export const GENERATORS = {
  // ---- Numbers ----
  read_write() {
    const th = 1 + r(9); const h = r(10); const t = r(10); const o = r(10);
    const n = th * 1000 + h * 100 + t * 10 + o;
    const expanded = `${th * 1000} + ${h * 100} + ${t * 10} + ${o}`;
    return { prompt_en: `Which number is this?  ${expanded}`, prompt_si: `මෙය කුමන සංඛ්‍යාවද?  ${expanded}`, options: shuffle([{ text: String(n), correct: true }, { text: String(n + 100), correct: false }, { text: String(n + 10), correct: false }]) };
  },
  order() {
    const nums = shuffle([1, 2, 3].map(() => 1000 + r(9000)));
    const askBig = r(2) === 0;
    const target = askBig ? Math.max(...nums) : Math.min(...nums);
    return { prompt_en: askBig ? 'Which is the biggest?' : 'Which is the smallest?', prompt_si: askBig ? 'විශාලම කුමක්ද?' : 'කුඩාම කුමක්ද?', options: nums.map((v) => ({ text: String(v), correct: v === target })) };
  },
  patterns() {
    const start = 1 + r(6); const step = pickOne([2, 3, 5, 10]);
    const seq = [start, start + step, start + 2 * step, start + 3 * step];
    const next = start + 4 * step;
    return { prompt_en: `What comes next?  ${seq.join(', ')}, ?`, prompt_si: `ඊළඟට කුමක්ද?  ${seq.join(', ')}, ?`, options: numOpts(next, step) };
  },
  multiples() {
    const base = pickOne([2, 3, 4, 5, 10]);
    const correct = base * (2 + r(8));
    const opts = new Set([correct]);
    while (opts.size < 3) {
      const cand = correct + pickOne([1, -1, 2, -2]);
      if (cand > 0 && cand % base !== 0) opts.add(cand);
    }
    return { prompt_en: `Which is a multiple of ${base}?`, prompt_si: `${base} හි ගුණාකාරය කුමක්ද?`, options: shuffle([...opts]).map((v) => ({ text: String(v), correct: v === correct })) };
  },
  roman() {
    const n = 1 + r(12);
    const asRoman = r(2) === 0;
    if (asRoman) {
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
  area() {
    const rows = 2 + r(4); const cols = 2 + r(4);
    return { prompt_en: 'How many squares? (the area)', prompt_si: 'චතුරස්‍ර කීයද? (වර්ගඵලය)', visual: { type: 'grid', rows, cols }, options: numOpts(rows * cols, 4) };
  },

  // ---- Money ----
  currency() {
    if (r(2) === 0) {
      const a = pickOne([10, 20, 50]); const b = pickOne([10, 20, 50]);
      return { prompt_en: `Rs.${a} + Rs.${b} = ?`, prompt_si: `රු.${a} + රු.${b} = ?`, options: numOpts(a + b, 20, (v) => `Rs. ${v}`) };
    }
    const coin = pickOne([5, 10]); const total = coin * (3 + r(5));
    return { prompt_en: `How many Rs.${coin} coins make Rs.${total}?`, prompt_si: `රු.${total} සෑදීමට රු.${coin} කාසි කීයද?`, options: numOpts(total / coin, 3) };
  },
  calc() {
    const a = 20 + r(60); const b = 20 + r(60);
    return { prompt_en: `Rs.${a} + Rs.${b} = ?`, prompt_si: `රු.${a} + රු.${b} = ?`, options: numOpts(a + b, 15, (v) => `Rs. ${v}`) };
  },
  receipts() {
    const x = 20 + r(40); const y = 20 + r(40);
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
  tables() {
    const cats = 2 + r(7); const dogs = 2 + r(7); const birds = 2 + r(7);
    const which = pickOne([['dogs', 'බල්ලන්', dogs], ['cats', 'පූසන්', cats], ['birds', 'කුරුල්ලන්', birds]]);
    return { prompt_en: `Cats: ${cats}, Dogs: ${dogs}, Birds: ${birds}. How many ${which[0]}?`, prompt_si: `පූසන්: ${cats}, බල්ලන්: ${dogs}, කුරුල්ලන්: ${birds}. ${which[1]} කීයද?`, options: numOpts(which[2], 3) };
  },
  picto() {
    const each = pickOne([2, 5]); const count = 2 + r(4);
    const sym = '⭐';
    return { prompt_en: `Each ${sym} = ${each}. There are ${count} ${sym}. How many in total?`, prompt_si: `එක් ${sym} = ${each}. ${sym} ${count}ක් ඇත. මුළු කීයද?`, options: numOpts(each * count, 4) };
  },
};
