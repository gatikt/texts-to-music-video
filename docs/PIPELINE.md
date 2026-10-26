# The pipeline in detail

This toolkit makes a personalized song and a hand-painted vertical (1080×1920) music video from someone's real iMessage and Instagram history. Every on-screen quote is a real message, checked against the database.

The method was proven on three finished videos, 2:30 to 4:30 long. Claude Code ran them in the terminal, with multi-agent **Workflows** fanning out across dozens of agents. This page follows the same order as `bin/t2mv`. Each section names the CLI stage and the commands it runs underneath, in case you want to run a step by hand.

All paths below are relative to the repo root. `P=projects/<name>` is your project folder; `V=$P/video`; `B=$V/build`.

---

## 0. Requirements

**Machine**
- macOS on Apple Silicon. The renderer uses Chrome's Metal backend through headless Chrome.
- About 15 GB of free disk space while rendering. Frames take about 5–6 GB for a 4.5-minute video; you can delete them after encoding.
- A run takes about 1 h of pre-production, 3–5 h of chapter agents, and about 15 min of rendering.

**Software**

| Tool | Version used | Install |
|---|---|---|
| Claude Code (CLI) | latest | needs the **Workflow** tool. Use an Opus-class model. |
| Node.js | 22.x | `brew install node@22` |
| Google Chrome | stable | `/Applications/Google Chrome.app`, or set `CHROME_PATH` |
| ffmpeg / ffprobe | 8.x | `brew install ffmpeg` |
| Python | 3.10–3.13 for the venv | `brew install python@3.13` |
| sqlite3 | system | preinstalled on macOS |
| Python venv | — | `python3.13 -m venv .venv && .venv/bin/pip install -r requirements.txt` |

The first whisper run downloads the `medium.en` model, about 1.5 GB, into `~/.cache/huggingface`.

**Accounts and data**
- A **Suno** account for the song. The lyrics box holds at most **5,000 characters**. You paste only the style line and the lyrics.
- **Full Disk Access** for your terminal (System Settings → Privacy & Security). This is needed to read `~/Library/Messages/chat.db`, Messages attachments and Contacts.
- An **Instagram data export**: Settings → Accounts Center → Download your information → Messages, **HTML** format. Unzip it and put its path in `project.json` → `data.instagram_export`.

`bin/t2mv doctor` checks all of this.

**Token budget, for reference (one 4.5-minute video)**
- Pre-production: about 22 agents and about 5M tokens.
- Chapters, review and fixes: about 70 agents and about 12M tokens.
- Totals scale with song length and chapter count; budget roughly 100 agents and 15–20M tokens per video.

---

## 1. Build the message database (once) — `bin/t2mv db <name>`

```bash
python3 -I scripts/ig_clean.py <instagram-export> $P/data/ig_out --tz <IANA tz>   # → ig_clean.json (+ threads/*.txt)
python3 -I scripts/build_dms.py --out $P/data/dms.db --me "<your name>" --ig $P/data/ig_out/ig_clean.json
```

- `--me` is the name stored as the sender of your own messages (`is_me=1`). Instagram often shows your full display name: add it with `--me-alias` (or `me_aliases` in project.json) so both sources agree.
- The Instagram HTML export prints its times at a fixed UTC offset. Some exports use a fixed regional *standard* time all year, ignoring DST (the default is `--export-utc-offset 0`). Check one message you remember and adjust it if needed.

`dms.db` has these tables:
- `messages(id, conv_id, source, ts, sender, is_me, kind, text, session_id)`
- `conversations(id, source, key, title, is_group, people, n, first, last)`
- `sessions(id, conv_id, start, end, n, senders)`: a new session starts after a 120-minute gap
- a `messages_fts` full-text index, and `meta(k, v)`

**Always open it read-only:** `sqlite3 "file:$P/data/dms.db?mode=ro"`. Search it with `python3 scripts/dmsearch.py --db $P/data/dms.db -h`.

`build_dms.py` takes contact names from the macOS AddressBook (read-only) and decodes the `attributedBody` text of newer iMessages.

---

## 2. Research → story arc → lyrics — `bin/t2mv research <name>`, `bin/t2mv lyrics <name>`

1. **Research the story** with `workflows/1_song_lyrics.js`. Parallel era researchers write `$P/research/*.md`. A story editor builds `$P/ARC.md`: real, dated moments, each with verbatim quotes, sender and timestamp. Three songwriters draft lyrics from different angles, and a producer judges them and writes `$P/lyrics.txt`. Set `eras` and `extra_research` in project.json first.
2. **Revise** with `workflows/1b_song_revision.js`. Put your feedback in `song.revision_feedback` first. The workflow proposes hook concepts, writes a full draft for each, judges them, runs two cringe critics and makes a final fix pass.
3. **Rules for the lyrics,** learned from real feedback:
   - No names or shorthand the AI singer can't pronounce. Spell numbers and times out ("Two A.M.", "nineteen").
   - **Everything is sung.** No spoken or whispered parts, no "hee hee" ad-libs. Put call-and-response in parentheses.
   - Use one strong, catchy hook built from a real quote, and repeat it.
   - Keep it funny, humble and tough. Not cringey and not self-boasty: undercut every win with the embarrassing true detail, and give credit to the people around you.
   - Short section tags (`[Verse 1]`, `[Chorus: gang vocals]`) keep you under 5,000 characters.

---

## 3. Make the song — `bin/t2mv suno <name> login|create|fetch`

- `create` fills suno.com/create with the style line and lyrics from `$P/lyrics.txt`. It spends credits; try `--dry-run` first. It saves both takes to `$V/suno-takes/`.
- Or generate it in your own signed-in Chrome with `workflows/0_suno_browser.js` (Claude in Chrome). The workflow stops before Create until you say go.
- Or paste the two fields by hand, for example a style line like *"upbeat feel-good pop anthem, stomp-clap beat, bright synths, warm lead vocal, playful, gang vocal chants, call and response, singalong chorus, 118 bpm, half-time bridge, final chorus key change"*.

Pick the best take, share it, and copy its **share link**. Then run:

```bash
bin/t2mv suno <name> fetch https://suno.com/s/XXXX     # → $V/song.m4a, $V/song.wav
```

`node suno/suno.mjs fetch` replaces the older `scripts/suno_fetch.sh`, which is kept as a fallback with no dependencies. **Suno's CDN returns 403 for a few minutes** after a song is shared, until its share video exists, so both of them poll until it is ready. Don't screen-record the song.

---

## 4. Audio and timing — `bin/t2mv audio <name>`

```bash
ffmpeg -y -i $V/song.wav -t <end> -af "afade=t=out:st=<end-2.2>:d=2.2" -ar 44100 $V/song_cut.wav
.venv/bin/python scripts/analyze_audio.py $V --audio song_cut.wav      # → beats.json, transcript.json
python3 scripts/align_lyrics.py $V <duration>                          # → aligned.json (per-word sung times)
```

- Set `song.trim_end` to cut a long tail, and `song.fade_out` for the fade length.
- **Check `aligned.json` by eye.** Whisper often merges or skips a repeated chorus. Fix it by copying another chorus's times with an offset, for example chorus 1 = chorus 2 − 60 s.
- **Choose chapters.** Cut on section starts from `aligned.json`: about 13 chapters for 4.5 minutes, each 15–25 s, with every chorus as its own chapter. Write them into project.json as `"chapters": [["c01_intro", 0, 24.8], …]`. The last chapter must end at the song's duration.

---

## 5. Set up the engine — `bin/t2mv timeline <name>`

The build folder `$B` holds two kinds of files (details in [engine/README.md](../engine/README.md)):

- **Engine-owned** files are copied in from `engine/` by `engine/sync.mjs`: `render.mjs`, `studio.html`, `GUIDE.md`, `src/core.js`, `src/frame.js`, `src/cast.js`, `src/props.js`, `src/lab/`, `tools/` and `assets/fonts/`. Never edit them in `$B`; change `engine/` and re-sync. Sync records what it copied in `.engine-sync.json` and will not overwrite a copy that was edited inside `$B` (it warns instead; `node engine/sync.mjs $B --force` replaces it after saving a backup in `.engine-sync-backup/`).
- **Project-owned** files are never touched by sync: `package.json`, `src/timeline_data.js`, `chapters.json`, `src/ch/*.js`, `src/story.js` (story dates and HUD config), the overlays `src/cast_project.js`, `src/props_project.js` and `src/hud.js` (they load after the engine, before the chapters), `src/msg_data.js`, `assets/*.png`, `STORYBOARD.md` and the research files.

`timeline` does this:

1. It writes `$B/package.json`, whose `postinstall` (and `npm run sync`) runs `engine/sync.mjs`, plus a `.gitignore` for the engine copies.
2. It runs `npm install`, which installs p5, p5.brush and puppeteer-core and syncs the engine in. On later runs it syncs only with `--refresh-engine`.
3. It runs `python3 scripts/make_timeline.py $V <duration> <name>.mp4 $V/chapters.json --build $B [--start-date <project.json story_start_date>]`. This writes `src/timeline_data.js` (duration, BPM, beats, lyric lines, output name and audio path), `chapters.json`, placeholder `src/ch/<chapter>.js` files, and a starter `src/story.js` if there is none.
4. It writes `src/msg_data.js` from the DB (`tools/msgcounts.mjs`) for the odometer.
5. It runs `tools/assets.mjs`, which writes `src/project_files.js`, the list of project scripts and images that `studio.html` loads. `render.mjs` and `sync.mjs` also re-run it; run it by hand after adding a new project file before opening `studio.html`.

`engine/GUIDE.md` is the house style and the hard rules every agent reads. The project header (song, length and BPM, story, audience, tone) goes at the top of `STORYBOARD.md`, which the pre-production director writes. A few rules carry over to every story:

- **Every frame is a pure function of t:** no state, no `Math.random` (use `hash()`), no `Date`.
- `tools/checkquotes.mjs` checks every `receipt(…)` against the **whole** database and must print only `OK`. A `WRONGWHO` on a very common word can be a false alarm; check that one by hand.
- `tools/chat_photos.py` exports a chat's photos from Messages into `photos/` with labelled contact sheets. `tools/print_photo.py` turns one into a riso halftone print. Choose the crop focus so the face is in frame, and avoid an ink that matches the subject's clothes.

Render previews from `$B`:

```
node render.mjs --sheet=33.4,34,35 --out=previews/x.jpg      # contact sheet
node render.mjs --stills=1.2,40 --out=previews/stills          # full-res PNGs
node render.mjs --clip=33:45 --out=previews/c03.mp4            # clip with audio
```

---

## 6. Pre-production (workflow, about 1 h) — `bin/t2mv preproduction <name>`

Set `lyric_sections` (one entry per lyric range: what the lines are about and what to find), `looks_people` and `settings_places` in project.json first. `workflows/2_preproduction.js` then runs, in parallel:

- **Per-lyric context dossiers** (`CONTEXT/ctx_*.md`): the exact real moment behind each line, the precise setting, who was there, outfits from photos, receipt candidates, and what the lyric gets wrong.
- **An independent fact-check** of each dossier.
- **`LOOKS.md`:** every person at every age (build, skin and hair hex, glasses, outfits per era), from real photos.
- **`SETTINGS.md`:** every place, with its palette and props.
- **Builders** that write the project overlays: the cast and ages in `src/cast_project.js`, the sets and props in `src/props_project.js`, and the HUD in `src/hud.js`. They extend the engine's `cast.js`, `props.js` and `frame.js` without editing them.
- **A director** who writes `STORYBOARD.md` (starting with the project header) and the real story dates in `src/story.js` (`storyKeys([...])`).

## 7. Chapters → review → fixes (workflow, 3–5 h) — `bin/t2mv chapters <name>`

`workflows/3_chapters_review_fix.js` pipelines all chapters in parallel:

- **Build:** one animator per chapter, with previews in `previews/<ch>/`.
- **Critique:** a director agent returns must, should and nice issues.
- **Polish.**
- **Whole-film review:** overlapping time slices check seams, outfit and age continuity, facts against the fact-checks, readability, and logos or IP. A second agent verifies each must-fix.
- **Per-file fix agents.**

The standalone versions are `workflows/4_continuity_review.js` (`bin/t2mv review <name>`) and `workflows/5_apply_review_fixes.js` (`bin/t2mv fixes <name> --items=<file>`).

**Rules in every agent prompt:**
- Only verified quotes.
- Edit only your own chapter file; report bugs in shared files instead of editing them.
- Keep faces and key action between y 260 and 1560, clear of the karaoke strip and the HUD.
- No brand logos or IP: no cartoon mascots, team jerseys or colours, or car-brand emblems.
- Nothing private about third parties.
- Check stills at every seam.

## 8. Leftovers, render, deliver — `bin/t2mv render <name>`

```bash
node tools/checkquotes.mjs src/ch/*.js | grep -v '^OK'           # should be empty (or known false WRONGWHO)
node render.mjs --stills=<each seam ±0.1, each flagged time> --out=previews/leftover   # LOOK at them
rm -rf out/frames30        # frames are reused on resume, so clear stale ones after any code change (render --fresh)
for i in 1 2 3 4; do node render.mjs --frames=0:<DUR> --workers=4 --fps=30 && break; done   # Chrome occasionally drops; it resumes
node render.mjs --encode --fps=30 --out=out/<name>.mp4
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height -of compact out/<name>.mp4   # DUR, 1080x1920, h264+aac
ffmpeg -v error -i out/<name>.mp4 -f null - && echo DECODE_OK
ffmpeg -i out/<name>.mp4 -c:v libx264 -crf 24 -preset slow -c:a aac -b:a 192k -movflags +faststart <name>_share.mp4
```

`bin/t2mv render` does all of this and copies both mp4 files to `$P/out/`.

**Cleanup** with `bin/t2mv clean <name> --yes`. It keeps everything needed to re-render, and removes `build/out`, `build/previews`, `build/photos`, `build/node_modules`, `song.wav` and `suno-share.mp4`.

---

## Gotchas, learned the hard way

- **EXIF rotation:** `sips` already applies it, so `print_photo.py` patches `exif_transpose` out. Otherwise prints come out rotated twice.
- **`receipt(..., {mirror:true})`** shows a message on the *other person's* phone, so the bubble colours flip correctly.
- **Weekdays and dates on screen must be real.** Check them with `date -j -f %Y-%m-%d <d> +%a`.
- **Outfit and colour continuity across chapters:** the same garment must keep the same colour everywhere. LOOKS.md is the source of truth.
- **Workflow output is JSON** `{summary, logs, result}`. Long results are truncated in the notification; read the run's `journal.jsonl` for every agent's full return.
- **To change a running workflow:** stop it, edit the script, and re-run with `resumeFromRunId`. Unchanged agents replay from cache, matched by call order, so edit late steps, not early ones.
- **The workflow `meta` block must be a pure literal:** no variables, template strings or calls. `node scripts/check_workflows.mjs` checks this.
- **Never print environment variables** (e.g. `pgrep -fl`, `env`) in a shell an agent can see; API keys leak.
- **Keep everything local.** Nothing gets uploaded or published. The audience is you and close friends; leave out third parties' private details and exes.

## Privacy

`dms.db`, `photos/`, `research/`, `CONTEXT/`, `ARC.md` and the workflow args contain private conversations. They all live under `projects/<name>/`, which is gitignored. Don't commit or share them; share only the final mp4 files.
