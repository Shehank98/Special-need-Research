import { useLanguage } from '../../context/LanguageContext.jsx';

const PLACES = [
  { en: 'ones', si: 'එක' },
  { en: 'tens', si: 'දස' },
  { en: 'hundreds', si: 'සිය' },
  { en: 'thousands', si: 'දහස්' },
];

// Renders one animated teaching visual based on `v.type`.
export default function TeachVisual({ v }) {
  const { lang } = useLanguage();
  if (!v) return null;

  switch (v.type) {
    case 'emoji':
      return (
        <div className="flex justify-center gap-2">
          {Array.from({ length: v.count || 1 }).map((_, i) => (
            <span key={i} className="animate-float text-8xl" style={{ animationDelay: `${i * 0.15}s` }}>
              {v.value}
            </span>
          ))}
        </div>
      );

    case 'expr':
      return (
        <div className="animate-bounce-in rounded-2xl bg-white px-6 py-5 text-center text-4xl font-bold text-slate-800 shadow">
          {v.value}
        </div>
      );

    case 'number': {
      const digits = String(v.value).split('');
      const n = digits.length;
      return (
        <div className="flex justify-center gap-2">
          {digits.map((d, i) => {
            const placeFromRight = n - 1 - i; // 0=ones
            const isHi = v.highlight === placeFromRight;
            const place = PLACES[placeFromRight];
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <span
                  className={`flex h-20 w-16 items-center justify-center rounded-2xl text-5xl font-bold shadow ${
                    isHi ? 'animate-wiggle bg-amber-300 text-slate-900' : 'bg-white text-slate-700'
                  }`}
                >
                  {d}
                </span>
                <span className={`text-xs ${isHi ? 'font-bold text-amber-700' : 'text-slate-400'}`}>
                  {place ? (lang === 'si' ? place.si : place.en) : ''}
                </span>
              </div>
            );
          })}
        </div>
      );
    }

    case 'carry':
      return (
        <div className="relative mx-auto w-fit rounded-2xl bg-white p-6 font-mono text-4xl font-bold shadow">
          <span className="animate-carry absolute left-6 top-8 text-2xl text-rose-500">1</span>
          <div className="text-right">27</div>
          <div className="text-right text-sky-600">+&nbsp;5</div>
          <div className="my-1 h-1 rounded bg-slate-800" />
          <div className="text-right text-emerald-600">32</div>
        </div>
      );

    case 'groups': {
      const { rows = 3, cols = 4, emoji = '🍎' } = v;
      return (
        <div className="inline-flex flex-col gap-1 rounded-2xl bg-white p-4 shadow">
          {Array.from({ length: rows }).map((_, ri) => (
            <div key={ri} className="flex gap-1">
              {Array.from({ length: cols }).map((_, ci) => (
                <span
                  key={ci}
                  className="animate-bounce-in text-3xl"
                  style={{ animationDelay: `${(ri * cols + ci) * 0.05}s` }}
                >
                  {emoji}
                </span>
              ))}
            </div>
          ))}
        </div>
      );
    }

    case 'fractionBar': {
      const { parts = 4, shaded = 1 } = v;
      const w = 300;
      const seg = w / parts;
      return (
        <svg viewBox={`0 0 ${w} 70`} className="mx-auto h-24 w-full max-w-sm">
          {Array.from({ length: parts }).map((_, i) => (
            <rect
              key={i}
              x={i * seg}
              y={5}
              width={seg}
              height={60}
              fill={i < shaded ? '#38bdf8' : '#f1f5f9'}
              stroke="#0f172a"
              strokeWidth="2"
            >
              {i < shaded && <animate attributeName="opacity" from="0" to="1" dur="0.6s" begin={`${i * 0.2}s`} fill="freeze" />}
            </rect>
          ))}
        </svg>
      );
    }

    case 'fraction':
      return (
        <div className="animate-bounce-in inline-flex flex-col items-center text-6xl font-bold text-sky-600">
          <span>{v.top}</span>
          <span className="my-1 h-1 w-16 bg-sky-600" />
          <span>{v.bottom}</span>
        </div>
      );

    case 'clock': {
      const { h = 3, m = 0 } = v;
      const minA = m * 6;
      const hourA = (h % 12) * 30 + m * 0.5;
      const hand = (a, len, wgt, color) => {
        const rad = (a - 90) * (Math.PI / 180);
        return <line x1="100" y1="100" x2={100 + len * Math.cos(rad)} y2={100 + len * Math.sin(rad)} stroke={color} strokeWidth={wgt} strokeLinecap="round" />;
      };
      return (
        <svg viewBox="0 0 200 200" className="mx-auto h-48 w-48 animate-bounce-in">
          <circle cx="100" cy="100" r="95" fill="#fff" stroke="#1e293b" strokeWidth="5" />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i * 30 - 90) * (Math.PI / 180);
            return (
              <text key={i} x={100 + 78 * Math.cos(a)} y={100 + 78 * Math.sin(a) + 6} textAnchor="middle" fontSize="16" fontWeight="bold" fill="#334155">
                {i === 0 ? 12 : i}
              </text>
            );
          })}
          {hand(hourA, 48, 7, '#0f172a')}
          {hand(minA, 70, 5, '#0284c7')}
          <circle cx="100" cy="100" r="6" fill="#0f172a" />
        </svg>
      );
    }

    case 'shape': {
      const c = { fill: '#a78bfa', stroke: '#4c1d95', strokeWidth: 4 };
      return (
        <svg viewBox="0 0 120 120" className="mx-auto h-40 w-40 animate-bounce-in">
          {v.id === 'triangle' && <polygon points="60,12 108,104 12,104" {...c} />}
          {v.id === 'square' && <rect x="15" y="15" width="90" height="90" {...c} />}
          {v.id === 'rectangle' && <rect x="10" y="35" width="100" height="50" {...c} />}
          {v.id === 'circle' && <circle cx="60" cy="60" r="50" {...c} />}
        </svg>
      );
    }

    default:
      return null;
  }
}
