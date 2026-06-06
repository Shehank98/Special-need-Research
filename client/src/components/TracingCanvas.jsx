import { useEffect, useRef, useState } from 'react';

// Tracing-on-dashed-marks canvas.
//  - guided=true (intervention): the word is shown as a dashed outline whose
//    dashes thin out as guideLevel rises (prompt fading). The child's stroke
//    turns green on-path and amber off-path; accuracy = % of on-path points.
//  - guided=false (control): the word is shown plainly and the child writes
//    freehand with a single neutral colour; no guides, no on/off feedback.
//
// onComplete({ accuracy_pct, time_ms, retries }) fires when the child taps Done.
const W = 360;
const H = 200;
const TOL = 18; // px tolerance to count a point as "on the path"

// Dash pattern by guide level: 1 = dense dashes ... 4 = very sparse.
const DASH = { 1: [6, 6], 2: [4, 12], 3: [2, 20], 4: [1, 30] };

export default function TracingCanvas({ word = '', guided = true, guideLevel = 1, onComplete }) {
  const drawRef = useRef(null);
  const maskRef = useRef(null);
  const drawingRef = useRef(false);
  const lastRef = useRef(null);
  const onPathRef = useRef(0);
  const totalRef = useRef(0);
  const startRef = useRef(Date.now());
  const [retries, setRetries] = useState(0);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Build the guide text + the offscreen mask used for accuracy.
  useEffect(() => {
    const draw = drawRef.current;
    const mask = maskRef.current;
    if (!draw || !mask) return;
    const dctx = draw.getContext('2d');
    const mctx = mask.getContext('2d');
    dctx.clearRect(0, 0, W, H);
    mctx.clearRect(0, 0, W, H);

    const font = `bold 120px 'OpenDyslexic', 'Comic Sans MS', sans-serif`;

    // Mask: solid thick text (used to test on-path proximity).
    mctx.font = font;
    mctx.textAlign = 'center';
    mctx.textBaseline = 'middle';
    mctx.fillStyle = '#000';
    mctx.fillText(word, W / 2, H / 2);

    // Visible guide.
    dctx.font = font;
    dctx.textAlign = 'center';
    dctx.textBaseline = 'middle';
    dctx.lineWidth = 2;
    if (guided) {
      dctx.setLineDash(DASH[guideLevel] || DASH[1]);
      dctx.strokeStyle = 'rgba(90,90,90,0.85)';
      dctx.strokeText(word, W / 2, H / 2);
    } else {
      // Plain: faint solid outline, no dashes.
      dctx.setLineDash([]);
      dctx.strokeStyle = 'rgba(120,120,120,0.5)';
      dctx.strokeText(word, W / 2, H / 2);
    }
    dctx.setLineDash([]);

    onPathRef.current = 0;
    totalRef.current = 0;
    startRef.current = Date.now();
    setHasDrawn(false);
  }, [word, guided, guideLevel]);

  function pos(e) {
    const r = drawRef.current.getBoundingClientRect();
    const p = e.touches ? e.touches[0] : e;
    return { x: ((p.clientX - r.left) / r.width) * W, y: ((p.clientY - r.top) / r.height) * H };
  }

  // Is (x,y) within TOL px of the glyph mask?
  function onPath(x, y) {
    const mctx = maskRef.current.getContext('2d');
    const sx = Math.max(0, Math.round(x - TOL));
    const sy = Math.max(0, Math.round(y - TOL));
    const w = Math.min(W - sx, TOL * 2);
    const h = Math.min(H - sy, TOL * 2);
    if (w <= 0 || h <= 0) return false;
    const data = mctx.getImageData(sx, sy, w, h).data;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] > 0) return true; // any opaque mask pixel nearby
    }
    return false;
  }

  function start(e) {
    e.preventDefault();
    drawingRef.current = true;
    lastRef.current = pos(e);
    setHasDrawn(true);
  }
  function move(e) {
    if (!drawingRef.current) return;
    e.preventDefault();
    const p = pos(e);
    const ctx = drawRef.current.getContext('2d');
    const hit = guided ? onPath(p.x, p.y) : true;
    totalRef.current += 1;
    if (hit) onPathRef.current += 1;
    ctx.strokeStyle = guided ? (hit ? '#22c55e' : '#f59e0b') : '#2563eb';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(lastRef.current.x, lastRef.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastRef.current = p;
  }
  function end() {
    drawingRef.current = false;
  }

  function clear() {
    setRetries((r) => r + 1);
    // redraw guide (re-run effect by toggling a dependency is overkill; just call)
    const draw = drawRef.current;
    const dctx = draw.getContext('2d');
    dctx.clearRect(0, 0, W, H);
    const font = `bold 120px 'OpenDyslexic', 'Comic Sans MS', sans-serif`;
    dctx.font = font;
    dctx.textAlign = 'center';
    dctx.textBaseline = 'middle';
    dctx.lineWidth = 2;
    if (guided) {
      dctx.setLineDash(DASH[guideLevel] || DASH[1]);
      dctx.strokeStyle = 'rgba(90,90,90,0.85)';
    } else {
      dctx.setLineDash([]);
      dctx.strokeStyle = 'rgba(120,120,120,0.5)';
    }
    dctx.strokeText(word, W / 2, H / 2);
    dctx.setLineDash([]);
    onPathRef.current = 0;
    totalRef.current = 0;
    setHasDrawn(false);
  }

  function done() {
    const total = totalRef.current;
    const acc = total > 0 ? Math.round((onPathRef.current / total) * 100) : 0;
    onComplete?.({
      accuracy_pct: guided ? acc : null,
      time_ms: Date.now() - startRef.current,
      retries,
    });
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="rounded-2xl bg-white/80 p-2 shadow">
        {/* hidden mask canvas */}
        <canvas ref={maskRef} width={W} height={H} className="hidden" />
        <canvas
          ref={drawRef}
          width={W}
          height={H}
          className="touch-none rounded-xl"
          style={{ width: '100%', maxWidth: W, height: 'auto', cursor: 'crosshair' }}
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={end}
        />
      </div>
      <div className="flex w-full gap-3">
        <button onClick={clear} className="btn-soft flex-1">🔄</button>
        <button onClick={done} disabled={!hasDrawn} className="btn-primary flex-1 disabled:opacity-50">✅</button>
      </div>
    </div>
  );
}
