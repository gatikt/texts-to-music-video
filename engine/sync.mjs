// sync.mjs — copy the shared engine into a project's build/ folder, then regenerate src/project_files.js.
// usage: node engine/sync.mjs <build dir> [--force]     (a project's build/package.json runs this on `npm install`)
//
// Engine-owned (copied in, gitignored inside the project — change them in engine/, never in build/):
//   render.mjs studio.html GUIDE.md src/core.js src/frame.js src/cast.js src/props.js src/lab/ tools/ assets/fonts/
// Project-owned (never written here; per-project work goes here — see engine/README.md):
//   package.json, src/timeline_data.js, src/story.js, src/msg_data.js, src/cast_project.js, src/props_project.js, src/hud.js,
//   src/ch/, src/lab/p_*.js (project benches), assets/*.png, chapters.json, PROJECT_GUIDE.md, STORYBOARD.md, previews/, out/
//
// Safety: every sync records the hash of each file it copied in <build>/.engine-sync.json. If an engine-owned file in build/
// was edited after the last sync, it is NOT overwritten (a warning names it) unless you pass --force; with --force the edited
// copy is first saved under <build>/.engine-sync-backup/<timestamp>/. A build synced before this manifest existed gets the same
// backup for every file that differs from the engine, and is then overwritten.
import { cpSync, mkdirSync, existsSync, readFileSync, writeFileSync, readdirSync, statSync, copyFileSync } from 'node:fs';
import { dirname, join, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const ENGINE = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`usage: node engine/sync.mjs <build dir> [--force]
  Copies the engine-owned files into <build dir>, skipping any that were edited there since the last sync
  (--force replaces them after saving a backup), then runs tools/assets.mjs to write src/project_files.js.`);
  process.exit(0);
}
const force = args.includes('--force');
const dest = resolve(args.find(a => !a.startsWith('-')) || '.');
if (dest === resolve(ENGINE)) { console.error('refusing to sync the engine onto itself'); process.exit(1); }

const ITEMS = ['render.mjs', 'studio.html', 'GUIDE.md', 'src/core.js', 'src/frame.js', 'src/cast.js', 'src/props.js', 'src/lab', 'tools', 'assets/fonts'];
const MANIFEST = join(dest, '.engine-sync.json');
const hash = f => createHash('sha256').update(readFileSync(f)).digest('hex');
const posix = p => p.split(sep).join('/');
const walk = relp => (statSync(join(ENGINE, relp)).isDirectory() ? readdirSync(join(ENGINE, relp)).flatMap(n => walk(join(relp, n))) : [relp]);

let manifest = null;
try { manifest = JSON.parse(readFileSync(MANIFEST, 'utf8')).files || null; } catch { /* first sync, or a build synced by an older sync.mjs */ }
const backupDir = join(dest, '.engine-sync-backup', new Date().toISOString().replace(/[:.]/g, '-'));
const backup = rp => { const to = join(backupDir, rp); mkdirSync(dirname(to), { recursive: true }); copyFileSync(join(dest, rp), to); };

const next = {}, skipped = [], backedUp = [];
let copied = 0;
for (const it of ITEMS) {
  if (!existsSync(join(ENGINE, it))) { console.error('missing engine file ' + it); process.exit(1); }
  for (const rp of walk(it)) {
    const key = posix(rp), from = join(ENGINE, rp), to = join(dest, rp), src = hash(from);
    if (existsSync(to)) {
      const cur = hash(to);
      if (cur === src) { next[key] = src; continue; }
      // differs from the engine: either a stale copy from the last sync (safe to replace) or edited here (protect it)
      const editedHere = !manifest || manifest[key] !== cur;
      if (editedHere && manifest && !force) { skipped.push(key); if (manifest[key]) next[key] = manifest[key]; continue; }
      if (editedHere) { backup(rp); backedUp.push(key); }
    }
    mkdirSync(dirname(to), { recursive: true });
    cpSync(from, to, { force: true });
    next[key] = src; copied++;
  }
}
for (const d of ['src/ch', 'assets']) mkdirSync(join(dest, d), { recursive: true });
writeFileSync(MANIFEST, JSON.stringify({ note: 'written by engine/sync.mjs: hashes of the engine files last copied here', files: next }, null, 1) + '\n');

const where = relative(process.cwd(), dest) || '.';
console.log(`engine synced → ${where} (${copied} file(s) updated)`);
if (backedUp.length) console.warn(`saved ${backedUp.length} engine file(s) that differed in ${where} to ${relative(process.cwd(), backupDir)} before overwriting:\n  ${backedUp.join('\n  ')}`);
if (skipped.length) {
  console.warn(`NOT overwritten (edited inside ${where} since the last sync; re-run with --force to replace them, a backup is kept):\n  ${skipped.join('\n  ')}`);
  console.warn('Per-project changes belong in project-owned files (src/cast_project.js, src/props_project.js, src/hud.js, src/story.js); see engine/README.md.');
}

// Regenerate src/project_files.js so studio.html finds this project's scripts even before the first render.
const r = spawnSync(process.execPath, ['tools/assets.mjs'], { cwd: dest, stdio: 'inherit' });
if (r.status !== 0) { console.error('tools/assets.mjs failed'); process.exit(1); }
