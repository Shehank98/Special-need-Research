// Warm, varied encouragement for grade-4 special-needs learners.
//
// Every answer gets a friendly reaction: lots of different praise so it never
// feels repetitive, and GENTLE "try again" lines that never scold. Pair the
// message with a happy buddy face + a celebration emoji and read it aloud (TTS)
// for non-readers. Kept bilingual (en/si) in one place so both quiz engines and
// any future activity reuse the exact same warm voice.

// Cheerful praise shown on a correct answer.
export const PRAISE = [
  { en: 'Great job!', si: 'ඉතා හොඳයි!' },
  { en: 'Amazing!', si: 'අපූරුයි!' },
  { en: "You're a star!", si: 'ඔබ තරුවක්!' },
  { en: 'Brilliant!', si: 'දක්ෂයි!' },
  { en: 'Wonderful!', si: 'විශිෂ්ටයි!' },
  { en: 'Super!', si: 'සුපිරි!' },
  { en: 'Well done!', si: 'හොඳට කළා!' },
  { en: 'Fantastic!', si: 'පුදුමාකාරයි!' },
  { en: 'You did it!', si: 'ඔබ කළා!' },
  { en: 'Awesome!', si: 'නියමයි!' },
  { en: 'Perfect!', si: 'පරිපූර්ණයි!' },
  { en: 'Keep it up!', si: 'දිගටම කරගෙන යන්න!' },
];

// Soft, hopeful nudges shown on a wrong answer — encouraging, never negative.
export const RETRY = [
  { en: 'Almost! Try again.', si: 'ආසන්නයි! නැවත උත්සාහ කරන්න.' },
  { en: 'You can do it!', si: 'ඔබට පුළුවන්!' },
  { en: 'Good try! Once more.', si: 'හොඳ උත්සාහයක්! තව වරක්.' },
  { en: 'Nearly there!', si: 'ආ ළඟයි!' },
  { en: "Don't give up!", si: 'අත් නොහරින්න!' },
  { en: "Let's try together!", si: 'එකට උත්සාහ කරමු!' },
  { en: 'So close!', si: 'හරිම ළඟයි!' },
];

// Celebration emojis sprinkled on a correct answer.
export const CELEBRATE_EMOJI = ['🎉', '🌟', '⭐', '🎈', '🥳', '🦄', '🚀', '🌈', '✨', '🏆', '🎊', '💫'];

// Friendly buddy faces — happy for correct, a thoughtful cheer for retry.
export const BUDDY_HAPPY = ['🐶', '🐵', '🦊', '🐱', '🐰', '🐨', '🐯', '🦁'];
export const BUDDY_CHEER = ['💪', '🤗', '👍', '🙌'];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function randomPraise(lang = 'en') {
  const p = pick(PRAISE);
  return lang === 'si' ? p.si : p.en;
}

export function randomRetry(lang = 'en') {
  const r = pick(RETRY);
  return lang === 'si' ? r.si : r.en;
}

export const randomCelebrateEmoji = () => pick(CELEBRATE_EMOJI);
export const randomBuddyHappy = () => pick(BUDDY_HAPPY);
export const randomBuddyCheer = () => pick(BUDDY_CHEER);
