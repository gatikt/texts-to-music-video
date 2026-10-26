# Workflows

These are **Claude Code Workflow** templates: scripts that run inside Claude Code and fan the work out across many agents. They contain no story content. Everything they need (paths, the protagonist's name, the brief, eras, lyric sections, chapters) arrives in the Workflow `args`.

You don't write the args by hand. `bin/t2mv` builds them from `projects/<name>/project.json`, saves them to `projects/<name>/workflow_args/<stage>.json`, and prints the exact sentence to give Claude:

```bash
bin/t2mv research my-story
# Paste to Claude:
#   Run the workflow at workflows/1_song_lyrics.js with args from projects/my-story/workflow_args/research.json
#   (pass the JSON object as the Workflow args value, not as a string).
```

Start Claude Code in the repo root with an Opus-class model, then paste that sentence. Claude reads the JSON file and calls the Workflow tool with `{ scriptPath: "workflows/1_song_lyrics.js", args: { ... } }`.

| Stage (`bin/t2mv …`) | File | What it does | Typical size |
|---|---|---|---|
| `workflow <p> suno-browser` | `0_suno_browser.js` | Fills suno.com/create in your Chrome (Claude in Chrome + the `suno-create` skill) and **stops before Create**; re-run with `"confirm": true` once you say go | 1–2 agents |
| `research <p>` | `1_song_lyrics.js` | era researchers → story editor (`ARC.md`) → 3 lyric drafts → producer (`lyrics.txt`, `SECTIONS.md`) | eras + 5 agents |
| `lyrics <p>` | `1b_song_revision.js` | hook concepts → one draft per hook → producer → 2 cringe critics → final fix | ~7 agents |
| `preproduction <p>` | `2_preproduction.js` | per-lyric CONTEXT dossiers + LOOKS + SETTINGS → fact-check each dossier → cast/sets/HUD builders → director (`STORYBOARD.md`) | ~2×sections + 6, ~1 h |
| `chapters <p>` | `3_chapters_review_fix.js` | per chapter build → critique → polish (pipelined) → whole-film slice review → verify each must-fix → per-file fixes | ~70 agents, 3–5 h |
| `review <p>` | `4_continuity_review.js` | standalone slice review + adversarial verify; returns `items` for stage 5 | slices + musts |
| `fixes <p> --items=f.json` | `5_apply_review_fixes.js` | one fixer per chapter file → independent re-check | 2 per file |

Check every template without spending tokens. This verifies that `meta` is a pure literal, that the phase titles match, that each file parses when wrapped in an async function, and that it runs end to end on stub agents:

```bash
node scripts/check_workflows.mjs
```

## Args schema

All stages get these common fields. Paths are absolute because agents run commands from anywhere; `bin/t2mv` fills them in for your machine.

| Field | Type | Meaning |
|---|---|---|
| `project` | string | project folder name |
| `title` | string | working title of the song/video |
| `protagonist` | string | the sender name used for your messages in `dms.db` (`is_me = 1`) |
| `displayName` | string | how agents should refer to you (defaults to `protagonist`) |
| `timezone` | string | IANA timezone |
| `audience` | string | who will see it (e.g. "you and close friends") |
| `tone` | string | e.g. "funny, humble, tough" |
| `brief` | string | your brief, quoted to every agent verbatim |
| `projectDir` | path | `projects/<name>` |
| `researchDir` | path | `projects/<name>/research` |
| `videoDir` | path | `projects/<name>/video` |
| `buildDir` | path | `projects/<name>/video/build` (the copied engine) |
| `python` | path | `.venv/bin/python` (photo tools need Pillow) |
| `db` | path | `projects/<name>/data/dms.db`; agents open it as `file:<db>?mode=ro` |
| `dmsearch` | path | `scripts/dmsearch.py` |
| `lyricsFile` | path | `projects/<name>/lyrics.txt` (TITLE / STYLE / LYRICS format) |

Each stage adds its own fields:

| Workflow | Extra fields |
|---|---|
| `0_suno_browser.js` | `songStyle`, `outDir`; `confirm: true` **only after you, the user, said yes** to spending credits |
| `1_song_lyrics.js` | `eras: [[id, "YYYY-MM-DD", "YYYY-MM-DD" (exclusive), description]]` (required), `extraResearch: [[id, scope]]`, `angles: [string]` (default 3), `songStyle`, `targetLength` |
| `1b_song_revision.js` | `feedback` (your words, verbatim), `hooks: [string]` (empty: an agent proposes 3 from ARC.md), `avoidWords: [string]`, `songStyle`, `targetLength` |
| `2_preproduction.js` | `lyricSections: [[id, "time range + lines: what they are about / what to find"]]` (required), `looksPeople`, `settingsPlaces`, `hud` (optional HUD description), `duration` |
| `3_chapters_review_fix.js` | `chapters: [[file_id, start_s, end_s]]` (required), `slices: [[from_s, to_s]]` (overlapping; `bin/t2mv` makes ~45 s slices with 4 s overlap unless `review_slices` is set), `duration`, `styleRefs: [path]` (optional finished builds to borrow techniques from) |
| `4_continuity_review.js` | `slices` (required), `duration`, `continuityNotes` (e.g. which outfit appears from which second) |
| `5_apply_review_fixes.js` | `items: [{tag, file, findings: [{t, severity, problem, fix}], extra?}]` (required; stage 4 returns this as `result.items`), `sharedChanges` (shared-engine changes the fixers must know about) |

Every template throws `missing args: …` at once if a required field is absent, so a bad invocation costs nothing.

## Writing or editing a template

- `export const meta = {...}` must be the first statement and a **pure literal**: no variables, template strings, spreads or calls. The `phases[].title` values must match the `phase()` / `opts.phase` strings exactly.
- There is no filesystem access in the script body and no `Date.now()` / `Math.random()`. Pass everything in through `args`.
- Use `pipeline()` by default and `parallel()` only when a stage needs every earlier result (e.g. the storyboard needs every dossier).
- **Resume:** stop the run, edit the script, and re-run with `resumeFromRunId`. Cached agents are matched by call order, so edits late in the script keep the early results.
- Results longer than the notification are truncated; the run's `journal.jsonl` holds every agent's full return.
- The rules repeated in the prompts were learned the hard way, so keep them: verbatim receipts only (`checkquotes`), edit only your own file, pure function of `t`, faces between y 260 and 1560, no logos or IP, nothing private about third parties, real weekdays, LOOKS.md colours are canon, never dump the environment, no network, the DB is read-only.
