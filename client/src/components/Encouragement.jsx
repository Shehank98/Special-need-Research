import { useMemo } from 'react';

// Big, friendly answer reaction for grade-4 special-needs learners.
//
// Shows a bouncing buddy face + a short message in a chunky bubble:
//   type 'correct' -> green bubble, sparkle burst, celebration emoji
//   type 'retry'   -> warm yellow bubble, gentle cheer (never red/alarming)
//
// Purely visual + aria-live for screen readers; the caller handles TTS so the
// message is also read aloud. Render when `show` is true.
export default function Encouragement({ show, type = 'correct', message, emoji, buddy }) {
  const sparkles = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        // Spread sparkles in a ring around the buddy.
        angle: (360 / 8) * i,
        delay: (i % 4) * 0.06,
      })),
    []
  );

  if (!show) return null;

  const correct = type === 'correct';
  const bubble = correct
    ? 'bg-pastel-green ring-emerald-300'
    : 'bg-pastel-yellow ring-amber-300';

  return (
    <div
      className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center"
      aria-live="assertive"
    >
      <div
        className={`animate-pop-big relative flex flex-col items-center gap-2 rounded-[2rem]
                    px-8 py-6 text-center shadow-2xl ring-4 ${bubble}`}
      >
        {/* Sparkle burst (correct answers only) */}
        {correct &&
          sparkles.map((s) => (
            <span
              key={s.id}
              className="animate-sparkle absolute text-2xl"
              style={{
                // `--a` feeds the keyframe so each sparkle flies out at its own angle.
                '--a': `${s.angle}deg`,
                animationDelay: `${s.delay}s`,
              }}
              aria-hidden="true"
            >
              ✨
            </span>
          ))}

        <span
          className={`text-7xl ${correct ? 'animate-bounce-in' : 'animate-jiggle'}`}
          aria-hidden="true"
        >
          {buddy || (correct ? '🎉' : '💪')}
        </span>
        <p className="text-3xl font-extrabold text-ink">
          {emoji ? `${emoji} ` : ''}
          {message}
        </p>
      </div>
    </div>
  );
}
