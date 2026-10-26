#!/usr/bin/env node
// Offline tests for suno.mjs. Nothing here talks to Suno or spends credits:
// the create flow runs headless against suno/test/mock-create.html served on
// 127.0.0.1, with a throwaway Chrome profile in the OS temp dir.
//
//   node suno/test/run-tests.mjs           # all offline tests
//   node suno/test/run-tests.mjs --live    # also: real share-link fetch (needs T2MV_TEST_SHARE_URL)
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CLI = path.join(HERE, '..', 'suno.mjs');
const MOCK = fs.readFileSync(path.join(HERE, 'mock-create.html'), 'utf8');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 't2mv-suno-test-'));
const squash = (s) => String(s).replace(/\s+/g, '');

// ---- mock server -------------------------------------------------------------
const state = { generateCalls: [], feedPolls: 0, ids: [] };
const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  const json = (o) => { res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify(o)); };
  if (u.pathname === '/create') { res.writeHead(200, { 'content-type': 'text/html' }); return res.end(MOCK); }
  if (u.pathname === '/signed-out') { res.writeHead(302, { location: '/sign-in?redirect_url=%2Fcreate' }); return res.end(); }
  if (u.pathname === '/sign-in') {
    res.writeHead(200, { 'content-type': 'text/html' });
    return res.end('<h1>Welcome to Suno</h1><button>Continue with Google</button>');
  }
  if (u.pathname.startsWith('/api/generate') && req.method === 'POST') {
    let body = '';
    req.on('data', (c) => { body += c; });
    req.on('end', () => {
      state.generateCalls.push(JSON.parse(body));
      state.ids = [crypto.randomUUID(), crypto.randomUUID()];
      json({ id: crypto.randomUUID(), clips: state.ids.map((id) => ({ id, title: 'Mock Take', status: 'submitted', audio_url: '' })) });
    });
    return;
  }
  if (u.pathname.startsWith('/api/feed')) {
    state.feedPolls++;
    const status = state.feedPolls >= 3 ? 'complete' : 'streaming';
    return json({ clips: state.ids.map((id) => ({ id, title: 'Mock Take', status, audio_url: '' })) });
  }
  res.writeHead(404); res.end('not found');
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${server.address().port}`;

function runCli(args, env = {}) {
  return new Promise((resolve) => {
    const p = spawn(process.execPath, [CLI, ...args], { env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    p.stdout.on('data', (d) => { out += d; });
    p.stderr.on('data', (d) => { out += d; });
    p.on('close', (code) => resolve({ code, out }));
  });
}

// ---- fixtures ----------------------------------------------------------------
const lyricsFile = path.join(TMP, 'lyrics.txt');
const LYRICS = '[Verse 1]\nLights on in the kitchen, kettle starts to sing\nNobody is awake yet, we can do anything\n\n[Chorus]\nKeep it simple, keep it light\n(keep it light)\n';
fs.writeFileSync(lyricsFile, LYRICS);
const STYLE = 'warm indie pop, hand claps, bright guitars, 110 bpm';
const profile = path.join(TMP, 'profile');
fs.mkdirSync(profile);
fs.writeFileSync(path.join(profile, '.keep'), ''); // looks like a used profile

const results = [];
async function test(name, fn) {
  try { await fn(); results.push([name, 'PASS']); console.log(`PASS ${name}`); }
  catch (e) { results.push([name, 'FAIL']); console.log(`FAIL ${name}\n  ${e.message.replace(/\n/g, '\n  ')}`); }
}

await test('help prints usage', async () => {
  const r = await runCli(['--help']);
  assert.equal(r.code, 0); assert.match(r.out, /Commands/);
  const c = await runCli(['create', '--help']);
  assert.equal(c.code, 0); assert.match(c.out, /--dry-run/);
});

await test('create without a profile says to run login first', async () => {
  const r = await runCli(['create', '--style', STYLE, '--lyrics', lyricsFile, '--dry-run', '--profile', path.join(TMP, 'missing-profile')]);
  assert.equal(r.code, 2, r.out); assert.match(r.out, /run "node suno\/suno\.mjs login" first/i);
});

await test('create on a signed-out profile says to run login first', async () => {
  const r = await runCli(['create', '--style', STYLE, '--lyrics', lyricsFile, '--dry-run', '--profile', profile],
    { T2MV_SUNO_CREATE_URL: `${BASE}/signed-out` });
  assert.equal(r.code, 2, r.out); assert.match(r.out, /Not logged in/);
});

await test('create rejects lyrics over 5000 characters before opening a browser', async () => {
  const long = path.join(TMP, 'long.txt');
  fs.writeFileSync(long, 'la '.repeat(1700)); // 5100 chars, 5099 after trimming
  const r = await runCli(['create', '--style', STYLE, '--lyrics', long, '--dry-run', '--profile', path.join(TMP, 'missing-profile')]);
  assert.equal(r.code, 2, r.out); assert.match(r.out, /5099 characters; Suno allows 5000/);
});

await test('create --dry-run fills and verifies the mock form and never calls /generate', async () => {
  const out = path.join(TMP, 'dry');
  const r = await runCli(['create', '--style', STYLE, '--lyrics', lyricsFile, '--title', 'Kitchen Light', '--dry-run', '--out', out, '--profile', profile, '--verbose'],
    { T2MV_SUNO_CREATE_URL: `${BASE}/create` });
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /DRY RUN: form filled and verified\. "Create song" button is ready/);
  assert.match(r.out, /style box: found next to the style-prompt buttons/);
  assert.equal(state.generateCalls.length, 0, 'dry run must not submit');
  assert.ok(fs.existsSync(path.join(out, 'dry_run.png')));
});

await test('create (mock page) submits once, tracks both clips to complete, writes suno_takes.json', async () => {
  const out = path.join(TMP, 'takes');
  const r = await runCli(['create', '--style', STYLE, '--lyrics', lyricsFile, '--title', 'Kitchen Light', '--out', out, '--profile', profile, '--verbose', '--timeout-min', '2'],
    { T2MV_SUNO_CREATE_URL: `${BASE}/create` });
  if (process.env.T2MV_TEST_SHOW) console.log(r.out);
  assert.equal(r.code, 0, r.out);
  assert.equal(state.generateCalls.length, 1, 'exactly one submit');
  const sent = state.generateCalls[0];
  assert.equal(squash(sent.prompt), squash(LYRICS), 'lyrics reached the page');
  assert.equal(sent.tags, STYLE); assert.equal(sent.title, 'Kitchen Light');
  const takes = JSON.parse(fs.readFileSync(path.join(out, 'suno_takes.json'), 'utf8'));
  assert.deepEqual(takes.map((t) => t.id), state.ids);
  for (const t of takes) {
    assert.equal(t.url, `https://suno.com/song/${t.id}`);
    assert.equal(t.status, 'complete');
    assert.equal(t.title, 'Mock Take');
  }
});

if (process.argv.includes('--live')) {
  await test('fetch (live) downloads a shared song and extracts m4a + wav', async () => {
    const share = process.env.T2MV_TEST_SHARE_URL;
    assert.ok(share, 'set T2MV_TEST_SHARE_URL to a share link you own');
    const out = path.join(TMP, 'fetch');
    const r = await runCli(['fetch', share, '--out', out]);
    assert.equal(r.code, 0, r.out);
    const meta = JSON.parse(fs.readFileSync(path.join(out, 'suno_fetch.json'), 'utf8'));
    assert.ok(meta.durations.wav > 1 && Math.abs(meta.durations.wav - meta.durations.source) < 0.5, JSON.stringify(meta.durations));
    console.log(`  durations: ${JSON.stringify(meta.durations)}`);
  });
}

server.close();
fs.rmSync(TMP, { recursive: true, force: true });
const failed = results.filter(([, s]) => s === 'FAIL').length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
