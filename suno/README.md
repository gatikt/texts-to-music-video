# Suno step: style + lyrics → song → audio

This folder automates the "make the song in Suno" step of the pipeline:

1. paste the style prompt and the lyrics into Suno,
2. generate (one click makes two takes),
3. pick a take and share it,
4. download its audio as `song.m4a` + `song.wav` for the analysis scripts.

Suno has no public API, so the create step drives the Suno website. There are
two ways to do it:

| Path | What drives the browser | Signed in how | Best for |
|---|---|---|---|
| **A. `suno/suno.mjs`** | Playwright + your installed Google Chrome, with a separate profile at `~/.t2mv/suno-profile` | you sign in once with `login` | running from a terminal or a script |
| **B. `suno-create` skill** (`.claude/skills/suno-create/`) | Claude Code through the Claude in Chrome extension, in your everyday Chrome | already signed in | asking Claude "make the song in Suno" |

`fetch` (download a shared song) needs no browser or login.

> **Terms of service.** Automating a website's UI may break that site's terms.
> These tools are meant for personal, low-volume use, at your own discretion.
> They do not hide that the browser is automated, never type your credentials,
> and never solve or bypass CAPTCHAs.

> **Credits.** Each "Create song" click spends Suno credits (it makes two
> takes; at the time of writing that is about 10 credits on the standard
> plans, but check your plan). `--dry-run` fills and checks the form without
> clicking.

## Setup

Requirements: Node 20+ (22 used), Google Chrome in its normal location,
ffmpeg/ffprobe on `PATH`.

```bash
npm install --prefix suno     # installs playwright-core only; it uses your Chrome, no browser download
npm test --prefix suno        # offline tests against a local mock page (no Suno, no credits)
```

## Path A: the CLI

### 1. Sign in once

```bash
node suno/suno.mjs login
```

A Chrome window opens on suno.com with a dedicated profile
(`~/.t2mv/suno-profile`, outside the repo; override with `--profile` or
`T2MV_SUNO_PROFILE`). Sign in yourself. The window closes when the create page
loads signed in, or press Enter in the terminal once you are done.

**Google sign-in often refuses automated browsers** ("This browser or app may
not be secure"). That is expected; use another sign-in method Suno offers
(Apple, Discord, Microsoft, Facebook, phone number). Do not add flags to hide
the automation.

### 2. Create

```bash
# check everything without spending credits (shows the window, waits for Enter)
node suno/suno.mjs create --style style.txt --lyrics lyrics.txt --title "My Song" --dry-run --headed

# generate for real
node suno/suno.mjs create --style style.txt --lyrics lyrics.txt --title "My Song" --out ~/.t2mv/takes/my-song --headed
```

| Option | Meaning |
|---|---|
| `--style <file\|string>` | Style prompt, from a file or inline, e.g. `"upbeat pop anthem, stomp-clap beat, 118 bpm"` |
| `--lyrics <file>` | Lyrics, at most 5000 characters (checked before the browser opens) |
| `--title T` | Optional song title |
| `--out dir` | Where to write `suno_takes.json` and `take_<n>.mp3` (default `~/.t2mv/takes/<date-time>`) |
| `--dry-run` | Fill and verify the form, save `dry_run.png`, never click "Create song" |
| `--headed` | Show the window. Use it for real runs so you can solve a verification check if one appears |
| `--timeout-min N` | How long to wait for both takes (default 15) |
| `--style-max N` | Style limit to enforce (default 1000; older models allow 200) |
| `--verbose` | Log every step |

What it does: opens `https://suno.com/create`, selects **Songs** and
**Advanced** (custom mode), fills **Lyrics editor**, the style box (found next
to the "View saved style prompts" button, since its placeholder is random),
and **Song Title (Optional)**, checks each value actually landed, then clicks
**Create song**. It reads the new clip ids from the `/generate` network
response (falling back to new `/song/<id>` links), waits until both takes are
`complete`, then writes:

```json
[
  { "id": "<uuid>", "url": "https://suno.com/song/<uuid>", "audio": "https://cdn1.suno.ai/<uuid>.mp3", "title": "My Song", "status": "complete", "file": "take_1.mp3", "duration": 151.2 },
  { "id": "<uuid>", "url": "https://suno.com/song/<uuid>", "audio": "...", "title": "My Song", "status": "complete", "file": "take_2.mp3", "duration": 149.8 }
]
```

Listen to `take_1.mp3` / `take_2.mp3`, open the better one's `url`, and use
**Share → Copy link**.

If Suno shows an hCaptcha or "verify you are human" check, the CLI stops and
asks you to solve it in the window (`--headed`); in headless mode it exits with
code 3 and tells you to re-run with `--headed`.

### 3. Fetch the chosen take

```bash
node suno/suno.mjs fetch https://suno.com/s/XXXXXXXX --out projects/my-song/video
```

Accepts a share link, a `https://suno.com/song/<uuid>` URL or a bare id. It
resolves the share link's redirect to the song id, downloads
`https://cdn1.suno.ai/<id>.mp4` (the share video; it returns 403 for a few
minutes after you first share, so the command polls for up to `--wait-min`,
default 10) or `<id>.mp3`, and writes `suno-share.mp4` (or `suno-song.mp3`),
`song.m4a`, `song.wav` (44.1 kHz) and `suno_fetch.json` with the durations.
These files are personal; keep them out of git.

It does the same job as `scripts/suno_fetch.sh` (curl), with id/URL inputs and an mp3 fallback.

### Exit codes

`0` ok · `1` error · `2` bad arguments or not logged in · `3` a verification
check needs a human.

## Path B: the Claude Code skill

Ask Claude Code something like "make the song in Suno with style.txt and
lyrics.txt". The `suno-create` skill opens a new tab in your Chrome through the
Claude in Chrome extension, fills the same fields, **asks you before clicking
"Create song"**, waits for the two takes and returns their links. See
[`.claude/skills/suno-create/SKILL.md`](../.claude/skills/suno-create/SKILL.md).

Known blocker: the extension may report **"Host access is restricted by
policy"** for suno.com. Reading the page works, but clicks, typing,
screenshots and JavaScript do not. Allow suno.com in the Claude in Chrome
extension's site permissions (or ask whoever manages your Chrome policy). Until
then, use path A.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Not logged in to Suno ... Run "node suno/suno.mjs login" first` | Run `login`. The session can expire; run it again. |
| `The Suno Chrome profile is already open` | Close the other window that uses `~/.t2mv/suno-profile` (or the other `suno.mjs` run). |
| `Google Chrome was not found` | Install Chrome, or pass `--chrome /path/to/chrome`. |
| Google sign-in says the browser is not secure | Use a different sign-in method. |
| `Could not find the "Lyrics editor" box` / style box / "Create song" | Suno changed its UI. Run with `--headed --verbose --dry-run`, inspect the element (DevTools → Accessibility shows its name), and update `suno/selectors.mjs`. All selectors live there. |
| `the text did not land in the field` | The editor changed. Same as above; the CLI tries `fill()` and then keyboard input. |
| `"Create song" is disabled` | Out of credits, or a field is invalid. Look with `--headed --dry-run`. |
| `lyrics are N characters; Suno allows 5000` | Shorten section tags (`[V1]`), cut repeated lines. |
| Takes finish but `take_<n>.mp3` is missing | The CDN file is not public yet. Share the song and use `fetch`. |
| `fetch` keeps saying `not ready (mp4 403 ...)` | The share video is still rendering, or the song is private. Make sure it is shared, then retry or raise `--wait-min`. |

## Files

| File | Purpose |
|---|---|
| `suno.mjs` | The CLI (`login`, `create`, `fetch`) |
| `selectors.mjs` | Every URL, locator and network pattern, with comments; edit this when Suno's UI changes |
| `lib.mjs` | Browser-free helpers: argument parsing, limit checks, share-link resolution, downloads, ffmpeg |
| `test/run-tests.mjs`, `test/mock-create.html` | Offline tests against a local mock of the create page. `node suno/test/run-tests.mjs --live` also runs a real `fetch` when `T2MV_TEST_SHARE_URL` is set |
