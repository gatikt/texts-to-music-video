// Browser-free helpers for suno.mjs: argument parsing, text checks, share-link
// resolution, downloads and ffmpeg. Kept separate so they can be tested
// without launching Chrome.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { URLS, UUID_RE, LIMITS } from './selectors.mjs';

export const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36';

let VERBOSE = false;
export const setVerbose = (v) => { VERBOSE = !!v; };
export const log = (...a) => console.log('[suno]', ...a);
export const vlog = (...a) => { if (VERBOSE) console.log('[suno:step]', ...a); };
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export class UsageError extends Error {}
export class CliError extends Error {
  constructor(msg, code = 1) { super(msg); this.code = code; }
}

// Minimal flag parser: --key value, --key=value, --flag (boolean), positionals.
export function parseArgs(argv, booleans = []) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { out._.push(a); continue; }
    const eq = a.indexOf('=');
    const key = (eq > 0 ? a.slice(2, eq) : a.slice(2)).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    if (eq > 0) { out[key] = a.slice(eq + 1); continue; }
    if (booleans.includes(key)) { out[key] = true; continue; }
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) throw new UsageError(`--${a.slice(2)} needs a value`);
    out[key] = next; i++;
  }
  return out;
}

export function expandHome(p) {
  if (!p) return p;
  return p === '~' ? os.homedir() : p.startsWith('~/') ? path.join(os.homedir(), p.slice(2)) : p;
}

// Persistent Chrome profile used by login/create. Outside the repo on purpose:
// it holds Suno session cookies.
export function profileDir(opt) {
  return path.resolve(expandHome(opt || process.env.T2MV_SUNO_PROFILE || '~/.t2mv/suno-profile'));
}

export function profileLooksUsed(dir) {
  try { return fs.readdirSync(dir).length > 0; } catch { return false; }
}

// --style accepts a file path or a literal string.
export function readStyle(v) {
  if (!v) throw new UsageError('--style is required (a file path or a quoted string)');
  const p = expandHome(v);
  if (fs.existsSync(p) && fs.statSync(p).isFile()) return fs.readFileSync(p, 'utf8').trim();
  return String(v).trim();
}

export function readLyrics(v) {
  if (!v) throw new UsageError('--lyrics <file> is required');
  const p = expandHome(v);
  if (!fs.existsSync(p)) throw new UsageError(`lyrics file not found: ${v}`);
  return fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n').trim();
}

// Character limits, checked before any browser work. Returns a list of errors.
export function checkLimits({ style, lyrics, title }, limits = LIMITS) {
  const errs = [];
  const n = (s) => [...(s || '')].length; // count code points like the UI counter
  if (!lyrics) errs.push('lyrics are empty');
  if (!style) errs.push('style is empty');
  if (n(lyrics) > limits.lyrics) errs.push(`lyrics are ${n(lyrics)} characters; Suno allows ${limits.lyrics}. Shorten section tags or cut lines.`);
  if (n(style) > limits.style) errs.push(`style is ${n(style)} characters; limit is ${limits.style} (override with --style-max if your model allows more).`);
  if (title && n(title) > limits.title) errs.push(`title is ${n(title)} characters; keep it under ${limits.title}.`);
  return errs;
}

// Whitespace-insensitive comparison for verifying text landed in an editor
// (rich-text editors turn newlines into paragraphs).
export const squash = (s) => String(s ?? '').replace(/\s+/g, '');

// ---- ids and share links ---------------------------------------------------

export function idFromString(s) {
  const m = String(s).match(UUID_RE);
  return m ? m[0].toLowerCase() : null;
}

// Accepts a bare UUID, https://suno.com/song/<uuid>, or a share link
// https://suno.com/s/<code> (resolved through its redirect).
export async function resolveSongId(input) {
  const direct = idFromString(input);
  if (direct && !/\/s\//.test(input)) return direct;
  let url = String(input).trim();
  if (!/^https?:\/\//.test(url)) {
    if (/^[A-Za-z0-9]{6,32}$/.test(url)) url = `https://suno.com/s/${url}`;
    else throw new UsageError(`not a Suno song id or link: ${input}`);
  }
  vlog('resolving share link', url);
  let res = await fetch(url, { redirect: 'manual', headers: { 'user-agent': UA } });
  for (let hop = 0; hop < 5 && res.status >= 300 && res.status < 400; hop++) {
    const loc = res.headers.get('location') || '';
    vlog(`redirect ${res.status} -> ${loc}`);
    const id = idFromString(loc);
    if (id && /\/song\//.test(loc)) return id;
    if (!loc) break;
    res = await fetch(new URL(loc, url), { redirect: 'manual', headers: { 'user-agent': UA } });
  }
  // No redirect to /song/: fall back to the first UUID on the page.
  const body = res.ok ? await res.text() : '';
  const id = idFromString(body);
  if (!id) throw new CliError(`could not resolve a song id from ${input} (HTTP ${res.status})`);
  return id;
}

// ---- downloads ---------------------------------------------------------------

// Status of a URL without downloading it (GET of the first byte; CDN HEAD
// responses are not always reliable).
export async function probe(url) {
  try {
    const r = await fetch(url, { headers: { 'user-agent': UA, range: 'bytes=0-0' } });
    try { await r.body?.cancel(); } catch {}
    return r.status === 206 ? 200 : r.status;
  } catch (e) {
    vlog('probe failed', url, e.message);
    return 0;
  }
}

export async function download(url, dest) {
  const r = await fetch(url, { headers: { 'user-agent': UA } });
  if (!r.ok || !r.body) throw new CliError(`download failed ${r.status}: ${url}`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const tmp = dest + '.part';
  await pipeline(Readable.fromWeb(r.body), fs.createWriteStream(tmp));
  fs.renameSync(tmp, dest);
  return dest;
}

// ---- ffmpeg ------------------------------------------------------------------

function run(bin, args) {
  vlog(bin, args.join(' '));
  const r = spawnSync(bin, args, { encoding: 'utf8' });
  if (r.error) throw new CliError(`${bin} not found or failed to start (${r.error.code}). Install it: brew install ffmpeg`);
  if (r.status !== 0) throw new CliError(`${bin} failed: ${(r.stderr || '').trim().split('\n').slice(-3).join(' | ')}`);
  return r.stdout;
}

export function duration(file) {
  const out = run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]);
  return Number.parseFloat(out.trim());
}

// From an mp4 share video or an mp3: song.m4a (original audio when possible)
// and song.wav at 44.1 kHz for analysis.
export function extractAudio(src, outDir) {
  const m4a = path.join(outDir, 'song.m4a');
  const wav = path.join(outDir, 'song.wav');
  const isMp4 = /\.mp4$/i.test(src);
  run('ffmpeg', ['-v', 'error', '-y', '-i', src, '-vn', ...(isMp4 ? ['-c:a', 'copy'] : ['-c:a', 'aac', '-b:a', '256k']), m4a]);
  run('ffmpeg', ['-v', 'error', '-y', '-i', src, '-vn', '-ar', '44100', wav]);
  return { m4a, wav };
}

export function toMp3(src, dest) {
  run('ffmpeg', ['-v', 'error', '-y', '-i', src, '-vn', '-c:a', 'libmp3lame', '-q:a', '2', dest]);
  return dest;
}

export { URLS };
