// frame.js — chapter registry, global overlays (karaoke, MSGS SENT odometer, date/age stamp), compositing, render hooks.
const CHAPTERS = [];
// chapter(name, start, end, shots): shots = [[t0, fn, opts?], ...]. fn(t, lt, dur) paints the WHOLE frame (background too).
// opts: { karaoke: 'sub' | 'none', meter: true|false, stamp: true|false, age: false|'AGE 17', date: 'YYYY-MM-DD', time: 'H:MM AM' }
function chapter(name, start, end, shots) { CHAPTERS.push({ name, start, end, shots: shots.map(([t0, fn, o]) => ({ t0, fn, o: o || {} })) }); CHAPTERS.sort((a, b) => a.start - b.start); }
function shotAt(t) {
  const ch = CHAPTERS.find(c => t >= c.start && t < c.end) || CHAPTERS[CHAPTERS.length - 1];
  if (!ch) return null;
  let i = 0; for (let k = 0; k < ch.shots.length; k++) if (t >= ch.shots[k].t0) i = k;
  const s = ch.shots[i], next = ch.shots[i + 1] ? ch.shots[i + 1].t0 : ch.end;
  return { ch, s, lt: t - s.t0, dur: next - s.t0 };
}

let T = 0, paperG = null, grainC = null, outC = null, outX = null, CUR = null;

// lab mode (studio.html?lab=name loads src/lab/name.js): labShot(fn, opts) replaces the whole timeline for test renders.
let LAB = null; function labShot(fn, o = {}) { LAB = { ch: { name: 'lab' }, s: { t0: 0, fn, o }, lt: 0, dur: DUR }; }
function drawWorld(t) {
  if (LAB) { CUR = { ...LAB, lt: t }; CUR.s.fn(t, t, DUR); return; }
  CUR = shotAt(t);
  if (!CUR) { bg(PAL.paper); return; }
  CUR.s.fn(t, CUR.lt, CUR.dur);
}

// ---------- overlay drawing (2D) ----------
function drawText(c, L) {
  const k = L.pop != null ? backOut(L.pop) : 1; if (k <= .01) return;
  c.save(); c.translate(L.x, L.y); c.rotate(L.rot || 0); c.scale(k, k); c.globalAlpha = L.alpha ?? 1;
  c.font = fontStr(L.font || 'marker', L.size, L.weight ?? 400);
  if ('fontStretch' in c) c.fontStretch = L.stretch || 'normal';
  c.textAlign = L.align || 'center'; c.textBaseline = L.baseline || 'middle';
  if (L.stroke) { c.lineJoin = 'round'; c.lineWidth = L.strokeW || L.size * .12; c.strokeStyle = L.stroke; c.strokeText(L.txt, 0, 0); }
  if (L.shadow !== false) { c.fillStyle = L.shadow || PAL.ink; c.fillText(L.txt, L.size * .05, L.size * .06); }
  c.fillStyle = L.color; c.fillText(L.txt, 0, 0);
  if ('fontStretch' in c) c.fontStretch = 'normal';
  c.restore();
}
function wrapLines(c, text, maxW) {
  const words = text.split(' '), out = []; let cur = '';
  for (const w of words) { const t2 = cur ? cur + ' ' + w : w; if (c.measureText(t2).width > maxW && cur) { out.push(cur); cur = w; } else cur = t2; }
  if (cur) out.push(cur); return out;
}
function drawBubble(c, B) {
  const k = B.pop != null ? backOut(B.pop) : 1; if (k <= .01) return;
  const sz = B.size, pad = sz * .5, maxW = B.maxW || W * .62;
  c.save(); c.font = `400 ${sz}px ${FONTS.sys}`;
  const lines = wrapLines(c, B.text, maxW - pad * 2), tw = Math.max(...lines.map(l => c.measureText(l).width));
  const bw = tw + pad * 2, bh = lines.length * sz * 1.22 + pad * 1.05, me = (B.who === 'me') !== !!B.mirror;  // mirror: show from the other person's phone (her sends = blue on her phone)
  // anchor: x is the bubble's outer edge (left edge for 'her', right edge for 'me'), y is its top
  const bx = me ? B.x - bw : B.x, by = B.y;
  c.translate(me ? B.x : B.x, by + bh); c.rotate(B.rot || 0); c.scale(k, k); c.translate(-(me ? B.x : B.x), -(by + bh));
  c.globalAlpha = B.alpha ?? 1;
  const r = Math.min(sz * .9, bh / 2);
  c.beginPath(); c.roundRect(bx, by, bw, bh, r);
  c.fillStyle = me ? PAL.imsgBlue : PAL.imsgGrey;
  if (B.shadow !== false) { c.save(); c.translate(6, 8); c.fillStyle = 'rgba(42,34,48,.85)'; c.fill(); c.restore(); }
  c.fill();
  // tail
  c.beginPath();
  if (me) { c.moveTo(bx + bw - r * .2, by + bh - r * .9); c.quadraticCurveTo(bx + bw + 2, by + bh, bx + bw + sz * .32, by + bh + 2); c.quadraticCurveTo(bx + bw - r * .3, by + bh + 1, bx + bw - r * .9, by + bh - r * .2); }
  else { c.moveTo(bx + r * .2, by + bh - r * .9); c.quadraticCurveTo(bx - 2, by + bh, bx - sz * .32, by + bh + 2); c.quadraticCurveTo(bx + r * .3, by + bh + 1, bx + r * .9, by + bh - r * .2); }
  c.fill();
  c.fillStyle = me ? '#FFFFFF' : '#000000'; c.textBaseline = 'top';
  lines.forEach((l, i) => c.fillText(l, bx + pad, by + pad * .52 + i * sz * 1.22));
  c.restore();
}
function drawImg(c, P) {
  const img = IMG[P.name]; if (!img || !img.naturalWidth) return;
  const k = P.pop != null ? backOut(P.pop) : 1; if (k <= .01) return;
  const w = P.w, h = w * img.naturalHeight / img.naturalWidth, b = P.border ?? Math.round(w * .025);
  c.save(); c.translate(P.x, P.y); c.rotate(P.rot || 0); c.scale(k, k); c.globalAlpha = P.alpha ?? 1;
  c.fillStyle = 'rgba(42,34,48,.85)'; c.fillRect(-w / 2 - b + 10, -h / 2 - b + 12, w + 2 * b, h + 2 * b);
  c.fillStyle = '#FFFDF7'; c.fillRect(-w / 2 - b, -h / 2 - b, w + 2 * b, h + 2 * b);
  c.drawImage(img, -w / 2, -h / 2, w, h);
  if (P.tape !== false) { c.fillStyle = 'rgba(247,215,116,.82)'; c.save(); c.translate(0, -h / 2 - b); c.rotate(-.12); c.fillRect(-w * .14, -18, w * .28, 40); c.restore(); }
  c.restore();
}
function drawOverlays(c) { for (const o of OVL) { if (o.k === 'txt') drawText(c, o); else if (o.k === 'bub') drawBubble(c, o); else if (o.k === 'img') drawImg(c, o); } }

// ---------- karaoke strip (default: on) ----------
function drawKaraoke(c, t) {
  const o = CUR ? CUR.s.o : {}; if (o.karaoke === 'none') return;
  const L = lineAt(t); if (!L) return;
  const k = backOut(seg(t, L.s - .05, L.s + .18)), out = seg(t, L.e - .12, L.e);
  const y = o.karaokeY ?? 1700, size = 52;
  c.save(); c.globalAlpha = 1 - out;
  c.font = `800 ${size}px ${FONTS.shantell}`;
  const rows = wrapLines(c, L.words.map(w => w.w).join(' '), W - 160);
  const rh = size * 1.18, boxH = rows.length * rh + 34, boxW = Math.max(...rows.map(r => c.measureText(r).width)) + 64;
  c.translate(W / 2, y + (1 - k) * 60); c.rotate(-.012 + Math.sin(L.i * 2.1) * .01);
  c.fillStyle = 'rgba(42,34,48,.9)'; c.fillRect(-boxW / 2 + 8, -boxH / 2 + 10, boxW, boxH);
  c.fillStyle = '#FFF8EC'; c.fillRect(-boxW / 2, -boxH / 2, boxW, boxH);
  c.textBaseline = 'middle'; c.textAlign = 'left';
  let wi = 0;
  rows.forEach((r, ri) => {
    const ws = r.split(' '); let x = -c.measureText(r).width / 2; const yy = -boxH / 2 + 17 + rh * (ri + .5);
    ws.forEach(w => {
      const wd = L.words[wi], on = wd && t >= wd.s, hot = wd && t >= wd.s && t < wd.s + .22;
      c.fillStyle = on ? (hot ? PAL.hot : PAL.ink) : 'rgba(42,34,48,.32)';
      const lift = hot ? -6 * (1 - (t - wd.s) / .22) : 0;
      c.fillText(w, x, yy + lift); x += c.measureText(w + ' ').width; wi++;
    });
  });
  c.restore();
}
// ---------- HUD data: the protagonist's real sent messages per day ----------
// Comes from the project, not the engine: src/msg_data.js (generated by `node tools/msgcounts.mjs`, which counts is_me=1 rows of
// kind text/media/attachment per calendar day in data/dms.db) sets window.MSG_DATA = { day0: 'YYYY-MM-DD', daily: [n, n, ...] }.
// Without it the odometer reads 0 and the stamp falls back to the first STORY_DATES key.
let MSG_DAY0 = null, MSG_DAILY = [], MSG_CUM = null;
function msgInit() {
  if (MSG_CUM) return;
  const D = window.MSG_DATA || {};
  MSG_DAILY = Array.isArray(D.daily) ? D.daily : [];
  const k0 = STORY_DATES.filter(k => Array.isArray(k) && parseYMD(k[1]) != null).map(k => parseYMD(k[1])).sort((a, b) => a - b)[0];
  MSG_DAY0 = parseYMD(D.day0) ?? k0 ?? Date.UTC(2024, 0, 1);
  MSG_CUM = new Float64Array(MSG_DAILY.length + 1); for (let i = 0; i < MSG_DAILY.length; i++) MSG_CUM[i + 1] = MSG_CUM[i] + MSG_DAILY[i];
}
// msgsSentAt(dayNumber): cumulative messages sent before day d (d = fractional days since MSG_DATA.day0; .5 = noon). Clamped to the data.
function msgsSentAt(d) {
  msgInit();
  if (!isFinite(d) || d <= 0) return 0;
  const n = MSG_DAILY.length; if (d >= n) return MSG_CUM[n];
  const i = Math.floor(d); return MSG_CUM[i] + MSG_DAILY[i] * (d - i);
}

// ---------- story-date stamp (top-left) + MSGS SENT odometer (top-right) ----------
// STORY_DATES — the DIRECTOR fills this, from src/story.js (project-owned) or from chapter files via storyKeys([...]). Each key:
//   [songTime, 'YYYY-MM-DD', 'H:MM AM' | null, opts?]
//   opts: 'roll'  (string, legacy)  or  { roll:true, age:'AGE 17' | false, label:'DORM' }
//   - roll: the date counts up day by day from this key to the next key (the odometer spins with it).
//   - age: overrides the auto age line (computed from HUD.birthday at the shown date); false hides it for this key.
//   - label: small tag in the stamp header instead of 'LOG' (e.g. 'HOME', 'DORM', 'GROUP CHAT').
//   - time 'H:MM AM' is also used by the odometer (fraction of the day), so a 2:00 AM key counts less of that day than 11 PM.
// Keys may be in any order; malformed keys are skipped; with no valid keys the stamp shows MSG_DATA.day0.
// Every date and time must be REAL (the verified timestamp of the message on screen) — check weekdays before using them.
// Per-shot options (chapter shot opts): {stamp:false} hide stamp · {meter:false} hide odometer · {age:false} hide age line ·
//   {date:'YYYY-MM-DD', time:'H:MM AM', age:'AGE 18'} pin this shot's story date (wins over STORY_DATES).
const STORY_DATES = [   // generic placeholder — the first storyKeys() call (src/story.js) removes it
  [0, '2024-01-01', null, { label: 'DAY ONE' }],
];
let STORY_PLACEHOLDER = true;
// HUD config (set from src/story.js or src/hud.js):  HUD.birthday = [YYYY, M, D] turns on the auto 'AGE n' line; HUD.age=false hides
// it everywhere; HUD.label = odometer caption.
// PROJECT HUD CHANGES go in the project-owned src/hud.js (loaded after this file; never edit the engine copy in build/, a sync
// replaces it). It can set HUD.*, and can replace any HUD function declared here by assignment, e.g.
//   drawMeter = function (c, t) { ... };   meterAt = t => ...;   drawStamp = function (c, t) { ... };
// (composite() calls them by name, so the replacement is used everywhere.)
const HUD = { age: true, label: 'MSGS SENT', birthday: null };
const FADE = { inS: .35, outS: 1.4, col: '20,16,26' };   // global fade from/to near-black: in over first inS s, out over last outS s
function storyKeys(keys) { if (STORY_PLACEHOLDER) { STORY_DATES.length = 0; STORY_PLACEHOLDER = false; } for (const k of keys || []) STORY_DATES.push(k); }
function parseYMD(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || '')); if (!m) return null;
  const ms = Date.UTC(+m[1], +m[2] - 1, +m[3]); return isFinite(ms) ? ms : null;
}
function parseTm(tm) {   // 'H:MM AM' -> fraction of day, or null
  const m = /^(\d{1,2}):(\d{2})\s*([AP]M)?$/i.exec(String(tm || '').trim()); if (!m) return null;
  let h = +m[1] % 12 + (m[3] && m[3].toUpperCase() === 'PM' ? 12 : 0); if (!m[3]) h = +m[1];
  return clamp((h * 60 + +m[2]) / 1440);
}
function keyOpts(k) { const o = k[3]; return o === 'roll' ? { roll: true } : (o && typeof o === 'object' ? o : {}); }
function validKeys() {
  return STORY_DATES.filter(k => Array.isArray(k) && isFinite(k[0]) && parseYMD(k[1]) != null).slice().sort((a, b) => a[0] - b[0]);
}
function ageOn(ms) {
  const B = HUD.birthday; if (!Array.isArray(B)) return null;
  const d = new Date(ms), y = d.getUTCFullYear(), mo = d.getUTCMonth() + 1, da = d.getUTCDate();
  return y - B[0] - ((mo < B[1] || (mo === B[1] && da < B[2])) ? 1 : 0);
}
// storyDate(t) -> { s:'2024.01.01', tm, ms (UTC ms of the day), day (fractional days since MSG_DAY0), age:'AGE 12'|null, label, rolling }
function storyDate(t) {
  msgInit();
  const o = (CUR && CUR.s && CUR.s.o) || {};
  const ks = validKeys();
  let ms, tm = null, rolling = false, ko = {}, frac = .5;
  if (o.date && parseYMD(o.date) != null) { ms = parseYMD(o.date); tm = o.time || null; }
  else if (!ks.length) ms = MSG_DAY0;
  else {
    let k = 0; for (let i = 0; i < ks.length; i++) if (t >= ks[i][0]) k = i;
    const K = ks[k], nx = ks[k + 1]; ko = keyOpts(K); ms = parseYMD(K[1]); tm = K[2] || null;
    if (ko.roll && nx && t < nx[0]) {
      const ms1 = parseYMD(nx[1]), days = Math.round((ms1 - ms) / 864e5), u = easeInOut(seg(t, K[0], nx[0]));
      const n = Math.floor(u * days); ms += n * 864e5; rolling = true; tm = null;
      frac = u * days - n;                      // odometer spins smoothly through the skipped days
    }
  }
  const tf = parseTm(tm); if (tf != null && !rolling) frac = tf;
  const day = (ms - MSG_DAY0) / 864e5 + frac;
  const ageO = o.age !== undefined ? o.age : ko.age;
  const auto = ageOn(ms);
  const age = ageO === false || (!HUD.age && ageO == null) ? null : (typeof ageO === 'string' ? ageO : auto == null ? null : 'AGE ' + auto);
  return { s: new Date(ms).toISOString().slice(0, 10).replace(/-/g, '.'), tm, ms, day, age, label: ko.label || null, rolling };
}
function drawStamp(c, t) {
  const o = CUR ? CUR.s.o : {}; if (o.stamp === false) return;
  const { s, tm, age, label, rolling } = storyDate(t);
  const rowsN = 1 + (tm ? 1 : 0) + (age ? 1 : 0);
  c.save(); c.translate(40, 70); c.rotate(.012);
  const w = 252, h = 64 + (rowsN - 1) * 30;
  c.fillStyle = 'rgba(42,34,48,.9)'; c.fillRect(6, 6, w, h); c.fillStyle = '#FFF8EC'; c.fillRect(0, 0, w, h);
  c.strokeStyle = PAL.ink; c.lineWidth = 3; c.strokeRect(0, 0, w, h);
  const blink = Math.floor(t * 2) % 2 === 0;
  c.fillStyle = blink ? PAL.hot : 'rgba(255,79,160,.35)'; c.beginPath(); c.arc(20, 22, 7, 0, TAU); c.fill();
  c.fillStyle = PAL.ink; c.font = `700 15px ${FONTS.mono}`; c.textBaseline = 'middle'; c.textAlign = 'left';
  c.fillText(rolling ? 'FAST FWD ▶▶' : (label || 'LOG'), 34, 22);
  c.font = `800 30px ${FONTS.mono}`; c.fillStyle = rolling ? PAL.bay : PAL.ink; c.fillText(s, 14, 48);
  let y = 48;
  if (tm) { y += 30; c.font = `800 24px ${FONTS.mono}`; c.fillStyle = PAL.hot; c.fillText(tm, 14, y); }
  if (age) { y += 30; c.font = `800 22px ${FONTS.mono}`; c.fillStyle = PAL.ink; c.fillText(age, 14, y); }
  c.restore();
}
// ---------- MSGS SENT odometer (default: on). meterAt(t) = the protagonist's real cumulative sent messages at the on-screen story date ----------
function meterAt(t) { return msgsSentAt(storyDate(t).day); }
function drawMeter(c, t) {
  const o = CUR ? CUR.s.o : {}; if (o.meter === false) return;
  const raw = meterAt(t), v = storyDate(t).rolling ? raw : Math.floor(raw), p = pulse(t, 9), N = 6;   // wheels settle on whole numbers unless the date is rolling
  c.save(); c.translate(W - 40, 70); c.rotate(-.02 + Math.sin(t * .7) * .01); c.scale(1 + p * .03, 1 + p * .03);
  const cw = 40, ch = 62, gap = 5, comma = 12, w = 28 + N * cw + (N - 1) * gap + comma, h = 118;
  c.fillStyle = 'rgba(42,34,48,.9)'; c.fillRect(-w + 7, 7, w, h);
  c.fillStyle = '#FFF8EC'; c.fillRect(-w, 0, w, h); c.strokeStyle = PAL.ink; c.lineWidth = 3; c.strokeRect(-w, 0, w, h);
  c.fillStyle = PAL.ink; c.font = `700 16px ${FONTS.mono}`; c.textAlign = 'right'; c.textBaseline = 'top';
  c.fillText(HUD.label, -14, 10);
  c.textAlign = 'left'; c.fillStyle = PAL.hot; c.fillText('✉', -w + 14, 9);
  // wheels: each digit rolls; a digit only turns while the digit to its right is passing 9 -> 0 (real odometer carry)
  const top = 34; let x = -w + 14;
  c.font = `900 50px ${FONTS.slab}`; if ('fontStretch' in c) c.fontStretch = 'condensed';
  c.textAlign = 'center'; c.textBaseline = 'middle';
  for (let i = 0; i < N; i++) {
    const place = Math.pow(10, N - 1 - i), q = v / place, d0 = Math.floor(q) % 10;
    const below = v - Math.floor(q) * place, roll = place === 1 ? q - Math.floor(q) : clamp((below - (place - 1)) / 1);
    const lead = v < place && place > 1;              // unused leading wheels read dim
    c.fillStyle = PAL.ink; c.fillRect(x, top, cw, ch);
    c.save(); c.beginPath(); c.rect(x, top, cw, ch); c.clip();
    c.fillStyle = lead ? 'rgba(255,248,236,.28)' : '#FFF8EC';
    const yy = top + ch / 2 + 3 - roll * ch;
    c.fillText(String(d0), x + cw / 2, yy); c.fillText(String((d0 + 1) % 10), x + cw / 2, yy + ch);
    c.restore();
    c.fillStyle = 'rgba(255,255,255,.10)'; c.fillRect(x, top, cw, ch * .45);
    x += cw + gap;
    if (i === N - 4) { c.fillStyle = PAL.ink; c.fillText(',', x + comma / 2 - gap / 2, top + ch - 16); x += comma; }
  }
  if ('fontStretch' in c) c.fontStretch = 'normal';
  c.fillStyle = PAL.hot; c.fillRect(-w + 14, top + ch + 6, w - 28, 5);
  c.restore();
}

// ---------- frame lifecycle ----------
async function setup() {
  createCanvas(W, H, WEBGL); pixelDensity(1); noLoop();
  brush.scaleBrushes(5); defineBrushes();
  paperG = makePaper(); grainC = makeGrain();
  outC = document.getElementById('out'); outX = outC.getContext('2d');
  MEASURE = document.createElement('canvas').getContext('2d');
  await Promise.all([document.fonts.load('100px "Permanent Marker"'), document.fonts.load('800 50px "Shantell Sans"'), document.fonts.load('700 50px "Caveat"')]);
  await Promise.all((window.ASSET_LIST || []).map(n => new Promise(r => { const im = new Image(); im.onload = im.onerror = () => r(); im.src = 'assets/' + n; IMG[n] = im; })));
  window.ready = true;
  if (!location.search.includes('render')) devUI();
}
function draw() {
  if (!window.ready) return;
  OVL = []; CAM = null;
  push(); translate(-W / 2, -H / 2);
  randomSeed(1000 + Math.floor(T * BOIL)); noiseSeed(77);
  image(paperG, 0, 0);
  drawWorld(T);
  pop();
}
function composite(t) {
  const c = outX; c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
  c.drawImage(drawingContext.canvas, 0, 0, W, H);
  drawOverlays(c);
  c.globalCompositeOperation = 'multiply'; c.drawImage(grainC, 0, 0); c.globalCompositeOperation = 'source-over';
  drawMeter(c, t); drawStamp(c, t); drawKaraoke(c, t);
  // global fade in/out
  const f = LAB ? 1 : Math.min(seg(t, 0, FADE.inS), 1 - seg(t, DUR - FADE.outS, DUR));   // lab benches never fade
  if (f < 1) { c.fillStyle = `rgba(${FADE.col},${1 - f})`; c.fillRect(0, 0, W, H); }
}
window.renderAt = async (t, type = 'image/png', q = .92) => { T = t; await redraw(); composite(t); return outC.toDataURL(type, q); };
window.renderSheet = async (times, cols = 4, w = 360) => {
  const h = Math.round(w * H / W), rows = Math.ceil(times.length / cols), sc = document.createElement('canvas');
  sc.width = cols * w; sc.height = rows * h; const c = sc.getContext('2d'), ms = [];
  for (let i = 0; i < times.length; i++) {
    const t0 = performance.now(); T = times[i]; await redraw(); composite(times[i]); ms.push(Math.round(performance.now() - t0));
    const x = (i % cols) * w, y = Math.floor(i / cols) * h;
    c.drawImage(outC, x, y, w, h); c.fillStyle = 'rgba(0,0,0,.7)'; c.fillRect(x, y, 92, 26); c.fillStyle = '#fff'; c.font = '16px sans-serif'; c.fillText(times[i].toFixed(2) + 's', x + 6, y + 18);
  }
  return { url: sc.toDataURL('image/jpeg', .88), ms };
};
window.gpuInfo = () => { const gl = drawingContext, e = gl.getExtension('WEBGL_debug_renderer_info'); return e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER); };
function devUI() {
  const s = document.getElementById('scrub'), lab = document.getElementById('tt'); let busy = false, want = null;
  const go = async () => { if (busy) return; busy = true; while (want != null) { const t = want; want = null; const t0 = performance.now(); await window.renderAt(t); lab.textContent = `${t.toFixed(2)}s · ${Math.round(performance.now() - t0)} ms`; } busy = false; };
  s.addEventListener('input', () => { want = +s.value; go(); }); want = +(new URLSearchParams(location.search).get('t') || 0); s.value = want; go();
}
