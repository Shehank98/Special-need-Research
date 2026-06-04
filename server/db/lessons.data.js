// Single source of truth for seed content (lessons + demo students).
// Consumed by both seed.js (DB seeding) and generate-seed-sql.js (SQL export).
//
// Images: each picture item / quiz option carries an `emoji`. The client renders
// it as an OpenMoji SVG (openmoji.org) and falls back to the emoji glyph if the
// image fails to load — so no asset hosting is required.

// Small helpers to keep the lesson data terse and consistent.
// Reading / picture-match / quiz target dyslexia (reading & word recognition).
const pm = (title_en, title_si, difficulty, instructions, items) => ({
  title_en,
  title_si,
  type: 'picture_match',
  category: 'dyslexia',
  difficulty,
  content: {
    type: 'picture_match',
    instructions_en: instructions.en,
    instructions_si: instructions.si,
    items,
  },
});

const reading = (title_en, title_si, difficulty, sentences) => ({
  title_en,
  title_si,
  type: 'reading',
  category: 'dyslexia',
  difficulty,
  content: {
    type: 'reading',
    instructions_en: 'Tap the speaker to hear each sentence, then read it aloud.',
    instructions_si: 'එක් එක් වාක්‍යය ඇසීමට ස්පීකරය තට්ටු කරන්න, පසුව එය හඬ නඟා කියවන්න.',
    sentences,
  },
});

const quiz = (title_en, title_si, difficulty, instructions, questions) => ({
  title_en,
  title_si,
  type: 'quiz',
  category: 'dyslexia',
  difficulty,
  content: {
    type: 'quiz',
    instructions_en: instructions.en,
    instructions_si: instructions.si,
    questions,
  },
});

// Numbers target dyscalculia (number sense, counting, simple arithmetic).
// Each question shows one or more groups of objects and number-tile answers.
const numbers = (title_en, title_si, difficulty, instructions, questions) => ({
  title_en,
  title_si,
  type: 'numbers',
  category: 'dyscalculia',
  difficulty,
  content: {
    type: 'numbers',
    instructions_en: instructions.en,
    instructions_si: instructions.si,
    questions,
  },
});

// Spelling targets dysorthographia (build the word from scrambled letter tiles).
const spelling = (title_en, title_si, difficulty, instructions, items) => ({
  title_en,
  title_si,
  type: 'spelling',
  category: 'dysorthographia',
  difficulty,
  content: {
    type: 'spelling',
    instructions_en: instructions.en,
    instructions_si: instructions.si,
    items,
  },
});

const COUNT = {
  en: 'Count the pictures and tap the right number.',
  si: 'පින්තූර ගණන් කර නිවැරදි අංකය තට්ටු කරන්න.',
};
const ADD = {
  en: 'Add the pictures together and tap the answer.',
  si: 'පින්තූර එකතු කර පිළිතුර තට්ටු කරන්න.',
};
const SPELL = {
  en: 'Look at the picture. Tap the letters in order to spell the word.',
  si: 'පින්තූරය බලන්න. වචනය අකුරු කිරීමට අකුරු පිළිවෙළට තට්ටු කරන්න.',
};

const MATCH = {
  en: 'Match the word to the picture',
  si: 'වචනය පින්තූරයට ගලපන්න',
};
const CHOOSE = {
  en: 'Choose the correct picture.',
  si: 'නිවැරදි පින්තූරය තෝරන්න.',
};

export const lessons = [
  // ---- Difficulty 1: picture match ----
  pm('Animals Around Us', 'අප වටා සිටින සතුන්', 1, MATCH, [
    { word_en: 'cat', word_si: 'පූසා', emoji: '🐱' },
    { word_en: 'dog', word_si: 'බල්ලා', emoji: '🐶' },
    { word_en: 'fish', word_si: 'මාළුවා', emoji: '🐟' },
    { word_en: 'bird', word_si: 'කුරුල්ලා', emoji: '🐦' },
  ]),
  pm('Fruits We Eat', 'අප කන පලතුරු', 1, MATCH, [
    { word_en: 'apple', word_si: 'ඇපල්', emoji: '🍎' },
    { word_en: 'banana', word_si: 'කෙසෙල්', emoji: '🍌' },
    { word_en: 'mango', word_si: 'අඹ', emoji: '🥭' },
    { word_en: 'grapes', word_si: 'මිදි', emoji: '🍇' },
  ]),
  pm('My Body', 'මගේ ශරීරය', 1, MATCH, [
    { word_en: 'eye', word_si: 'ඇස', emoji: '👁️' },
    { word_en: 'ear', word_si: 'කන', emoji: '👂' },
    { word_en: 'nose', word_si: 'නාසය', emoji: '👃' },
    { word_en: 'mouth', word_si: 'කට', emoji: '👄' },
  ]),
  pm('Things That Go', 'ගමන් කරන දේ', 1, MATCH, [
    { word_en: 'car', word_si: 'කාර්', emoji: '🚗' },
    { word_en: 'bus', word_si: 'බස්', emoji: '🚌' },
    { word_en: 'bicycle', word_si: 'බයිසිකලය', emoji: '🚲' },
    { word_en: 'aeroplane', word_si: 'ගුවන් යානය', emoji: '✈️' },
  ]),

  // ---- Difficulty 2: reading / quiz / match ----
  reading('My First Reading', 'මගේ පළමු කියවීම', 2, [
    { en: 'The sun is big and yellow.', si: 'හිරු විශාල හා කහ පැහැයි.', emoji: '☀️' },
    { en: 'A small dog runs in the park.', si: 'කුඩා බල්ලෙක් උද්‍යානයේ දුවයි.', emoji: '🐶' },
    { en: 'I like to read my book.', si: 'මම මගේ පොත කියවීමට කැමතියි.', emoji: '📖' },
  ]),
  quiz('Colours Quiz', 'වර්ණ ප්‍රශ්නාවලිය', 2, CHOOSE, [
    {
      prompt_en: 'Which one is red?',
      prompt_si: 'රතු පාට කුමක්ද?',
      options: [
        { label_en: 'apple', label_si: 'ඇපල්', emoji: '🍎', correct: true },
        { label_en: 'leaf', label_si: 'කොළය', emoji: '🍃', correct: false },
        { label_en: 'banana', label_si: 'කෙසෙල්', emoji: '🍌', correct: false },
      ],
      hint_en: 'It is a fruit you can eat.',
      hint_si: 'එය ඔබට කන්න පුළුවන් පලතුරකි.',
    },
    {
      prompt_en: 'Which one is yellow?',
      prompt_si: 'කහ පාට කුමක්ද?',
      options: [
        { label_en: 'sun', label_si: 'හිරු', emoji: '☀️', correct: true },
        { label_en: 'grapes', label_si: 'මිදි', emoji: '🍇', correct: false },
        { label_en: 'fish', label_si: 'මාළුවා', emoji: '🐟', correct: false },
      ],
      hint_en: 'You see it in the sky in the day.',
      hint_si: 'ඔබ එය දිවා කාලයේ අහසේ දකියි.',
    },
  ]),
  pm('Food on My Plate', 'මගේ පිඟානේ ආහාර', 2, MATCH, [
    { word_en: 'bread', word_si: 'පාන්', emoji: '🍞' },
    { word_en: 'milk', word_si: 'කිරි', emoji: '🥛' },
    { word_en: 'egg', word_si: 'බිත්තරය', emoji: '🥚' },
    { word_en: 'carrot', word_si: 'කැරට්', emoji: '🥕' },
  ]),
  reading('At School', 'පාසලේදී', 2, [
    { en: 'I go to school every day.', si: 'මම සෑම දිනකම පාසල් යමි.', emoji: '🏫' },
    { en: 'My teacher is very kind.', si: 'මගේ ගුරුතුමිය ඉතා කරුණාවන්තයි.', emoji: '👩‍🏫' },
    { en: 'We sing a happy song.', si: 'අපි සතුටු ගීතයක් ගයමු.', emoji: '🎵' },
  ]),

  // ---- Difficulty 3 ----
  quiz('Action Words', 'ක්‍රියා වචන', 3, { en: 'Pick the picture for the action word.', si: 'ක්‍රියා වචනයට ගැළපෙන පින්තූරය තෝරන්න.' }, [
    {
      prompt_en: 'run',
      prompt_si: 'දුවනවා',
      options: [
        { label_en: 'running', label_si: 'දුවනවා', emoji: '🏃', correct: true },
        { label_en: 'sleeping', label_si: 'නිදනවා', emoji: '😴', correct: false },
        { label_en: 'eating', label_si: 'කනවා', emoji: '🍽️', correct: false },
      ],
      hint_en: 'You move your legs fast.',
      hint_si: 'ඔබ ඔබේ කකුල් වේගයෙන් චලනය කරයි.',
    },
    {
      prompt_en: 'eat',
      prompt_si: 'කනවා',
      options: [
        { label_en: 'eating', label_si: 'කනවා', emoji: '🍽️', correct: true },
        { label_en: 'jumping', label_si: 'පනිනවා', emoji: '🤸', correct: false },
        { label_en: 'reading', label_si: 'කියවනවා', emoji: '📖', correct: false },
      ],
      hint_en: 'You do this when you are hungry.',
      hint_si: 'ඔබ බඩගිනි වූ විට මෙය කරයි.',
    },
  ]),
  reading('My Day', 'මගේ දවස', 3, [
    { en: 'In the morning I brush my teeth.', si: 'උදෑසන මම දත් මදිමි.', emoji: '🪥' },
    { en: 'I eat rice for lunch.', si: 'දිවා ආහාරයට මම බත් කමි.', emoji: '🍚' },
    { en: 'At night I sleep in my warm bed.', si: 'රාත්‍රියේ මම උණුසුම් ඇඳේ නිදමි.', emoji: '🛏️' },
  ]),
  quiz('Big and Small', 'ලොකු සහ පොඩි', 3, CHOOSE, [
    {
      prompt_en: 'Which animal is big?',
      prompt_si: 'ලොකු සතා කුමක්ද?',
      options: [
        { label_en: 'elephant', label_si: 'අලියා', emoji: '🐘', correct: true },
        { label_en: 'ant', label_si: 'කුහුඹුවා', emoji: '🐜', correct: false },
        { label_en: 'mouse', label_si: 'මීයා', emoji: '🐭', correct: false },
      ],
      hint_en: 'It has a long trunk.',
      hint_si: 'එයට දිගු හොඬක් ඇත.',
    },
    {
      prompt_en: 'Which one is small?',
      prompt_si: 'පොඩි දේ කුමක්ද?',
      options: [
        { label_en: 'ant', label_si: 'කුහුඹුවා', emoji: '🐜', correct: true },
        { label_en: 'elephant', label_si: 'අලියා', emoji: '🐘', correct: false },
        { label_en: 'cow', label_si: 'හරකා', emoji: '🐄', correct: false },
      ],
      hint_en: 'It is tiny and lives in the ground.',
      hint_si: 'එය ඉතා කුඩා වන අතර පොළොවේ ජීවත් වේ.',
    },
  ]),

  // ---- Difficulty 4 ----
  reading('The Little Garden', 'කුඩා වත්ත', 4, [
    { en: 'My grandmother has a small garden.', si: 'මගේ ආච්චිට කුඩා වත්තක් ඇත.', emoji: '🌷' },
    { en: 'Red and pink flowers grow there.', si: 'එහි රතු සහ රෝස මල් වැවේ.', emoji: '🌸' },
    { en: 'A yellow butterfly flies over them.', si: 'කහ සමනලයෙක් ඒවා මතින් පියාසර කරයි.', emoji: '🦋' },
    { en: 'We water the plants together.', si: 'අපි එකට ශාක වලට ජලය දමමු.', emoji: '💧' },
  ]),
  quiz('Where They Live', 'ඔවුන් ජීවත් වන තැන', 4, CHOOSE, [
    {
      prompt_en: 'Which animal can fly?',
      prompt_si: 'පියාසර කළ හැකි සතා කුමක්ද?',
      options: [
        { label_en: 'bird', label_si: 'කුරුල්ලා', emoji: '🐦', correct: true },
        { label_en: 'fish', label_si: 'මාළුවා', emoji: '🐟', correct: false },
        { label_en: 'dog', label_si: 'බල්ලා', emoji: '🐶', correct: false },
      ],
      hint_en: 'It has wings and a beak.',
      hint_si: 'එයට පියාපත් සහ හොටක් ඇත.',
    },
    {
      prompt_en: 'Which animal lives in water?',
      prompt_si: 'ජලයේ ජීවත් වන සතා කුමක්ද?',
      options: [
        { label_en: 'fish', label_si: 'මාළුවා', emoji: '🐟', correct: true },
        { label_en: 'cat', label_si: 'පූසා', emoji: '🐱', correct: false },
        { label_en: 'bird', label_si: 'කුරුල්ලා', emoji: '🐦', correct: false },
      ],
      hint_en: 'It swims and has fins.',
      hint_si: 'එය පිහිනන අතර වරල් ඇත.',
    },
  ]),

  // ---- Difficulty 5 ----
  reading('A Day at the Beach', 'වෙරළේ දිනයක්', 5, [
    { en: 'On Sunday we went to the beach.', si: 'ඉරිදා අපි වෙරළට ගියෙමු.', emoji: '🏖️' },
    { en: 'The waves were blue and cool.', si: 'රළ නිල් සහ සිසිල් විය.', emoji: '🌊' },
    { en: 'I built a big sandcastle.', si: 'මම විශාල වැලි බලකොටුවක් තැනුවෙමි.', emoji: '🏰' },
    { en: 'We ate ice cream and laughed.', si: 'අපි අයිස්ක්‍රීම් කා සිනාසුණෙමු.', emoji: '🍦' },
  ]),
  quiz('Story Time', 'කතන්දර වේලාව', 5, {
    en: 'Read: "Nimal has a red ball. He plays with his dog in the garden." Now answer.',
    si: 'කියවන්න: "නිමල්ට රතු බෝලයක් ඇත. ඔහු වත්තේදී ඔහුගේ බල්ලා සමඟ සෙල්ලම් කරයි." දැන් පිළිතුරු දෙන්න.',
  }, [
    {
      prompt_en: 'What does Nimal have?',
      prompt_si: 'නිමල්ට ඇත්තේ කුමක්ද?',
      options: [
        { label_en: 'a ball', label_si: 'බෝලයක්', emoji: '⚽', correct: true },
        { label_en: 'a book', label_si: 'පොතක්', emoji: '📖', correct: false },
        { label_en: 'a kite', label_si: 'සරුංගලයක්', emoji: '🪁', correct: false },
      ],
      hint_en: 'It is red and you can play with it.',
      hint_si: 'එය රතු වන අතර ඔබට එය සමඟ සෙල්ලම් කළ හැක.',
    },
    {
      prompt_en: 'Who plays with Nimal?',
      prompt_si: 'නිමල් සමඟ සෙල්ලම් කරන්නේ කවුද?',
      options: [
        { label_en: 'his dog', label_si: 'ඔහුගේ බල්ලා', emoji: '🐶', correct: true },
        { label_en: 'a cat', label_si: 'පූසෙක්', emoji: '🐱', correct: false },
        { label_en: 'a bird', label_si: 'කුරුල්ලෙක්', emoji: '🐦', correct: false },
      ],
      hint_en: 'It is a pet that barks.',
      hint_si: 'එය බුරන සුරතලෙකි.',
    },
  ]),

  // =====================================================================
  // DYSCALCULIA — numbers, counting and simple arithmetic
  // =====================================================================
  numbers('Count the Animals', 'සතුන් ගණන් කරන්න', 1, COUNT, [
    { prompt_en: 'How many cats?', prompt_si: 'පූසන් කී දෙනෙක්ද?', groups: [{ emoji: '🐱', count: 2 }], answer: 2, options: [1, 2, 3], hint_en: 'Touch each cat as you count.', hint_si: 'ගණන් කරන විට එක් එක් පූසා ස්පර්ශ කරන්න.' },
    { prompt_en: 'How many ducks?', prompt_si: 'තාරාවන් කී දෙනෙක්ද?', groups: [{ emoji: '🦆', count: 3 }], answer: 3, options: [2, 3, 4], hint_en: 'Count slowly: one, two, three.', hint_si: 'සෙමින් ගණන් කරන්න: එක, දෙක, තුන.' },
    { prompt_en: 'How many fish?', prompt_si: 'මාළුන් කී දෙනෙක්ද?', groups: [{ emoji: '🐟', count: 4 }], answer: 4, options: [3, 4, 5], hint_en: 'Point to each fish.', hint_si: 'එක් එක් මාළුවා පෙන්වන්න.' },
  ]),
  numbers('Count the Fruit', 'පලතුරු ගණන් කරන්න', 2, COUNT, [
    { prompt_en: 'How many apples?', prompt_si: 'ඇපල් කීයද?', groups: [{ emoji: '🍎', count: 5 }], answer: 5, options: [4, 5, 6], hint_en: 'Count each apple once.', hint_si: 'එක් එක් ඇපල් එක් වරක් ගණන් කරන්න.' },
    { prompt_en: 'How many bananas?', prompt_si: 'කෙසෙල් කීයද?', groups: [{ emoji: '🍌', count: 6 }], answer: 6, options: [5, 6, 7], hint_en: 'Five and one more.', hint_si: 'පහයි තවත් එකයි.' },
  ]),
  numbers('Add the Fruit', 'පලතුරු එකතු කරන්න', 3, ADD, [
    { prompt_en: 'How many in all?', prompt_si: 'මුළු ගණන කීයද?', groups: [{ emoji: '🍎', count: 2 }, { emoji: '🍎', count: 1 }], operator: '+', answer: 3, options: [2, 3, 4], hint_en: 'Two and one more is three.', hint_si: 'දෙකයි එකයි තුනයි.' },
    { prompt_en: 'How many in all?', prompt_si: 'මුළු ගණන කීයද?', groups: [{ emoji: '🍌', count: 3 }, { emoji: '🍌', count: 2 }], operator: '+', answer: 5, options: [4, 5, 6], hint_en: 'Count all the bananas together.', hint_si: 'සියලු කෙසෙල් එකට ගණන් කරන්න.' },
  ]),
  numbers('Adding Stars', 'තරු එකතු කිරීම', 4, ADD, [
    { prompt_en: 'Add the stars.', prompt_si: 'තරු එකතු කරන්න.', groups: [{ emoji: '⭐', count: 4 }, { emoji: '⭐', count: 3 }], operator: '+', answer: 7, options: [6, 7, 8], hint_en: 'Four plus three.', hint_si: 'හතරයි තුනයි.' },
    { prompt_en: 'Add the stars.', prompt_si: 'තරු එකතු කරන්න.', groups: [{ emoji: '⭐', count: 5 }, { emoji: '⭐', count: 4 }], operator: '+', answer: 9, options: [8, 9, 10], hint_en: 'Five plus four.', hint_si: 'පහයි හතරයි.' },
  ]),

  // =====================================================================
  // DYSORTHOGRAPHIA — spelling by arranging letter tiles
  // =====================================================================
  spelling('Spell the Animal', 'සතාගේ නම අකුරු කරන්න', 1, SPELL, [
    { word_en: 'cat', word_si: 'පූසා', emoji: '🐱' },
    { word_en: 'dog', word_si: 'බල්ලා', emoji: '🐶' },
    { word_en: 'pig', word_si: 'ඌරා', emoji: '🐷' },
  ]),
  spelling('Spell the Fruit', 'පලතුරේ නම අකුරු කරන්න', 2, SPELL, [
    { word_en: 'apple', word_si: 'ඇපල්', emoji: '🍎' },
    { word_en: 'mango', word_si: 'අඹ', emoji: '🥭' },
    { word_en: 'lemon', word_si: 'දෙහි', emoji: '🍋' },
  ]),
  spelling('Spell Things at Home', 'ගෙදර දේවල් අකුරු කරන්න', 3, SPELL, [
    { word_en: 'book', word_si: 'පොත', emoji: '📖' },
    { word_en: 'clock', word_si: 'ඔරලෝසුව', emoji: '🕐' },
    { word_en: 'chair', word_si: 'පුටුව', emoji: '🪑' },
  ]),
];

// [name, language, grade]
export const students = [
  ['Nimal', 'si', 3],
  ['Amara', 'en', 4],
  ['Kavya', 'si', 2],
];
