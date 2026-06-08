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
      visual: { type: 'emoji', value: '👀', count: 1 },
      en: 'Now find the digit in the right place. Let’s play!',
      si: 'දැන් නිවැරදි ස්ථානයේ ඉලක්කම සොයන්න. සෙල්ලම් කරමු!',
    },
  ],
  addition: [
    { visual: { type: 'expr', value: '6 + 7 = 13' }, en: 'When we add, we start from the right — the ones column.', si: 'එකතු කරන විට, අපි දකුණේ සිට — එක ස්ථානයෙන් — පටන් ගනිමු.' },
    { visual: { type: 'carry' }, en: 'If a column makes 10 or more, we carry 1 to the next column.', si: 'තීරුවක් 10ක් හෝ වැඩි වුවහොත්, අපි ඊළඟ තීරුවට 1ක් රැගෙන යමු.' },
    { visual: { type: 'emoji', value: '✏️', count: 1 }, en: 'Add each column and write the total. Let’s try!', si: 'එක් එක් තීරුව එකතු කර එකතුව ලියන්න. උත්සාහ කරමු!' },
  ],
  subtraction: [
    { visual: { type: 'expr', value: '13 − 5 = 8' }, en: 'When we subtract, we also start from the right.', si: 'අඩු කරන විටද අපි දකුණෙන් පටන් ගනිමු.' },
    { visual: { type: 'expr', value: 'borrow 10' }, en: 'If the top number is smaller, we borrow 10 from the next column.', si: 'ඉහළ ඉලක්කම කුඩා නම්, ඊළඟ තීරුවෙන් 10ක් ණයට ගනිමු.' },
  ],
  times_tables: [
    { visual: { type: 'groups', rows: 3, cols: 4, emoji: '🍎' }, en: 'Multiplying is fast adding. 3 rows of 4 apples = 12.', si: 'ගුණ කිරීම යනු ඉක්මන් එකතු කිරීමයි. ඇපල් 4 බැගින් පේළි 3ක් = 12.' },
    { visual: { type: 'expr', value: '3 × 4 = 12' }, en: 'So 3 × 4 = 12. Learn the patterns and it gets easy!', si: 'එබැවින් 3 × 4 = 12. රටා ඉගෙන ගත්විට පහසු වේ!' },
  ],
  division: [
    { visual: { type: 'groups', rows: 3, cols: 4, emoji: '🍪' }, en: 'Dividing shares things into equal groups. 12 cookies in 3 groups = 4 each.', si: 'බෙදීම යනු සමාන කණ්ඩායම් වලට බෙදීමයි. කුකීස් 12ක් කණ්ඩායම් 3කට = බැගින් 4ක්.' },
    { visual: { type: 'expr', value: '13 ÷ 4 = 3 r 1' }, en: 'Sometimes there are leftovers — that is the remainder.', si: 'සමහර විට ඉතිරියක් ඇත — එය ඉතිරියයි.' },
  ],
  clock: [
    { visual: { type: 'clock', h: 3, m: 0 }, en: 'The short hand shows the hour. This says 3 o’clock.', si: 'කෙටි කටුව පැය පෙන්වයි. මෙය 3 යි.' },
    { visual: { type: 'clock', h: 3, m: 15 }, en: 'The long hand shows the minutes. This is quarter past 3.', si: 'දිගු කටුව මිනිත්තු පෙන්වයි. මෙය 3:15 යි.' },
  ],
  fractions: [
    { visual: { type: 'fractionBar', parts: 4, shaded: 1 }, en: 'A fraction is part of a whole. 1 part out of 4 is one quarter.', si: 'භාගයක් යනු සම්පූර්ණයකින් කොටසකි. 4න් කොටස් 1ක් යනු කාලකි.' },
    { visual: { type: 'fraction', top: 1, bottom: 4 }, en: 'Top number = shaded parts. Bottom number = total parts.', si: 'ඉහළ ඉලක්කම = වර්ණ කළ කොටස්. පහළ ඉලක්කම = මුළු කොටස්.' },
  ],
  shapes: [
    { visual: { type: 'shape', id: 'triangle' }, en: 'A triangle has 3 straight sides and 3 corners.', si: 'ත්‍රිකෝණයකට සෘජු පැති 3ක් සහ කොන් 3ක් ඇත.' },
    { visual: { type: 'shape', id: 'square' }, en: 'A square has 4 equal sides and 4 corners.', si: 'චතුරස්‍රයකට සමාන පැති 4ක් සහ කොන් 4ක් ඇත.' },
  ],
  shop: [
    { visual: { type: 'emoji', value: '🛒', count: 1 }, en: 'When you buy something, change = money you pay − the price.', si: 'යමක් මිලදී ගන්නා විට, ඉතිරිය = ඔබ ගෙවන මුදල − මිල.' },
    { visual: { type: 'expr', value: 'Rs.100 − Rs.65 = Rs.35' }, en: 'Pay Rs.100 for a Rs.65 item → you get Rs.35 back.', si: 'Rs.65 දෙයකට Rs.100 ගෙවුවොත් → ඔබට Rs.35 ආපසු ලැබේ.' },
  ],
  bar_chart: [
    { visual: { type: 'emoji', value: '📊', count: 1 }, en: 'A bar chart shows amounts. A taller bar means more.', si: 'තීරු සටහනක් ප්‍රමාණ පෙන්වයි. උස තීරුව යනු වැඩියි.' },
    { visual: { type: 'emoji', value: '🔝', count: 1 }, en: 'Read the number at the top of each bar.', si: 'එක් එක් තීරුවේ ඉහළ ඇති අංකය කියවන්න.' },
  ],
  assessment: [
    { visual: { type: 'emoji', value: '📝', count: 1 }, en: 'This is a quiz to see what you know. Try your best — take your time!', si: 'මෙය ඔබ දන්නා දේ බැලීමට ප්‍රශ්නාවලියකි. උපරිමය උත්සාහ කරන්න — හදිසි නැත!' },
  ],
};
