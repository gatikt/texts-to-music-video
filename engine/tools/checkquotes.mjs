// Verifies every receipt('...', 'me'|'her') string in src/ against the WHOLE chat DB (all conversations).
// 'me'  = the protagonist sent it (is_me=1); 'her' = anyone else sent it (is_me=0) — put the real sender in a comment next to it.
// usage: node tools/checkquotes.mjs [--db=path/to/dms.db] [file...]   → prints OK / WRONGWHO / MISSING per quote; exit 1 if any fail.
// DB: --db flag, else $T2MV_DB, else the nearest data/dms.db walking up from the current folder
//     (from projects/<name>/video/build that is projects/<name>/data/dms.db). Always opened read-only.
if (process.argv.includes('--help') || process.argv.includes('-h')) { const { readFileSync: rf } = await import('node:fs'); console.log(rf(new URL(import.meta.url), 'utf8').split('\n').filter(l => l.startsWith('//')).map(l => l.replace(/^\/\/ ?/, '')).join('\n')); process.exit(0); }
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, dirname, join } from 'node:path';
const argv = process.argv.slice(2), dbArg = argv.find(a => a.startsWith('--db='));
function findDb() {
  for (let d = resolve('.'), i = 0; i < 6; i++, d = dirname(d)) { const p = join(d, 'data', 'dms.db'); if (existsSync(p)) return p; }
  return resolve('../data/dms.db');
}
const DB = resolve(dbArg ? dbArg.slice(5) : process.env.T2MV_DB || findDb());
if (!existsSync(DB)) { console.error(`no message DB at ${DB} (pass --db= or set T2MV_DB)`); process.exit(2); }
const fileArgs = argv.filter(a => !a.startsWith('--'));
const files = fileArgs.length ? fileArgs : (existsSync('src/ch') ? readdirSync('src/ch').filter(f => f.endsWith('.js')).sort().map(f => 'src/ch/' + f) : []);
const norm = s => s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').trim();
let bad = 0, n = 0;
for (const f of files) {
  const src = readFileSync(f, 'utf8'); const re = /receipt\(\s*(['"`])((?:\\.|(?!\1).)*)\1\s*,\s*['"](her|me)['"]/g; let m;
  while ((m = re.exec(src))) {
    n++;
    const raw = m[2].replace(/\\(['"`\\])/g, '$1'), who = m[3], want = who === 'me' ? 1 : 0;
    const variants = [...new Set([raw, raw.replace(/'/g, '’'), raw.replace(/’/g, "'"), raw.replace(/"/g, '“'), norm(raw)])];
    const hits = execFileSync('sqlite3', [`file:${DB}?mode=ro`, `select is_me from messages where kind='text' and replace(text,char(10),' ') in (${variants.map(v => "'" + v.replace(/'/g, "''") + "'").join(',')}) limit 5`]).toString().trim().split('\n').filter(Boolean).map(Number);
    if (hits.includes(want)) console.log(`OK       ${f}: [${who}] ${raw}`);
    else if (hits.length) { bad++; console.log(`WRONGWHO ${f}: [${who}] ${raw}`); }
    else { bad++; console.log(`MISSING  ${f}: [${who}] ${raw}`); }
  }
}
if (!n) console.error('(no receipt() calls found)');
process.exit(bad ? 1 : 0);
