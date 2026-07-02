// Knowledge base for the voice-based study assistant ("Nimna", the study buddy).
// It provides on-demand, self-study support that acts as a "more knowledgeable
// other" (Vygotsky, 1978): the child asks a question by voice or by tapping a
// suggestion, and the assistant explains a foundational concept in simple,
// bilingual language. Matching is keyword-based (no network needed), so the
// assistant works offline on modest school devices.

// Each intent: keys to match (English + Sinhala/romanised), and a bilingual reply.
const INTENTS = [
  {
    id: 'greeting',
    keys: ['hello', 'hi', 'hey', 'ayubowan', 'ආයුබෝ', 'හලෝ'],
    en: 'Hello! I am your study buddy. Ask me about numbers, or tap a question below.',
    si: 'ආයුබෝවන්! මම ඔබේ අධ්‍යයන මිතුරා. අංක ගැන අහන්න, නැත්නම් පහත ප්‍රශ්නයක් තට්ටු කරන්න.',
  },
  {
    id: 'count',
    keys: ['count', 'how many', 'counting', 'ganan', 'ගණන්', 'කීයද'],
    en: 'To count, touch each object one by one and say a number for each: one, two, three. The last number you say is how many there are.',
    si: 'ගණන් කිරීමට, සෑම වස්තුවක්ම එකින් එක ස්පර්ශ කර එකකට අංකයක් කියන්න: එක, දෙක, තුන. ඔබ අවසානයට කියන අංකය තමයි ප්‍රමාණය.',
  },
  {
    id: 'tenframe',
    keys: ['ten frame', 'tenframe', 'ten-frame', 'frame', 'දස රාමු'],
    en: 'A ten-frame has ten boxes in two rows of five. Fill the boxes with counters to see how big a number is.',
    si: 'දස රාමුවක පස් බැගින් පේළි දෙකක කොටු දහයක් ඇත. අංකයක ප්‍රමාණය දැකීමට කොටු තිත් වලින් පුරවන්න.',
  },
  {
    id: 'compare',
    keys: ['more', 'less', 'fewer', 'bigger', 'smaller', 'compare', 'wedi', 'adu', 'වැඩි', 'අඩු'],
    en: 'To find which is more, count each group. The group with the higher number has more. The one with the lower number has fewer.',
    si: 'වැඩි කුමක්දැයි සොයන්න, සෑම කණ්ඩායමක්ම ගණන් කරන්න. වැඩි අංකය ඇති කණ්ඩායමේ වැඩියි. අඩු අංකය ඇති එකේ අඩුයි.',
  },
  {
    id: 'order',
    keys: ['before', 'after', 'next', 'order', 'comes', 'පෙර', 'පසු', 'ඊළඟ'],
    en: 'Numbers go in order: 1, 2, 3, 4. The number after comes one step to the right. The number before comes one step to the left.',
    si: 'අංක පිළිවෙළට යයි: 1, 2, 3, 4. පසුව එන අංකය දකුණට එක් පියවරකි. පෙර එන අංකය වමට එක් පියවරකි.',
  },
  {
    id: 'add',
    keys: ['add', 'plus', 'sum', 'together', 'ekathu', 'එකතු', 'plus sign'],
    en: 'The plus sign, +, means add. Put the two groups together and count them all to get the answer.',
    si: 'එකතු ලකුණ, +, යනු එකතු කිරීමයි. කණ්ඩායම් දෙක එකට තබා සියල්ල ගණන් කර පිළිතුර ලබා ගන්න.',
  },
  {
    id: 'subtract',
    keys: ['minus', 'subtract', 'take away', 'less', 'adu kir', 'අඩු කිරීම', 'minus sign'],
    en: 'The minus sign, −, means take away. Start with the first number and remove some. Count what is left.',
    si: 'අඩු ලකුණ, −, යනු අඩු කිරීමයි. පළමු අංකයෙන් පටන් ගෙන ටිකක් ඉවත් කරන්න. ඉතිරි ගණන් කරන්න.',
  },
  {
    id: 'equals',
    keys: ['equal', 'equals', 'same', 'sama', 'සමාන'],
    en: 'The equals sign, =, means both sides are the same. 2 + 1 = 3 means two and one together are the same as three.',
    si: 'සමාන ලකුණ, =, යනු දෙපැත්තම සමාන බවයි. 2 + 1 = 3 යනු දෙකයි එකයි එකට තුනට සමාන බවයි.',
  },
  {
    id: 'multiply',
    keys: ['times', 'multiply', 'multiplication', 'guna', 'ගුණ'],
    en: 'Times, ×, means fast adding of equal groups. 3 × 4 means three groups of four, which is twelve.',
    si: 'ගුණ කිරීම, ×, යනු සමාන කණ්ඩායම් ඉක්මනින් එකතු කිරීමයි. 3 × 4 යනු හතර බැගින් කණ්ඩායම් තුනක්, එනම් දොළහයි.',
  },
  {
    id: 'divide',
    keys: ['divide', 'division', 'share', 'ber', 'බෙදී'],
    en: 'Divide, ÷, means share equally. 12 ÷ 3 means share twelve into three equal groups, which is four each.',
    si: 'බෙදීම, ÷, යනු සමානව බෙදීමයි. 12 ÷ 3 යනු දොළහ සමාන කණ්ඩායම් තුනකට බෙදීම, එනම් බැගින් හතරයි.',
  },
  {
    id: 'fraction',
    keys: ['fraction', 'half', 'quarter', 'baga', 'භාග'],
    en: 'A fraction is part of a whole. In 1/4, the bottom number is how many equal parts there are, and the top number is how many we take.',
    si: 'භාගයක් යනු සම්පූර්ණයකින් කොටසකි. 1/4 හි, පහළ අංකය සමාන කොටස් කීයද යන්නයි, ඉහළ අංකය අප ගන්නා ගණනයි.',
  },
  {
    id: 'stuck',
    keys: ['stuck', 'hard', 'difficult', 'i cannot', "i can't", "don't know", 'help me', 'amaru', 'අමාරු'],
    en: 'That is okay. Take your time and try the easy level first. Listen to the question again with the speaker button, then pick your best answer.',
    si: 'කමක් නැහැ. හදිසි නොවී මුලින් පහසු මට්ටම උත්සාහ කරන්න. speaker බොත්තමෙන් ප්‍රශ්නය නැවත අසා, හොඳම පිළිතුර තෝරන්න.',
  },
  {
    id: 'repeat',
    keys: ['again', 'repeat', 'say it', 'read again', 'listen', 'nawatha', 'නැවත'],
    en: 'To hear something again, tap the speaker button next to it. You can listen as many times as you like.',
    si: 'යමක් නැවත ඇසීමට, ඒ අසල ඇති speaker බොත්තම තට්ටු කරන්න. ඔබට කැමති තරම් වාර ගණනක් ඇසිය හැක.',
  },
  {
    id: 'help',
    keys: ['help', 'what do i do', 'how to play', 'udaw', 'උදව්'],
    en: 'First we watch and learn, then you try, then we play. Tap the play button to start, and tap the speaker to hear the words.',
    si: 'මුලින් අපි බලා ඉගෙන ගනිමු, පසුව ඔබ උත්සාහ කරන්න, පසුව සෙල්ලම් කරමු. පටන් ගැනීමට play බොත්තම, වචන ඇසීමට speaker බොත්තම තට්ටු කරන්න.',
  },
  {
    id: 'thanks',
    keys: ['thank', 'thanks', 'bohoma', 'ස්තූ'],
    en: 'You are welcome! You are doing a great job. Keep going!',
    si: 'සුබ පැතුම්! ඔබ ඉතා හොඳින් කරනවා. දිගටම කරන්න!',
  },
];

const FALLBACK = {
  en: 'I can help with counting, comparing numbers, before and after, and the maths signs. Tap one of the questions below.',
  si: 'ගණන් කිරීම, අංක සැසඳීම, පෙර සහ පසු, සහ ගණිත ලකුණු ගැන මට උදව් කළ හැක. පහත ප්‍රශ්නයක් තට්ටු කරන්න.',
};

// Suggested questions shown as tappable chips (always available, even without a mic).
export const SUGGESTIONS = [
  { id: 'count', en: 'How do I count?', si: 'ගණන් කරන්නේ කෙසේද?' },
  { id: 'compare', en: 'Which is more?', si: 'වැඩි කුමක්ද?' },
  { id: 'order', en: 'What comes next?', si: 'ඊළඟට කුමක්ද?' },
  { id: 'add', en: 'What does + mean?', si: '+ යනු කුමක්ද?' },
  { id: 'stuck', en: 'I am stuck', si: 'මම අමාරුවේ' },
];

// Return the best matching reply for a free-text/voice query.
export function answer(queryText, lang = 'en') {
  const q = (queryText || '').toLowerCase().trim();
  if (!q) return { id: 'fallback', text: FALLBACK[lang] || FALLBACK.en };
  for (const intent of INTENTS) {
    if (intent.keys.some((k) => q.includes(k.toLowerCase()))) {
      return { id: intent.id, text: (lang === 'si' ? intent.si : intent.en) };
    }
  }
  return { id: 'fallback', text: FALLBACK[lang] || FALLBACK.en };
}

// Reply for a tapped suggestion chip (matched by id).
export function answerById(id, lang = 'en') {
  const intent = INTENTS.find((i) => i.id === id);
  if (!intent) return { id: 'fallback', text: FALLBACK[lang] || FALLBACK.en };
  return { id: intent.id, text: (lang === 'si' ? intent.si : intent.en) };
}

export function greeting(lang = 'en') {
  const g = INTENTS.find((i) => i.id === 'greeting');
  return lang === 'si' ? g.si : g.en;
}
