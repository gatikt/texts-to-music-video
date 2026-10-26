# texts-to-music-video

Turn someone's real text messages (iMessage + Instagram) into a **personalized song** and a **hand-painted, vertical (1080×1920) music video**: about 2.5 to 4.5 minutes of a watercolour, riso-storybook world, with the real messages popping up as on-screen "receipts".

It is a private, personal toolkit. Nothing is uploaded, and the message data never leaves your machine, except what you choose to paste into Suno (the lyrics and a style line).

## What you get

A 1080×1920 H.264/AAC mp4 at 30 fps, plus a smaller share copy. A typical result:

- a catchy pop song in Suno about real moments from the last few years, built on a hook someone really texted;
- a karaoke strip that follows the sung words exactly (whisper alignment);
- painted characters for the protagonist, family and friends at each age, in outfits taken from real photos;
- painted sets for the real places (a bedroom, a kitchen, a classroom, a gym);
- real message bubbles, each verified against the database, plus riso halftone prints of real photos;
- a HUD with the story's date and a running "messages sent" odometer;
- cuts and gags that land on beats and sung words.

## How it works

```
iMessage chat.db ─┐
Instagram export ─┴─► dms.db ──► research agents ──► ARC.md ──► lyrics.txt ──► Suno ──► song.wav
                                                                                         │
          beats.json + aligned.json (whisper) ◄──────────────────────────────────────────┘
                     │
   engine (p5.js + p5.brush) ──► pre-production agents (dossiers, LOOKS, SETTINGS, STORYBOARD)
                     │
          chapter agents ──► review + verify ──► fixes ──► headless Chrome frames ──► mp4
```

The heavy creative work (research, lyrics, storyboard, animating each chapter, reviewing) runs as **Claude Code Workflows**: scripts that fan out across dozens of agents. Everything else is the `bin/t2mv` CLI.

## Requirements

| Need | Version | Why | Install |
|---|---|---|---|
| macOS on Apple Silicon | 14+ | iMessage import, Chrome's Metal renderer | — |
| Node.js | 22.x (20+ works) | CLI, renderer, Suno helper | `brew install node@22` |
| Google Chrome | stable | headless rendering (puppeteer-core), Suno | [google.com/chrome](https://www.google.com/chrome/), or set `CHROME_PATH` |
| ffmpeg / ffprobe | 8.x | audio cut, encode, verify | `brew install ffmpeg` |
| Python | 3.10–3.13 for the venv (scripts run on 3.10+) | message DB, audio analysis | `brew install python@3.13` |
| Python packages | see `requirements.txt` | librosa, faster-whisper, pillow, numpy | `python3.13 -m venv .venv && .venv/bin/pip install -r requirements.txt` |
| sqlite3 CLI | system | agents query the DB | preinstalled |
| Claude Code | latest, Opus-class model | the Workflow tool runs the research/lyrics/video agents | [docs.claude.com/claude-code](https://docs.claude.com/en/docs/claude-code) |
| Suno account | — | makes the song | suno.com |
| Full Disk Access | — | to read `~/Library/Messages/chat.db` | System Settings → Privacy & Security → Full Disk Access → your terminal |
| Disk | ~15 GB free | frames for a 4–5 minute render | — |

Run `bin/t2mv doctor` to check everything; it prints a fix for anything missing.

## Quickstart: render the demo

`projects/demo` is a small, fully synthetic project (made-up people, made-up messages) that ships with the repo.

```bash
bin/t2mv doctor                # check tools; fix any FAIL (a missing .venv is only a warning: the demo needs no Python)
bin/t2mv timeline demo         # npm install in projects/demo/video/build (copies the engine in), list the project scripts
bin/t2mv render demo           # render frames, encode, verify → projects/demo/out/
```

Open `projects/demo/video/build/studio.html` in Chrome to scrub the timeline live.

## The full pipeline

Each stage reads `projects/<name>/project.json` (copied from [`project.example.json`](project.example.json)). The stages that run agents print a ready-to-paste instruction for Claude Code. [`docs/PIPELINE.md`](docs/PIPELINE.md) has every step in detail, including the commands each stage runs underneath and the gotchas.

| # | Command | What happens | Output |
|---|---|---|---|
| 0 | `bin/t2mv init <name>` | create the project folder | `projects/<name>/project.json` |
| | *edit project.json* | `me` (your sender name exactly as stored), `me_aliases` (your Instagram display name), `timezone`, `data.instagram_export`, `brief`, `tone`, `eras` | |
| 1 | `bin/t2mv db <name>` | parse the Instagram HTML export and read iMessage (read-only) into one searchable SQLite DB with sessions and full-text search | `data/dms.db` |
| 2 | `bin/t2mv research <name>` → Claude | era researchers → story arc → 3 lyric drafts → producer | `research/*.md`, `ARC.md`, `lyrics.txt`, `SECTIONS.md` |
| 2b | `bin/t2mv lyrics <name>` → Claude | revise from your feedback (`song.revision_feedback`): new hooks, judge, cringe critics | `lyrics.txt` |
| 3 | `bin/t2mv suno <name> login` / `create` | make the song on suno.com (spends credits; `--dry-run` first). Or `bin/t2mv workflow <name> suno-browser` to let Claude fill Suno in your own Chrome; it waits for your OK before Create | `video/suno-takes/` |
| 3b | `bin/t2mv suno <name> fetch <share-url>` | download the take you picked | `video/song.wav` |
| 4 | `bin/t2mv audio <name>` | trim + fade, beat grid (librosa), word timestamps (faster-whisper), lyrics alignment. **Check `aligned.json` by eye**, then set `chapters` in project.json | `video/song_cut.wav`, `beats.json`, `aligned.json` |
| 5 | `bin/t2mv timeline <name>` | set up `video/build/` (npm install syncs the engine in) and write the timing, chapters and a starter `src/story.js` | `video/build/` |
| 6 | `bin/t2mv preproduction <name>` → Claude | per-lyric context dossiers + fact-checks, looks and settings bibles, cast/sets/HUD builders, director's storyboard (~1 h) | `build/CONTEXT/`, `LOOKS.md`, `SETTINGS.md`, `STORYBOARD.md` |
| 7 | `bin/t2mv chapters <name>` → Claude | every chapter built → critiqued → polished in parallel, then whole-film review, adversarial verify, fixes (3–5 h) | `build/src/ch/*.js` |
| 7b | `bin/t2mv review <name>` / `fixes <name> --items=f.json` → Claude | optional extra review and fix rounds | |
| 8 | `bin/t2mv render <name> [--fresh]` | checkquotes, render all frames (resumable, with retries), encode, ffprobe + full decode check, share copy | `out/<name>.mp4`, `out/<name>_share.mp4` |
| 9 | `bin/t2mv clean <name> --yes` | delete what can be re-created (frames, previews, node_modules, raw audio) | |

`bin/t2mv status <name>` shows which artifacts exist. `bin/t2mv help` lists every option.

Workflow invocation and the args schema are in [`workflows/README.md`](workflows/README.md). In short, start Claude Code in this repo, run the `bin/t2mv` stage, and paste the sentence it prints, e.g. *"Run the workflow at workflows/1_song_lyrics.js with args from projects/my-story/workflow_args/research.json"*.

### Repo layout

```
bin/t2mv               the CLI (plain Node, no dependencies)
scripts/               ig_clean.py, build_dms.py, dmsearch.py, analyze_audio.py, align_lyrics.py, make_timeline.py,
                       check_workflows.mjs, suno_fetch.sh (fallback; superseded by suno/suno.mjs fetch)
workflows/             Claude Code Workflow templates (generic; everything comes from args)
engine/                the p5.js + p5.brush renderer, studio, cast/props/frame libraries, photo tools (see engine/README.md)
suno/                  Suno helper: login / create / fetch (see suno/README.md)
.claude/skills/        the suno-create skill for Claude in Chrome
projects/demo/         synthetic example project (committed)
projects/<name>/       your projects (gitignored: they hold private messages)
docs/PIPELINE.md       the whole method, step by step
```

## Privacy

- **All personal data lives in `projects/<name>/`**: the message DB, Instagram parse, research notes, ARC, lyrics, CONTEXT dossiers, photos and prints, workflow args and renders. That folder is **gitignored** (only `projects/demo` is committed, and it is synthetic). `*.db`, `out/`, `frames*/`, `previews/` and `photos/` are ignored everywhere.
- The message DB is only ever opened **read-only** (`file:…?mode=ro`); `chat.db` is never written.
- The agents work locally. Their prompts forbid network use, dumping environment variables and writing to the DB. They flag anything private about third parties so it stays off screen.
- Suno receives only the style line and the lyrics you paste. Re-read the lyrics before you paste them.
- Share the finished video only with the people in it. Get their OK before putting friends' real messages or photos on screen.

## Cost and time (from real runs of a 4–5 minute video)

| Stage | Wall clock | Agents | Tokens (approx.) |
|---|---|---|---|
| DB build | minutes | — | — |
| Research + lyrics | 30–60 min | ~15 | a few M |
| Suno | minutes per generation | — | Suno credits (one Create = 2 takes) |
| Audio analysis | ~5 min (+1.5 GB model download, first time) | — | — |
| Pre-production | ~1 h | ~22 | ~5M |
| Chapters, review, fixes | 3–5 h | ~70 | ~12M |
| Render + encode | ~15 min | — | — |

As a rough estimate, budget about 100 agents and 15–20M subagent tokens per video; it scales with song length and chapter count. Frames for a 4.5-minute video take about 5–6 GB of disk until `clean`.

## Credits and terms

- Rendering: [p5.js](https://p5js.org/) and [p5.brush](https://github.com/acamposuribe/p5.brush), driven by [puppeteer-core](https://pptr.dev/) and Google Chrome. Audio: [librosa](https://librosa.org/) and [faster-whisper](https://github.com/SYSTRAN/faster-whisper). Encoding: [FFmpeg](https://ffmpeg.org/). Fonts in `engine/assets/fonts/` are redistributed unmodified under their own licenses: Caveat and Shantell Sans under the SIL Open Font License 1.1 (`OFL.txt`), Permanent Marker under the Apache License 2.0 (`LICENSE-PermanentMarker.txt`).
- **Suno:** songs you generate are subject to [Suno's Terms of Service](https://suno.com/terms). Whether you may share or use a song publicly or commercially depends on your plan. Automating Suno's website (the `suno/` helper and the `suno-create` skill) may conflict with its terms. It is meant for personal, low-volume use at your own discretion; it never types your credentials or solves CAPTCHAs.
- Instagram and iMessage data belong to you and the people you talk to. Treat it accordingly.
