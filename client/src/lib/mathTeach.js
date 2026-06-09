// Bilingual, animated teaching steps shown BEFORE each activity's game.
// Each step: { visual: {type, ...}, en, si }. Visual types are rendered by
// components/math/TeachVisual.jsx.

export const TEACH = {
  place_value: [
    {
      visual: { type: 'number', value: '4827', highlight: -1 },
      en: 'Every digit has a place: ones, tens, hundreds and thousands.',
      si: 'සෑම ඉලක්කමකටම ස්ථානයක් ඇත: එක, දස, සිය සහ දහස්.',
    },
    {
      visual: { type: 'number', value: '4827', highlight: 1 },
      en: 'The 8 sits in the hundreds place, so it means 8 hundreds.',
      si: '8 සිය ස්ථානයේ ඇත, එනම් එය සිය 8 කි.',
    },
    {
      try: {
        prompt_en: 'Your turn! In 3572, tap the digit in the tens place.',
        prompt_si: '3572 හි දස ස්ථානයේ ඉලක්කම තට්ටු කරන්න.',
        visual: { type: 'number', value: '3572', highlight: -1 },
        options: [{ text: '7', correct: true }, { text: '5', correct: false }, { text: '2', correct: false }],
      },
    },
  ],
  addition: [
    { visual: { type: 'expr', value: '6 + 7 = 13' }, en: 'When we add, we start from the right — the ones column.', si: 'එකතු කරන විට, අපි දකුණේ සිට — එක ස්ථානයෙන් — පටන් ගනිමු.' },
    { visual: { type: 'carry' }, en: 'If a column makes 10 or more, we carry 1 to the next column.', si: 'තීරුවක් 10ක් හෝ වැඩි වුවහොත්, අපි ඊළඟ තීරුවට 1ක් රැගෙන යමු.' },
    { try: { prompt_en: 'Try it: 8 + 5 = ?', prompt_si: 'උත්සාහ කරන්න: 8 + 5 = ?', options: [{ text: '13', correct: true }, { text: '12', correct: false }, { text: '14', correct: false }] } },
  ],
  subtraction: [
    { visual: { type: 'expr', value: '13 − 5 = 8' }, en: 'When we subtract, we also start from the right.', si: 'අඩු කරන විටද අපි දකුණෙන් පටන් ගනිමු.' },
    { visual: { type: 'expr', value: 'borrow 10' }, en: 'If the top number is smaller, we borrow 10 from the next column.', si: 'ඉහළ ඉලක්කම කුඩා නම්, ඊළඟ තීරුවෙන් 10ක් ණයට ගනිමු.' },
    { try: { prompt_en: 'Try it: 12 − 4 = ?', prompt_si: 'උත්සාහ කරන්න: 12 − 4 = ?', options: [{ text: '8', correct: true }, { text: '6', correct: false }, { text: '9', correct: false }] } },
  ],
  times_tables: [
    { visual: { type: 'groups', rows: 3, cols: 4, emoji: '🍎' }, en: 'Multiplying is fast adding. 3 rows of 4 apples = 12.', si: 'ගුණ කිරීම යනු ඉක්මන් එකතු කිරීමයි. ඇපල් 4 බැගින් පේළි 3ක් = 12.' },
    { visual: { type: 'expr', value: '3 × 4 = 12' }, en: 'So 3 × 4 = 12. Learn the patterns and it gets easy!', si: 'එබැවින් 3 × 4 = 12. රටා ඉගෙන ගත්විට පහසු වේ!' },
    { try: { prompt_en: 'Try it: 2 × 6 = ?', prompt_si: 'උත්සාහ කරන්න: 2 × 6 = ?', options: [{ text: '12', correct: true }, { text: '8', correct: false }, { text: '10', correct: false }] } },
  ],
  division: [
    { visual: { type: 'groups', rows: 3, cols: 4, emoji: '🍪' }, en: 'Dividing shares things into equal groups. 12 cookies in 3 groups = 4 each.', si: 'බෙදීම යනු සමාන කණ්ඩායම් වලට බෙදීමයි. කුකීස් 12ක් කණ්ඩායම් 3කට = බැගින් 4ක්.' },
    { visual: { type: 'expr', value: '13 ÷ 4 = 3 r 1' }, en: 'Sometimes there are leftovers — that is the remainder.', si: 'සමහර විට ඉතිරියක් ඇත — එය ඉතිරියයි.' },
    { try: { prompt_en: 'Try it: 10 ÷ 2 = ?', prompt_si: 'උත්සාහ කරන්න: 10 ÷ 2 = ?', options: [{ text: '5', correct: true }, { text: '4', correct: false }, { text: '6', correct: false }] } },
  ],
  clock: [
    { visual: { type: 'clock', h: 3, m: 0 }, en: 'The short hand shows the hour. This says 3 o’clock.', si: 'කෙටි කටුව පැය පෙන්වයි. මෙය 3 යි.' },
    { visual: { type: 'clock', h: 3, m: 15 }, en: 'The long hand shows the minutes. This is quarter past 3.', si: 'දිගු කටුව මිනිත්තු පෙන්වයි. මෙය 3:15 යි.' },
    { try: { prompt_en: 'What time is this?', prompt_si: 'මෙය කුමන වේලාවද?', visual: { type: 'clock', h: 6, m: 0 }, options: [{ text: '6:00', correct: true }, { text: '3:00', correct: false }, { text: '9:00', correct: false }] } },
  ],
  set_clock: [
    { visual: { type: 'clock', h: 7, m: 30 }, en: 'Now you set the clock! Drag the long blue hand to the minutes, tap a number for the hour.', si: 'දැන් ඔබ ඔරලෝසුව සකසන්න! නිල් කටුව මිනිත්තු වෙත ඇද දමා, පැය සඳහා අංකයක් තට්ටු කරන්න.' },
  ],
  fractions: [
    { visual: { type: 'fractionBar', parts: 4, shaded: 1 }, en: 'A fraction is part of a whole. 1 part out of 4 is one quarter.', si: 'භාගයක් යනු සම්පූර්ණයකින් කොටසකි. 4න් කොටස් 1ක් යනු කාලකි.' },
    { visual: { type: 'fraction', top: 1, bottom: 4 }, en: 'Top number = shaded parts. Bottom number = total parts.', si: 'ඉහළ ඉලක්කම = වර්ණ කළ කොටස්. පහළ ඉලක්කම = මුළු කොටස්.' },
    { try: { prompt_en: 'What fraction is shaded?', prompt_si: 'වර්ණ කළ භාගය කුමක්ද?', visual: { type: 'fractionBar', parts: 3, shaded: 1 }, options: [{ text: '1/3', correct: true }, { text: '2/3', correct: false }, { text: '1/2', correct: false }] } },
  ],
  shapes: [
    { visual: { type: 'shape', id: 'triangle' }, en: 'A triangle has 3 straight sides and 3 corners.', si: 'ත්‍රිකෝණයකට සෘජු පැති 3ක් සහ කොන් 3ක් ඇත.' },
    { visual: { type: 'shape', id: 'square' }, en: 'A square has 4 equal sides and 4 corners.', si: 'චතුරස්‍රයකට සමාන පැති 4ක් සහ කොන් 4ක් ඇත.' },
    { try: { prompt_en: 'Which shape is this?', prompt_si: 'මෙය කුමන හැඩයද?', visual: { type: 'shape', id: 'circle' }, options: [{ en: 'Circle', si: 'වෘත්තය', correct: true }, { en: 'Square', si: 'චතුරස්‍රය', correct: false }, { en: 'Triangle', si: 'ත්‍රිකෝණය', correct: false }] } },
  ],
  shop: [
    { visual: { type: 'emoji', value: '🛒', count: 1 }, en: 'When you buy something, change = money you pay − the price.', si: 'යමක් මිලදී ගන්නා විට, ඉතිරිය = ඔබ ගෙවන මුදල − මිල.' },
    { visual: { type: 'expr', value: 'Rs.100 − Rs.65 = Rs.35' }, en: 'Pay Rs.100 for a Rs.65 item → you get Rs.35 back.', si: 'Rs.65 දෙයකට Rs.100 ගෙවුවොත් → ඔබට Rs.35 ආපසු ලැබේ.' },
    { try: { prompt_en: 'Pay Rs.50 for a Rs.30 toy. Change?', prompt_si: 'Rs.30 සෙල්ලම් බඩුවකට Rs.50 ගෙවයි. ඉතිරිය?', options: [{ text: 'Rs. 20', correct: true }, { text: 'Rs. 30', correct: false }, { text: 'Rs. 10', correct: false }] } },
  ],
  bar_chart: [
    { visual: { type: 'emoji', value: '📊', count: 1 }, en: 'A bar chart shows amounts. A taller bar means more.', si: 'තීරු සටහනක් ප්‍රමාණ පෙන්වයි. උස තීරුව යනු වැඩියි.' },
    { visual: { type: 'emoji', value: '🔝', count: 1 }, en: 'Read the number at the top of each bar.', si: 'එක් එක් තීරුවේ ඉහළ ඇති අංකය කියවන්න.' },
    { try: { prompt_en: 'Apples: 5, Bananas: 2. How many more apples?', prompt_si: 'ඇපල්: 5, කෙසෙල්: 2. ඇපල් කීයක් වැඩිද?', options: [{ text: '3', correct: true }, { text: '2', correct: false }, { text: '7', correct: false }] } },
  ],
  assessment: [
    { visual: { type: 'emoji', value: '📝', count: 1 }, en: 'This is a quiz to see what you know. Try your best — take your time!', si: 'මෙය ඔබ දන්නා දේ බැලීමට ප්‍රශ්නාවලියකි. උපරිමය උත්සාහ කරන්න — හදිසි නැත!' },
  ],

  // ---- Numbers extras ----
  read_write: [
    { visual: { type: 'expr', value: '2000 + 300 + 40 + 5' }, en: 'We can build a number from its parts. This makes 2,345.', si: 'සංඛ්‍යාවක් කොටස් වලින් සෑදිය හැක. මෙය 2,345 වේ.' },
  ],
  order: [
    { visual: { type: 'expr', value: '231 < 312 < 540' }, en: 'To order numbers, compare the biggest place first.', si: 'සංඛ්‍යා පිළිවෙළට, මුලින් විශාලම ස්ථානය සසඳන්න.' },
  ],
  patterns: [
    { visual: { type: 'expr', value: '2, 4, 6, 8, …' }, en: 'A pattern follows a rule. Here we add 2 each time.', si: 'රටාවක් නීතියක් අනුගමනය කරයි. මෙහි සෑම විටම 2ක් එකතු වේ.' },
  ],
  multiples: [
    { visual: { type: 'groups', rows: 2, cols: 5, emoji: '🔵' }, en: 'Multiples of 5 are 5, 10, 15, 20… counting in fives.', si: '5 හි ගුණාකාර 5, 10, 15, 20… පහ බැගින් ගණන් කිරීම.' },
  ],
  roman: [
    { visual: { type: 'expr', value: 'I=1  V=5  X=10' }, en: 'Roman numerals use letters. IV means 4, IX means 9.', si: 'රෝම ඉලක්කම් අකුරු භාවිතා කරයි. IV යනු 4, IX යනු 9.' },
  ],

  // ---- Measurement extras ----
  capacity: [
    { visual: { type: 'emoji', value: '🥤', count: 1 }, en: 'Capacity is how much a container holds. 1 litre = 1000 millilitres.', si: 'ධාරිතාව යනු බඳුනක රඳවන ප්‍රමාණයයි. ලීටර් 1 = මිලිලීටර් 1000.' },
  ],
  length: [
    { visual: { type: 'emoji', value: '📏', count: 1 }, en: 'We measure length in cm and m. 1 metre = 100 centimetres.', si: 'දිග අපි සෙ.මී. සහ මී. වලින් මනිමු. මීටර් 1 = සෙන්ටිමීටර් 100.' },
  ],
  weight: [
    { visual: { type: 'emoji', value: '⚖️', count: 1 }, en: 'Weight is how heavy something is. 1 kilogram = 1000 grams.', si: 'බර යනු යමක කෙතරම් බරද යන්නයි. කිලෝ 1 = ග්‍රෑම් 1000.' },
  ],
  area: [
    { visual: { type: 'grid', rows: 3, cols: 4 }, en: 'Area is the space inside a shape — count the squares.', si: 'වර්ගඵලය යනු හැඩයක් තුළ ඇති ඉඩයි — චතුරස්‍ර ගණන් කරන්න.' },
  ],

  // ---- Money extras ----
  currency: [
    { visual: { type: 'emoji', value: '💵', count: 1 }, en: 'We use rupee notes and coins. Add their values together.', si: 'අපි රුපියල් නෝට්ටු සහ කාසි භාවිතා කරමු. ඒවායේ අගය එකතු කරන්න.' },
  ],
  calc: [
    { visual: { type: 'expr', value: 'Rs.35 + Rs.45 = Rs.80' }, en: 'Add the prices to find the total money.', si: 'මුළු මුදල සොයා ගැනීමට මිල එකතු කරන්න.' },
  ],
  receipts: [
    { visual: { type: 'emoji', value: '🧾', count: 1 }, en: 'A bill adds up everything you buy. Add each price.', si: 'බිලක් ඔබ මිලදී ගන්නා සියල්ල එකතු කරයි. සෑම මිලක්ම එකතු කරන්න.' },
  ],

  // ---- Geometry extras ----
  faces: [
    { visual: { type: 'emoji', value: '🎲', count: 1 }, en: 'A cube has 6 faces, 8 corners and 12 edges.', si: 'ඝනකයකට මුහුණත් 6ක්, කොන් 8ක් සහ දාර 12ක් ඇත.' },
  ],
  angles: [
    { visual: { type: 'angle', deg: 90 }, en: 'A right angle is a square corner — exactly 90 degrees.', si: 'සෘජු කෝණයක් යනු චතුරස්‍ර කොනකි — හරියටම අංශක 90ක්.' },
  ],
  directions: [
    { visual: { type: 'compass', dir: 'N' }, en: 'North, East, South and West. North is up on a compass.', si: 'උතුර, නැගෙනහිර, දකුණ සහ බටහිර. මාලිමාවක උතුර ඉහළින්.' },
  ],

  // ---- Data extras ----
  tables: [
    { visual: { type: 'emoji', value: '📋', count: 1 }, en: 'A table shows information in rows. Read across to find the number.', si: 'වගුවක් තොරතුරු පේළිවල පෙන්වයි. අංකය සොයා ගැනීමට හරහා කියවන්න.' },
  ],
  picto: [
    { visual: { type: 'emoji', value: '⭐', count: 3 }, en: 'In a picture graph each symbol stands for an amount. Multiply!', si: 'පින්තූර ප්‍රස්තාරයක එක් සංකේතයක් ප්‍රමාණයක් නියෝජනය කරයි. ගුණ කරන්න!' },
  ],
};
