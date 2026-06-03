import { useMemo } from 'react';

// Lightweight CSS confetti — no dependencies. Render when `show` is true.
export default function Confetti({ show, count = 60 }) {
  const pieces = useMemo(() => {
    const colors = ['#ffd6e0', '#cfe8ef', '#d8f3dc', '#fff3b0', '#e7d6ff', '#ffb3c1'];
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      duration: 1.8 + Math.random() * 1.4,
      color: colors[i % colors.length],
    }));
  }, [count]);

  if (!show) return null;
  return (
    <div className="pointer-events-none" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}vw`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
