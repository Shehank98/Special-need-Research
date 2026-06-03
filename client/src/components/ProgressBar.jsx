// Friendly, chunky progress bar.
export default function ProgressBar({ value = 0, max = 100, color = 'bg-green-400' }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="h-6 w-full overflow-hidden rounded-full bg-white/70 shadow-inner">
      <div
        className={`h-full rounded-full ${color} transition-all duration-500`}
        style={{ width: `${pct}%` }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      />
    </div>
  );
}
