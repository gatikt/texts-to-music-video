// core.js — paper, paint, lettering, receipts (real texts), camera, timing, compositing.
// Canvas is PORTRAIT 1080×1920. Every frame is a pure function of t (frames render in parallel, out of order).
const W = 1080, H = 1920, TAU = Math.PI * 2, BOIL = 12;
const DUR = TL.duration, BPM = TL.bpm, BEAT = 60 / BPM, BEATS = TL.beats;

const PAL = {
  paper: '#F4ECDD', cream: '#FFF6E6', ink: '#2A2230', night: '#1E2148', indigo: '#33407E',
  bay: '#3E6FA8', sky: '#9CC8E8', blush: '#F3A7B5', rose: '#E46F8C', hot: '#FF4FA0',
  coral: '#F2876A', ochre: '#E9AE3C', butter: '#F7D774', sage: '#86AE7A', teal: '#3E9C97',
  violet: '#7E62AE', lilac: '#C3B1E1', skin1: '#C98D67', skin2: '#B57B56', hair: '#2B2026',
  imsgBlue: '#0A84FF', imsgGrey: '#E9E9EB',
};

// ---------- math / timing ----------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, x) => a + (b - a) * x;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const frac = x => x - Math.floor(x);
const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const easeIn = x => Math.pow(clamp(x), 3);
const easeInOut = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const backOut = (x, s = 1.9) => { x = clamp(x); return 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); };
const elasticOut = x => { x = clamp(x); return x === 0 || x === 1 ? x : Math.pow(2, -10 * x) * Math.sin((x * 10 - .75) * (TAU / 3)) + 1; };
const hash = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const wob = (t, f = 1, ph = 0) => Math.sin((t * f + ph) * TAU);
// jit uses p5's random(), reseeded 12×/s → linework "boils" like hand-drawn animation (wanted).
const jit = a => (random() * 2 - 1) * a;
function kf(t, keys, e = ease) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (t < keys[i][0]) {
    const [a, va] = keys[i - 1], [b, vb] = keys[i], k = e((t - a) / (b - a));
    return Array.isArray(va) ? va.map((v, j) => lerp(v, vb[j], k)) : lerp(va, vb, k);
  }
  return keys[keys.length - 1][1];
}
function mixCol(a, b, k) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16), c = i => Math.round(lerp((pa >> i) & 255, (pb >> i) & 255, clamp(k)));
  return '#' + ((1 << 24) + (c(16) << 16) + (c(8) << 8) + c(0)).toString(16).slice(1);
}
// beats (the real detected grid from beats.json, via TL.beats / TL.bpm)
function beatN(t) { let lo = 0, hi = BEATS.length - 1; if (t < BEATS[0]) return Math.floor((t - BEATS[0]) / BEAT); if (t >= BEATS[hi]) return hi + Math.floor((t - BEATS[hi]) / BEAT); while (lo < hi) { const m = (lo + hi + 1) >> 1; if (BEATS[m] <= t) lo = m; else hi = m - 1; } return lo; }
const beatT = n => (n < 0 ? BEATS[0] + n * BEAT : n >= BEATS.length ? BEATS[BEATS.length - 1] + (n - BEATS.length + 1) * BEAT : BEATS[n]);
const beatPh = t => { const n = beatN(t), a = beatT(n), b = beatT(n + 1); return clamp((t - a) / (b - a)); };
const pulse = (t, k = 6) => Math.exp(-beatPh(t) * k);                 // 1 on each beat, decays
const pulse2 = (t, k = 6) => Math.exp(-frac(beatPh(t) * 2) * k);      // eighth notes
const snapBeat = time => { const n = beatN(time), a = beatT(n), b = beatT(n + 1); return time - a < b - time ? a : b; };
const shakeXY = (t, amt) => { const f = Math.floor(t * 24); return [(hash(f * 1.7) - .5) * 2 * amt, (hash(f * 2.3 + 9) - .5) * 2 * amt]; };
// lyrics
const lineAt = t => TL.lines.find(l => t >= l.s && t < l.e) || null;
const wordT = (lineIdx, wordIdx) => TL.lines[lineIdx].words[wordIdx].s;

// ---------- camera (one level) ----------
let CAM = null;
function camBegin(cx = W / 2, cy = H / 2, zoom = 1, rot = 0) { push(); translate(W / 2, H / 2); rotate(rot); scale(zoom); translate(-cx, -cy); CAM = { cx, cy, zoom, rot }; }
function camEnd() { pop(); CAM = null; }
function toScreen(x, y) {
  if (!CAM) return [x, y];
  const c = Math.cos(CAM.rot), s = Math.sin(CAM.rot), dx = (x - CAM.cx) * CAM.zoom, dy = (y - CAM.cy) * CAM.zoom;
  return [W / 2 + dx * c - dy * s, H / 2 + dx * s + dy * c];
}

// ---------- geometry ----------
function rectPts(x, y, w, h, j = 0) {
  return [[x + jit(j), y + jit(j)], [x + w / 2 + jit(j), y + jit(j) * .5], [x + w + jit(j), y + jit(j)], [x + w + jit(j) * .5, y + h / 2],
          [x + w + jit(j), y + h + jit(j)], [x + w / 2 + jit(j), y + h + jit(j) * .5], [x + jit(j), y + h + jit(j)], [x + jit(j) * .5, y + h / 2]];
}
function ellPts(cx, cy, rx, ry, n = 28, j = 0, rot = 0) { const p = []; for (let i = 0; i < n; i++) { const a = rot + i / n * TAU; p.push([cx + Math.cos(a) * rx + jit(j), cy + Math.sin(a) * ry + jit(j)]); } return p; }
function rrPts(x, y, w, h, r, j = 0) {
  const p = [], n = 5, corner = (cx, cy, a0) => { for (let i = 0; i <= n; i++) { const a = a0 + i / n * Math.PI / 2; p.push([cx + Math.cos(a) * r + jit(j), cy + Math.sin(a) * r + jit(j)]); } };
  corner(x + w - r, y + r, -Math.PI / 2); corner(x + w - r, y + h - r, 0); corner(x + r, y + h - r, Math.PI / 2); corner(x + r, y + r, Math.PI); return p;
}
function starPts(cx, cy, r, inner = .42, n = 5, rot = -Math.PI / 2) { const p = []; for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, q = i % 2 ? r * inner : r; p.push([cx + Math.cos(a) * q, cy + Math.sin(a) * q]); } return p; }
function heartPts(cx, cy, r, n = 36) { const p = []; for (let i = 0; i < n; i++) { const a = i / n * TAU; p.push([cx + r * 16 * Math.pow(Math.sin(a), 3) / 16, cy - r * (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) / 16]); } return p; }
const xform = (pts, dx = 0, dy = 0, s = 1, r = 0) => pts.map(([x, y]) => [dx + (x * Math.cos(r) - y * Math.sin(r)) * s, dy + (x * Math.sin(r) + y * Math.cos(r)) * s]);

// ---------- paint ----------
// paint(pts, {wash, washOp, fill, fillOp, bleed, tex, border, hatch:{d,a,o,b,c,w}, ink, sw, br, curv})
function paint(pts, o = {}) {
  if (o.wash || o.fill || o.hatch) {
    if (o.wash) brush.wash(o.wash, o.washOp ?? 255); else brush.noWash();
    if (o.fill) { brush.fill(o.fill, o.fillOp ?? 170); brush.fillBleed(o.bleed ?? .1); brush.fillTexture(o.tex ?? .4, o.border ?? .35); } else brush.noFill();
    if (o.hatch) { brush.hatch(o.hatch.d, o.hatch.a, o.hatch.o || { rand: .15 }); brush.hatchStyle(o.hatch.b || 'HB', o.hatch.c || PAL.ink, o.hatch.w || 1); } else brush.noHatch();
    brush.noStroke();
    if (o.curv) { brush.beginShape(o.curv); for (const p of pts) brush.vertex(p[0], p[1]); brush.endShape(true); } else brush.polygon(pts);
  }
  if (o.ink !== null) {
    brush.noWash(); brush.noFill(); brush.noHatch(); brush.set(o.br || 'ink', o.ink || PAL.ink, o.sw ?? 1);
    brush.beginShape(o.curv || 0); for (const p of pts) brush.vertex(p[0], p[1]); brush.endShape(true);
  }
}
function inkLine(pts, sw = 1, col = PAL.ink, br = 'ink', curv = .5) { if (pts.length === 2) pts = [pts[0], [(pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2], pts[1]]; brush.noFill(); brush.noWash(); brush.noHatch(); brush.set(br, col, sw); brush.spline(pts, curv); }
function bg(col) { paint(rectPts(-80, -80, W + 160, H + 160), { wash: col, ink: null }); }
function wash(pts, col, op = 255) { paint(pts, { wash: col, washOp: op, ink: null }); }
function glow(cx, cy, r, col, op = 90) { paint(ellPts(cx, cy, r, r, 30, r * .04), { fill: col, fillOp: op, bleed: .25, tex: .3, border: .1, ink: null }); }

// ---------- 2D overlay queue (lettering, receipts, photos) — composited crisp over the paint, under the grain ----------
let OVL = [];
const FONTS = { marker: '"Permanent Marker"', shantell: '"Shantell Sans"', caveat: '"Caveat"', slab: '"Helvetica Neue"', sys: '-apple-system, "SF Pro Text", "Helvetica Neue", sans-serif', mono: 'Menlo, monospace' };
const placed = (x, y, size, o) => { if (CAM && !o.screen) { [x, y] = toScreen(x, y); size *= CAM.zoom; o = { ...o, rot: (o.rot || 0) + CAM.rot }; } return [x, y, size, o]; };
// letter(txt, x, y, size, color, {font:'marker'|'shantell'|'slab'|'caveat', weight, stretch, pop(0..1), rot, alpha, shadow(color|false), stroke, align, screen})
function letter(txt, x, y, size, color, o = {}) { [x, y, size, o] = placed(x, y, size, o); OVL.push({ k: 'txt', txt, x, y, size, color, ...o }); }
function sfx(txt, x, y, size, color, age, o = {}) {
  const life = o.life ?? 1.2; if (age < 0 || age > life) return;
  letter(txt, x, y, size, color, { pop: age * 5, rot: (o.rot ?? -.08) + Math.sin(age * 20) * .03 * (1 - age / life), alpha: 1 - seg(age, life - .25, life), ...o });
}
// receipt: a REAL iMessage bubble. who: 'her' | 'me'. pop 0..1. Text must be verbatim from the chat (checked by tools/checkquotes.mjs).
function receipt(text, who, x, y, o = {}) { const sz = o.size || 40; [x, y, , o] = placed(x, y, sz, o); OVL.push({ k: 'bub', text, who, x, y, size: (o.size || 40) * (CAM && !o.screen ? CAM.zoom : 1), ...o }); }
function tsLabel(text, x, y, o = {}) { letter(text, x, y, o.size || 24, '#8A8A8E', { font: 'sys', shadow: false, weight: 500, ...o }); }
// photo(name, x, y, w, {rot, pop, tape, alpha, border}) — name is a file in assets/ (halftone prints) — drawn as a taped print
function photo(name, x, y, w, o = {}) { [x, y, w, o] = placed(x, y, w, o); OVL.push({ k: 'img', name, x, y, w, ...o }); }
const IMG = {};
// big-lyric helper: words of TL.lines[i] slam in on their sung times. o: {x,y,size,color,shadow,font,maxW,lineH,align,stagger}
function bigLyric(t, i, o = {}) {
  const L = TL.lines[i], words = o.words || L.words.map(w => w.w);
  const size = o.size || 150, maxW = o.maxW || W - 170, lh = o.lineH || size * .92;
  const ctx = MEASURE; ctx.font = fontStr(o.font || 'slab', size, o.weight ?? 900, o.stretch ?? 'condensed');
  if ('fontStretch' in ctx) ctx.fontStretch = o.stretch ?? 'condensed';
  // greedy wrap
  const rows = []; let row = [], wsum = 0;
  words.forEach((w, j) => { const ww = ctx.measureText((o.upper === false ? w : w.toUpperCase()) + ' ').width; if (wsum + ww > maxW && row.length) { rows.push(row); row = []; wsum = 0; } row.push(j); wsum += ww; });
  if (row.length) rows.push(row);
  const x0 = o.x ?? 60, y0 = o.y ?? 400;
  rows.forEach((r, ri) => {
    let x = x0;
    if (o.align === 'center') { const rw = r.reduce((s, j) => s + ctx.measureText((o.upper === false ? words[j] : words[j].toUpperCase()) + ' ').width, 0); x = W / 2 - rw / 2; }
    r.forEach(j => {
      const ws = (L.words[j] ? L.words[j].s : L.s) + (o.lead ?? -0.04);
      const txt = o.upper === false ? words[j] : words[j].toUpperCase(); const wd = ctx.measureText(txt + ' ').width;
      const age = t - ws;
      if (age >= 0) letter(txt, x, y0 + ri * lh, size, (o.colors && o.colors[j]) || o.color || PAL.ink, { font: o.font || 'slab', weight: o.weight ?? 900, stretch: o.stretch ?? 'condensed', align: 'left', pop: age * (o.popRate || 7), shadow: o.shadow ?? PAL.hot, rot: (o.rot || 0) + (hash(i * 31 + j) - .5) * (o.wiggle ?? .06), screen: o.screen });
      x += wd;
    });
  });
}
const fontStr = (f, size, weight = 400, stretch) => `${weight} ${size}px ${FONTS[f] || f}`;
let MEASURE = null;

// ---------- full-frame effects ----------
function flash(k, col = '#FFF8EC') { if (k > .01) paint(rectPts(-80, -80, W + 160, H + 160), { wash: col, washOp: 255 * clamp(k), ink: null }); }
function irisShape(pts, col = PAL.ink, far = 5000) {
  const n = pts.length; let cx = 0, cy = 0; for (const p of pts) { cx += p[0]; cy += p[1]; } cx /= n; cy /= n;
  const out = p => { const dx = p[0] - cx, dy = p[1] - cy, d = Math.hypot(dx, dy) || 1; return [cx + dx / d * far, cy + dy / d * far]; };
  for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % n], ex = (b[0] - a[0]) * .06, ey = (b[1] - a[1]) * .06, a2 = [a[0] - ex, a[1] - ey], b2 = [b[0] + ex, b[1] + ey]; paint([a2, b2, out(b2), out(a2)], { wash: col, ink: null }); }
}
function iris(cx, cy, r, col = PAL.ink) { if (r < 4) bg(col); else irisShape(ellPts(cx, cy, r, r, 40), col); }

// ---------- paper + grain ----------
function lcg(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
function makePaper() {
  const g = createGraphics(W, H); g.pixelDensity(1); const c = g.drawingContext, rnd = lcg(11);
  c.fillStyle = PAL.paper; c.fillRect(0, 0, W, H);
  for (let i = 0; i < 90; i++) { const x = rnd() * W, y = rnd() * H, r = 120 + rnd() * 420, gr = c.createRadialGradient(x, y, 0, x, y, r), a = .045 * rnd(); gr.addColorStop(0, `rgba(160,125,80,${a})`); gr.addColorStop(1, 'rgba(160,125,80,0)'); c.fillStyle = gr; c.fillRect(x - r, y - r, 2 * r, 2 * r); }
  for (let i = 0; i < 1800; i++) { const x = rnd() * W, y = rnd() * H, l = 6 + rnd() * 26, a = rnd() * TAU; c.strokeStyle = `rgba(110,88,60,${.035 + rnd() * .06})`; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a + .6) * l * .5, y + Math.sin(a + .6) * l * .5, x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke(); }
  return g;
}
function makeGrain() {
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d'), rnd = lcg(5);
  const id = c.createImageData(W, H), d = id.data;
  for (let i = 0; i < d.length; i += 4) { const v = 255 - (rnd() < .55 ? rnd() * rnd() * 34 : 0); d[i] = v; d[i + 1] = v - 1; d[i + 2] = v - 3; d[i + 3] = 255; }
  c.putImageData(id, 0, 0);
  const g = c.createRadialGradient(W / 2, H / 2, H * .38, W / 2, H / 2, H * .75); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(120,95,70,.32)');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  return cv;
}
function defineBrushes() {
  brush.add('ink', { type: 'default', weight: 5, scatter: .25, sharpness: .8, grain: 40, opacity: 235, spacing: .2, pressure: [1.15, .75], rotate: 'natural', noise: .15 });
  brush.add('inkfine', { type: 'default', weight: 2.6, scatter: .15, sharpness: .85, grain: 40, opacity: 230, spacing: .2, pressure: [1.1, .8], rotate: 'natural', noise: .1 });
  brush.add('dry', { type: 'default', weight: 14, scatter: 3, sharpness: .3, grain: 6, opacity: 90, spacing: .6, pressure: [1, .6], rotate: 'natural', noise: .4 });
}
