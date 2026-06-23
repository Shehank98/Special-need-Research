// Short, narrated, animated "explainer video" lessons for the Number
// Foundations module (Dyscalculia pre-mathematics). Each lesson is a sequence of
// SCENES played by components/math/ConceptVideo.jsx:
//   - a teaching scene  : { visual, en, si }  (animated visual + narration)
//   - an interactive try: { try: { prompt_en, prompt_si, visual?, options[] } }
// Narration is read aloud (audio), the visual animates (visual), and the final
// "you try" is tap-to-answer (interactive) — i.e. multi-sensory throughout.
// Real-life, picture-based examples (apples, cars, cookies, fish…) keep the
// numbers concrete, and the steps build up gradually to grow confidence.

export const FOUNDATIONS_LESSONS = {
  count_objects: {
    en: 'Counting — how many?',
    si: 'ගණන් කිරීම — කීයද?',
    scenes: [
      { visual: { type: 'count', value: '🍎', count: 1 }, en: 'Counting tells us HOW MANY things there are. Let’s start with one apple.', si: 'ගණන් කිරීමෙන් කීයක් තිබේද කියා දැනගනිමු. ඇපල් එකකින් පටන් ගමු.' },
      { visual: { type: 'count', value: '🍎', count: 3 }, en: 'Now there are more apples. Touch each one and say a number: one, two, three.', si: 'දැන් ඇපල් වැඩියි. එක එක ස්පර්ශ කර අංකයක් කියන්න: එක, දෙක, තුන.' },
      { visual: { type: 'tenframe', count: 5 }, en: 'A ten-frame helps us SEE the amount. Five counters fill one whole row.', si: 'දස රාමුවක් ප්‍රමාණය දැකීමට උපකාරී වේ. තිත් පහක් එක් පේළියක් පුරවයි.' },
      { visual: { type: 'count', value: '🚗', count: 4 }, en: 'We can count anything — cars, fingers, sweets. The LAST number we say is how many.', si: 'අපට ඕනෑම දෙයක් ගණන් කළ හැක — කාර්, ඇඟිලි, රසකැවිලි. අවසන් අංකය තමයි ප්‍රමාණය.' },
      { try: { prompt_en: 'Now you try! How many balloons?', prompt_si: 'දැන් ඔබ උත්සාහ කරන්න! බැලූන් කීයද?', visual: { type: 'count', value: '🎈', count: 4 }, options: [{ text: '4', correct: true }, { text: '3', correct: false }, { text: '5', correct: false }] } },
    ],
  },

  number_recognition: {
    en: 'Meet the numbers',
    si: 'අංක හඳුනා ගනිමු',
    scenes: [
      { visual: { type: 'expr', value: '1   2   3' }, en: 'Each number has its own shape and its own name.', si: 'සෑම අංකයකටම තමන්ගේම හැඩයක් සහ නමක් ඇත.' },
      { visual: { type: 'expr', value: '3' }, en: 'This shape is the number three.', si: 'මෙම හැඩය තුන අංකයයි.' },
      { visual: { type: 'count', value: '⭐', count: 3 }, en: 'Three stars — and the numeral 3 also means three.', si: 'තරු තුනක් — 3 ඉලක්කමද තුන යන්නයි.' },
      { visual: { type: 'expr', value: '7' }, en: 'This one is seven. We hear the name, then find the matching number.', si: 'මෙය හත යි. නම අසා, ගැලපෙන අංකය සොයමු.' },
      { try: { prompt_en: 'Tap the number "five"', prompt_si: '"පහ" අංකය තට්ටු කරන්න', options: [{ text: '5', correct: true }, { text: '2', correct: false }, { text: '8', correct: false }] } },
    ],
  },

  number_words: {
    en: 'Numbers have words',
    si: 'අංකවලට වචන ඇත',
    scenes: [
      { visual: { type: 'expr', value: '2  =  two' }, en: 'Every numeral has a word. The numeral 2 has the word "two".', si: 'සෑම ඉලක්කමකටම වචනයක් ඇත. 2 ඉලක්කමේ වචනය "දෙක" යි.' },
      { visual: { type: 'count', value: '🐟', count: 2 }, en: 'Two fish. We write the numeral 2 and we say "two".', si: 'මාළු දෙකක්. අපි 2 ඉලක්කම ලියා "දෙක" කියමු.' },
      { visual: { type: 'expr', value: '4  =  four' }, en: 'Match each number to its word.', si: 'සෑම අංකයක්ම එහි වචනයට ගලපන්න.' },
      { try: { prompt_en: 'Which word means 2?', prompt_si: '2 යන්නෙහි වචනය කුමක්ද?', visual: { type: 'expr', value: '2' }, options: [{ en: 'two', si: 'දෙක', correct: true }, { en: 'six', si: 'හය', correct: false }, { en: 'ten', si: 'දහය', correct: false }] } },
    ],
  },

  compare_quantity: {
    en: 'More or fewer',
    si: 'වැඩි හෝ අඩු',
    scenes: [
      { visual: { type: 'compare', a: 2, b: 5 }, en: 'To compare, count each group. Which row has MORE dots?', si: 'සැසඳීමට, සෑම කණ්ඩායමක්ම ගණන් කරන්න. තිත් වැඩි පේළිය කුමක්ද?' },
      { visual: { type: 'compare', a: 5, b: 5 }, en: 'When both groups have the same amount, they are EQUAL.', si: 'කණ්ඩායම් දෙකේම ප්‍රමාණය සමාන නම්, ඒවා සමානයි.' },
      { visual: { type: 'count', value: '🍪', count: 6 }, en: '"More" means a bigger amount. "Fewer" means a smaller amount.', si: '"වැඩි" යනු වැඩි ප්‍රමාණයක්. "අඩු" යනු අඩු ප්‍රමාණයක්.' },
      { try: { prompt_en: 'Which group has MORE?', prompt_si: 'වැඩිපුර ඇත්තේ කුමන කණ්ඩායමේද?', visual: { type: 'compare', a: 3, b: 6 }, options: [{ text: '6', correct: true }, { text: '3', correct: false }] } },
    ],
  },

  number_order: {
    en: 'Before and after',
    si: 'පෙර හා පසු',
    scenes: [
      { visual: { type: 'numberLine', max: 10, mark: 5 }, en: 'Numbers live in order on a number line, from small to big.', si: 'අංක අංක රේඛාවක කුඩාවේ සිට විශාලයට පිළිවෙළට පවතී.' },
      { visual: { type: 'expr', value: '4,  5,  6' }, en: 'After 5 comes 6. Before 5 comes 4.', si: '5 ට පසු 6. 5 ට පෙර 4.' },
      { visual: { type: 'numberLine', max: 10, mark: 8 }, en: 'To find the NEXT number, hop one step to the right.', si: 'ඊළඟ අංකය සොයන්න, දකුණට එක් පියවරක් පනින්න.' },
      { try: { prompt_en: 'What comes AFTER 8?', prompt_si: '8 ට පසු කුමක්ද?', visual: { type: 'expr', value: '8, ?' }, options: [{ text: '9', correct: true }, { text: '7', correct: false }, { text: '10', correct: false }] } },
    ],
  },

  symbols: {
    en: 'The maths signs',
    si: 'ගණිත ලකුණු',
    scenes: [
      { visual: { type: 'expr', value: '2 + 1 = 3' }, en: 'The plus sign + means ADD — put groups together.', si: 'එකතු ලකුණ + යනු එකතු කිරීම — කණ්ඩායම් එකට තැබීම.' },
      { visual: { type: 'expr', value: '3 − 1 = 2' }, en: 'The minus sign − means TAKE AWAY.', si: 'අඩු ලකුණ − යනු අඩු කිරීම.' },
      { visual: { type: 'expr', value: '3 = 3' }, en: 'The equals sign = means both sides are the SAME.', si: 'සමාන ලකුණ = යනු දෙපැත්තම සමාන බවයි.' },
      { try: { prompt_en: 'Which sign means "add"?', prompt_si: '"එකතු කිරීම" යන්නෙහි ලකුණ කුමක්ද?', options: [{ text: '+', correct: true }, { text: '−', correct: false }, { text: '=', correct: false }] } },
    ],
  },
};
