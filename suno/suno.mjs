#!/usr/bin/env node
// Suno helper: sign in once, create a song from a style + lyrics file, and
// fetch a finished song's audio. Suno has no public API, so `login` and
// `create` drive the website with Playwright and your installed Google Chrome.
// `fetch` only needs public CDN files. See suno/README.md.
//
// Selectors live in ./selectors.mjs. Helpers that need no browser live in ./lib.mjs.
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { URLS, NET, LIMITS, SIGN_IN_PATH, ui } from './selectors.mjs';
import {
  parseArgs, setVerbose, log, vlog, sleep, UsageError, CliError, profileDir, profileLooksUsed,
  readStyle, readLyrics, checkLimits, squash, idFromString, resolveSongId, probe, download,
  duration, extractAudio, toMp3, expandHome,
} from './lib.mjs';

const HELP = {
  main: `Usage: node suno/suno.mjs <command> [options]

Commands
  login                     Open a visible Chrome window on suno.com and wait while you sign in.
  create                    Fill style + lyrics (+ title) on suno.com/create, click "Create song",
                            wait for both takes, save suno_takes.json and take_<n>.mp3.
  fetch <share-url|id>      Download a finished song (share link, song URL or id) and
                            extract song.m4a + song.wav (44.1 kHz).

Common options
  --profile <dir>           Chrome profile dir (default ~/.t2mv/suno-profile, or $T2MV_SUNO_PROFILE)
  --chrome <path>           Chrome executable (default: installed Google Chrome via channel "chrome")
  --verbose                 Log each step
  --help                    Show help for a command (e.g. node suno/suno.mjs create --help)

Exit codes: 0 ok, 1 error, 2 usage error or not logged in, 3 verification challenge needs a human.`,

  login: `Usage: node suno/suno.mjs login [--profile dir] [--timeout-min 15] [--verbose]

Opens a visible Chrome window with a dedicated profile and goes to suno.com.
Sign in yourself; the tool never sees or types your credentials. When the
create page loads signed in, the window closes and the session is saved in
the profile for later "create" runs.

Google sign-in often refuses automated browsers ("This browser or app may not
be secure"). If that happens, use another sign-in method Suno offers
(Apple, Discord, Microsoft, Facebook, phone number). This tool does not try to
hide that the browser is automated.`,

  create: `Usage: node suno/suno.mjs create --style <file|string> --lyrics <file>
                              [--title T] [--out dir] [--dry-run] [--headed]
                              [--timeout-min 15] [--style-max 1000] [--verbose]

  --style       Style prompt: a path to a text file, or the text itself.
  --lyrics      Lyrics file (max ${LIMITS.lyrics} characters).
  --title       Song title (optional).
  --out         Output folder for suno_takes.json and take_<n>.mp3
                (default ~/.t2mv/takes/<date-time>, outside the repo, because the audio is personal).
  --dry-run     Fill the form and verify it, then stop. Never clicks "Create song".
  --headed      Show the Chrome window (needed if Suno asks for a human-verification check).
  --timeout-min How long to wait for both takes to finish (default 15).
  --style-max   Style character limit to enforce (default ${LIMITS.style}).

Without --dry-run this SPENDS SUNO CREDITS (one generation = two takes).
Run "login" first.`,

  fetch: `Usage: node suno/suno.mjs fetch <share-url|song-url|song-id> --out <dir> [--wait-min 10] [--verbose]

Resolves https://suno.com/s/<code> to the song id, downloads
https://cdn1.suno.ai/<id>.mp4 (polling while it is 403; it appears a few
minutes after you share a song) or <id>.mp3, then writes:
  <out>/suno-share.mp4 or <out>/suno-song.mp3   (source file)
  <out>/song.m4a                                (audio track)
  <out>/song.wav                                (44.1 kHz, for analysis)
  <out>/suno_fetch.json                         (id, urls, durations)`,
};

// ---- browser plumbing --------------------------------------------------------

async function launch(opts, { headed }) {
  let chromium;
  try {
    ({ chromium } = await import('playwright-core'));
  } catch {
    throw new CliError('playwright-core is not installed. Run: npm install --prefix suno', 1);
  }
  const dir = profileDir(opts.profile);
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  vlog('profile', dir, headed ? '(headed)' : '(headless)');
  try {
    const ctx = await chromium.launchPersistentContext(dir, {
      ...(opts.chrome ? { executablePath: expandHome(opts.chrome) } : { channel: 'chrome' }),
      headless: !headed,
      viewport: headed ? null : { width: 1440, height: 1000 },
      acceptDownloads: true,
    });
    const page = ctx.pages()[0] || (await ctx.newPage());
    return { ctx, page, dir };
  } catch (e) {
    const m = String(e.message || e);
    if (/ProcessSingleton|already in use|SingletonLock/i.test(m)) {
      throw new CliError(`The Suno Chrome profile is already open (${dir}). Close that window (or the other suno.mjs run) and try again.`, 1);
    }
    if (/Chromium distribution 'chrome' is not found|executable doesn't exist/i.test(m)) {
      throw new CliError('Google Chrome was not found. Install it, or pass --chrome <path-to-chrome-binary>.', 1);
    }
    throw e;
  }
}

const isVisible = (loc) => loc.first().isVisible().catch(() => false);
const pathOf = (page) => { try { return new URL(page.url()).pathname; } catch { return ''; } };

// Go to /create and decide whether we are signed in.
async function openCreate(page, { timeoutMs = 30000 } = {}) {
  vlog('goto', URLS.create);
  await page.goto(URLS.create, { waitUntil: 'domcontentloaded', timeout: 60000 });
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (SIGN_IN_PATH.test(pathOf(page))) return 'signed-out';
    if (await isVisible(ui.signedOut(page))) return 'signed-out';
    if (await isVisible(ui.lyrics(page)) || await isVisible(ui.createButton(page)) ||
        await isVisible(ui.advancedTab(page))) return 'ok';
    if (await captchaVisible(page)) return 'captcha';
    await sleep(500);
  }
  return 'unknown';
}

async function captchaVisible(page) {
  const frames = page.locator(ui.captchaFrames);
  const n = Math.min(await frames.count().catch(() => 0), 10);
  for (let i = 0; i < n; i++) {
    const f = frames.nth(i);
    if (!(await f.isVisible().catch(() => false))) continue;
    const box = await f.boundingBox().catch(() => null);
    if (box && box.width >= 100 && box.height >= 100) return true;
  }
  return isVisible(page.getByText(ui.captchaText));
}

// If a verification challenge is showing, stop and let the human solve it.
// We never try to solve or bypass it.
async function waitForHuman(page, { headed, context }) {
  if (!(await captchaVisible(page))) return;
  if (!headed) {
    throw new CliError(
      `Suno is showing a human-verification check (${context}). Re-run with --headed and solve it yourself in the window.` +
      (context === 'after Create song' ? ' Check your Suno library first: if no new songs appeared, no credits were spent.' : ''), 3);
  }
  log('');
  log('>>> STOP: Suno is asking for a human-verification check.');
  log('>>> Please solve it yourself in the Chrome window. This tool will not touch it.');
  log('>>> Waiting (up to 15 min)...');
  const deadline = Date.now() + 15 * 60_000;
  while (Date.now() < deadline) {
    await sleep(3000);
    if (page.isClosed()) throw new CliError('The browser window was closed.', 1);
    if (!(await captchaVisible(page))) { log('Check cleared, continuing.'); await sleep(1500); return; }
  }
  throw new CliError('Timed out waiting for the verification check to be solved.', 3);
}

function waitForEnter(prompt) {
  if (!process.stdin.isTTY) return new Promise(() => {});
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(prompt, () => { rl.close(); resolve(); });
  });
}

// ---- form filling ------------------------------------------------------------

async function readText(target) {
  return target.evaluate((el) =>
    (el instanceof HTMLTextAreaElement || el instanceof HTMLInputElement) ? el.value : (el.innerText ?? el.textContent ?? ''));
}

// Fill a textarea/input/contenteditable and confirm the text actually landed.
async function fillVerified(page, target, text, label) {
  const ok = async () => squash(await readText(target)) === squash(text);
  await target.scrollIntoViewIfNeeded().catch(() => {});
  await target.click();
  try {
    await target.fill(text);
    vlog(`${label}: fill()`);
  } catch (e) {
    vlog(`${label}: fill() failed (${e.message.split('\n')[0]}), falling back to keyboard`);
  }
  if (await ok()) return;
  // Fallback for rich-text editors: clear, then insert as one input event.
  await target.click();
  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
  await page.keyboard.press('Backspace');
  await page.keyboard.insertText(text);
  vlog(`${label}: keyboard.insertText()`);
  if (await ok()) return;
  const got = await readText(target);
  throw new CliError(`${label}: the text did not land in the field (expected ${text.length} chars, field has ${got.length}). ` +
    'Suno may have changed the editor; run with --headed --verbose and update suno/selectors.mjs.', 1);
}

async function sameOrNested(a, b) {
  return a.evaluate((x, y) => x === y || x.contains(y) || y.contains(x), await b.elementHandle()).catch(() => false);
}

// The style box's placeholder is random, so find it by (1) an accessible name
// containing "style", (2) the nearest text field sharing a container with the
// "View saved style prompts" / "Personalize style prompt" buttons, or (3) a
// field whose placeholder is a comma-separated list of styles.
async function findStyleBox(page, lyrics) {
  const notLyrics = async (handle) => !(await sameOrNested(handle, lyrics));
  const visibleHandles = async (loc, max = 10) => {
    const out = [];
    const n = Math.min(await loc.count().catch(() => 0), max);
    for (let i = 0; i < n; i++) {
      const l = loc.nth(i);
      if (await l.isVisible().catch(() => false)) out.push(await l.elementHandle());
    }
    return out;
  };

  for (const h of await visibleHandles(ui.styleByName(page))) {
    if (await notLyrics(h)) { vlog('style box: found by accessible name'); return h; }
  }

  if (await ui.styleAnchors(page).count()) {
    const container = page.locator('div, section, form, fieldset')
      .filter({ has: ui.styleAnchors(page) })
      .filter({ has: page.locator(ui.editable) })
      .last(); // deepest container holding both an anchor button and a text field
    if (await container.count()) {
      for (const h of await visibleHandles(container.locator(ui.editable))) {
        if (await notLyrics(h)) { vlog('style box: found next to the style-prompt buttons'); return h; }
      }
    }
  }

  const list = /^\s*[^,]{2,60}(,\s*[^,]{2,60}){2,}/;
  for (const h of await visibleHandles(page.locator('textarea[placeholder], input[placeholder], [contenteditable="true"][data-placeholder], [contenteditable="true"][aria-placeholder]'), 30)) {
    const ph = await h.evaluate((el) => el.getAttribute('placeholder') || el.getAttribute('data-placeholder') || el.getAttribute('aria-placeholder') || '');
    if (list.test(ph) && await notLyrics(h)) { vlog('style box: found by comma-list placeholder'); return h; }
  }
  throw new CliError('Could not find the style prompt box. Suno may have changed its UI; update ui.styleByName / ui.styleAnchors in suno/selectors.mjs.', 1);
}

async function clickIfVisible(page, loc, label) {
  const l = loc.first();
  if (!(await l.isVisible().catch(() => false))) { vlog(`${label}: not visible, skipping`); return false; }
  await l.click();
  vlog(`${label}: clicked`);
  await sleep(600);
  return true;
}

// ---- clip tracking -----------------------------------------------------------

// Walk a JSON payload and collect clip-like objects ({ id: uuid, status | audio_url }).
function collectClips(node, out = [], depth = 0) {
  if (!node || typeof node !== 'object' || depth > 6) return out;
  if (Array.isArray(node)) { for (const x of node) collectClips(x, out, depth + 1); return out; }
  if (typeof node.id === 'string' && idFromString(node.id) === node.id.toLowerCase() &&
      ('status' in node || 'audio_url' in node)) out.push(node);
  for (const v of Object.values(node)) if (v && typeof v === 'object') collectClips(v, out, depth + 1);
  return out;
}

function trackClips(page) {
  const seen = new Map();       // id -> latest clip info from any response
  const generated = [];         // ids returned by the /generate call, in order
  page.on('response', async (res) => {
    const url = res.url();
    const isGen = NET.generate.test(url) && res.request().method() === 'POST';
    if (!isGen && !NET.clipFeed.test(url)) return;
    if (!/json/i.test(res.headers()['content-type'] || '')) return;
    let body;
    try { body = await res.json(); } catch { return; }
    const clips = collectClips(body);
    for (const c of clips) {
      const id = c.id.toLowerCase();
      const prev = seen.get(id) || {};
      seen.set(id, { ...prev, id, status: c.status ?? prev.status, audio_url: c.audio_url ?? prev.audio_url, title: c.title ?? prev.title });
      if (isGen && !generated.includes(id)) generated.push(id);
    }
    if (isGen) vlog(`generate response: ${clips.length} clip(s) ${clips.map((c) => c.id).join(', ')}`);
  });
  return { seen, generated };
}

async function songLinkIds(page) {
  const hrefs = await page.locator(ui.songLinks).evaluateAll((as) => as.map((a) => a.getAttribute('href'))).catch(() => []);
  return [...new Set(hrefs.map(idFromString).filter(Boolean))];
}

// ---- commands ----------------------------------------------------------------

async function cmdLogin(opts) {
  const { ctx, page, dir } = await launch(opts, { headed: true });
  const timeoutMs = Number(opts.timeoutMin || 15) * 60_000;
  try {
    await page.goto(URLS.home, { waitUntil: 'domcontentloaded', timeout: 60000 });
    log(`Chrome is open with profile ${dir}`);
    log('Sign in to Suno in that window yourself. This tool never types credentials.');
    log('Tip: if Google says the browser "may not be secure", use another sign-in method (Apple, Discord, Microsoft, phone).');
    log('Waiting for you to finish signing in...');
    let enter = false;
    waitForEnter('(Or press Enter here once you are signed in.)\n').then(() => { enter = true; });
    const deadline = Date.now() + timeoutMs;
    let lastCheck = 0;
    while (Date.now() < deadline) {
      await sleep(2000);
      if (page.isClosed()) throw new CliError('The browser window was closed before sign-in finished.', 1);
      const cookies = await ctx.cookies('https://suno.com').catch(() => []);
      const hasSession = cookies.some((c) => c.name === '__session' && c.value);
      const p = pathOf(page);
      // Check the create page once a session cookie appears, or when asked.
      if ((hasSession && !SIGN_IN_PATH.test(p) && Date.now() - lastCheck > 15000) || enter) {
        enter = false; lastCheck = Date.now();
        vlog('checking sign-in state on /create');
        const state = await openCreate(page, { timeoutMs: 20000 });
        vlog('state', state);
        if (state === 'ok') {
          log('Signed in. Session saved to the profile. You can now run "create".');
          await sleep(2000);
          return;
        }
        if (state === 'captcha') log('Suno is showing a verification check; please solve it in the window.');
        else log('Not signed in yet. Finish signing in in the Chrome window.');
      }
    }
    throw new CliError('Timed out waiting for sign-in.', 2);
  } finally {
    await ctx.close().catch(() => {});
    process.stdin.pause?.();
  }
}

async function cmdCreate(opts) {
  const style = readStyle(opts.style);
  const lyrics = readLyrics(opts.lyrics);
  const title = opts.title ? String(opts.title).trim() : '';
  const limits = { ...LIMITS, style: Number(opts.styleMax || LIMITS.style) };
  const errs = checkLimits({ style, lyrics, title }, limits);
  if (errs.length) throw new UsageError(errs.join('\n'));
  log(`style ${[...style].length}/${limits.style} chars, lyrics ${[...lyrics].length}/${limits.lyrics} chars${title ? `, title "${title}"` : ''}`);

  const dir = profileDir(opts.profile);
  if (!profileLooksUsed(dir)) {
    throw new CliError(`Not logged in to Suno (no profile at ${dir}). Run "node suno/suno.mjs login" first.`, 2);
  }
  const headed = !!opts.headed;
  const dry = !!opts.dryRun;
  const stamp = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19);
  const out = path.resolve(expandHome(opts.out || `~/.t2mv/takes/${stamp}`));

  const { ctx, page } = await launch(opts, { headed });
  const cleanup = () => ctx.close().catch(() => {});
  process.once('SIGINT', () => { cleanup().finally(() => process.exit(130)); });
  try {
    const tracker = trackClips(page);

    let state = await openCreate(page);
    vlog('create page state:', state);
    if (state === 'captcha') { await waitForHuman(page, { headed, context: 'on page load' }); state = await openCreate(page); }
    if (state === 'signed-out') {
      throw new CliError('Not logged in to Suno (the create page redirected to sign-in). Run "node suno/suno.mjs login" first.', 2);
    }
    if (state !== 'ok') {
      throw new CliError(`The Suno create page did not load as expected (at ${page.url()}). If you are signed in, Suno may have changed its UI; run with --headed --verbose.`, 1);
    }

    // Songs mode + Advanced (custom) mode.
    await clickIfVisible(page, ui.songsTab(page), 'tab "Songs"');
    if (!pathOf(page).startsWith('/create')) { vlog('"Songs" navigated away, returning to /create'); await openCreate(page); }
    await clickIfVisible(page, ui.advancedTab(page), 'tab "Advanced"');

    const lyricsBox = ui.lyrics(page).first();
    try { await lyricsBox.waitFor({ state: 'visible', timeout: 15000 }); } catch {
      throw new CliError('Could not find the "Lyrics editor" box (is Advanced mode available?). Update ui.lyrics / ui.advancedTab in suno/selectors.mjs.', 1);
    }
    vlog('filling lyrics');
    await fillVerified(page, lyricsBox, lyrics, 'lyrics');

    vlog('locating style box');
    const styleBox = await findStyleBox(page, lyricsBox);
    await fillVerified(page, styleBox, style, 'style');

    if (title) {
      const t = ui.title(page).first();
      if (await t.isVisible().catch(() => false)) { vlog('filling title'); await fillVerified(page, t, title, 'title'); }
      else log('warning: title field not found; the song will get an automatic title.');
    }

    // Re-check that the lyrics survived (some editors reset on mode changes).
    if (squash(await readText(lyricsBox)) !== squash(lyrics)) throw new CliError('Lyrics changed after filling the other fields; aborting before Create.', 1);

    const createBtn = ui.createButton(page).first();
    const btnVisible = await createBtn.isVisible().catch(() => false);
    const btnEnabled = btnVisible && await createBtn.isEnabled().catch(() => false);
    fs.mkdirSync(out, { recursive: true });

    if (dry) {
      const shot = path.join(out, 'dry_run.png');
      await page.screenshot({ path: shot }).catch(() => {});
      log(`DRY RUN: form filled and verified. "Create song" button ${btnVisible ? (btnEnabled ? 'is ready' : 'is visible but disabled') : 'was NOT found'}. Not clicking.`);
      log(`screenshot: ${shot}`);
      if (headed) await waitForEnter('Press Enter to close the window. ');
      return;
    }
    if (!btnVisible) throw new CliError('Could not find the "Create song" button. Update ui.createButton in suno/selectors.mjs.', 1);
    if (!btnEnabled) throw new CliError('"Create song" is disabled (out of credits, or a field is invalid). Run with --headed --dry-run to look.', 1);

    const before = new Set(await songLinkIds(page));
    log('Clicking "Create song" (this spends credits)...');
    await createBtn.click();

    // Collect the new clip ids.
    let ids = [];
    const idDeadline = Date.now() + 120_000;
    let firstSeenAt = 0;
    while (Date.now() < idDeadline) {
      await sleep(2000);
      await waitForHuman(page, { headed, context: 'after Create song' });
      if (tracker.generated.length >= 2) { ids = tracker.generated.slice(); break; }
      const fresh = (await songLinkIds(page)).filter((id) => !before.has(id));
      const merged = [...new Set([...tracker.generated, ...fresh])];
      if (merged.length && !firstSeenAt) firstSeenAt = Date.now();
      if (merged.length >= 2 || (merged.length && Date.now() - firstSeenAt > 30_000)) { ids = merged; break; }
    }
    if (!ids.length) throw new CliError('Clicked "Create song" but no new clips appeared within 2 minutes. Check your Suno library.', 1);
    log(`new clip(s): ${ids.join(', ')}`);

    // Wait for both to finish.
    const done = new Set();
    const failed = new Set();
    const finishDeadline = Date.now() + Number(opts.timeoutMin || 15) * 60_000;
    let lastProbe = 0;
    let lastReload = Date.now();
    while (done.size + failed.size < ids.length && Date.now() < finishDeadline) {
      await sleep(3000);
      await waitForHuman(page, { headed, context: 'while generating' });
      for (const id of ids) {
        if (done.has(id) || failed.has(id)) continue;
        const st = tracker.seen.get(id)?.status;
        if (NET.doneStatus.has(st)) { done.add(id); log(`take ${id}: complete`); }
        else if (NET.errorStatus.has(st)) { failed.add(id); log(`take ${id}: FAILED (${st})`); }
      }
      if (Date.now() - lastProbe > 15_000) {
        lastProbe = Date.now();
        for (const id of ids) {
          if (done.has(id) || failed.has(id)) continue;
          if ((await probe(URLS.cdnMp3(id))) === 200) { done.add(id); log(`take ${id}: mp3 is on the CDN`); }
        }
        vlog('status:', ids.map((id) => `${id.slice(0, 8)}=${done.has(id) ? 'done' : failed.has(id) ? 'failed' : (tracker.seen.get(id)?.status || '?')}`).join(' '));
      }
      // The page normally polls its own feed; nudge it if nothing has changed for a while.
      if (Date.now() - lastReload > 90_000) {
        lastReload = Date.now();
        vlog('reloading /create to refresh clip statuses');
        await page.reload({ waitUntil: 'domcontentloaded' }).catch(() => {});
      }
    }

    // Results.
    const takes = ids.map((id, i) => ({
      id,
      url: URLS.song(id),
      audio: null,
      title: tracker.seen.get(id)?.title || title || null,
      status: done.has(id) ? 'complete' : failed.has(id) ? 'error' : (tracker.seen.get(id)?.status || 'unknown'),
      n: i + 1,
    }));
    for (const t of takes) {
      if (t.status !== 'complete') continue;
      const feedUrl = tracker.seen.get(t.id)?.audio_url;
      const candidates = [
        ...(feedUrl && /^https:\/\/cdn\d*\.suno\.ai\/.+\.mp3/.test(feedUrl) ? [feedUrl] : []),
        URLS.cdnMp3(t.id), URLS.cdnMp4(t.id),
      ];
      const dest = path.join(out, `take_${t.n}.mp3`);
      for (const u of [...new Set(candidates)]) {
        vlog(`take ${t.n}: trying ${u}`);
        const r = await ctx.request.get(u, { failOnStatusCode: false, timeout: 300_000 }).catch(() => null);
        if (!r || !r.ok()) { vlog(`  -> ${r ? r.status() : 'error'}`); continue; }
        if (/\.mp4(\?|$)/.test(u)) {
          const tmp = path.join(out, `take_${t.n}.mp4`);
          fs.writeFileSync(tmp, await r.body());
          toMp3(tmp, dest);
          fs.rmSync(tmp, { force: true });
        } else {
          fs.writeFileSync(dest, await r.body());
        }
        t.audio = u;
        t.file = path.basename(dest);
        try { t.duration = Number(duration(dest).toFixed(2)); } catch {}
        log(`take ${t.n}: saved ${dest}${t.duration ? ` (${t.duration}s)` : ''}`);
        break;
      }
      if (!t.file) log(`take ${t.n}: audio not downloadable yet; open ${t.url} or run "fetch" later.`);
    }
    const json = path.join(out, 'suno_takes.json');
    fs.writeFileSync(json, JSON.stringify(takes.map(({ n, ...t }) => t), null, 2) + '\n');
    log(`wrote ${json}`);
    for (const t of takes) log(`  take ${t.n}: ${t.url}  [${t.status}]${t.file ? `  ${t.file}` : ''}`);
    log('Listen, pick a take, share it on Suno, then: node suno/suno.mjs fetch <share-url> --out <video dir>');
    if (done.size < ids.length) throw new CliError(`${ids.length - done.size} take(s) did not finish in time or failed; suno_takes.json lists their status.`, 1);
  } finally {
    await cleanup();
  }
}

async function cmdFetch(opts) {
  const input = opts._[1];
  if (!input) throw new UsageError('fetch needs a share URL, song URL or song id');
  if (!opts.out) throw new UsageError('fetch needs --out <dir>');
  const out = path.resolve(expandHome(opts.out));
  fs.mkdirSync(out, { recursive: true });

  const id = await resolveSongId(input);
  log(`song id: ${id}`);

  const waitMs = Number(opts.waitMin || 10) * 60_000;
  const deadline = Date.now() + waitMs;
  let src = null;
  for (let attempt = 1; ; attempt++) {
    const s4 = await probe(URLS.cdnMp4(id));
    if (s4 === 200) { src = { url: URLS.cdnMp4(id), file: 'suno-share.mp4' }; break; }
    const s3 = await probe(URLS.cdnMp3(id));
    if (s3 === 200) { src = { url: URLS.cdnMp3(id), file: 'suno-song.mp3' }; break; }
    if (Date.now() + 15000 > deadline) {
      throw new CliError(`audio not available after ${opts.waitMin || 10} min (mp4 ${s4}, mp3 ${s3}). Make sure the song is shared/public, then retry.`, 1);
    }
    log(`not ready (mp4 ${s4}, mp3 ${s3}), retry ${attempt} in 15s`);
    await sleep(15000);
  }
  const dest = path.join(out, src.file);
  log(`downloading ${src.url}`);
  await download(src.url, dest);
  const { m4a, wav } = extractAudio(dest, out);
  const d = { source: duration(dest), m4a: duration(m4a), wav: duration(wav) };
  const meta = { id, url: URLS.song(id), input, source_url: src.url, files: { source: src.file, m4a: 'song.m4a', wav: 'song.wav' }, durations: d };
  fs.writeFileSync(path.join(out, 'suno_fetch.json'), JSON.stringify(meta, null, 2) + '\n');
  log(`ok: ${dest} (${d.source.toFixed(2)}s)`);
  log(`    ${m4a} (${d.m4a.toFixed(2)}s)`);
  log(`    ${wav} (${d.wav.toFixed(2)}s, 44.1 kHz)`);
}

// ---- main --------------------------------------------------------------------

async function main() {
  const argv = process.argv.slice(2);
  const opts = parseArgs(argv, ['dryRun', 'headed', 'verbose', 'help']);
  const cmd = opts._[0];
  setVerbose(opts.verbose);
  if (!cmd || cmd === 'help') { console.log(HELP[opts._[1]] || HELP.main); return; }
  if (!HELP[cmd] || cmd === 'main') throw new UsageError(`unknown command "${cmd}"\n\n${HELP.main}`);
  if (opts.help) { console.log(HELP[cmd]); return; }
  if (cmd === 'login') return cmdLogin(opts);
  if (cmd === 'create') return cmdCreate(opts);
  if (cmd === 'fetch') return cmdFetch(opts);
}

main().then(() => process.exit(0)).catch((e) => {
  if (e instanceof UsageError) { console.error(`error: ${e.message}`); process.exit(2); }
  if (e instanceof CliError) { console.error(`error: ${e.message}`); process.exit(e.code); }
  console.error(e?.stack || e);
  process.exit(1);
});
