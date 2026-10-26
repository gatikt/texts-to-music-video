#!/usr/bin/env node
// Dry-run every Claude Code Workflow template in workflows/ without spawning agents.
// usage: node scripts/check_workflows.mjs [workflows/x.js ...] [--verbose]
// For each file: (1) `meta` must be a pure literal with name + description and phases matching phase() titles,
// (2) the body must parse when wrapped in an async function, (3) it runs end to end with stub agent()/parallel()/
// pipeline() against sample args (schema-shaped stub results), and (4) it throws a clear error with no args.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const verbose = process.argv.includes('--verbose');
const files = process.argv.slice(2).filter(a => !a.startsWith('--'));
const targets = files.length ? files : fs.readdirSync(path.join(REPO, 'workflows')).filter(f => f.endsWith('.js')).sort().map(f => path.join('workflows', f));

const D = '/tmp/t2mv-check';   // fake paths only; nothing is read or written there
const CH = [['c01_intro', 0, 20], ['c02_verse', 20, 41.5]];
const SAMPLE = {
  project: 'sample', title: 'Sample Song', protagonist: 'Alex', displayName: 'Alex', timezone: 'America/New_York',
  audience: 'Alex and friends', tone: 'funny, humble, tough', brief: 'a sample brief',
  projectDir: D, researchDir: `${D}/research`, videoDir: `${D}/video`, buildDir: `${D}/video/build`, python: 'python3',
  db: `${D}/data/dms.db`, dmsearch: `${REPO}/scripts/dmsearch.py`, lyricsFile: `${D}/lyrics.txt`,
  eras: [['era_a', '2021-01-01', '2022-01-01', '2021'], ['era_b', '2022-01-01', '2023-01-01', '2022']],
  extraResearch: [['stats', 'numbers']], angles: [], songStyle: 'pop', targetLength: '3:00',
  feedback: 'less cringe', hooks: [], avoidWords: ['hello'],
  lyricSections: [['ctx_01', '0-20 s'], ['ctx_02', '20-41.5 s']], looksPeople: '', settingsPlaces: '',
  chapters: CH, slices: [[0, 24], [20, 41.5]], duration: 41.5, outDir: `${D}/video`,
  items: [{ tag: 'c01_intro', file: 'src/ch/c01_intro.js', findings: [{ t: 3, severity: 'must', problem: 'p', fix: 'f' }] }],
};

function stub(schema) {
  if (!schema) return 'stub text';
  switch (schema.type) {
    case 'object': return Object.fromEntries(Object.entries(schema.properties || {}).map(([k, v]) => [k, stub(v)]));
    case 'array': return [stub(schema.items)];
    case 'boolean': return true;
    case 'number': case 'integer': return 1;
    case 'string': return schema.enum ? schema.enum[0] : 'x';
    default: return null;
  }
}
function validateSchema(s, where) {
  if (!s || s.type !== 'object' || !s.properties) throw new Error(`${where}: schema root must be {type:'object', properties}`);
  for (const r of s.required || []) if (!(r in s.properties)) throw new Error(`${where}: required "${r}" not in properties`);
}

function extractMeta(src) {
  const start = src.indexOf('export const meta = ');
  if (start !== 0 && !/^\s*$/.test(src.slice(0, start).replace(/\/\/.*$/gm, ''))) throw new Error('script must begin with export const meta');
  let i = src.indexOf('{', start), depth = 0, q = null;
  const from = i;
  for (; i < src.length; i++) {
    const c = src[i];
    if (q) { if (c === '\\') i++; else if (c === q) q = null; continue; }
    if (c === "'" || c === '"') q = c;
    else if (c === '`') throw new Error('meta contains a template literal (must be a pure literal)');
    else if (c === '{') depth++;
    else if (c === '}' && --depth === 0) break;
  }
  const text = src.slice(from, i + 1);
  if (/\.\.\./.test(text.replace(/'(?:\\.|[^'])*'|"(?:\\.|[^"])*"/g, ''))) throw new Error('meta contains a spread');
  if (/[A-Za-z_$][\w$]*\s*\(/.test(text.replace(/'(?:\\.|[^'])*'|"(?:\\.|[^"])*"/g, ''))) throw new Error('meta contains a call');
  // eslint-disable-next-line no-new-func
  const meta = Function('"use strict"; return (' + text + ')')();   // any identifier reference throws here
  return { meta, end: i + 1 };
}

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
let failed = 0;
for (const f of targets) {
  const src = fs.readFileSync(path.resolve(REPO, f), 'utf8');
  const out = [];
  try {
    const { meta, end } = extractMeta(src);
    if (!meta.name || !meta.description) throw new Error('meta needs name + description');
    const body = src.slice(end);
    if (/\bDate\.now\(|\bMath\.random\(|new Date\(\s*\)/.test(body)) throw new Error('Date.now()/Math.random()/new Date() are not allowed in workflows');
    if (/\/Users\/|\/home\//.test(src)) throw new Error('absolute home path in workflow');
    const run = new AsyncFunction('args', 'agent', 'parallel', 'pipeline', 'phase', 'log', 'budget', 'workflow', body); // parse check
    const run1 = async (args) => {
      const phases = new Set(); let agents = 0;
      const agent = async (prompt, opts = {}) => {
        if (typeof prompt !== 'string' || !prompt) throw new Error('agent prompt must be a non-empty string');
        if (opts.schema) validateSchema(opts.schema, opts.label || 'agent');
        if (opts.phase) phases.add(opts.phase);
        if (/\$\{|undefined|\[object Object\]/.test(prompt)) throw new Error(`prompt for ${opts.label} contains ${prompt.match(/\$\{|undefined|\[object Object\]/)[0]}`);
        agents++; return stub(opts.schema);
      };
      const parallel = async (th) => Promise.all(th.map(t => t().catch(() => null)));
      const pipeline = async (items, ...stages) => Promise.all(items.map(async (it, idx) => { let v = it; for (const [n, s] of stages.entries()) { try { v = await s(n === 0 ? it : v, it, idx); } catch (e) { throw e; } } return v; }));
      const phase = (t) => phases.add(t);
      const log = (m) => { if (verbose) out.push(`    log: ${m}`); };
      const result = await run(args, agent, parallel, pipeline, phase, log, { total: null, spent: () => 0, remaining: () => Infinity }, async () => null);
      return { phases, agents, result };
    };
    const { phases, agents, result } = await run1(JSON.parse(JSON.stringify(SAMPLE)));
    const declared = new Set((meta.phases || []).map(p => p.title));
    const undeclared = [...phases].filter(p => !declared.has(p));
    if (undeclared.length) throw new Error(`phase titles not in meta.phases: ${undeclared.join(', ')}`);
    if (result === undefined) throw new Error('workflow returned nothing');
    let noArgs = 'no';
    try { await run1(undefined); } catch (e) { noArgs = /missing args/.test(e.message) ? 'yes' : `other error: ${e.message}`; }
    if (noArgs !== 'yes') throw new Error(`without args it should throw "missing args" (got: ${noArgs})`);
    console.log(`OK   ${f}  (meta "${meta.name}", ${agents} stub agents, phases: ${[...phases].join(' / ')})`);
  } catch (e) {
    failed++; console.log(`FAIL ${f}: ${e.message}`);
  }
  if (out.length) console.log(out.join('\n'));
}
process.exitCode = failed ? 1 : 0;
