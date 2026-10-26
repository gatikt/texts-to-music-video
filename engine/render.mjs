// render.mjs — drive studio.html in headless Chrome. Run from the project's build/ folder.
// Song length, title and audio come from src/timeline_data.js (TL.duration, TL.out, TL.audio) — nothing is hard-coded here.
//   node render.mjs --sheet=3.4,4,5 [--cols=4] [--w=360] --out=previews/x.jpg       contact sheet (fast visual check, prints ms/frame)
//   node render.mjs --stills=1.2,10 --out=previews/stills                           full-res PNGs
//   node render.mjs --clip=3:12 [--fps=24] --out=previews/c01.mp4                   short low-res clip WITH audio (watch timing)
//   node render.mjs --frames=0:<DUR> --workers=4 [--fps=30] [--force]               full-res JPEG frames → out/frames<fps>/ (resumable)
//   node render.mjs --encode [--fps=30] [--out=out/<name>.mp4]                      frames + audio → MP4
//   add --lab=name to any mode to render src/lab/name.js instead of the timeline (test benches)
// Options: --audio=<wav> (default TL.audio or ../song_cut.wav) · --chrome=<path> (default $T2MV_CHROME or the macOS Chrome app)
//          --out=<path> (encode default: out/<TL.out or the video folder name>.mp4)
if (process.argv.includes('--help') || process.argv.includes('-h')) { const { readFileSync: rf } = await import('node:fs'); console.log(rf(new URL(import.meta.url), 'utf8').split('\n').filter(l => l.startsWith('//')).map(l => l.replace(/^\/\/ ?/, '')).join('\n')); process.exit(0); }
import puppeteer from 'puppeteer-core';
import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync, statSync, renameSync, readFileSync } from 'node:fs';
import { dirname, resolve, basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import vm from 'node:vm';
const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, ...v] = a.replace(/^--/, '').split('='); return [k, v.length ? v.join('=') : true]; }));
const TL = vm.runInNewContext(readFileSync('src/timeline_data.js', 'utf8') + '\n;TL', {});
const DUR = +TL.duration, fps = +(args.fps || 30), FRAMES_DIR = `out/frames${fps}`;
if (!(DUR > 0)) throw new Error('src/timeline_data.js has no TL.duration');
const AUDIO = args.audio || TL.audio || '../song_cut.wav';
const parentDir = basename(resolve('..')), projDir = parentDir === 'video' ? basename(resolve('../..')) : parentDir;
const OUTNAME = String(TL.out || projDir || 'video').replace(/\.mp4$/i, '') + '.mp4';
const CHROME = args.chrome || process.env.T2MV_CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
execFileSync('node', ['tools/assets.mjs']);
const run = (cmd, a) => new Promise((ok, bad) => { const p = spawn(cmd, a, { stdio: 'inherit' }); p.on('close', c => c ? bad(new Error(cmd + ' exited ' + c)) : ok()); });
if (args.encode) {
  const out = args.out || `out/${OUTNAME}`; mkdirSync(dirname(out), { recursive: true });
  if (!existsSync(`${FRAMES_DIR}/f00000.jpg`)) throw new Error(`no frames in ${FRAMES_DIR} — run --frames first (same --fps)`);
  if (!existsSync(AUDIO)) throw new Error(`audio not found: ${AUDIO} (pass --audio=)`);
  await run('ffmpeg', ['-y', '-loglevel', 'error', '-stats', '-framerate', String(fps), '-i', `${FRAMES_DIR}/f%05d.jpg`, '-i', AUDIO, '-map', '0:v', '-map', '1:a',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart', '-shortest', out]);
  console.log('wrote ' + out); process.exit(0);
}
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, protocolTimeout: 0,
  args: ['--allow-file-access-from-files', '--ignore-gpu-blocklist', '--use-angle=metal', '--enable-gpu-rasterization', '--window-size=1080,1920', '--disable-renderer-backgrounding', '--disable-background-timer-throttling', '--force-device-scale-factor=1'] });
async function openPage(tag = '') {
  const page = await browser.newPage();
  page.on('console', m => { if (['error', 'warn'].includes(m.type())) console.log(`[page${tag}]`, m.text()); });
  page.on('pageerror', e => console.log(`[page error${tag}]`, e.message));
  await page.goto(pathToFileURL(resolve('studio.html')).href + '?render' + (args.lab ? '&lab=' + args.lab : ''), { waitUntil: 'load' });
  await page.waitForFunction('window.ready === true', { timeout: 60000 });
  return page;
}
const frameOf = async (page, t, type, q) => { const url = await page.evaluate((t, type, q) => window.renderAt(t, type, q), t, type, q); return Buffer.from(url.slice(url.indexOf(',') + 1), 'base64'); };
const times = s => String(s).split(',').map(Number);
if (args.sheet) {
  const page = await openPage(), out = args.out || 'previews/sheet.jpg'; mkdirSync(dirname(out), { recursive: true });
  const { url, ms } = await page.evaluate((ts, c, w) => window.renderSheet(ts, c, w), times(args.sheet), +(args.cols || 4), +(args.w || 360));
  writeFileSync(out, Buffer.from(url.slice(url.indexOf(',') + 1), 'base64')); console.log(`${out}  ms/frame: ${ms.join(' ')}`);
} else if (args.stills) {
  const page = await openPage(), out = args.out || 'previews/stills'; mkdirSync(out, { recursive: true });
  console.log('GPU:', await page.evaluate(() => window.gpuInfo()));
  for (const s of times(args.stills)) { const t0 = Date.now(), buf = await frameOf(page, s, 'image/png'); const f = `${out}/t${s.toFixed(2).replace('.', '_')}.png`; writeFileSync(f, buf); console.log(`${f}  ${Date.now() - t0} ms`); }
} else if (args.frames) {
  const [a, b] = String(args.frames === true ? `0:${DUR}` : args.frames).split(':').map(Number), workers = +(args.workers || 4); mkdirSync(FRAMES_DIR, { recursive: true });
  const first = Math.round(a * fps), last = Math.min(Math.ceil(DUR * fps) - 1, Math.round(b * fps) - 1);
  const todo = []; for (let i = first; i <= last; i++) { const f = `${FRAMES_DIR}/f${String(i).padStart(5, '0')}.jpg`; if (args.force || !existsSync(f) || statSync(f).size < 1000) todo.push(i); }
  console.log(`${todo.length} frames to render, ${workers} workers`); let next = 0, done = 0; const start = Date.now();
  await Promise.all(Array.from({ length: Math.min(workers, Math.max(1, todo.length)) }, async (_, w) => { const page = await openPage('#' + w);
    while (next < todo.length) { const i = todo[next++], f = `${FRAMES_DIR}/f${String(i).padStart(5, '0')}.jpg`; const buf = await frameOf(page, i / fps, 'image/jpeg', .94);
      writeFileSync(f + '.tmp', buf); renameSync(f + '.tmp', f);
      if (++done % 60 === 0 || done === todo.length) { const el = (Date.now() - start) / 1000; console.log(`frame ${done}/${todo.length}  ${(el / done * 1000).toFixed(0)} ms/frame eff  eta ${((todo.length - done) * el / done / 60).toFixed(1)} min`); } } }));
} else {
  const page = await openPage(); const [a, b] = args.clip ? String(args.clip).split(':').map(Number) : [0, DUR];
  const cfps = +(args.fps || 24), out = args.out || 'previews/clip.mp4'; mkdirSync(dirname(out), { recursive: true });
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(cfps), '-c:v', 'mjpeg', '-i', '-', '-ss', String(a), '-t', String(b - a), '-i', AUDIO,
    '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-vf', 'scale=540:960', '-c:a', 'aac', '-b:a', '192k', '-shortest', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const n = Math.round((b - a) * cfps), start = Date.now();
  for (let i = 0; i < n; i++) { const buf = await frameOf(page, a + i / cfps, 'image/jpeg', .9); if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r)); if (i % 48 === 0 || i === n - 1) console.log(`frame ${i + 1}/${n}  ${((Date.now() - start) / (i + 1)).toFixed(0)} ms/frame`); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log(`wrote ${out}`);
}
await browser.close();
